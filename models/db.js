var setting = require('../setting');
const MongoClient = require('mongodb').MongoClient;

//连接数据库(内部函数)
function _connectDB(dbName, callback) {
  const url = setting.dburl;
  const client = new MongoClient(url);
  client.connect(function (err) {
    if (err) {
      console.log(err);
      console.log("数据库连接失败！");
      client.close();
      return;
    }
    const db = client.db(dbName);
    callback(db, client);
  });
}

//插入数据
exports.insertOne = function (dbName, collectionName, data, callback) {
  _connectDB(dbName, function (db, client) {
    const collection = db.collection(collectionName);
    collection.insertOne(data, function (err, result) {
      callback(err, result);
      client.close();
    });
  })
}

//查找数据
exports.find = function(dbName, collectionName, query, args, callback) {
  let skipNum, limitNum, sortRule;
  if(arguments.length == 5) {
    skipNum = args.pageamount * (args.page - 1) || 0;
    limitNum = args.pageamount || 0;
    sortRule = args.sort || {};
  } else if(arguments.length == 4) {
    skipNum = 0;
    limitNum = 0;
    callback = arguments[3];
  } else {
    console.log("参数的个数为4个或5个");
    return;
  }
  
  _connectDB(dbName, function(db, client) {
    const collection = db.collection(collectionName);
    collection.find(query).limit(limitNum).skip(skipNum).sort(sortRule).toArray(function(err, docs) {
      callback(err, docs);
      client.close();
    });
  })
}

//删除数据
exports.deleteMany = function(dbName, collectionName, query, callback) {
  _connectDB(dbName, function(db, client) {
    const collection = db.collection(collectionName);
    collection.deleteMany(query, function(err, result) {
      callback(err, result);
      client.close();
    });    
  })
}

//修改数据
exports.updateMany = function(dbName, collectionName, query, data, callback) {
  _connectDB(dbName, function(db, client) {
    const collection = db.collection(collectionName);
    collection.updateMany(query, data, function(err, result) {
      callback(err, result);
      client.close();
    });
  })
}

//查找集合中的数据数量
exports.getAllCount = function(dbName, collectionName, callback) {
  _connectDB(dbName, function(db, client) {
    const collection = db.collection(collectionName);
    collection.count({},function(err, result) {
      callback(err, result);
      client.close();
    });
  });
}