// 导入MySQL模块
const mysql = require('mysql')
// 建立与MySQL数据库的连接
const db = mysql.createPool({
    host: '127.0.0.1', // 数据库的IP地址
    user: 'root', // 登录数据库的账号
    password: 'admin', // 登录数据库的密码
    database: 'my_db_01' // 指定要操作哪个数据库
})

// 检测mysql模块是否能正常工作
db.query('select 1', (err, res) => {
    if(err) return console.log(err.message)
    // 只要能打印出[ RowDataPacket {'1': 1} ]的结果，就证明数据库连接正常
    console.log(res)
})
db.query('select * from users', (err, res) => {
    if(err) return console.log(err.message)
    // 成功
    console.log(res)
})