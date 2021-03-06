'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var main = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var orderBookGemini, orderBookGdax, orderBooks, positionChange, tradeResults, gdaxResults, geminiResults, buyValue, sellValue, profit;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;


            _heartbeatLogger2.default.info('running arbitrage strategy...');

            _context.next = 4;
            return geminiService.getOrderBook();

          case 4:
            orderBookGemini = _context.sent;
            _context.next = 7;
            return gdaxService.getOrderBook();

          case 7:
            orderBookGdax = _context.sent;
            orderBooks = {
              gdax: orderBookGdax,
              gemini: orderBookGemini
            };
            _context.next = 11;
            return determinePositionChange(orderBooks);

          case 11:
            positionChange = _context.sent;

            if (!(positionChange == 'none')) {
              _context.next = 14;
              break;
            }

            return _context.abrupt('return');

          case 14:

            _logger2.default.info('');
            _logger2.default.info('NEW TRADE');

            _context.next = 18;
            return execute(positionChange);

          case 18:
            tradeResults = _context.sent;
            gdaxResults = tradeResults.gdax;
            geminiResults = tradeResults.gemini;

            //check here for results from each exchage. If either is bad then process.exit and cancel all orders on both exchanges.

            buyValue = void 0;
            sellValue = void 0;
            _context.t0 = tradeResults.takeProfit;
            _context.next = _context.t0 === 'gdax' ? 26 : _context.t0 === 'gemini' ? 29 : 32;
            break;

          case 26:
            buyValue = tradeResults.gemini.price * tradeResults.gemini.amount - tradeResults.gemini.fee;
            sellValue = tradeResults.gdax.price * tradeResults.gdax.amount - tradeResults.gdax.fee;
            return _context.abrupt('break', 32);

          case 29:
            sellValue = tradeResults.gemini.price * tradeResults.gemini.amount - tradeResults.gemini.fee;
            buyValue = tradeResults.gdax.price * tradeResults.gdax.amount - tradeResults.gdax.fee;
            return _context.abrupt('break', 32);

          case 32:
            profit = (sellValue - buyValue) / buyValue;


            _logger2.default.info('successful ' + tradeResults.gdax.action + ' on Gdax for ' + tradeResults.gdax.amount + ' ethereum at $' + tradeResults.gdax.price + '/eth, fee of ' + tradeResults.gdax.fee);
            _logger2.default.info('successful ' + tradeResults.gemini.action + ' on Gemini for ' + tradeResults.gemini.amount + ' ethereum at ' + tradeResults.gemini.price + '/eth, fee of ' + tradeResults.gemini.fee);
            _logger2.default.info('profit percentage: ' + profit);

            _context.next = 41;
            break;

          case 38:
            _context.prev = 38;
            _context.t1 = _context['catch'](0);

            _logger2.default.info('error: ' + _context.t1);
            // geminiService.cancelOrders()
            // gdaxService.cancelOrders()
            // process.exit()

          case 41:
            _context.prev = 41;
            _context.next = 44;
            return _bluebird2.default.delay(_config2.default.timeDelta);

          case 44:
            main();
            return _context.finish(41);

          case 46:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 38, 41, 46]]);
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


            _heartbeatLogger2.default.info('bidPriceGemini: ' + bidPriceGemini);
            _heartbeatLogger2.default.info('bidPriceGdax: ' + bidPriceGdax);
            _heartbeatLogger2.default.info('askPriceGemini: ' + askPriceGemini);
            _heartbeatLogger2.default.info('askPriceGdax: ' + askPriceGdax);

            _heartbeatLogger2.default.info('gdaxBasePercentageDifference: ' + gdaxBasePercentageDifference);
            _heartbeatLogger2.default.info('geminiBasePercentageDifference: ' + geminiBasePercentageDifference);

            if (!gdaxRateIsHigherAndProfitable) {
              _context2.next = 44;
              break;
            }

            _logger2.default.info('bidPriceGemini: ' + bidPriceGemini);
            _logger2.default.info('bidPriceGdax: ' + bidPriceGdax);
            _logger2.default.info('askPriceGemini: ' + askPriceGemini);
            _logger2.default.info('askPriceGdax: ' + askPriceGdax);

            _logger2.default.info('gdaxBasePercentageDifference: ' + gdaxBasePercentageDifference);
            _logger2.default.info('geminiBasePercentageDifference: ' + geminiBasePercentageDifference);

            _logger2.default.info('gdax rate is higher and profitable');

            totalSaleValue = bidPriceGdax * ethereumTradingQuantity;
            totalPurchaseCost = askPriceGemini * ethereumTradingQuantity;

            estimatedGrossProfit = totalSaleValue - totalPurchaseCost;
            estimatedTransactionFees = transactionPercentageGdax / 100 * totalSaleValue + transactionPercentageGemini / 100 * totalPurchaseCost;
            estimatedNetProfit = estimatedGrossProfit - estimatedTransactionFees;

            _logger2.default.info('estimated total sale value: ' + totalSaleValue);
            _logger2.default.info('estimated total purchase cost: ' + totalPurchaseCost);
            _logger2.default.info('estimated gross profit: ' + estimatedGrossProfit);
            _logger2.default.info('estimated transaction fees: ' + estimatedTransactionFees);
            _logger2.default.info('estimated net profit: ' + estimatedNetProfit);

            positionChange = {
              takeProfit: 'gdax',
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
            _context2.next = 67;
            break;

          case 44:
            if (!geminiRateIsSwappable) {
              _context2.next = 65;
              break;
            }

            _logger2.default.info('bidPriceGemini: ' + bidPriceGemini);
            _logger2.default.info('bidPriceGdax: ' + bidPriceGdax);
            _logger2.default.info('askPriceGemini: ' + askPriceGemini);
            _logger2.default.info('askPriceGdax: ' + askPriceGdax);

            _logger2.default.info('gdaxBasePercentageDifference: ' + gdaxBasePercentageDifference);
            _logger2.default.info('geminiBasePercentageDifference: ' + geminiBasePercentageDifference);
            _logger2.default.info('Gemini rate is higher and profitable');

            _totalSaleValue = bidPriceGemini * ethereumTradingQuantity;
            _totalPurchaseCost = askPriceGdax * ethereumTradingQuantity;

            estimatedGrossProfit = _totalSaleValue - _totalPurchaseCost;
            estimatedTransactionFees = transactionPercentageGemini / 100 * _totalSaleValue + transactionPercentageGdax / 100 * _totalPurchaseCost;
            estimatedNetProfit = estimatedGrossProfit - estimatedTransactionFees;

            _logger2.default.info('estimated total sale value: ' + _totalSaleValue);
            _logger2.default.info('estimated total purchase cost: ' + _totalPurchaseCost);
            _logger2.default.info('estimated gross profit: ' + estimatedGrossProfit);
            _logger2.default.info('estimated transaction fees: ' + estimatedTransactionFees);
            _logger2.default.info('estimated net profit: ' + estimatedNetProfit);

            positionChange = {
              takeProfit: 'gemini',
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
            _context2.next = 67;
            break;

          case 65:
            positionChange = 'none';
            return _context2.abrupt('return', positionChange);

          case 67:
            _context2.next = 69;
            return determineCurrentEthereumPosition();

          case 69:
            exchangeWithEthereumBalance = _context2.sent;

            if (!(positionChange[exchangeWithEthereumBalance].action == 'sell')) {
              _context2.next = 74;
              break;
            }

            return _context2.abrupt('return', positionChange);

          case 74:
            return _context2.abrupt('return', 'none');

          case 75:
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
            return _bluebird2.default.all([gdaxService.executeTrade(positionChange), geminiService.executeTrade(positionChange)]);

          case 2:
            tradeResults = _context3.sent;

            //let tradeResults = await Promise.all([gdaxService.executeTrade(positionChange)])

            tradeLog = {
              gdax: tradeResults[0],
              gemini: tradeResults[1],
              takeProfit: positionChange.takeProfit
            };
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
    var currentGeminiBalances, geminiUsdBalance, geminiEthBalance, currentGdaxBalances, gdaxUsdBalance, gdaxEthBalance, ethereumBalance;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return geminiService.availableBalances();

          case 2:
            currentGeminiBalances = _context4.sent;
            geminiUsdBalance = currentGeminiBalances.filter(function (accountDetails) {
              return accountDetails.currency == 'USD';
            });

            geminiUsdBalance = parseFloat(geminiUsdBalance[0].amount);

            geminiEthBalance = currentGeminiBalances.filter(function (accountDetails) {
              return accountDetails.currency == 'ETH';
            });

            geminiEthBalance = parseFloat(geminiEthBalance[0].amount);

            // determine gdax ethereum balance
            _context4.next = 9;
            return gdaxService.availableBalances();

          case 9:
            currentGdaxBalances = _context4.sent;
            gdaxUsdBalance = currentGdaxBalances.filter(function (accountDetails) {
              return accountDetails.currency == 'USD';
            });

            gdaxUsdBalance = parseFloat(gdaxUsdBalance[0].balance);

            gdaxEthBalance = currentGdaxBalances.filter(function (accountDetails) {
              return accountDetails.currency == 'ETH';
            });

            gdaxEthBalance = parseFloat(gdaxEthBalance[0].balance);

            _logger2.default.info('geminiEthBalance: ' + geminiEthBalance);
            _logger2.default.info('geminiUsdBalance: ' + geminiUsdBalance);
            _logger2.default.info('gdaxEthBalance: ' + gdaxEthBalance);
            _logger2.default.info('gdaxUsdBalance: ' + gdaxUsdBalance);

            ethereumBalance = void 0;

            if (geminiEthBalance > gdaxEthBalance) {
              ethereumBalance = 'gemini';
            } else if (gdaxEthBalance > geminiEthBalance) {
              ethereumBalance = 'gdax';
            }

            _logger2.default.info('ethereum balance is in ' + ethereumBalance);

            return _context4.abrupt('return', ethereumBalance);

          case 22:
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

var _logger = require('./services/logger.js');

var _logger2 = _interopRequireDefault(_logger);

var _heartbeatLogger = require('./services/heartbeatLogger.js');

var _heartbeatLogger2 = _interopRequireDefault(_heartbeatLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var gdaxService = new _gdax2.default(_extends({}, _config2.default.gdax, { logger: _logger2.default }));
var geminiService = new _gemini2.default(_extends({}, _config2.default.gemini, { logger: _logger2.default }));

main();

function calculateBidPrice(bids, ethereumTradingQuantity) {

  var priceLevel = bids.find(function (bid) {
    return parseFloat(bid.amount) >= ethereumTradingQuantity;
  });
  //let priceLevel = bids[0]

  return priceLevel ? parseFloat(priceLevel.price) : 'no match found';
}

function calculateAskPrice(asks, ethereumTradingQuantity) {

  var priceLevel = asks.find(function (ask) {
    return parseFloat(ask.amount) >= ethereumTradingQuantity;
  });
  //let priceLevel = asks[0]

  return priceLevel ? parseFloat(priceLevel.price) : 'no match found';
}
//# sourceMappingURL=index.js.map