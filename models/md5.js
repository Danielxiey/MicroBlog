var crypto = require('crypto');

exports.md5 = function(psw) {
  var md5 = crypto.createHash('md5');
  return md5.update(psw).digest('base64');
}