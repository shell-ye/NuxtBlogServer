const { checkToken } = require('./../utils/jwt')
const db = require('../mysql')

const token_verification = ( req, res, next ) => {
    checkToken(req.session._ctx.cookies.token).then(() => {
        next()
    }).catch(err => {
        console.log('server-token:',req.session)
        console.log('server-token:',req.session.cookies.token)
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