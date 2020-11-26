var express = require('express');
var router = express.Router();
const db = require('../mysql')
const { Timestamp_To_YYYY_MM_DD_HH_MM_SS } = require('./../utils/time')
const { token_verification, checkAdmin } = require('./../middleware/index')

router.get('/list', async (req, res) => {
    // 1 查询全部 2 分类查询（标签）3 关键字查询
    const { type, pages, page_count, article_tags } = req.query
    if ( !type || !pages ) { return res.send({ code: '000020', msg: '缺少参数'}) }
    // 查找文章总数
    let count = type == 1 
    ? await db.select('count(*)').from('article').queryValue().catch(err => {
        console.log( err )
        res.send({code: 0, msg: '系统繁忙'})
        return
    })
    : await db.select('count(*)').from('article').where('article_tags', article_tags, 'like').queryValue().catch(err => {
        console.log( err )
        res.send({code: 0, msg: '系统繁忙'})
        return
    })

    // 文章
    let article = {}
    if ( type == 1  ) {
        article = await db.select('*').from('article').orderby('update_time desc').queryListWithPaging(pages, page_count).catch(err => {
            console.log( err )
            res.send({code: 0, msg: '系统繁忙'})
            return
        })
    } else if ( type == 2 ) {
        article = await db.select('*').from('article').where('article_tags', article_tags, 'like').orderby('update_time desc').queryListWithPaging(pages, page_count).catch(err => {
            console.log( err )
            res.send({code: 0, msg: '系统繁忙'})
            return
        })
    } else if ( type == 3 ) {
        article = await db.select('*').from('article').where('title', pages, 'like').orderby('update_time desc').queryList().catch(err => {
            console.log( err )
            res.send({code: 0, msg: '系统繁忙'})
            return
        })
    }
    
    if ( type == 1 || type == 2 ) {
        res.send({code: 200, data: article.rows, pages_info: { count, pages }})
    } else if ( type == 3 ) {
        res.send({code: 200, data: article})
    }
})

// 查找文章
router.get('/search', async (req, res) => {
    // 1-id
    const { type, id, article_tags } = req.query
    if ( !type ) { return res.send({ code: '000020', msg: '缺少参数'})}
    if ( type == 1 ) {
        let data = await db.select('*').from('article').where('id', id).queryRow().catch(err => {
            console.log( err )
            res.send({code: 0, msg: '系统繁忙'})
            return
        })
        res.send({code: 200, data})
    } else if ( type == 2 ) {
        
    }
})

// 点赞
router.get('/like', async (req, res) => {
    // type 1 无用户 2 有用户
    const { type, user_id, article_id, bool } = req.query
    if ( !type || !article_id || !bool ) { return res.send({ code: '000020', msg: '缺少参数'}) }
    let time = Timestamp_To_YYYY_MM_DD_HH_MM_SS( new Date() )
    
    let result = bool == 'true'
    ? await db.update('article').column('likes_count', db.literal('likes_count + 1')).where('id', article_id).execute().catch(err => {
        console.log( err )
        res.send({code: 0, msg: '系统繁忙'})
        return
    })
    : await db.update('article').column('likes_count', db.literal('likes_count - 1')).where('id', article_id).execute().catch(err => {
        console.log( err )
        res.send({code: 0, msg: '系统繁忙'})
        return
    })

    let likes = await db.select('likes_count').from('article').where('id', article_id).queryValue().catch(err => {
        console.log( err )
        res.send({code: 0, msg: '系统繁忙'})
        return
    })
    res.send({code: 200, data: likes})

    // 添加 | 删除 至用户收藏列表
    if ( type == 2 ) {
        if ( bool == 'true' ) {
            db.insert('article_likes')
            .column('article_id', article_id)
            .column('user_id', user_id)
            .execute()
            .catch(err => {
                console.log( err )
                res.send({code: 0, msg: '系统繁忙'})
                return
            })
        } else {
            db.delete('article_likes')
            .where('article_id', article_id)
            .where('user_id', user_id)
            .execute().catch(err => {
                console.log( err )
                res.send({code: 0, msg: '系统繁忙'})
                return
            })
        }
    }
})

// 用户的喜欢列表
router.get('/user-like', async (req, res) => {
    // type 1 列表 2 单个
    const { type, user_id, article_id } = req.query
    if ( !type || !user_id ) { return res.send({ code: '000020', msg: '缺少参数'}) }
    let data = type == 1 
    ? await db.select('*').from('article as a').join("left join article_likes as b on a.id = b.article_id").where('b.user_id', user_id).queryList().catch(err => {
        console.log( err )
        res.send({code: 0, msg: '系统繁忙'})
        return
    })
    : await db.select('*').from('article_likes').where('user_id', user_id).where('article_id', article_id).queryList().catch(err => {
        console.log( err )
        res.send({code: 0, msg: '系统繁忙'})
        return
    })
    res.send({code: 200, data})
})

// 添加文章
router.post('/add', token_verification, checkAdmin, async (req, res) => {
    const { title, article_img, article_tags, skill_tag, description, content, html_content } = req.body
    if ( !title || !article_img || !article_tags || !skill_tag || !description || !content || !html_content ) { return res.send({ code: '000020', msg: '缺少参数'}) }
    let start_time = Timestamp_To_YYYY_MM_DD_HH_MM_SS( new Date() )
    db.insert('article')
    .column('title', title)
    .column('article_img', article_img)
    .column('article_tags', article_tags)
    .column('skill_tag', skill_tag)
    .column('content', content)
    .column('description', description)
    .column('html_content', html_content)
    .column('publish_time', start_time)
    .column('update_time', start_time)
    .execute().catch(err => {
        console.log( err )
        res.send({code: 0, msg: '系统繁忙'})
        return
    })
    res.send({code: 200, data: 'ok'})
})

// 删除文章
router.get('/del', token_verification, checkAdmin, (req, res) => {
    const { id } = req.query
    if ( !id ) { return res.send({ code: '000020', msg: '缺少参数'})}
    db.delete('article').where('id', id).execute().catch(err => {
        console.log( err )
        res.send({code: 0, msg: '系统繁忙'})
        return
    })
    res.send({code: 200})
})

router.post('/update', token_verification, checkAdmin, async (req, res) => {
    const { id, title, article_img, article_tags, skill_tag, content, html_content, description } = req.body
    if ( !id || !title || !article_tags || !skill_tag || !description || !content || !html_content ) { return res.send({ code: '000020', msg: '缺少参数'}) }
    let update_time = Timestamp_To_YYYY_MM_DD_HH_MM_SS( new Date() )
    await db.update('article')
    .column('title', title)
    .column('article_img', article_img)
    .column('article_tags', article_tags)
    .column('skill_tag', skill_tag)
    .column('content', content)
    .column('description', description)
    .column('html_content', html_content)
    .column('update_time', update_time)
    .where('id', id)
    .execute()
    .catch(err => {
        console.log( err )
        res.send({code: 0, msg: '系统繁忙'})
        return
    })
    res.send({code: 200})
})

module.exports = router;