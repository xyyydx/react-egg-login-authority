'use strict';

const Controller = require('egg').Controller;
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const axios = require('axios')
const OSS = require('ali-oss');

const key = "179521"
const client_id = "3303e7ad1d86776dbe8e9a2653e65fcfda3d628e14b1423138c8cb8d62e39b49"
const redirect_uri = 'http://127.0.0.1:7001/ThirdParty'
const client_secret = "3aa773c1fb259135f50d96b91373ddbf6f940fade0b00576ada155fd119c64c2"

// oss图片上传
let client = new OSS({
  // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: 'oss-cn-hangzhou',
  // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
  accessKeyId: 'LTAI5tMHmTfbSARMNAgVfXLr',
  accessKeySecret: 'pYsZ6Ja7RmMzboM7foZ8862A6lysmD',
  bucket: 'wwwxyyydscn'
});

class HomeController extends Controller {
  exec(pas) {
    const res = `pas=${pas}&secret=${key}`
    const pass = crypto.createHash('md5').update(res).digest('hex')
    return pass
  }
  // 登录
  async login() {
    const { ctx } = this;
    const { form: { username, password } } = ctx.request.body
    const results = await this.app.mysql.get('login', { username, password: this.exec(password) });
    if (results) {
      const token = jwt.sign({ username }, 'key');
      delete results.password
      ctx.body = {
        code: 200,
        message: '登陆成功',
        token: token,
        userInfo: results
      }
    } else {
      ctx.body = {
        code: 304,
        message: '请先注册账号'
      }
    }
  }
  // 注册
  async register() {
    const { ctx } = this
    const { form: { username, password, authority } } = ctx.request.body
    const post = await this.app.mysql.get('login', { username });
    if (post) {
      ctx.body = {
        code: 304,
        message: "账号已经被注册"
      }
    } else {
      const res = authority ? "[1001, 1002, 1003, 1004, 1005, 1006,1007]" : "[1001, 1002, 1003,1004]"
      console.log(res)
      const result = await this.app.mysql.insert('login', { username, password: this.exec(password), authority: res });
      if (result.affectedRows === 1) {
        ctx.body = {
          code: 200,
          message: "注册成功"
        }
      } else {
        ctx.body = {
          code: 304,
          message: "注册失败"
        }
      }
    }
  }
  // 修改
  async modification() {
    const { ctx } = this
    const { form: { username, password, newPassword } } = ctx.request.body
    const post = await this.app.mysql.get('login', { username, password });
    if (post) {
      const row = { password: newPassword };
      const options = { where: { username: username } };
      const result = await this.app.mysql.update('login', row, options);
      console.log(result)
      if (result.affectedRows === 1) {
        ctx.body = {
          code: 200,
          message: '修改成功'
        }
      } else {
        ctx.body = {
          code: 304,
          message: '修改失败'
        }
      }
    } else {
      ctx.body = {
        code: 304,
        message: '用户密码错误'
      }
    }
  }
  // 第三方
  async ThirdParty() {
    // 临时的
    const { code } = this.ctx.query
    // 获取登录令牌
    const res = await axios.post(`https://gitee.com/oauth/token?grant_type=authorization_code&code=${code}&client_id=${client_id}&redirect_uri=${redirect_uri}&client_secret=${client_secret}`)
    const token = res.data.access_token
    // 获取用户的信息
    const userInfo = await axios.get(`https://gitee.com/api/v5/user?access_token=${token}`)

    this.ctx.response.redirect(`http://localhost:3000/home?name=${userInfo.data.name}&url=${userInfo.data.avatar_url}`)
  }
  // oss图片上传
  async upload() {
    console.log(111)
    const { ctx } = this
    let file = ctx.request.files[0];
    console.log(file)
    let data = await client.put(file.filename, file.filepath)
    console.log(data.url)
    ctx.body = {
      code: 200
    }
  }
}

module.exports = HomeController;
