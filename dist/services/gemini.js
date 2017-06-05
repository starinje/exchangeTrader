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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function createRequestConfig(_ref) {
    var key = _ref.key,
        secret = _ref.secret,
        payload = _ref.payload;


    console.log('key is: ' + key);
    console.log('secret is: ' + secret);
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


                            console.log(payload);

                            config = createRequestConfig({
                                payload: payload,
                                key: _this.options.key,
                                secret: _this.options.secret
                            });


                            console.log(config);

                            requestOptions = {
                                method: 'POST',
                                uri: requestUrl,
                                headers: config
                            };


                            console.log(JSON.stringify(requestOptions));

                            _context.next = 12;
                            return _this.session(requestOptions);

                        case 12:
                            return _context.abrupt('return', _context.sent);

                        case 15:
                            _context.prev = 15;
                            _context.t0 = _context['catch'](0);

                            _this.logger.info('error: ' + _context.t0);
                            return _context.abrupt('return');

                        case 19:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this, [[0, 15]]);
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
                                uri: '' + _this.options.url + endpoint,
                                body: _extends({}, params)
                            };
                            _context2.next = 4;
                            return _this.session(requestOptions);

                        case 4:
                            return _context2.abrupt('return', _context2.sent);

                        case 7:
                            _context2.prev = 7;
                            _context2.t0 = _context2['catch'](0);
                            return _context2.abrupt('return', Promise.reject(_context2.t0));

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

                        console.log(_context3.t0);

                    case 13:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, _this, [[0, 10]]);
    }));

    this.executeTrade = function () {
        var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(tradeDetails) {
            var orderParams, orderResults, tradeCompleted, tradeCompletedDetails, _tradeStatus;

            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _this.logger.info('placing ' + tradeDetails.action + ' trade on Gemini for ' + tradeDetails.quantity + ' ethereum at $' + tradeDetails.rate + '/eth');

                            orderParams = {
                                client_order_id: "20150102-4738721",
                                symbol: 'ethusd',
                                amount: tradeDetails.quantity,
                                price: tradeDetails.rate,
                                side: tradeDetails.action,
                                type: 'exchange limit'
                            };

                            //place order

                            _context4.next = 4;
                            return _this.newOrder(orderParams);

                        case 4:
                            orderResults = _context4.sent;
                            tradeCompleted = false;
                            tradeCompletedDetails = void 0;

                            // logic to here that tries to place order
                            // if it doesnt go through then retrive order book and try matchin existing order as long as it is still profitable
                            // perhaps this logic should move to index.js?

                            //wait for order to go through and then return final trade details

                        case 7:
                            if (!(tradeStatus == 'pending')) {
                                _context4.next = 16;
                                break;
                            }

                            _context4.next = 10;
                            return Promise.delay(1000);

                        case 10:
                            _context4.next = 12;
                            return orderStatus(orderResults.order_id);

                        case 12:
                            _tradeStatus = _context4.sent;

                            if (currentTradeStatus.executed_amount == currentTradeStatus.original_amount) {
                                tradeCompleted = true;
                                tradeCompletedDetails = _tradeStatus;
                            }
                            _context4.next = 7;
                            break;

                        case 16:
                            return _context4.abrupt('return', tradeCompletedDetails);

                        case 17:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, _this);
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
                            _context5.next = 2;
                            return _this.requestPrivate('/order/new', _extends({
                                client_order_id: (0, _shortid2.default)(),
                                type: 'exchange limit'
                            }, params));

                        case 2:
                            return _context5.abrupt('return', _context5.sent);

                        case 3:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, _this);
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
                        return _context6.abrupt('return', _this.requestPrivate('/balances'));

                    case 1:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, _this);
    }));

    this.orderStatus = function (orderId) {
        return _this.requestPrivate('/order/status', { order_id: orderId });
    };

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