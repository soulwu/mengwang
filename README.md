# mengwang
Node.js SDK for mengwang sms SOAP.

[![Build Status](https://travis-ci.org/soulwu/mengwang.svg?branch=master)](https://travis-ci.org/soulwu/mengwang)

Examples
--------

``` js
import Mengwang from 'mengwang';

const mengwang = new Mengwang({
  username: '<Your userId>',
  userpass: '<Your password>'
});

mengwang.sendSms('13700000000', '我是内容').then((result) => {
  console.log(result);
}, (err) => {
  console.error(err);
});
```

Installation
------------

``` bash
$ npm install mengwang
```

Documents
---------

### Table of Contents
- [Class: Mengwang](#class-mengwang)
    - [new Mengwang(options)](#new-mengwangoptions)
    - [mengwang.sendSms(mobile, content)](#mengwangsendsmsmobile-content)

### Class: Mengwang
This class is a wrapper for mengwang sms SOAP API

#### new Mengwang(options)
Construct a new mengwang object

`options` is an object with the following defaults:

``` js
{
  wsdl: 'http://61.145.229.29:9006/MWGate/wmgw.asmx?wsdl',
  pszSubPort: '*',
  debug: false,
  logger: () => {}
}
```

`options`'s property list as below:

| Name          | type     | Description                             | Requirement |
| ------------- | -------- | --------------------------------------- | ----------- |
| wsdl          | string   | WSDL                                    | optional    |
| pszSubPort    | string   | sub port                                | optional    |
| username      | string   | The userId                              | required    |
| userpass      | string   | The password                            | required    |
| debug         | bool     | Debug toggle                            | optional    |
| logger        | function | A logger handler                        | optional    |
| proxy         | string   | Proxy for someone behind a firewall     | optional    |
| timeout       | integer  | Timeout for request                     | optional    |

`logger` function accept only one argument `msg` like

``` js
(msg) => {
  // do some thing...
}
```

| Name | type   | Description | Requirement |
| ---- | ------ | ----------- | ----------- |
| msg  | string | Log message | optional    |

#### mengwang.sendSms(mobile, content)
Send sms `content` to `mobile`

| Name       | type         | Description                           | Requirement |
| ---------- | ------------ | ------------------------------------- | ----------- |
| mobile     | string/array | User's mobile to receive sms          | required    |
| content    | string       | Token played                          | required    |

License
-------

MIT License. See the [`LICENSE`](LICENSE) file.


