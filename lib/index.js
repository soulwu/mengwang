'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint camelcase:0 */

var _soap = require('soap');

var _soap2 = _interopRequireDefault(_soap);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _defaults = require('lodash/defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _validator = require('validator');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Mengwang = function () {
  function Mengwang(options) {
    _classCallCheck(this, Mengwang);

    this.options = (0, _defaults2.default)({}, options, Mengwang.defaultOptions);
    this.deferClient = _q2.default.nfcall(_soap2.default.createClient, this.options.wsdl, {
      wsdl_options: {
        proxy: this.options.proxy,
        timeout: this.options.timeout
      }
    });
  }

  _createClass(Mengwang, [{
    key: 'sendSms',
    value: function sendSms(mobiles, content) {
      var _this = this;

      var deferred = _q2.default.defer();
      var mobileArr = void 0;
      if ((0, _isArray2.default)(mobiles)) {
        mobileArr = mobiles;
      } else {
        mobileArr = [mobiles];
      }

      if (mobileArr.length === 0 || !content) {
        return deferred.reject('mobile or content empty');
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = mobileArr[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var mobile = _step.value;

          if (!(0, _validator.isMobilePhone)(mobile, 'zh-CN')) {
            return deferred.reject('mobile invalid');
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var logMsg = '';
      if (this.options.debug) {
        mobileArr.forEach(function (mobile, i) {
          logMsg = logMsg + 'mobile' + (i + 1) + '[' + mobile + '] ';
        });
      }

      logMsg = logMsg + 'content[' + content.substr(0, 30) + ']';

      this.deferClient.then(function (client) {
        _this.options.logger('Call mengwang sendSms. ' + logMsg);
        var startTime = Date.now();
        client.MongateCsSpSendSmsNew({
          userId: _this.options.username,
          password: _this.options.userpass,
          pszMobis: mobileArr.join(','),
          pszMsg: content,
          iMobiCount: mobileArr.length,
          pszSubPort: _this.options.pszSubPort
        }, function (err, result) {
          _this.options.logger('Call mengwang complete. elapsedTime[' + (Date.now() - startTime) + '] ' + logMsg);
          if (err) {
            _this.options.logger('Call mengwang sendSms failed. err[' + err + '] ' + logMsg);
            deferred.reject(err);
            return;
          }
          var response = result;
          if ((0, _isArray2.default)(result)) {
            response = result[0];
          }
          logMsg = logMsg + ' result[' + JSON.stringify(response) + ']';
          if (response && Math.abs(response.MongateCsSpSendSmsNewResult) > 999) {
            _this.options.logger('Call mengwang sendSms succ. ' + logMsg);
            deferred.resolve(response.MongateCsSpSendSmsNewResult);
          } else {
            var errMsg = 'unknow error';
            if (response && Mengwang.errMap[response.MongateCsSpSendSmsNewResult]) {
              errMsg = Mengwang.errMap[response.MongateCsSpSendSmsNewResult];
            }
            _this.options.logger('Call mengwang sendSms err. err[' + errMsg + '] ' + logMsg);
            deferred.reject(errMsg);
          }
        }, {
          proxy: _this.options.proxy,
          timeout: _this.options.timeout
        });
      }).catch(function (err) {
        _this.options.logger('Get mengwang client failed. err[' + err + '] ' + logMsg);
        deferred.reject(err);
      });

      return deferred.promise;
    }
  }]);

  return Mengwang;
}();

Mengwang.errMap = {
  '-1': '参数为空。信息、电话号码等有空指针，登陆失败',
  '-2': '电话号码个数超过100',
  '-10': '申请缓存空间失败',
  '-11': '电话号码中有非数字字符',
  '-12': '有异常电话号码',
  '-13': '电话号码个数与实际个数不相等',
  '-14': '实际号码个数超过100',
  '-101': '发送消息等待超时',
  '-102': '发送或接收消息失败',
  '-103': '接收消息超时',
  '-200': '其他错误',
  '-999': 'web服务器内部错误',
  '-10001': '用户登陆不成功',
  '-10002': '提交格式不正确',
  '-10003': '用户余额不足',
  '-10004': '手机号码不正确',
  '-10005': '计费用户帐号错误',
  '-10006': '计费用户密码错',
  '-10007': '账号已经被停用',
  '-10008': '账号类型不支持该功能',
  '-10009': '其它错误',
  '-10010': '企业代码不正确',
  '-10011': '信息内容超长',
  '-10012': '不能发送联通号码',
  '-10013': '操作员权限不够',
  '-10014': '费率代码不正确',
  '-10015': '服务器繁忙',
  '-10016': '企业权限不够',
  '-10017': '此时间段不允许发送',
  '-10018': '经销商用户名或密码错',
  '-10019': '手机列表或规则错误',
  '-10021': '没有开停户权限',
  '-10022': '没有转换用户类型的权限',
  '-10023': '没有修改用户所属经销商的权限',
  '-10024': '经销商用户名或密码错',
  '-10025': '操作员登陆名或密码错误',
  '-10026': '操作员所充值的用户不存在',
  '-10027': '操作员没有充值商务版的权限',
  '-10028': '该用户没有转正不能充值',
  '-10029': '此用户没有权限从此通道发送信息',
  '-10030': '不能发送移动号码',
  '-10031': '手机号码(段)非法',
  '-10032': '用户使用的费率代码错误',
  '-10033': '非法关键词'
};
Mengwang.defaultOptions = {
  wsdl: 'http://61.145.229.29:9006/MWGate/wmgw.asmx?wsdl',
  pszSubPort: '*',
  debug: process.env.NODE_DEBUG && /\bmengwang\b/.test(process.env.NODE_DEBUG),
  logger: _noop2.default
};
exports.default = Mengwang;