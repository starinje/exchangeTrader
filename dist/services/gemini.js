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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function createRequestConfig(_ref) {
    var key = _ref.key,
        secret = _ref.secret,
        payload = _ref.payload;


    var encodedPayload = new Buffer(JSON.stringify(payload)).toString('base64');

    var signature = _crypto2.default.createHmac('sha384', secret).update(encodedPayload).digest('hex');

    return {
        'X-GEMINI-APIKEY': key,
        'X-GEMINI-PAYLOAD': encodedPayload,
        'X-GEMINI-SIGNATURE': signature
    };
}

var GeminiService = function GeminiService(options) {
    var _this = this;

    _classCallCheck(this, GeminiService);

    this.requestPrivate = function () {
        var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(endpoint) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var requestUrl, payload, config, requestOptions;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;

                            if (!(!_this.options.key || !_this.options.secret)) {
                                _context.next = 3;
                                break;
                            }

                            throw new Error('API key and secret key required to use authenticated methods');

                        case 3:
                            requestUrl = '' + _this.baseUrl + endpoint;
                            payload = _extends({
                                nonce: Date.now(),
                                request: '/v1' + endpoint
                            }, params);
                            config = createRequestConfig({
                                payload: payload,
                                key: _this.options.key,
                                secret: _this.options.secret
                            });
                            requestOptions = {
                                method: 'POST',
                                uri: requestUrl,
                                headers: config
                            };
                            _context.next = 9;
                            return _this.session(requestOptions);

                        case 9:
                            return _context.abrupt('return', _context.sent);

                        case 12:
                            _context.prev = 12;
                            _context.t0 = _context['catch'](0);
                            return _context.abrupt('return', _bluebird2.default.reject('gemini requestPrivate |> ' + _context.t0));

                        case 15:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this, [[0, 12]]);
        }));

        return function (_x) {
            return _ref2.apply(this, arguments);
        };
    }();

    this.requestPublic = function () {
        var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(endpoint) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var requestOptions;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.prev = 0;
                            requestOptions = {
                                method: 'GET',
                                uri: '' + _this.baseUrl + endpoint,
                                body: _extends({}, params)
                            };
                            _context2.next = 4;
                            return _this.session(requestOptions);

                        case 4:
                            return _context2.abrupt('return', _context2.sent);

                        case 7:
                            _context2.prev = 7;
                            _context2.t0 = _context2['catch'](0);
                            return _context2.abrupt('return', _bluebird2.default.reject('gemini requestPublic |> ' + _context2.t0));

                        case 10:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this, [[0, 7]]);
        }));

        return function (_x3) {
            return _ref3.apply(this, arguments);
        };
    }();

    this.getOrderBook = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
        var orderBook, timestamp, bids, asks;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;
                        _context3.next = 3;
                        return _this.requestPublic('/book/ethusd', {});

                    case 3:
                        orderBook = _context3.sent;
                        timestamp = orderBook.bids[0].timestamp;
                        bids = orderBook.bids.map(function (bidLevel) {
                            return {
                                price: bidLevel.price,
                                amount: bidLevel.amount
                            };
                        });
                        asks = orderBook.asks.map(function (askLevel) {
                            return {
                                price: askLevel.price,
                                amount: askLevel.amount
                            };
                        });
                        return _context3.abrupt('return', { asks: asks, bids: bids, timestamp: timestamp });

                    case 10:
                        _context3.prev = 10;
                        _context3.t0 = _context3['catch'](0);
                        return _context3.abrupt('return', _bluebird2.default.reject('gemini getOrderBook |> ' + _context3.t0));

                    case 13:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, _this, [[0, 10]]);
    }));

    this.executeTrade = function () {
        var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(tradeDetails) {
            var orderParams, orderResults, tradeCompleted, tradeStatus, tradeSummary;
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.prev = 0;

                            _this.logger.info('placing ' + tradeDetails.action + ' trade on Gemini for ' + tradeDetails.quantity + ' ethereum at $' + tradeDetails.rate + '/eth');

                            orderParams = {
                                client_order_id: "20150102-4738721",
                                symbol: 'ethusd',
                                amount: tradeDetails.quantity,
                                price: tradeDetails.rate,
                                side: tradeDetails.action,
                                type: 'exchange limit'
                            };
                            _context4.next = 5;
                            return _this.newOrder(orderParams);

                        case 5:
                            orderResults = _context4.sent;
                            tradeCompleted = false;

                        case 7:
                            if (tradeCompleted) {
                                _context4.next = 16;
                                break;
                            }

                            _context4.next = 10;
                            return _bluebird2.default.delay(1000);

                        case 10:
                            _context4.next = 12;
                            return _this.orderStatus(orderResults.order_id);

                        case 12:
                            tradeStatus = _context4.sent;

                            if (tradeStatus.executed_amount == tradeStatus.original_amount) {
                                tradeCompleted = true;
                            }
                            _context4.next = 7;
                            break;

                        case 16:
                            _context4.next = 18;
                            return _this.orderHistory(orderResults.order_id);

                        case 18:
                            tradeSummary = _context4.sent;
                            return _context4.abrupt('return', _extends({}, tradeSummary, { action: tradeDetails.action }));

                        case 22:
                            _context4.prev = 22;
                            _context4.t0 = _context4['catch'](0);
                            return _context4.abrupt('return', _bluebird2.default.reject('gemini executeTrade |> ' + _context4.t0));

                        case 25:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, _this, [[0, 22]]);
        }));

        return function (_x5) {
            return _ref5.apply(this, arguments);
        };
    }();

    this.newOrder = function () {
        var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.prev = 0;
                            _context5.next = 3;
                            return _this.requestPrivate('/order/new', _extends({
                                client_order_id: (0, _shortid2.default)(),
                                type: 'exchange limit'
                            }, params));

                        case 3:
                            return _context5.abrupt('return', _context5.sent);

                        case 6:
                            _context5.prev = 6;
                            _context5.t0 = _context5['catch'](0);
                            return _context5.abrupt('return', _bluebird2.default.reject('gemini newOrder |> ' + _context5.t0));

                        case 9:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, _this, [[0, 6]]);
        }));

        return function () {
            return _ref6.apply(this, arguments);
        };
    }();

    this.availableBalances = _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.prev = 0;
                        return _context6.abrupt('return', _this.requestPrivate('/balances'));

                    case 4:
                        _context6.prev = 4;
                        _context6.t0 = _context6['catch'](0);
                        return _context6.abrupt('return', _bluebird2.default.reject('gemini availableBalances |> ' + _context6.t0));

                    case 7:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, _this, [[0, 4]]);
    }));

    this.orderStatus = function (orderId) {
        try {
            return _this.requestPrivate('/order/status', { order_id: orderId });
        } catch (err) {
            return _bluebird2.default.reject('gemini orderStatus |> ' + err);
        }
    };

    this.orderHistory = function () {
        var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(orderId) {
            var trades, orderTrades, fee, amount, price, numberOfTrades, averagePrice, tradeSummary;
            return regeneratorRuntime.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            _context7.prev = 0;
                            _context7.next = 3;
                            return _this.requestPrivate('/mytrades', { symbol: 'ETHUSD' });

                        case 3:
                            trades = _context7.sent;
                            orderTrades = trades.filter(function (trade) {
                                return trade.order_id == orderId;
                            });
                            fee = 0;
                            amount = 0;
                            price = 0;
                            numberOfTrades = 0;


                            orderTrades.forEach(function (trade) {
                                fee = parseFloat(trade.fee_amount) + fee;
                                amount = parseFloat(trade.amount) + amount;
                                price = parseFloat(trade.price) + price;
                                numberOfTrades = numberOfTrades + 1;
                            });

                            averagePrice = price / numberOfTrades;
                            tradeSummary = {
                                fee: fee,
                                amount: amount,
                                price: averagePrice
                            };
                            return _context7.abrupt('return', tradeSummary);

                        case 15:
                            _context7.prev = 15;
                            _context7.t0 = _context7['catch'](0);
                            return _context7.abrupt('return', _bluebird2.default.reject('gemini orderStatus |> ' + _context7.t0));

                        case 18:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, _this, [[0, 15]]);
        }));

        return function (_x7) {
            return _ref8.apply(this, arguments);
        };
    }();

    this.options = options || {};
    this.logger = this.options.logger;
    var subdomain = this.options.sandbox ? 'api.sandbox' : 'api';
    this.baseUrl = 'https://' + subdomain + '.gemini.com/v1';
    this.session = _requestPromise2.default.defaults({
        json: true,
        headers: {
            'User-Agent': 'Request-Promise'
        }
    });
};

exports.default = GeminiService;
//# sourceMappingURL=gemini.js.map