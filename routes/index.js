var express = require('express');
var router = express.Router();
const db = require('../mysql');
const { token_verification, checkAdmin } = require("./../middleware/index")
const multer  = require('multer');

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
    let webside = await db.select('views, tell, create_time, sentences, skill_tags, article_tags').from('webside').queryRow().catch(err => {
        console.log(err)
        res.send({code: 0, msg: '系统繁忙'})
        return
    })

    // 分类文章数量
    let tags_count = {}
    for ( let prop in JSON.parse(webside.article_tags) ) {
        tags_count[JSON.parse(webside.article_tags)[prop]] = await db.select('count(*)').from('article').where('article_tags', JSON.parse(webside.article_tags)[prop], 'like').queryValue()
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
        tags_count
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

module.exports = router;
