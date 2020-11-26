const jwt = require('jsonwebtoken')
const scriet = '小火车哐嗤哐嗤'

const createToken = ( playload ) => {
    playload.ctime = Date.now()
    playload.exp = (Date.now() / 1000) + ( 60 * 60 * 24 ) // 过期时间设置(当前时间 + 持续的时间),单位: 秒
    return jwt.sign( playload,scriet )
}

const checkToken = ( token ) => {
    return new Promise((res, rej) => {
        jwt.verify(token, scriet, (err, data) => {
            if ( err ) {
                rej(err)
            } else {
                res( data )
            }
        })
    })
}

module.exports = {
    createToken,
    checkToken
}