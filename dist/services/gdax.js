'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _gdax = require('gdax');

var _gdax2 = _interopRequireDefault(_gdax);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GdaxService = function GdaxService(options) {
    var _this = this;

    _classCallCheck(this, GdaxService);

    this.getOrderBook = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        return _context.abrupt('return', new _bluebird2.default(function (resolve, reject) {
                            _this.publicClient.getProductOrderBook({ 'level': 2 }, function (err, response, data) {

                                if (err) {
                                    return reject(err);
                                }

                                var orderBook = _extends({}, data);

                                if (orderBook.bids.length < 1 || orderBook.asks.length < 1) {
                                    return reject(new Error('order book is corrupted'));
                                }

                                var bids = orderBook.bids.map(function (bidLevel) {
                                    return {
                                        price: bidLevel[0],
                                        amount: bidLevel[1]
                                    };
                                });

                                var asks = orderBook.asks.map(function (askLevel) {
                                    return {
                                        price: askLevel[0],
                                        amount: askLevel[1]
                                    };
                                });

                                var reformattedOrderBook = {
                                    asks: asks,
                                    bids: bids,
                                    timeStamp: 'timestamp'
                                };

                                return resolve(reformattedOrderBook);
                            });
                        }));

                    case 4:
                        _context.prev = 4;
                        _context.t0 = _context['catch'](0);
                        return _context.abrupt('return', _bluebird2.default.reject('gdax getOrderBook |> ' + _context.t0));

                    case 7:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, _this, [[0, 4]]);
    }));

    this.executeTrade = function () {
        var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(positionChange) {
            var _ret;

            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.prev = 0;
                            return _context3.delegateYield(regeneratorRuntime.mark(function _callee2() {
                                var tradeDetails, counterPrice, rateDelta, tradeCompleted, tradeProfitable, finalOrderResults, price, tradeQuantity, orderBook, lowestSellPriceLevel, highestBuyPriceLevel, orderParams, orderResults, timeStart, timeExpired, now, timeSinceTradePlaced, tradeStatus, tradeSummary, _tradeSummary;

                                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                                    while (1) {
                                        switch (_context2.prev = _context2.next) {
                                            case 0:
                                                tradeDetails = positionChange.gdax;
                                                counterPrice = positionChange.gemini.rate;
                                                rateDelta = Math.abs(positionChange.gdax.rate - positionChange.gemini.rate);
                                                tradeCompleted = false;
                                                tradeProfitable = true;
                                                finalOrderResults = void 0;
                                                price = void 0;
                                                tradeQuantity = tradeDetails.quantity;

                                            case 8:
                                                if (!(!tradeCompleted && tradeProfitable)) {
                                                    _context2.next = 68;
                                                    break;
                                                }

                                                _context2.next = 11;
                                                return _this.getOrderBook();

                                            case 11:
                                                orderBook = _context2.sent;
                                                _context2.t0 = tradeDetails.action;
                                                _context2.next = _context2.t0 === 'buy' ? 15 : _context2.t0 === 'sell' ? 21 : 27;
                                                break;

                                            case 15:
                                                // let lowestSellPrice = parseFloat(orderBook.asks[0].price)
                                                // price = lowestSellPrice - .01
                                                // let highestBuyPrice = parseFloat(orderBook.bids[0].price)
                                                // price = highestBuyPrice 

                                                lowestSellPriceLevel = orderBook.asks.find(function (ask) {
                                                    return parseFloat(ask.amount) >= tradeQuantity;
                                                });


                                                price = parseFloat(lowestSellPriceLevel.price);

                                                if (!(price >= counterPrice)) {
                                                    _context2.next = 20;
                                                    break;
                                                }

                                                //-(rateDelta/2)
                                                tradeProfitable = false;
                                                return _context2.abrupt('continue', 8);

                                            case 20:
                                                return _context2.abrupt('break', 27);

                                            case 21:
                                                // let highestBuyPrice = parseFloat(orderBook.bids[0].price)
                                                // price = highestBuyPrice + .01
                                                // let lowestSellPrice = parseFloat(orderBook.asks[0].price)
                                                // price = lowestSellPrice

                                                highestBuyPriceLevel = orderBook.bids.find(function (ask) {
                                                    return parseFloat(ask.amount) >= tradeQuantity;
                                                });


                                                price = parseFloat(highestBuyPriceLevel.price);

                                                if (!(price <= counterPrice)) {
                                                    _context2.next = 26;
                                                    break;
                                                }

                                                //+(rateDelta/2)
                                                tradeProfitable = false;
                                                return _context2.abrupt('continue', 8);

                                            case 26:
                                                return _context2.abrupt('break', 27);

                                            case 27:

                                                price = price.toFixed(2).toString();

                                                _this.logger.info('placing ' + tradeDetails.action + ' trade on Gdax for ' + tradeDetails.quantity + ' ethereum at $' + price + '/eth');

                                                orderParams = {
                                                    productId: 'ETH-USD',
                                                    size: tradeQuantity,
                                                    price: price,
                                                    action: tradeDetails.action
                                                };


                                                if (parseFloat(orderParams.price) < 250 || parseFloat(orderParams.price) > 400) {
                                                    _this.logger.info('failed gdax price sanity check. price: ' + orderParams.price + ' ');
                                                    process.exit();
                                                }

                                                _context2.next = 33;
                                                return _this.newOrder(orderParams);

                                            case 33:
                                                orderResults = _context2.sent;

                                                orderResults = JSON.parse(orderResults.body);

                                                if (!(!orderResults.hasOwnProperty('status') || !(orderResults.status == 'pending'))) {
                                                    _context2.next = 39;
                                                    break;
                                                }

                                                _this.logger.info('gdax order could not be submitted');
                                                _this.logger.info(orderResults);
                                                return _context2.abrupt('continue', 8);

                                            case 39:
                                                _context2.next = 41;
                                                return _bluebird2.default.delay(1000);

                                            case 41:
                                                timeStart = _moment2.default.utc(new Date());
                                                timeExpired = false;


                                                _this.logger.info('gdax order entered - going into check status loop...');

                                            case 44:
                                                if (!(!timeExpired && !tradeCompleted)) {
                                                    _context2.next = 66;
                                                    break;
                                                }

                                                _context2.next = 47;
                                                return _bluebird2.default.delay(1000);

                                            case 47:
                                                now = _moment2.default.utc(new Date());
                                                timeSinceTradePlaced = _moment2.default.duration(now.diff(timeStart));
                                                _context2.next = 51;
                                                return _this.orderStatus(orderResults.id);

                                            case 51:
                                                tradeStatus = _context2.sent;

                                                if (!(tradeStatus.filled_size == tradeStatus.size)) {
                                                    _context2.next = 58;
                                                    break;
                                                }

                                                tradeCompleted = true;
                                                finalOrderResults = orderResults;
                                                return _context2.abrupt('continue', 44);

                                            case 58:
                                                tradeQuantity = parseFloat(tradeStatus.size) - parseFloat(tradeStatus.filled_size);

                                            case 59:
                                                if (!(timeSinceTradePlaced.asMinutes() > _this.options.orderFillTime)) {
                                                    _context2.next = 64;
                                                    break;
                                                }

                                                _this.logger.info('time has expired trying to ' + tradeDetails.action + ' ' + tradeDetails.quantity + ' ethereum on gdax at ' + price + '/eth, canceling order');
                                                _context2.next = 63;
                                                return _this.cancelOrders();

                                            case 63:
                                                timeExpired = true;

                                            case 64:
                                                _context2.next = 44;
                                                break;

                                            case 66:
                                                _context2.next = 8;
                                                break;

                                            case 68:
                                                tradeSummary = void 0;

                                                if (!tradeCompleted) {
                                                    _context2.next = 74;
                                                    break;
                                                }

                                                _tradeSummary = {
                                                    fee: parseFloat(finalOrderResults.fill_fees),
                                                    amount: parseFloat(finalOrderResults.size),
                                                    price: parseFloat(finalOrderResults.price)
                                                };
                                                return _context2.abrupt('return', {
                                                    v: _extends({}, _tradeSummary, { action: tradeDetails.action })
                                                });

                                            case 74:
                                                if (!tradeProfitable) {
                                                    _this.logger.info(tradeDetails.action + ' on gdax for ' + tradeDetails.quantity + ' ethereum at ' + price + '/eth was unsuccesful - order book no longer profitable');
                                                    process.exit();
                                                }

                                            case 75:
                                            case 'end':
                                                return _context2.stop();
                                        }
                                    }
                                }, _callee2, _this);
                            })(), 't0', 2);

                        case 2:
                            _ret = _context3.t0;

                            if (!((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object")) {
                                _context3.next = 5;
                                break;
                            }

                            return _context3.abrupt('return', _ret.v);

                        case 5:
                            _context3.next = 10;
                            break;

                        case 7:
                            _context3.prev = 7;
                            _context3.t1 = _context3['catch'](0);
                            return _context3.abrupt('return', _bluebird2.default.reject('gdax executeTrade |> ' + _context3.t1));

                        case 10:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, _this, [[0, 7]]);
        }));

        return function (_x) {
            return _ref2.apply(this, arguments);
        };
    }();

    this.newOrder = function () {
        var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.prev = 0;
                            return _context4.abrupt('return', new _bluebird2.default(function (resolve, reject) {

                                var reformattedParams = {
                                    price: params.price,
                                    size: params.size,
                                    product_id: params.productId,
                                    post_only: params.postOnly
                                };

                                _this.authedClient[params.action](reformattedParams, function (err, results, data) {
                                    return resolve(results);
                                });
                            }));

                        case 4:
                            _context4.prev = 4;
                            _context4.t0 = _context4['catch'](0);
                            return _context4.abrupt('return', _bluebird2.default.reject('gdax newOrder Error: ' + _context4.t0));

                        case 7:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, _this, [[0, 4]]);
        }));

        return function () {
            return _ref3.apply(this, arguments);
        };
    }();

    this.cancelOrders = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.prev = 0;
                        return _context5.abrupt('return', new _bluebird2.default(function (resolve, reject) {
                            _this.authedClient.cancelAllOrders(function (err, results, data) {
                                return resolve(results);
                            });
                        }));

                    case 4:
                        _context5.prev = 4;
                        _context5.t0 = _context5['catch'](0);
                        return _context5.abrupt('return', _bluebird2.default.reject('gdax cancelOrders Error: ' + _context5.t0));

                    case 7:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, _this, [[0, 4]]);
    }));
    this.availableBalances = _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.prev = 0;
                        return _context6.abrupt('return', new _bluebird2.default(function (resolve, reject) {
                            _this.authedClient.getAccounts(function (err, results, data) {
                                return resolve(data);
                            });
                        }));

                    case 4:
                        _context6.prev = 4;
                        _context6.t0 = _context6['catch'](0);
                        return _context6.abrupt('return', _bluebird2.default.reject('gdax accounts |> ' + _context6.t0));

                    case 7:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, _this, [[0, 4]]);
    }));

    this.orderStatus = function (orderId) {
        try {
            return new _bluebird2.default(function (resolve, reject) {
                _this.authedClient.getOrder(orderId, function (err, results, data) {
                    return resolve(data);
                });
            });
        } catch (err) {
            return _bluebird2.default.reject('gdax orderStatus |> ' + err);
        }
    };

    this.options = options || {};
    this.logger = this.options.logger;
    this.baseUrl = this.options.sandbox ? 'https://api-public.sandbox.gdax.com' : 'https://api.gdax.com';
    this.publicClient = new _gdax2.default.PublicClient('ETH-USD', this.baseUrl);
    this.authedClient = new _gdax2.default.AuthenticatedClient(this.options.key, this.options.secret, this.options.passphrase, this.baseUrl);
};

exports.default = GdaxService;
//# sourceMappingURL=gdax.js.map