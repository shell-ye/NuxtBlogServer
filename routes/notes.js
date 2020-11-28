var express = require('express');
var router = express.Router();
const db = require('../mysql');
const { checkAdmin } = require("./../middleware/index")
const { Timestamp_To_YYYY_MM_DD_HH_MM_SS } = require('./../utils/time')

router.get('/list', async (req, res) => {
    let data = await db.select('*').from('notes').queryList().catch(err => {
        console.log(err)
        res.send({code: 0, msg: '系统繁忙'})
        return
    })
    res.send({code: 200, data})
})

router.post('/del', checkAdmin, async (req, res) => {
    const { id } = req.body
    if ( !id ) { return res.send({code: 0, msg: '缺少参数'}) } 
    await db.delete('notes').where('id', id).execute().catch(err => {
        console.log(err)
        res.send({code: 0, msg: '系统繁忙'})
        return
    })
    res.send({code: 200})
})

router.post('/add', checkAdmin, async (req, res) => {
    const { title, content, html_content } = req.body
    if ( !title || !content || !html_content ) { return res.send({code: 0, msg: '缺少参数'}) } 
    let start_time = Timestamp_To_YYYY_MM_DD_HH_MM_SS( new Date() )
    await db.insert('notes')
    .column('title', title)
    .column('content', content)
    .column('html_content', html_content)
    .column('publish_time', start_time)
    .column('update_time', start_time)
    .execute().catch(err => {
        console.log( err )
        res.send({code: 0, msg: '系统繁忙'})
        return
    })
    res.send({code: 200})
})

router.post('/update', checkAdmin, async (req, res) => {
    const { id, title, content, html_content } = req.body
    if ( !id || !title || !content || !html_content ) { return res.send({code: 0, msg: '缺少参数'}) } 
    let start_time = Timestamp_To_YYYY_MM_DD_HH_MM_SS( new Date() )
    await db.update('notes')
    .column('title', title)
    .column('content', content)
    .column('html_content', html_content)
    .column('update_time', start_time)
    .where('id', id)
    .execute().catch(err => {
        console.log( err )
        res.send({code: 0, msg: '系统繁忙'})
        return
    })
    res.send({code: 200})
})

router.get('/search', async (req, res) => {
    const { id } = req.query
    if ( !id ) { return res.send({code: 0, msg: '缺少参数'}) }
    let data = await db.select('*').from('notes').where('id', id).queryRow().catch(err => {
        console.log(err)
        res.send({code: 0, msg: '系统繁忙'})
        return
    })
    res.send({code: 200, data})
})

module.exports = router;
