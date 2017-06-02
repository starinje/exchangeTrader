'use strict';

var main = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var orderBookGemini, orderBookGdax, orderBooks, actions;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            logger.info('running arbitrage strategy...');

            logger.info('timeDelta is ' + _config2.default.timeDelta);
            logger.info('tradeThreshold is ' + _config2.default.tradeThreshold);

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
            actions = determineAction(orderBooks);


            console.log('actions: ', actions);

            // let results = execute(action)

            _context.next = 15;
            return _bluebird2.default.delay(_config2.default.timeDelta);

          case 15:
            main();

            _context.next = 21;
            break;

          case 18:
            _context.prev = 18;
            _context.t0 = _context['catch'](0);

            logger.info('error: ' + _context.t0);

          case 21:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 18]]);
  }));

  return function main() {
    return _ref.apply(this, arguments);
  };
}();

var execute = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(action) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt('return', actionCompleted);

          case 1:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function execute(_x) {
    return _ref2.apply(this, arguments);
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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } // Poloniex API documentation: https://poloniex.com/support/api/


var gdaxService = new _gdax2.default(_config2.default.gdax);
var geminiService = new _gemini2.default(_config2.default.gemini);

var TIMESTAMP_FORMAT = 'HH:mm:ss.SSS';

var aggregateProfit = 0;

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

function determineAction(orderBooks) {

  var ethereumTradingQuantity = _config2.default.ethereumTradingQuantity;
  var takeProfitTradeThreshold = _config2.default.takeProfitTradeThreshold;
  var swapFundsTradeThreshold = _config2.default.swapFundsTradeThreshold;

  var bidPriceGemini = calculateBidPrice(orderBooks.gemini.bids, ethereumTradingQuantity);
  var bidPriceGdax = calculateBidPrice(orderBooks.gdax.bids, ethereumTradingQuantity);
  var askPriceGemini = calculateAskPrice(orderBooks.gemini.asks, ethereumTradingQuantity);
  var askPriceGdax = calculateAskPrice(orderBooks.gdax.asks, ethereumTradingQuantity);

  logger.info('bidPriceGemini: ' + bidPriceGemini);
  logger.info('bidPriceGdax: ' + bidPriceGdax);
  logger.info('askPriceGemini: ' + askPriceGemini);
  logger.info('askPriceGdax: ' + askPriceGdax);

  var transactionPercentageGemini = _config2.default.transactionPercentageGemini;
  var transactionPercentageGdax = _config2.default.transactionPercentageGdax;

  var gdaxBasePercentageDifference = (bidPriceGdax - askPriceGemini) / askPriceGemini * 100;
  var geminiBasePercentageDifference = (bidPriceGemini - askPriceGdax) / askPriceGdax * 100;

  var gdaxRateIsHigherAndProfitable = gdaxBasePercentageDifference > takeProfitTradeThreshold;
  var geminiRateIsHigherAndProfitable = geminiBasePercentageDifference > swapFundsTradeThreshold;

  var actions = void 0;
  var estimatedTransactionFees = void 0;
  var estimatedGrossProfit = void 0;
  var estimatedNetProfit = void 0;

  logger.info('gdaxBasePercentageDifference: ' + gdaxBasePercentageDifference);
  logger.info('geminiBasePercentageDifference: ' + geminiBasePercentageDifference);

  if (gdaxRateIsHigherAndProfitable) {

    var totalSaleValue = bidPriceGdax * ethereumTradingQuantity;
    var totalPurchaseCost = askPriceGemini * ethereumTradingQuantity;
    estimatedGrossProfit = totalSaleValue - totalPurchaseCost;
    estimatedTransactionFees = transactionPercentageGdax / 100 * totalSaleValue + transactionPercentageGemini / 100 * totalPurchaseCost;
    estimatedNetProfit = estimatedGrossProfit - estimatedTransactionFees;

    logger.info('total sale value: ' + totalSaleValue);
    logger.info('total purchase cost: ' + totalPurchaseCost);
    logger.info('estimated gross profit: ' + estimatedGrossProfit);
    logger.info('estimated transaction fees: ' + estimatedTransactionFees);
    logger.info('estimated net profit: ' + estimatedNetProfit);

    actions = {
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
  } else if (geminiRateIsHigherAndProfitable) {

    var _totalSaleValue = bidPriceGemini * ethereumTradingQuantity;
    var _totalPurchaseCost = askPriceGdax * ethereumTradingQuantity;
    estimatedGrossProfit = _totalSaleValue - _totalPurchaseCost;
    estimatedTransactionFees = transactionPercentageGemini * _totalSaleValue + transactionPercentageGdax * _totalPurchaseCost;
    estimatedNetProfit = estimatedGrossProfit - estimatedTransactionFees;

    logger.info('total sale value: ' + _totalSaleValue);
    logger.info('total purchase cost: ' + _totalPurchaseCost);
    logger.info('estimated gross profit: ' + estimatedGrossProfit);
    logger.info('estimated transaction fees: ' + estimatedTransactionFees);
    logger.info('estimated net profit: ' + estimatedNetProfit);

    actions = {
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
  } else {
    actions = 'no trade opportunity';
    return actions;
  }

  var exchangeWithEthereumBalance = determineEthereumBalance();

  console.log(actions[exchangeWithEthereumBalance].action);
  if (actions[exchangeWithEthereumBalance].action == 'sell') {
    return actions;
  } else {
    return 'no trade opportunity';
  }
}

function determineEthereumBalance() {

  // check balances on both exchanges
  // return name of exchange with ethereum balance (account to sell from)
  return 'gdax';
}

function calculateBidPrice(bids, ethereumTradingQuantity) {

  var priceLevel = bids.find(function (bid) {
    return parseFloat(bid.amount) >= ethereumTradingQuantity;
  });

  return parseFloat(priceLevel.price);
}

function calculateAskPrice(asks, ethereumTradingQuantity) {

  var priceLevel = asks.find(function (ask) {
    return parseFloat(ask.amount) >= ethereumTradingQuantity;
  });

  return parseFloat(priceLevel.price);
}
//# sourceMappingURL=index.js.map