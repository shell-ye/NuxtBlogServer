var express = require('express');
var router = express.Router();
const db = require('../mysql');
const { dateFormat } = require('../utils/time')
const fs = require('fs')

// 首页信息
router.get('/init', async (req, res) => {
    // 文章数量
    let article_count = await db.select('count(*)').from('article').queryValue().catch(err => {
        console.log(err)
        res.send({code: 0, msg: '系统繁忙'})
        return
    })
    // 文章点赞数
    let article_likes_count = await db.select('sum(likes_count)').from('article').queryValue().catch(err => {
        console.log(err)
        res.send({code: 0, msg: '系统繁忙'})
        return
    })
    // 网站信息
    let webside = await db.select('views, tell, create_time, sentences, skill_tags, article_tags, notes_class').from('webside').queryRow().catch(err => {
        console.log(err)
        res.send({code: 0, msg: '系统繁忙'})
        return
    })

    // 分类文章数量
    let tags_count = {}
    for ( let prop in JSON.parse(webside.article_tags) ) {
        tags_count[JSON.parse(webside.article_tags)[prop]] = await db.select('count(*)').from('article').where('article_tags', JSON.parse(webside.article_tags)[prop], 'like').queryValue()
    }

    // 笔记分类
    console.log(JSON.parse(webside.notes_class))
    let notes_class = []
    for ( let prop in JSON.parse(webside.notes_class) ) {
        notes_class.push(JSON.parse(webside.notes_class)[prop])
    }

    // 返回的数据
    let webInit = {
        article_count,
        article_likes_count,
        views_count: webside.views,
        tell: webside.tell,
        create_time: webside.create_time,
        sentences: webside.sentences,
        skill_tags: webside.skill_tags,
        article_tags: webside.article_tags,
        tags_count,
        notes_class
    }
    res.send({code: 200, data: webInit})

    // 增加浏览量
    db.update('webside').column('views', db.literal('views + 1')).where('id', 1).execute()
    if ( req.session && req.session.email ) {
        db.update('user').column('looked', db.literal('looked + 1')).where('email', req.session && req.session.email).execute()
    }
})

// 友情链接
router.get('/friend/links', async (req, res) => {
    let data = await db.select('*').from('friend_links').queryList().catch(err => {
        console.log(err)
        res.send({code: 0, msg: '系统繁忙'})
        return
    })
    res.send({code: 200, data})
})

// 访问日志
router.get('/accesslog', async (req, res) => {
    let { ip, address, isp } = req.query
    if ( !ip || !address || !isp ) {
        res.send({code: 0, msg: '缺少参数'})
    } else {
        let log = await db.select('ip, time').from('access_log').where('ip', ip).where('time', new Date(dateFormat(new Date(), 'yyyy-MM-dd')), 'gt').where('time', new Date(dateFormat(new Date(), 'yyyy-MM-dd') + ' 23:59:59'), 'lt').queryRow()
        if ( !log ) {
            db.insert('access_log').column('ip', ip).column('address', address).column('isp', isp).execute()
        }
        res.send({code: 200})
    }
})

router.post('/img', (req, res) => {
    console.log(req.body)
    fs.writeFile('test.jpg', req.body.head_img, blob, (err, data) => {
        if ( err ) {
            console.log('Error', err)
        } else {
            console.log('成功')
        }
    })
    res.send('ok')
})

module.exports = router;
