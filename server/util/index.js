module.exports.insertFindUnpay = (io,db,col,order)=> { // 更新数据，并发送到商家
  // 数据库插入和查询是异步的，为了确保数据插入后再查询必须使用回调函数！！！！！！！！或者Promise将异步变同步
  new Promise((resolve,reject)=>{
    col.insertOne(order, (err, result) => {
     if (err) {
       reject(err)
       db.close();
       return;
     }
     resolve() //必写
    console.log("插入成功")
   })
 })
 .then(()=> {
   col.find().toArray(function (err, result) { // 返回集合中所有数据
     if (err) throw err 
     io.sockets.emit('fromcSeleted', { "unpayList": result })
      console.log("查找成功")
     db.close()
   })
 })
}

module.exports.findAllUnPay = (io,db,col)=> {// 查找所有未支付订单，并发送到商家
  col.find().toArray(function (err, result) { // 返回集合中所有数据
    if (err) throw err
    io.sockets.emit('fromcSeleted', { "unpayList": result })
    console.log("查找成功")
    db.close()
  })
}

module.exports.insOne = (db,col,order)=> { // 添加一条数据
  col.insertOne(order, (err, result) => {
    if (err) {
      console.log('数据插入失败！')
      db.close();
      return;
    }
    console.log("插入成功")
    db.close()
  })
}

module.exports.delOne = (db,col,data)=> { // 删除一条数据
  col.deleteOne(data,(err, result) => {
    if (err) {
      console.log('数据删除失败！')
      db.close()
      return;
    }
    console.log("删除成功")
    db.close()
  })
}

module.exports.findOne = (io,db,col,data)=> { // 查找对应桌号的数据并发送到message客户端
  col.findOne(data,(err, result) => {
    if (err) {
      console.log('数据查找失败！')
      db.close()
      return;
    }
    console.log("查找成功")
    io.sockets.emit('message', { "unpayList": result ,"status": 1})
    db.close()
  })
}