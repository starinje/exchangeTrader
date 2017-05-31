'use strict';

var main = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var timeDelta, tradeThreshhold, orderBookGemini, orderBookGdax;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            timeDelta = 2000;
            tradeThreshhold = .01;


            logger.info('running arbitrage strategy...');
            _context.next = 5;
            return geminiService.getOrderBook();

          case 5:
            orderBookGemini = _context.sent;
            _context.next = 8;
            return gdaxService.getOrderBook();

          case 8:
            orderBookGdax = _context.sent;

            logger.info(orderBookGemini);
            logger.info(orderBookGdax);
            // let orderBookGDAX = getOrderBook('gdax')

            // let priceDelta = await calculatePriceDelta(orderBookGemini, orderBookGDAX)
            // logger.info(`priceDelta is ${priceDelta}`)

            // if(priceDelta > tradeThreshhold){
            //   logger.info('making money today!')
            // }

            //poll order book from both gemini and gdax
            //compare prices of both
            //if a delta is present more than x percent AND dollars are in the exchange with the lower rate
            //then sell ethereum on higher exchange and buy same amount of ethereum on lower exchange

            _context.next = 13;
            return _bluebird2.default.delay(timeDelta);

          case 13:
            main();

          case 14:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function main() {
    return _ref.apply(this, arguments);
  };
}();

var getOrderBook = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(exchange) {
    var uri, options, orderBook;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;


            console.log('getting order book from ' + exchange);

            uri = void 0;
            _context2.t0 = exchange;
            _context2.next = _context2.t0 === 'gemini' ? 6 : _context2.t0 === 'gdax' ? 8 : 10;
            break;

          case 6:
            uri = 'https://api.gemini.com/v1/book/ethusd';
            return _context2.abrupt('break', 11);

          case 8:
            uri = 'https://api.gdax.com/products/ETH-USD/book?level=2';
            return _context2.abrupt('break', 11);

          case 10:
            logger.info('Unknown exchange: ' + exchange);

          case 11:
            options = {
              uri: uri
            };


            console.log(options);

            _context2.next = 15;
            return (0, _requestPromise2.default)(options);

          case 15:
            orderBook = _context2.sent;

            console.log(orderBook);
            return _context2.abrupt('return', orderBook);

          case 20:
            _context2.prev = 20;
            _context2.t1 = _context2['catch'](0);

            logger.error(_context2.t1);

          case 23:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 20]]);
  }));

  return function getOrderBook(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var calculatePriceDelta = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(firstOrderBook, secondOrderBook) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            return _context3.abrupt('return', _bluebird2.default.resolve(.04));

          case 1:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function calculatePriceDelta(_x2, _x3) {
    return _ref3.apply(this, arguments);
  };
}();

// async function getOrderBook(){

//   try{
//     const options = {
//       uri: `https://poloniex.com/public?command=returnOrderBook&currencyPair=${currencyPair}&depth=100`,
//       json: true // Automatically parses the JSON string in the response
//     }

//     let orderBook = await rp(options)
//     return orderBook

//   } catch(err){
//     logger.error(err)
//   }
// }


// // Initialize the program (with args)
// program
//   .version('0.1.0')
//   .usage('[options] <pair>')
//   .arguments('<pair>')
//   .action((pair) => { currencyPair = pair.toUpperCase().trim() })
//   .option('-o --out [file]', 'Output file')
//   .option('-a --append', 'Append to output file (default: false)', false)
//   .option('-q --quiet', 'Quiet mode (default: false)', false)
//   .parse(process.argv)

// // Currency pair is required
// if (!CURRENCY_PAIR_REGEX.test(currencyPair)) {
//   console.error('Missing or invalid currency pair')
//   process.exit(1)
// }

// // Initialize logger
// const logger = new winston.Logger()
//   .add(winston.transports.Console, {
//     timestamp: () => `[${moment.utc().format(TIMESTAMP_FORMAT)}]`,
//     colorize: true,
//     prettyPrint: true,
//     level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
//   })

// // If output file was specified, try to create a writeable stream
// if (program.out) {
//   try {
//     const fileOptions = { flags: program.append ? 'a': 'w' }
//     outputStream = fs.createWriteStream(program.out, fileOptions)
//     logger.info(`Writing updates to file '${program.out}'...`)
//   } catch (err) {
//     logger.error(`Unable to create file '${program.out}':`, err)
//     process.exit(1)
//   }
// }

// function writeEventToFile(eventData) {
//   const line = JSON.stringify(eventData || {})

//   if (!program.quiet) {
//     logger.info(line)
//   }
//   if (outputStream) {
//     outputStream.write(`${line}\n`)
//   }
// }

// // Handles ticker update events
// function handleTickerData(args, metadata) {
//   const timestamp = new Date().toISOString()
//   const [pair, astPrice, lowestAsk, highestBid, percentChange, baseVolume, quoteVolume, isFrozen, dailyHigh, dailyLow] = args

//   // Ignore other currency pairs
//   if (pair !== currencyPair) {
//     return
//   }

//   const eventData = {
//     sequence: 0,
//     event: 'ticker',
//     timestamp,
//     currencyPair: pair,
//     lowestAsk,
//     highestBid,
//     percentChange,
//     baseVolume,
//     quoteVolume,
//     isFrozen: !!isFrozen,
//     '24hourHigh': dailyHigh,
//     '24hourLow': dailyLow
//   }

//   writeEventToFile(eventData)
// }

// // Handles market update events (order book and trades)
// function handleMarketData(args, metadata) {
//   for (const event of args) {
//     const { type, data } = event
//     let eventData = {
//         sequence: metadata.seq,
//         timestamp: new Date().toISOString(),
//         event: type
//       }

//     switch (type) {
//       case EVENT_ORDER_BOOK_MODIFY:
//       const total = parseFloat(data.rate * data.amount).toFixed(8)
//         eventData = { ...eventData, ...data, total }
//         break
//       case EVENT_ORDER_BOOK_REMOVE:
//         eventData = { ...eventData, ...data }
//         break
//       case EVENT_NEW_TRADE:
//         eventData = { ...eventData, ...data }
//         break
//       default:
//         logger.warn(`Unknown event '${type}': ${JSON.stringify(data)}`)
//         continue
//     }

//     writeEventToFile(eventData)
//   }
// }

// async function getOrderBook(){

//   try{
//     const options = {
//       uri: `https://poloniex.com/public?command=returnOrderBook&currencyPair=${currencyPair}&depth=100`,
//       json: true // Automatically parses the JSON string in the response
//     }

//     let orderBook = await rp(options)
//     return orderBook

//   } catch(err){
//     logger.error(err)
//   }
// }

// async function saveOrderBookRecursive(orderBookUpdateFrequency){

//   while(true){
//     const orderBook = await getOrderBook()

//     let eventData = {
//         timestamp: new Date().toISOString(),
//         event: 'newOrderBook',
//         orderBook: orderBook
//     }

//     writeEventToFile(eventData)

//     await Promise.delay(orderBookUpdateFrequency*1000)
//   }
// }

// // Create WAMP socket for real-time API updates
// const socket = new autobahn.Connection({
//   url: POLONIEX_API_URL,
//   realm: POLONIEX_API_REALM
// })

// const orderBookUpdateFrequency = 1

// socket.onopen = (session) => {
//   logger.info(`Connected to Poloniex push API successfully.`)

//   saveOrderBookRecursive(orderBookUpdateFrequency)

//   logger.info('Subscribed to ticker events.')
//   session.subscribe('ticker', handleTickerData)

//   logger.info(`Subscribed to ${currencyPair} events.`)
//   session.subscribe(currencyPair, handleMarketData)
// }

// socket.onclose = (reason) => {
//   logger.info(`Disconnected from Poloniex push API (${reason}).`)
// }

// logger.info('Connecting to Poloniex push API...')
// socket.open()


var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _autobahn = require('autobahn');

var _autobahn2 = _interopRequireDefault(_autobahn);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _gdax = require('./services/gdax');

var _gdax2 = _interopRequireDefault(_gdax);

var _gemini = require('./services/gemini');

var _gemini2 = _interopRequireDefault(_gemini);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } // Poloniex API documentation: https://poloniex.com/support/api/


console.log(_gdax2.default);

var gdaxService = new _gdax2.default(_config2.default.gdax);
var geminiService = new _gemini2.default(_config2.default.gemini);

console.log(_config2.default);

var TIMESTAMP_FORMAT = 'HH:mm:ss.SSS';

// Initialize logger
var logger = new _winston2.default.Logger().add(_winston2.default.transports.Console, {
  timestamp: function timestamp() {
    return '[' + _moment2.default.utc().format(TIMESTAMP_FORMAT) + ']';
  },
  colorize: true,
  prettyPrint: true,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

main();
//# sourceMappingURL=index.js.map