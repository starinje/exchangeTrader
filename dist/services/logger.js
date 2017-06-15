'use strict';

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logDir = 'log';
var tsFormat = function tsFormat() {
  return new Date().toLocaleTimeString();
};
var TIMESTAMP_FORMAT = 'HH:mm:ss.SSS';

if (!_fs2.default.existsSync(logDir)) {
  _fs2.default.mkdirSync(logDir);
}

var logger = new _winston2.default.Logger({
  transports: [new _winston2.default.transports.Console({
    timestamp: function timestamp() {
      return '[' + _moment2.default.utc().format(TIMESTAMP_FORMAT) + ']';
    },
    colorize: true,
    prettyPrint: true,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }), new _winston2.default.transports.File({
    filename: logDir + '/results.log',
    timestamp: tsFormat,
    level: 'info'
  })]
});

module.exports = logger;
//# sourceMappingURL=logger.js.map