var express = require('express');
const { select } = require('../mysql');
var router = express.Router();
const db = require('../mysql')
const { checkToken } = require('./../utils/jwt')

router.post('/submit', async (req, res) => {
    let { type, user_id, username, identification, identification_color, message } = req.body
    if ( !type || !user_id || !username || !identification || !identification_color || !message ) {
        res.send({code: 0, msg: '缺少参数'})
    } else if ( username.length > 7) {
        res.send({code: 0, msg: '昵称最长为七位'})
    } else if ( identification > 5 ) {
        res.send({code: 0, msg: '头衔最长为五位'})
    } else {
        let head_img = await db.select('head_img').from('user').where('id', user_id).queryValue().catch(err => {
            console.log(err)
            res.send({code: 0, msg: '系统繁忙'})
            return
        })
        if ( type == 1 ) {
            await db.insert('message')
            .column('user_id', user_id)
            .column('username', username)
            .column('head_img', head_img == null ? 'default_head_img.png' : head_img)
            .column('identification', identification)
            .column('identification_color', identification_color)
            .column('message', message)
            .execute()
            .catch(err => {
                console.log(err)
                res.send({code: 0, msg: '系统繁忙'})
                return
            })
            res.send({code: 200})
        } else if ( type == 2 ) {
            let { base_id, to_user_id, to_username, to_head_img, to_identification, to_identification_color } = req.body
            if ( !base_id || !to_user_id || !to_username || !to_head_img || !to_identification || !to_identification_color ) {
                res.send({code: 0, msg: '缺少参数'})
            } else {
                await db.insert('message_reply')
                .column('user_id', user_id)
                .column('username', username)
                .column('head_img', head_img == null ? 'default_head_img.png' : head_img)
                .column('identification', identification)
                .column('identification_color', identification_color)
                .column('message', message)
                .column('base_id', base_id)
                .column('to_user_id', to_user_id)
                .column('to_username', to_username)
                .column('to_head_img', to_head_img)
                .column('to_identification', to_identification)
                .column('to_identification_color', to_identification_color)
                .execute()
                .catch(err => {
                    console.log(err)
                    res.send({code: 0, msg: '系统繁忙'})
                    return
                })
                res.send({code: 200})
            }
        }
    }
})

router.get('/list', async (req, res) => {
    // type 1-网站留言  2-网站留言+回复 3-用户网站留言  4-用户回复的  5-回复用户的
    let { type, page, pageSize } = req.query
    if ( !type || !page || !pageSize ) {
        res.send({code: 0, msg: '缺少餐参数'})
    }
    if ( type == 1 ) {
        // 网站留言（基础）
        let data = await db.select('*').from('message').orderby('time desc').queryListWithPaging(page || 1, pageSize).catch(err => {
            console.log(err)
            res.send({code: 0, msg: '系统繁忙'})
            return
        })
        res.send({code: 200, data})
    } else if ( type == 2 ) {
        // 网站留言（基础）
        let data = await db.select('*').from('message').orderby('time desc').queryListWithPaging(page || 1, pageSize).catch(err => {
            console.log(err)
            res.send({code: 0, msg: '系统繁忙'})
            return
        })
        // 含有给留言回复留言
        let conditions = []
        data.rows.forEach(item => {
            conditions.push({field: 'base_id', value: item.id, join: 'or'})
        })
        let reply = await db.select('*').from('message_reply').where(conditions).orderby('time asc').queryList().catch(err => {
            console.log(err)
            res.send({code: 0, msg: '系统繁忙'})
            return
        })
        data.rows.forEach(item => {
            item['child'] = []
            reply.forEach(items => {
                if ( item.id == items.base_id ) {
                    item['child'].push(items)
                }
            })
        })
        res.send({code: 200, data})
    } else if ( type == 3 ) {
        let { token } = req.query
        checkToken(token).then(async response => {
            let email = response.email
            let id = await db.select('id').from('user').where('email', email).queryValue().catch(err => {
                console.log(err)
                res.send({code: 0, msg: '系统繁忙'})
                return
            })
            let data = await db.select('*').from('message').orderby('time desc').where('user_id', id).queryListWithPaging(page || 1, pageSize).catch(err => {
                console.log(err)
                res.send({code: 0, msg: '系统繁忙'})
                return
            })
            res.send({code: 200, data})
        }).catch(err => {
            res.send({ code: '000013', msg: '无效的 token'})
        })
    } else if ( type == 4 ) {
        let { token } = req.query
        checkToken(token).then(async response => {
            let email = response.email
            let id = await db.select('id').from('user').where('email', email).queryValue().catch(err => {
                console.log(err)
                res.send({code: 0, msg: '系统繁忙'})
                return
            })
            let data = await db.select('*').from('message_reply').orderby('time desc').where('user_id', id).queryListWithPaging(page || 1, pageSize).catch(err => {
                console.log(err)
                res.send({code: 0, msg: '系统繁忙'})
                return
            })
            res.send({code: 200, data})
        }).catch(err => {
            res.send({ code: '000013', msg: '无效的 token'})
        })
    } else if ( type == 5 ) {
        let { token } = req.query
        checkToken(token).then(async response => {
            let email = response.email
            let id = await db.select('id').from('user').where('email', email).queryValue().catch(err => {
                console.log(err)
                res.send({code: 0, msg: '系统繁忙'})
                return
            })
            let data = await db.select('*').from('message_reply').orderby('time desc').where('to_user_id', id).queryListWithPaging(page || 1, pageSize).catch(err => {
                console.log(err)
                res.send({code: 0, msg: '系统繁忙'})
                return
            })
            res.send({code: 200, data})
        }).catch(err => {
            res.send({ code: '000013', msg: '无效的 token'})
        })
    }
})

module.exports = router;