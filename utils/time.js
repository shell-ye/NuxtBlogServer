const Timestamp_To_YYYY_MM_DD_HH_MM_SS = (timestamp) => {
    let date = new Date() // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
    let Y = date.getFullYear() + '-'
    let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-'
    let D = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate()) + ' '
    let h = (date.getHours() < 10 ? '0'+date.getHours() : date.getHours()) + ':'
    let m = (date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes()) + ':'
    let s = (date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds())
    let strDate = Y+M+D+h+m+s
    return strDate;
}

const YYYY_MM_DD_HH_MM_SS_To_TimeToTimestamp = ( time ) => {
    return (new Date(time)).getTime()
}

const timeDifference = ( type,bigTime,smallTime ) => {
    let bt = parseInt( new Date( bigTime ).getTime() )
    let st = parseInt( new Date( smallTime ).getTime() )
    let result = ''
    if ( type == 's' ) {
        result = ( bt - st ) / 1000
    } else if ( type == 'm' ) {
        result = ( bt - st ) / 1000 / 60
    } else if ( type == 'h' ) {
        result = ( bt - st ) / 1000 / 60 / 60
    } else if ( type == 'd' ) {
        result = ( bt - st ) / 1000 / 60 / 60 / 24
    }
    return Math.ceil( result )
}

module.exports = {
    Timestamp_To_YYYY_MM_DD_HH_MM_SS,
    YYYY_MM_DD_HH_MM_SS_To_TimeToTimestamp,
    timeDifference
}