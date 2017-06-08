import winston from 'winston'
import fs from 'fs'
import moment from 'moment'

const logDir = 'log';
const tsFormat = () => (new Date()).toLocaleTimeString();
const TIMESTAMP_FORMAT = 'HH:mm:ss.SSS'

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: () => `[${moment.utc().format(TIMESTAMP_FORMAT)}]`,
      colorize: true,
      prettyPrint: true,
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  }),
    new (winston.transports.File)({
      filename: `${logDir}/results.log`,
      timestamp: tsFormat,
      level: 'info'
    })
  ]
});

module.exports = logger
