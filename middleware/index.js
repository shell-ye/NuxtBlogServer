const { checkToken } = require('./../utils/jwt')
const db = require('../mysql')

const token_verification = ( req, res, next ) => {
    let token = req.method == 'GET' ? req.query.token : req.body.token
    checkToken(token).then((response) => {
        if ( req.method == 'POST' ) {
            req.body['email'] = response.email
        } else {
            req.query['email'] = response.email
        }
        next()
    }).catch(err => {
        // console.log('server-token:',req.session._ctx, err)
        req.session = null
        res.send({ code: '000013', msg: '无效的 token'})
    })
}

const checkAdmin = async ( req, res, next ) => {
    let user_id = req.route.methods.get ? req.query.user_id : req.body.user_id
    let admin = await db.select('admin').from('user').where('id', user_id).queryValue()
    if ( admin == 1 ) {
        next()
    } else {
        res.send({code: 0, msg: '没有权限'})
    }
}

module.exports = {
    token_verification,
    checkAdmin
}