var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var MongoClient = require('mongodb').MongoClient
var url = "mongodb://localhost:27017/info"
var fs = require('fs');
var util = require("./util/index")
var insertFindUnpay = util.insertFindUnpay
var findAllUnPay = util.findAllUnPay
var insOne = util.insOne
var delOne = util.delOne
var findOne = util.findOne
var file = "./mock.json";
var file2 = "./mock2.json";
var formidable = require("formidable");
var bodyParser = require("body-parser");

app.use(bodyParser.json({ limit: '10mb' })); // for parsing application/json
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // for parsing application/x-www-form-urlencoded

// 设置cros跨域
app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1')
  if (req.method == "OPTIONS") res.send(200);/*让options请求快速返回*/
  else next();
});


io.on("connection", function (socket) {
  socket.on('cSelected', function (data) { // 监听客户端的订单变化，并更新到商家)
      MongoClient.connect(url, function (err, db) {
      var orderInfo = db.db("orderInfo")
      var unpayList = orderInfo.collection("unpayList") // unpayList未支付订单的集合
      if (err) throw err;
      console.log("数据库已创建!");
      let order = {}
      if (data.subOrderListId == 1) { //该桌用户首次下单
        order = {
          "deskId": data.deskId,
          "total": data.subTotal,
          "shopList": [
            {
              "deskId": data.deskId,
              "subOrderListId": data.subOrderListId,
              "status": data.status,
              "subTotal": data.subTotal,
              "subShopList": data.cSelected,
              "createTime": +new Date()
            }
          ]
        }
        insertFindUnpay(io, db, unpayList, order) //调用promise进行现插入再查询
        findOne(io, db, unpayList, { "deskId": data.deskId }) // 查找该桌号的所有未支付订单，发送给顾客
      } else { //该桌用户后续加菜
        unpayList.find({ "deskId": data.deskId }).toArray((err, result) => {
          if (err) {
            console.log('数据查询失败！');
            db.close();
            return;
          };
          // console.log(result)
          let newTotal = result[0].total + data.subTotal //更新订单总价
          let newShopList = result[0].shopList // 更新该桌的清单列表
          newShopList.push({ // 新加清单项
            "deskId": data.deskId,//该清单桌号
            "subOrderListId": data.subOrderListId, //清单id
            "status": data.status, // 该清单状态
            "subTotal": data.subTotal, // 该清单小计
            "subShopList": data.cSelected, //该清单的用户选择商品列表
            "createTime": +new Date()// 该清单创建时间
          })
          order = {
            "deskId": data.deskId,//该订单桌号
            "total": newTotal,//该订单总价
            "shopList": newShopList,// 该订单用户的清单项
          }
          delOne(db, unpayList, { "deskId": data.deskId })//删除一条数据
          insOne(db, unpayList, order) // 添加一条数据
          findAllUnPay(io, db, unpayList) // 查找所有未支付订单，并发送
          findOne(io, db, unpayList, { "deskId": data.deskId }) // 查找该桌号的所有未支付订单，发送给顾客
          db.close()
        })
      }
    })
  })

  // 商家点击确认修改
  socket.on('bSelected', function (data) {
    console.log(data)
    MongoClient.connect(url, function (err, db) {
      var orderInfo = db.db("orderInfo")
      var unpayList = orderInfo.collection("unpayList") // unpayList未支付订单的集合
      if (err) throw err;
      console.log("数据库已创建!");
      var bSelected = []
      var total = 0
      new Promise((resolve,reject)=>{
      unpayList.find({ "deskId": data.deskId }).toArray((err, result) => {
        // console.log(result[0].shopList)
        if (err) {
          reject(err)
          db.close();
          return;
        }
        bSelected = result[0].shopList
        for (let i = 0; i < bSelected.length; i++) {
          if (data.subOrderListId == bSelected[i].subOrderListId) {
            bSelected[i].subShopList = data.bSelected
            bSelected[i].subTotal = data.subTotal
          }
          total += bSelected[i].subTotal
        }
        console.log("数据修改完成")
        unpayList.updateOne({ deskId: data.deskId }, { $set: { 'shopList': bSelected, "total": total } }, function (err, res) {
          if (err) { err } else {
            console.log("文档更新成功")
          }
        })
        resolve() //必写
      })
    })
    .then(()=> {
        unpayList.find({}).toArray((err, result) => {
          io.sockets.emit('fromcSeleted', { "unpayList": result })
        })
        // findOne(io, db, unpayList, { "deskId": data.deskId }) // 查找该桌号的所有未支付订单，发送给顾客
        unpayList.findOne( { "deskId": data.deskId },(err, result) => {
          io.sockets.emit('frombSeleted', { "unpayList": result ,"deskId": data.deskId})
        })
        db.close()
      })
    })
  })

  // 商家点击下厨
  socket.on('updataCook', function (data) {
  MongoClient.connect(url, function (err, db) {
    var orderInfo = db.db("orderInfo")
    var unpayList = orderInfo.collection("unpayList") // unpayList未支付订单的集合
    if (err) throw err;
    console.log("数据库已创建!");
    new Promise((resolve,reject)=>{
      let bSelected = []
      unpayList.find({ "deskId": data.deskId }).toArray((err, result) => {
        // console.log(result[0].shopList)
        if (err) {
          reject(err)
          db.close();
          return;
        }
        bSelected = result[0].shopList
        for (let i = 0; i < bSelected.length; i++) {
          if (data.subOrderListId == bSelected[i].subOrderListId) {
            bSelected[i].status = 1
          }
        }
        console.log("数据修改完成")
        unpayList.updateOne({ deskId: data.deskId }, { $set: { 'shopList': bSelected } }, function (err, res) {
          if (err) { err } else {
            console.log("文档更新成功")
          }
        })
        resolve() //必写
      })
    })
    .then(()=> {
        unpayList.find({}).toArray((err, result) => {
          io.sockets.emit('fromcSeleted', { "unpayList": result })
        })
        // findOne(io, db, unpayList, { "deskId": data.deskId }) // 查找该桌号的所有未支付订单，发送给顾客
        unpayList.findOne( { "deskId": data.deskId },(err, result) => {
          io.sockets.emit('frombSeleted', { "unpayList": result , "deskId": data.deskId})
        })
        db.close()
      })
  console.log(data)
  })
})

// 商家点击结账
socket.on('payDeckId', function (data) {
  MongoClient.connect(url, function (err, db) {
    var orderInfo = db.db("orderInfo")
    var unpayList = orderInfo.collection("unpayList") // unpayList未支付订单的集合
    var payList = orderInfo.collection("payList") // payList已支付订单的集合
    if (err) throw err;
    console.log("数据库已创建!");
    unpayList.findOne( { "deskId": data.deskId },(err, result) => {
      result.payTime = +new Date() // 新增id，time，属性
      result.id = +new Date()
    insOne(db, payList, result) // 向payList添加一条数据
    delOne(db, unpayList, { "deskId": data.deskId })// 在unpayList删除一条数据
    unpayList.findOne( { "deskId": data.deskId },(err, result) => {
      console.log(result)
      io.sockets.emit('frombSeleted', { "unpayList": result ,"deskId": data.deskId})
    })
    db.close()
    })
  })
})

})



// 顾客请求
app.get('/customerInfo', function (req, res) {
    console.log(req.query)
  // var allShopList = JSON.parse(fs.readFileSync(file))
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var orderInfo = db.db("orderInfo")
    var unpayList = orderInfo.collection("unpayList")
    unpayList.find({ "deskId": req.query.deskId }).toArray(function (err, result) { // 返回集合中所有数据
      if (err) throw err;
      res.send(JSON.stringify({"unpayList": result[0] })) // 发送菜单和当前桌号的未支付数据
      db.close()
    })
    db.close()
  })
});

//  商家请求所有未支付列表
app.get('/unpayList', function (req, res) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var orderInfo = db.db("orderInfo")
    var unpayList = orderInfo.collection("unpayList")
    unpayList.find().toArray(function (err, result) { // 返回集合中所有数据
      if (err) throw err;
      // console.log(result);
      res.send(JSON.stringify({ "unpayList": result }))
      db.close()
    })
    db.close()
  })
});

// 商家请求所有已支付列表
app.get('/payList', function (req, res) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var orderInfo = db.db("orderInfo")
    var payList = orderInfo.collection("payList")
    let today = new Date(new Date().toLocaleDateString()).getTime()
    payList.find({payTime : {$gte  : today}}).sort({"payTime":-1}).toArray(function (err, result) { // 返回集合中今日已结账订单数据
      if (err) throw err;
      res.send(JSON.stringify({ "payList": result }))
      db.close()
    })
    db.close()
  })
});

//商家请求特定订单号
app.get('/getInputOrderDetail', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var orderInfo = db.db("orderInfo")
        var payList = orderInfo.collection("payList")
        console.log(req.query.orderId)
        payList.find({'id': +req.query.orderId}).toArray(function (err, result) { // 返回集合中今日已结账订单数据
            if (err) throw err;
            console.log(result)
            res.send(JSON.stringify({ "payList": result }))
            db.close()
        })
        db.close()
    })
});

app.get('/allShopList', function (req, res) {
  var allShopList = JSON.parse(fs.readFileSync(file))
  res.send(JSON.stringify(allShopList))
})

app.use('/public', express.static('public'));

app.post('/upload', function (req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (error, fields, files) {
    // console.log(files)
    // console.log(fields.id)//from表单元素的其他传参从fields获取！！！！！！  文件信息从files获取！！！
    if (!files.file) {
      res.send("没有传图片")
    } else {
      fs.writeFileSync(`public/${fields.id}.png`, fs.readFileSync(files.file.path)); // 写入文件
    }
    fs.readFile(file, 'utf-8', function (err, data) {
      if (err) {
        console.log(err);
        return;
      } else {
        var mock = JSON.parse(data).data
        for (let i = 0; i < mock.length; i++) {
          if (mock[i].id == fields.id) {
            mock[i].name = fields.name
            mock[i].price = fields.price
            mock[i].describtion = fields.describtion
          }
          // console.log(mock[i].id)
        }
        var str = JSON.stringify({"data":mock});//因为nodejs的写入文件只认识字符串或者二进制数，所以把json对象转换成字符串重新写入json文件中
        fs.writeFile(file, str, function (err) {
          if (err) {
            console.error(err);
          }
          console.log('修改成功');
          res.send(mock)
        })
      }
    })
  })
})


// app.post('/server', function (req, res) { // 将图片转换成base64位储存
//   console.log(req.body.id)
//     fs.readFile(file, 'utf-8',function (err, data) {
//       if (err) {
//         console.log(err);
//         return;
//       } else {
//         var mock = JSON.parse(data).data
//         for(let i=0;i<mock.length;i++){
//           if(mock[i].id == req.body.id){
//             mock[i].src = req.body.data
//           }
//         }
//         var str = JSON.stringify(mock);//因为nodejs的写入文件只认识字符串或者二进制数，所以把json对象转换成字符串重新写入json文件中
//         fs.writeFile(file,str,function(err){
//             if(err){
//                 console.error(err);
//             }
//             console.log('修改成功');
//         })
//         if(data){
//           res.send({ "status": data })
//           // res.send({ "status": 1, "target": req.body.data, })//测试使用
//         }
//       }
//     })
// })

http.listen(3000, function () {
  console.log('succeed')
});
