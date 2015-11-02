soap = require 'soap'
_ = require 'lodash'
Q = require 'q'

{conf, Log, util} = require '../../../mediator'

class Mengwang
  @errMap:
    "-1": "参数为空。信息、电话号码等有空指针，登陆失败"
    "-2": "电话号码个数超过100"
    "-10": "申请缓存空间失败"
    "-11": "电话号码中有非数字字符"
    "-12": "有异常电话号码"
    "-13": "电话号码个数与实际个数不相等"
    "-14": "实际号码个数超过100"
    "-101": "发送消息等待超时"
    "-102": "发送或接收消息失败"
    "-103": "接收消息超时"
    "-200": "其他错误"
    "-999": "web服务器内部错误"
    "-10001": "用户登陆不成功"
    "-10002": "提交格式不正确"
    "-10003": "用户余额不足"
    "-10004": "手机号码不正确"
    "-10005": "计费用户帐号错误"
    "-10006": "计费用户密码错"
    "-10007": "账号已经被停用"
    "-10008": "账号类型不支持该功能"
    "-10009": "其它错误"
    "-10010": "企业代码不正确"
    "-10011": "信息内容超长"
    "-10012": "不能发送联通号码"
    "-10013": "操作员权限不够"
    "-10014": "费率代码不正确"
    "-10015": "服务器繁忙"
    "-10016": "企业权限不够"
    "-10017": "此时间段不允许发送"
    "-10018": "经销商用户名或密码错"
    "-10019": "手机列表或规则错误"
    "-10021": "没有开停户权限"
    "-10022": "没有转换用户类型的权限"
    "-10023": "没有修改用户所属经销商的权限"
    "-10024": "经销商用户名或密码错"
    "-10025": "操作员登陆名或密码错误"
    "-10026": "操作员所充值的用户不存在"
    "-10027": "操作员没有充值商务版的权限"
    "-10028": "该用户没有转正不能充值"
    "-10029": "此用户没有权限从此通道发送信息"
    "-10030": "不能发送移动号码"
    "-10031": "手机号码(段)非法"
    "-10032": "用户使用的费率代码错误"
    "-10033": "非法关键词"
  constructor: (@options) ->
    @deferClient = Q.nfcall soap.createClient, @options.wsdl,
      wsdl_options:
        proxy: @options.proxy
        timeout: @options.timeout
    @options.debug = @options.debug || process.env.NODE_DEBUG && /\bmengwang\b/.test(process.env.NODE_DEBUG)
    if @options.logger
      @_logger = @options.logger
    else if @options.debug
      @_logger = console.log.bind console
    else
      @_logger = _.noop
  sendSms: (mobiles, content) ->
    deferred = Q.defer()
    if not mobiles or not content
      deferred.reject 'mobile or content empty'
    else if not (_.isString(mobiles) and util.isMobile(mobiles) or _.isArray(mobiles) and _.all(mobiles, -> util.isMobile(@)))
      deferred.reject 'mobile invalid'
    else
      if _.isString mobiles then mobiles = [mobiles]
      logMsg = ''
      for mobile, i in mobiles
        logMsg += "mobile#{i + 1}[#{util.maskMobile mobile}] "
      logMsg += "content[#{content.substr 0, 30}]"
      @deferClient.then (client) =>
        Log.log "Call mengwang sendSms. #{logMsg}", Log.TRACE, "#{logPrefix}.sendSms"
        time = Date.now()
        client.MongateCsSpSendSmsNew
          userId: @options.username
          password: @options.userpass
          pszMobis: mobiles.join ','
          pszMsg: content
          iMobiCount: mobiles.length
          pszSubPort: @options.pszSubPort
        , (err, result) ->
            Log.log "Call mengwang complete. elapsedTime[#{Date.now() - time}] #{logMsg}", Log.TRACE, "#{logPrefix}.sendSms"
            if _.isArray result then result = result[0]
            if err
              Log.log "Call mengwang sendSms failed. err[#{err}] #{logMsg}", Log.TRACE, "#{logPrefix}.sendSms"
              deferred.reject err
            else
              logMsg += " result[#{JSON.stringify result}]"
              if result and Math.abs(result.MongateCsSpSendSmsNewResult) > 999
                Log.log "Call mengwang sendSms succ. #{logMsg}", Log.TRACE, "#{logPrefix}.sendSms"
                deferred.resolve result.MongateCsSpSendSmsNewResult
              else
                errMsg = result and Mengwang.errMap[result.MongateCsSpSendSmsNewResult] or 'unknow error'
                Log.log "Call mengwang sendSms err. err[#{errMsg}] #{logMsg}", Log.ERROR, "#{logPrefix}.sendSms"
                deferred.reject errMsg
        ,
          proxy: @options.proxy
          timeout: @options.timeout
      .catch (err) ->
        Log.log "Get mengwang client failed. err[#{err}]", Log.ERROR, "#{logPrefix}.sendSms"
        deferred.reject err
    deferred.promise

module.exports = new Mengwang conf.sms.components.mengwang