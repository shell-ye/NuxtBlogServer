var express = require('express');
var router = express.Router();
const db = require('../mysql')

router.post('/submit', async (req, res) => {
    let { type, user_id, username, identification, identification_color, message } = req.body
    if ( !type || !user_id || !username || !identification || !identification_color || !message ) {
        res.send({code: 0, msg: '缺少参数'})
    } else if ( username.length > 7 || identification > 7 ) {
        res.send({code: 0, msg: '昵称或标识最长为七位'})
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
    let { type, page } = req.query
    if ( !type ) {
        res.send({code: 0, msg: '缺少餐参数'})
    }
    // 网站留言（基础）
    let data = await db.select('*').from('message').orderby('time desc').queryListWithPaging(page || 1, 4).catch(err => {
        console.log(err)
        res.send({code: 0, msg: '系统繁忙'})
        return
    })
    console.log(data)
    if ( type == 2 ) {
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
    }
    res.send({code: 200, data})
})

module.exports = router;