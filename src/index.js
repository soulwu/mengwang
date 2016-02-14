/* eslint new-cap:0 */

import soap from 'soap';
import Q from 'q';
import defaults from 'lodash/defaults';
import noop from 'lodash/noop';
import isArray from 'lodash/isArray';
import {isMobilePhone} from 'validator';

class Mengwang {
  static errMap = {
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

  static defaultOptions = {
    wsdl: 'http://61.145.229.29:9006/MWGate/wmgw.asmx?wsdl',
    pszSubPort: '*',
    debug: process.env.NODE_DEBUG && /\bmengwang\b/.test(process.env.NODE_DEBUG),
    logger: noop
  };

  constructor(options) {
    this.options = defaults({}, options, Mengwang.defaultOptions);
    this.deferClient = Q.nfcall(soap.createClient, this.options.wsdl, {
      wsdl_options: {
        proxy: this.options.proxy,
        timeout: this.options.timeout
      }
    });
  }

  sendSms(mobiles, content) {
    const deferred = Q.defer();
    let mobileArr;
    if (isArray(mobiles)) {
      mobileArr = mobiles;
    } else {
      mobileArr = [mobiles];
    }

    if (mobileArr.length === 0 || !content) {
      return deferred.reject('mobile or content empty');
    }

    for (const mobile of mobileArr) {
      if (!isMobilePhone(mobile, 'zh-CN')) {
        return deferred.reject('mobile invalid');
      }
    }

    let logMsg = '';
    if (this.options.debug) {
      mobileArr.forEach((mobile, i) => {
        logMsg = `${logMsg}mobile${i + 1}[${mobile}] `;
      });
    }

    logMsg = `${logMsg}content[${content.substr(0, 30)}]`;

    this.deferClient.then((client) => {
      this.options.logger(`Call mengwang sendSms. ${logMsg}`);
      const startTime = Date.now();
      client.MongateCsSpSendSmsNew({
        userId: this.options.username,
        password: this.options.userpass,
        pszMobis: mobileArr.join(','),
        pszMsg: content,
        iMobiCount: mobileArr.length,
        pszSubPort: this.options.pszSubPort
      }, (err, result) => {
        this.options.logger(`Call mengwang complete. elapsedTime[${Date.now() - startTime}] ${logMsg}`);
        if (err) {
          this.options.logger(`Call mengwang sendSms failed. err[${err}] ${logMsg}`);
          deferred.reject(err);
          return;
        }
        let response = result;
        if (isArray(result)) {
          response = result[0];
        }
        logMsg = `${logMsg} result[${JSON.stringify(response)}]`;
        if (response && Math.abs(response.MongateCsSpSendSmsNewResult) > 999) {
          this.options.logger(`Call mengwang sendSms succ. ${logMsg}`);
          deferred.resolve(response.MongateCsSpSendSmsNewResult);
        } else {
          let errMsg = 'unknow error';
          if (response && Mengwang.errMap[response.MongateCsSpSendSmsNewResult]) {
            errMsg = Mengwang.errMap[response.MongateCsSpSendSmsNewResult];
          }
          this.options.logger(`Call mengwang sendSms err. err[${errMsg}] ${logMsg}`);
          deferred.reject(errMsg);
        }
      }, {
        proxy: this.options.proxy,
        timeout: this.options.timeout
      });
    }).catch((err) => {
      this.options.logger(`Get mengwang client failed. err[${err}] ${logMsg}`);
      deferred.reject(err);
    });

    return deferred.promise;
  }
}

export default Mengwang;
