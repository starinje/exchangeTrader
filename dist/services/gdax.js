'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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
        var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(tradeDetails, orderBook) {
            var price, orderParams, orderResults, tradeCompleted, tradeCompletedDetails, tradeStatus, tradeSummary;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.prev = 0;
                            _context2.next = 3;
                            return _this.getOrderBook();

                        case 3:
                            orderBook = _context2.sent;

                            _this.logger.info('retrieving latest order book from gdax');
                            price = void 0;
                            _context2.t0 = tradeDetails.action;
                            _context2.next = _context2.t0 === 'buy' ? 9 : _context2.t0 === 'sell' ? 11 : 13;
                            break;

                        case 9:
                            price = orderBook.bids[2].price;
                            return _context2.abrupt('break', 13);

                        case 11:
                            price = orderBook.asks[2].price;
                            return _context2.abrupt('break', 13);

                        case 13:

                            _this.logger.info('placing ' + tradeDetails.action + ' trade on Gdax for ' + tradeDetails.quantity + ' ethereum at $' + price + '/eth');

                            orderParams = {
                                productId: 'ETH-USD',
                                size: tradeDetails.quantity,
                                price: price,
                                action: tradeDetails.action,
                                postOnly: true
                            };
                            _context2.next = 17;
                            return _this.newOrder(orderParams);

                        case 17:
                            orderResults = _context2.sent;

                            orderResults = JSON.parse(orderResults.body);

                            tradeCompleted = false;
                            tradeCompletedDetails = void 0;

                        case 21:
                            if (tradeCompleted) {
                                _context2.next = 30;
                                break;
                            }

                            _context2.next = 24;
                            return _this.orderStatus(orderResults.id);

                        case 24:
                            tradeStatus = _context2.sent;

                            if (tradeStatus.status == 'done') {
                                tradeCompleted = true;
                                tradeCompletedDetails = tradeStatus;
                            }
                            _context2.next = 28;
                            return _bluebird2.default.delay(1000);

                        case 28:
                            _context2.next = 21;
                            break;

                        case 30:
                            tradeSummary = {
                                fee: parseFloat(tradeCompletedDetails.fill_fees),
                                amount: parseFloat(tradeCompletedDetails.size),
                                price: parseFloat(tradeCompletedDetails.price),
                                action: tradeDetails.action
                            };
                            return _context2.abrupt('return', tradeSummary);

                        case 35:
                            _context2.prev = 35;
                            _context2.t1 = _context2['catch'](0);
                            return _context2.abrupt('return', _bluebird2.default.reject('gdax executeTrade |> ' + _context2.t1));

                        case 38:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this, [[0, 35]]);
        }));

        return function (_x, _x2) {
            return _ref2.apply(this, arguments);
        };
    }();

    this.executeTradeOld = function () {
        var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(tradeDetails, orderBook) {
            var orderParams, orderResults, tradeCompleted, tradeCompletedDetails, tradeStatus, tradeSummary;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.prev = 0;

                            _this.logger.info('placing ' + tradeDetails.action + ' trade on Gdax for ' + tradeDetails.quantity + ' ethereum at $' + tradeDetails.rate + '/eth');

                            //should pass in profitable price range
                            //logic here to sweep across the price range attempting to place maker only orders
                            //if it cant then just place market order

                            orderParams = {
                                productId: 'ETH-USD',
                                size: tradeDetails.quantity,
                                price: tradeDetails.rate,
                                action: tradeDetails.action
                            };
                            _context3.next = 5;
                            return _this.newOrder(orderParams);

                        case 5:
                            orderResults = _context3.sent;

                            orderResults = JSON.parse(orderResults.body);

                            tradeCompleted = false;
                            tradeCompletedDetails = void 0;

                        case 9:
                            if (tradeCompleted) {
                                _context3.next = 18;
                                break;
                            }

                            _context3.next = 12;
                            return _this.orderStatus(orderResults.id);

                        case 12:
                            tradeStatus = _context3.sent;

                            if (tradeStatus.status == 'done') {
                                tradeCompleted = true;
                                tradeCompletedDetails = tradeStatus;
                            }
                            _context3.next = 16;
                            return _bluebird2.default.delay(1000);

                        case 16:
                            _context3.next = 9;
                            break;

                        case 18:
                            tradeSummary = {
                                fee: parseFloat(tradeCompletedDetails.fill_fees),
                                amount: parseFloat(tradeCompletedDetails.size),
                                price: parseFloat(tradeCompletedDetails.price),
                                action: tradeDetails.action
                            };
                            return _context3.abrupt('return', tradeSummary);

                        case 22:
                            _context3.prev = 22;
                            _context3.t0 = _context3['catch'](0);
                            return _context3.abrupt('return', _bluebird2.default.reject('gdax executeTrade |> ' + _context3.t0));

                        case 25:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, _this, [[0, 22]]);
        }));

        return function (_x3, _x4) {
            return _ref3.apply(this, arguments);
        };
    }();

    this.newOrder = function () {
        var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
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
            return _ref4.apply(this, arguments);
        };
    }();

    this.availableBalances = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.prev = 0;
                        return _context5.abrupt('return', new _bluebird2.default(function (resolve, reject) {
                            _this.authedClient.getAccounts(function (err, results, data) {
                                return resolve(data);
                            });
                        }));

                    case 4:
                        _context5.prev = 4;
                        _context5.t0 = _context5['catch'](0);
                        return _context5.abrupt('return', _bluebird2.default.reject('gdax accounts |> ' + _context5.t0));

                    case 7:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, _this, [[0, 4]]);
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