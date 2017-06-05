'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var main = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var orderBookGemini, orderBookGdax, orderBooks, positionChange, results;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            console.log('');
            console.log('');
            logger.info('running arbitrage strategy...');

            _context.next = 6;
            return geminiService.getOrderBook();

          case 6:
            orderBookGemini = _context.sent;
            _context.next = 9;
            return gdaxService.getOrderBook();

          case 9:
            orderBookGdax = _context.sent;
            orderBooks = {
              gdax: orderBookGdax,
              gemini: orderBookGemini
            };
            _context.next = 13;
            return determinePositionChange(orderBooks);

          case 13:
            positionChange = _context.sent;

            if (!(positionChange == 'none')) {
              _context.next = 16;
              break;
            }

            return _context.abrupt('return');

          case 16:
            _context.next = 18;
            return execute(positionChange);

          case 18:
            results = _context.sent;
            _context.next = 24;
            break;

          case 21:
            _context.prev = 21;
            _context.t0 = _context['catch'](0);

            logger.info('error: ' + _context.t0);

          case 24:
            _context.prev = 24;
            _context.next = 27;
            return _bluebird2.default.delay(_config2.default.timeDelta);

          case 27:
            main();
            return _context.finish(24);

          case 29:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 21, 24, 29]]);
  }));

  return function main() {
    return _ref.apply(this, arguments);
  };
}();

var determinePositionChange = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(orderBooks) {
    var ethereumTradingQuantity, takeProfitTradeThreshold, swapFundsTradeThreshold, bidPriceGemini, bidPriceGdax, askPriceGemini, askPriceGdax, transactionPercentageGemini, transactionPercentageGdax, gdaxBasePercentageDifference, geminiBasePercentageDifference, gdaxRateIsHigherAndProfitable, geminiRateIsSwappable, positionChange, estimatedTransactionFees, estimatedGrossProfit, estimatedNetProfit, totalSaleValue, totalPurchaseCost, _totalSaleValue, _totalPurchaseCost, exchangeWithEthereumBalance;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            ethereumTradingQuantity = _config2.default.ethereumTradingQuantity;
            takeProfitTradeThreshold = _config2.default.takeProfitTradeThreshold;
            swapFundsTradeThreshold = _config2.default.swapFundsTradeThreshold;
            bidPriceGemini = calculateBidPrice(orderBooks.gemini.bids, ethereumTradingQuantity);
            bidPriceGdax = calculateBidPrice(orderBooks.gdax.bids, ethereumTradingQuantity);
            askPriceGemini = calculateAskPrice(orderBooks.gemini.asks, ethereumTradingQuantity);
            askPriceGdax = calculateAskPrice(orderBooks.gdax.asks, ethereumTradingQuantity);


            logger.info('bidPriceGemini: ' + bidPriceGemini);
            logger.info('bidPriceGdax: ' + bidPriceGdax);
            logger.info('askPriceGemini: ' + askPriceGemini);
            logger.info('askPriceGdax: ' + askPriceGdax);

            transactionPercentageGemini = _config2.default.transactionPercentageGemini;
            transactionPercentageGdax = _config2.default.transactionPercentageGdax;
            gdaxBasePercentageDifference = (bidPriceGdax - askPriceGemini) / askPriceGemini * 100;
            geminiBasePercentageDifference = (bidPriceGemini - askPriceGdax) / askPriceGdax * 100;
            gdaxRateIsHigherAndProfitable = gdaxBasePercentageDifference > takeProfitTradeThreshold;
            geminiRateIsSwappable = geminiBasePercentageDifference > swapFundsTradeThreshold;
            positionChange = void 0;
            estimatedTransactionFees = void 0;
            estimatedGrossProfit = void 0;
            estimatedNetProfit = void 0;


            logger.info('gdaxBasePercentageDifference: ' + gdaxBasePercentageDifference);
            logger.info('geminiBasePercentageDifference: ' + geminiBasePercentageDifference);

            if (!gdaxRateIsHigherAndProfitable) {
              _context2.next = 38;
              break;
            }

            logger.info('gdax rate is higher and profitable');

            totalSaleValue = bidPriceGdax * ethereumTradingQuantity;
            totalPurchaseCost = askPriceGemini * ethereumTradingQuantity;

            estimatedGrossProfit = totalSaleValue - totalPurchaseCost;
            estimatedTransactionFees = transactionPercentageGdax / 100 * totalSaleValue + transactionPercentageGemini / 100 * totalPurchaseCost;
            estimatedNetProfit = estimatedGrossProfit - estimatedTransactionFees;

            logger.info('estimated total sale value: ' + totalSaleValue);
            logger.info('estimated total purchase cost: ' + totalPurchaseCost);
            logger.info('estimated gross profit: ' + estimatedGrossProfit);
            logger.info('estimated transaction fees: ' + estimatedTransactionFees);
            logger.info('estimated net profit: ' + estimatedNetProfit);

            positionChange = {
              type: 'takeProfit',
              gdax: {
                action: 'sell',
                quantity: ethereumTradingQuantity,
                units: 'eth',
                rate: bidPriceGdax
              },
              gemini: {
                action: 'buy',
                quantity: ethereumTradingQuantity,
                units: 'eth',
                rate: askPriceGemini
              }
            };
            _context2.next = 55;
            break;

          case 38:
            if (!geminiRateIsSwappable) {
              _context2.next = 53;
              break;
            }

            logger.info('Gemini Rate Is Swappable');

            _totalSaleValue = bidPriceGemini * ethereumTradingQuantity;
            _totalPurchaseCost = askPriceGdax * ethereumTradingQuantity;

            estimatedGrossProfit = _totalSaleValue - _totalPurchaseCost;
            estimatedTransactionFees = transactionPercentageGemini / 100 * _totalSaleValue + transactionPercentageGdax / 100 * _totalPurchaseCost;
            estimatedNetProfit = estimatedGrossProfit - estimatedTransactionFees;

            logger.info('estimated total sale value: ' + _totalSaleValue);
            logger.info('estimated total purchase cost: ' + _totalPurchaseCost);
            logger.info('estimated gross profit: ' + estimatedGrossProfit);
            logger.info('estimated transaction fees: ' + estimatedTransactionFees);
            logger.info('estimated net profit: ' + estimatedNetProfit);

            positionChange = {
              type: 'swapFunds',
              gemini: {
                action: 'sell',
                quantity: ethereumTradingQuantity,
                units: 'eth',
                rate: bidPriceGemini
              },
              gdax: {
                action: 'buy',
                quantity: ethereumTradingQuantity,
                units: 'eth',
                rate: askPriceGdax
              }
            };
            _context2.next = 55;
            break;

          case 53:
            positionChange = 'none';
            return _context2.abrupt('return', positionChange);

          case 55:
            _context2.next = 57;
            return determineCurrentEthereumPosition();

          case 57:
            exchangeWithEthereumBalance = _context2.sent;

            if (!(positionChange[exchangeWithEthereumBalance].action == 'sell')) {
              _context2.next = 62;
              break;
            }

            return _context2.abrupt('return', positionChange);

          case 62:
            return _context2.abrupt('return', 'none');

          case 63:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function determinePositionChange(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var execute = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(positionChange) {
    var tradeResults, tradeLog;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return _bluebird2.default.all([geminiService.executeTrade(positionChange.gemini), gdaxService.executeTrade(positionChange.gdax)]);

          case 2:
            tradeResults = _context3.sent;
            tradeLog = _extends({}, tradeResults, {
              type: positionChange.type
            });
            return _context3.abrupt('return', tradeLog);

          case 5:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function execute(_x2) {
    return _ref3.apply(this, arguments);
  };
}();

var determineCurrentEthereumPosition = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
    var currentGeminiBalances;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return geminiService.getMyAvailableBalances();

          case 2:
            currentGeminiBalances = _context4.sent;

            console.log('current Gemini Balances: ' + currentGeminiBalances);

            //let currentGdaxBalances = await gdaxService.getMyAvailableBalances()
            //console.log(`current Gdax Balances: ${currentGdaxBalances}`)

            // check balances on both exchanges
            // return name of exchange with ethereum balance (account to sell from)
            return _context4.abrupt('return', 'gdax');

          case 5:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function determineCurrentEthereumPosition() {
    return _ref4.apply(this, arguments);
  };
}();

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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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

var gdaxService = new _gdax2.default(_extends({}, _config2.default.gdax, { logger: logger }));
var geminiService = new _gemini2.default(_extends({}, _config2.default.gemini, { logger: logger }));

var aggregateProfit = 0;

main();

function calculateBidPrice(bids, ethereumTradingQuantity) {

  var priceLevel = bids.find(function (bid) {
    return parseFloat(bid.amount) >= ethereumTradingQuantity;
  });

  return priceLevel ? parseFloat(priceLevel.price) : 'no match found';
}

function calculateAskPrice(asks, ethereumTradingQuantity) {

  var priceLevel = asks.find(function (ask) {
    return parseFloat(ask.amount) >= ethereumTradingQuantity;
  });

  return priceLevel ? parseFloat(priceLevel.price) : 'no match found';
}
//# sourceMappingURL=index.js.map