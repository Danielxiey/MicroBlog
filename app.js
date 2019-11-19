var express = require('express');
var router = require('./router/router');
var session = require('express-session')

var app = express();

app.set('view engine', 'ejs');

app.use(express.static('./public'));
app.use(express.static('./avatar'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' }
}))

app.get('/', router.showIndex);
app.get('/register', router.showRegister);
app.post('/doregister', router.doregister);
app.get('/login', router.login);
app.post('/dologin', router.dologin);
app.get('/setavatar', router.setAvatar);
app.post('/uploadimg', router.uploadImg);
app.get('/cut', router.showcut);
app.get('/docut', router.docut);
app.post('/publish', router.publish);
app.get('/getallblogs', router.getAllBlogs);
app.get('/getuserinfo', router.getUserInfo);
app.get('/getblogscount', router.getBlogsCount);
app.get('/user/:username', router.personPage);
app.get('/userlist', router.userList);
app.get('/logout', router.logout);

app.listen(3000);