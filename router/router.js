var formidable = require('formidable');
var db = require('../models/db');
var md5 = require('../models/md5').md5;
var fs = require('fs');
var gm = require('gm');

exports.showIndex = function(req, res) {
  if(req.session.login == 'true') {
    db.find('shuoshuo', 'users', {'username':req.session.username}, function(err, result) {
      res.render('index', {
        login: req.session.login,
        username: req.session.username,
        active: '首页',
        avatar: result[0].avatar
      });
    })
  } else {
    res.render('index', {
      login: req.session.login,
      username: req.session.username,
      active: '首页',
      avatar: 'default.jpg'
    });
  }

  
}

exports.showRegister = function(req, res) {
  res.render('register', {
    login: req.session.login,
    username: req.session.username,
    active: '注册'
  });
}

exports.doregister = function(req, res) {
  var form = new formidable.IncomingForm();
 
  form.parse(req, function(err, fields, files) {
    db.find('shuoshuo', 'users', {'username': fields.username}, function(err, result) {
      if(err) {
        res.json(-3);
        return;
      }
      if(result.length != 0) {
        res.json(-1);
        return;
      }
      db.insertOne('shuoshuo', 'users', {
        'username': fields.username,
        'password': md5(md5(fields.password) + 'daniel'),
        'avatar': 'default.jpg'
      }, function(err, result) {
        if(err) {
          res.json(-3);
          return;
        }
        req.session.username = fields.username;
        req.session.login = 'true';
        res.json(1);
      })
    });
  });
}

exports.login = function(req, res) {
  res.render('login', {
    login: req.session.login,
    username: req.session.username,
    active: '登录'
  });
}

exports.dologin = function(req, res) {
  var form = new formidable.IncomingForm();
 
  form.parse(req, function(err, fields, files) {
    db.find('shuoshuo', 'users', {'username': fields.username}, function(err, result) {
      if(err) {
        res.json(-5);   //服务器错误
        return;
      }
      if(result.length == 0) {
        res.json(-1);   //用户不存在
        return;
      }
      var password = md5(md5(fields.password) + 'daniel');
      if(password == result[0].password) {
        req.session.username = result[0].username;
        req.session.login = 'true';
        res.json(1);    //登录成功
      } else {
        res.json(-2);   //密码错误
      }
    })
  });
}

exports.setAvatar = function(req, res) {
  if(req.session.login == 'true') {
    res.render('setavatar', {
      login: req.session.login,
      username: req.session.username,
      active: '个人资料'
    });
  } else {
    res.send('未获取到用户权限，请先登录！');
  }
}

exports.uploadImg = function(req, res) {
  var form = new formidable.IncomingForm();
  form.uploadDir = __dirname + "/../avatar";

  form.parse(req, function(err, fields, files) {
    var oldpath = files.avatar.path;
    var newpath = __dirname + "/../avatar/" + req.session.username + '.jpg';
    fs.rename(oldpath, newpath, function(err) {
      if(err) {
        console.log(err);
        res.json(-1);
        return;
      }
      db.updateMany('shuoshuo', 'users', {'username': req.session.username}, {$set: {'avatar': req.session.username + '.jpg'}}, function(err, result) {
        if(err) {
          res.json(-1);
          return;
        }
        res.json(1);
      })
    })
  });
}

exports.showcut = function(req, res) {
  if(req.session.login == 'true') {
    res.render('cut', {
      'avatar': req.session.username + '.jpg'
    });
  } else {
    res.send('未获取到用户权限，请先登录！');
  }
}

exports.docut = function(req, res) {
  var w = req.query.w;
  var h = req.query.h;
  var x = req.query.x;
  var y = req.query.y;
  gm('./avatar/' + req.query.filename)
  .crop(w, h, x, y)
  .resize(200, 200, '!')
  .write('./avatar/' + req.query.filename, function (err) {
    if(err) console.log(err);
    if (!err) res.json('裁剪成功！');
  });
}

exports.publish = function(req, res) {
  if(req.session.login != 'true') {
    res.send('未获取到用户权限，请先登录！');
    return;
  }
  var form = new formidable.IncomingForm();
 
  form.parse(req, function(err, fields, files) {
    db.insertOne('shuoshuo', 'blogs', {
      'username': req.session.username,
      'datetime': Date(),
      'content': fields.content
    }, function(err, result) {
      if(err) {
        res.json(-1);
        return;
      }
      res.json(1);
    })
  });
}

exports.getAllBlogs = function(req, res) {
  db.find('shuoshuo', 'blogs', {}, {'pageamount': 6, 'page': req.query.page, 'sort': {'datetime': -1}}, function(err, result) {
    if(err) {
      console.log(err);
      return;
    }
    res.json(result);
  });
}

exports.getUserInfo = function(req, res) {
  db.find('shuoshuo', 'users', {'username': req.query.username}, function(err, result) {
    if(err) {
      console.log(err);
      return;
    }
    res.json({
      'username': result[0].username,
      'avatar': result[0].avatar
    });
  });
}

exports.getBlogsCount = function(req, res) {
  db.getAllCount('shuoshuo', 'blogs', function(err, result) {
    if(err) {
      console.log(err);
      return;
    }
    res.json(result);
  })
}

exports.personPage = function(req, res) {
  var username = req.params.username;
  db.find('shuoshuo', 'blogs', {'username': username}, {sort: {'datetime': -1}}, function(err, result) {
    if(err) {
      console.log(err);
      return;
    }
    db.find('shuoshuo', 'users', {'username': username}, function(err, info) {
      if(err) {
        console.log(err);
        return;
      }
      var active = '';
      if(req.session.username == username) {
        active = '我的微博'
      }
      res.render('user', {
        login: req.session.login,
        username: req.session.username,
        active: active,
        user: username,
        blogs: result,
        useravatar: info[0].avatar
      });
    })
  });
}

exports.userList = function(req, res) {
  db.find('shuoshuo', 'users', {}, function(err, result) {
    if(err) {
      console.log(err);
      return;
    }
    res.render('userlist', {
      login: req.session.login,
      username: req.session.username,
      active: '成员列表',
      members: result
    })
  })
}

exports.logout = function(req, res) {
  req.session.destroy(function(err) {
    res.redirect('/');
  });
}