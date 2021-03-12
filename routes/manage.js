var express = require('express');
var router = express.Router();
const db = require('../mysql');
const { checkAdmin } = require("./../middleware/index")
const multer  = require('multer');
const { dateFormat } = require('../utils/time');
const e = require('express');

let storage = multer.diskStorage({
  destination (req, file, cb) {
    cb(null, './public/images/friendLinkImg')
  },
  filename (req, file, cb) {
    let name = file.originalname.split('.')[0]
    let ext = file.originalname.split('.')[1]
    cb(null, `${ name }.${ ext }`)
  }
})
let upload = multer({
  storage
})

/* GET home page. */
// 添加友情链接 ×
router.post('/friend-add', checkAdmin, async (req, res) => {
  const { classes, name, remarks, href, filename } = req.body
  if ( !classes || !name || !remarks || !href || !filename ) {
    res.send({code: 0, msg: '缺少参数'})
    return
  }
  await db.insert('friend_links').column('class', classes).column('name', name).column('remarks', remarks).column('href', href).column('head_img', filename).execute().catch(err => {
    console.log(err)
    res.send({code: 0, msg: '系统繁忙'})
    return
  })
  res.send({code: 200})
})

// 添加友情链接图片 ×
router.post('/friend-add-head', upload.single('head_img'), (req, res) => {
  let name = req.file.originalname.split('.')[0]
  let ext = req.file.originalname.split('.')[1]
  res.send({code: 200, headFileName: name + '.' + ext})
})

// 删除友链 √
router.get('/friend-del', checkAdmin, async (req, res) => {
  const { id } = req.query
  await db.delete('friend_links').where('id', id).execute().catch(err => {
    console.log(err)
    res.send({code: 0, msg: '系统繁忙'})
    return
  })
  res.send({code: 200})
})

// 网站管理初始信息
router.get('/webinit', checkAdmin, async (req, res) => {
  let data = await db.select('*').from('webside').where('id', 1).queryRow().catch(err => {
    console.log(err)
    res.send({code: 0, msg: '系统繁忙'})
    return
  })
  res.send({code: 200, data})
})

// 更新公告
router.get('/notice', checkAdmin, async (req, res) => {
  const { notice } = req.query
  if ( !notice ) {
    res.send({code: 0, msg: '请输入公告内容'})
  } else {
    await db.update('webside').column('tell', notice).where('id', 1).execute().catch(err => {
      console.log(err)
      res.send({code: 0, msg: '系统繁忙'})
      return
    })
    res.send({code: 200})
  }
})

// 更新标签
router.get('/tags', checkAdmin, async (req, res) => {
  const { type, tags } = req.query
  if ( !type || !tags ) {
    res.send({code: 0, msg: '缺少参数'})
  } else {
    let tag = type == 'skill' ? 'skill_tags' : type == 'article' ? 'article_tags' : type == 'notes' ? 'notes_class' : 'sentences'
    await db.update('webside').column(tag, tags).where('id', 1).execute().catch(err => {
      console.log(err)
      res.send({code: 0, msg: '系统繁忙'})
      return
    })
    res.send({code: 200})
  }
})

// 获取访问量
router.get('/accesslog', checkAdmin, async (req, res) => {
  
  // select DATE_FORMAT(c_time,'%Y-%m-%d') as ymd,count(c_time) as num from access_log group by ymd
  let data = await db.select("DATE_FORMAT(time, '%Y-%m-%d') as ymd, count(time) as num").from('access_log').groupby('ymd').queryList().catch(err => {
    console.log(err)
    res.send({code: 0, msg: '系统繁忙'})
    return
  })

  let dayTimeStamp = 1000 * 60 * 60 * 24
  let dateObj = {}
  for ( let i = 0; i < 30; i++ ) {
    data.forEach(item => {
      if ( item.ymd == dateFormat(Date.parse(new Date()) - i * dayTimeStamp, 'yyyy-MM-dd') ) {
        dateObj[item.ymd] = item.num
      }
    })
  }
  for ( let i = 0; i < 30; i++ ) {
    if ( !dateObj[dateFormat(Date.parse(new Date()) - i * dayTimeStamp, 'yyyy-MM-dd')] ) {
      dateObj[dateFormat(Date.parse(new Date()) - i * dayTimeStamp, 'yyyy-MM-dd')] = 0
    }
  }

  res.send({code: 200, data: dateObj})
})

module.exports = router;
