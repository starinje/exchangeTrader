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

// function createRequestConfig({ key, secret, payload }){

//   const encodedPayload = (new Buffer(JSON.stringify(payload)))
//     .toString(`base64`);

//   const signature = crypto
//     .createHmac(`sha384`, secret)
//     .update(encodedPayload)
//     .digest(`hex`);

//   return {
//       'X-GEMINI-APIKEY': key,
//       'X-GEMINI-PAYLOAD': encodedPayload,
//       'X-GEMINI-SIGNATURE': signature,
//   };
// }


var GdaxService = function GdaxService(options) {
    var _this = this;

    _classCallCheck(this, GdaxService);

    this.requestPrivate = function () {
        var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(endpoint) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;
                            _context.next = 7;
                            break;

                        case 3:
                            _context.prev = 3;
                            _context.t0 = _context['catch'](0);

                            _this.logger.info('error: ' + _context.t0);
                            return _context.abrupt('return');

                        case 7:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this, [[0, 3]]);
        }));

        return function (_x) {
            return _ref.apply(this, arguments);
        };
    }();

    this.requestPublic = function () {
        var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(endpoint) {
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
                            return _context2.abrupt('return', _bluebird2.default.reject(_context2.t0));

                        case 10:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this, [[0, 7]]);
        }));

        return function (_x3) {
            return _ref2.apply(this, arguments);
        };
    }();

    this.getOrderBook = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
        var orderBook, bids, asks;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;
                        _context3.next = 3;
                        return _this.requestPublic('/products/ETH-USD/book?level=2', {});

                    case 3:
                        orderBook = _context3.sent;
                        bids = orderBook.bids.map(function (bidLevel) {
                            return {
                                price: bidLevel[0],
                                amount: bidLevel[1]
                            };
                        });
                        asks = orderBook.asks.map(function (askLevel) {
                            return {
                                price: askLevel[0],
                                amount: askLevel[1]
                            };
                        });

                        // reformat order book into standard format

                        return _context3.abrupt('return', {
                            asks: asks,
                            bids: bids,
                            timeStamp: 'timestamp'
                        });

                    case 9:
                        _context3.prev = 9;
                        _context3.t0 = _context3['catch'](0);

                        _this.logger.info(_context3.t0);

                    case 12:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, _this, [[0, 9]]);
    }));

    this.executeTrade = function () {
        var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(tradeDetails) {
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _this.logger.info('placing ' + tradeDetails.action + ' trade on Gemini for ' + tradeDetails.quantity + ' ethereum at $' + tradeDetails.rate + '/eth');

                            console.log('code to execute gdax trade...');

                            // TODO: pick up code here....

                            // let orderParams = { 
                            //     client_order_id: "20150102-4738721", 
                            //     symbol: 'ethusd',       
                            //     amount: tradeDetails.quantity,        
                            //     price: tradeDetails.rate,
                            //     side: tradeDetails.action,
                            //     type: 'exchange limit'
                            // }

                            // let orderResults = await this.newOrder(orderParams)

                            // let tradeCompleted = false
                            // let tradeCompletedDetails

                            // while(!tradeCompleted){
                            //     await Promise.delay(1000)
                            //     let tradeStatus = await this.orderStatus(orderResults.order_id)
                            //     if(tradeStatus.executed_amount == tradeStatus.original_amount){
                            //         tradeCompleted = true
                            //         tradeCompletedDetails = tradeStatus
                            //     }
                            // }

                            // return tradeCompletedDetails

                        case 2:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, _this);
        }));

        return function (_x5) {
            return _ref4.apply(this, arguments);
        };
    }();

    this.newOrder = function () {
        var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, _this);
        }));

        return function () {
            return _ref5.apply(this, arguments);
        };
    }();

    this.availableBalances = _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, _this);
    }));

    this.orderStatus = function (orderId) {
        // return this.requestPrivate(`/order/status`, { order_id: orderId })
    };

    this.options = options || {};
    this.logger = this.options.logger;
    this.baseUrl = this.options.sandbox ? 'https://api-public.sandbox.gdax.com' : 'https://api.gdax.com';
    this.session = _requestPromise2.default.defaults({
        json: true,
        headers: {
            'User-Agent': 'Request-Promise'
        }
    });
};

exports.default = GdaxService;
//# sourceMappingURL=gdax.js.map