'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var newOrder = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(session, options) {
        var orderOptions, orderResults;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        orderOptions = {
                            method: 'POST',
                            uri: options.url + '/order/new',
                            json: true,
                            body: {
                                request: "/v1/order/new", //is this needed?
                                nonce: '<nonce>',
                                client_order_id: "20150102-4738721",
                                symbol: config.gemini.currencyPair,
                                amount: options.amount,
                                price: options.price,
                                side: options.action,
                                type: config.gemini.orderType
                            }
                        };
                        _context.next = 3;
                        return session(orderOptions);

                    case 3:
                        orderResults = _context.sent;
                        return _context.abrupt('return', orderResults);

                    case 5:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function newOrder(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var GeminiService = function GeminiService(options) {
    _classCallCheck(this, GeminiService);

    _initialiseProps.call(this);

    this.options = options || {};
    this.logger = options.logger;
    this.session = _requestPromise2.default.defaults({
        json: true,
        headers: {
            'User-Agent': 'Request-Promise'
        }
    });
};

var _initialiseProps = function _initialiseProps() {
    var _this = this;

    this.getOrderBook = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var requestOptions, orderBook, timestamp, bids, asks;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        requestOptions = {
                            uri: _this.options.url + '/book/ethusd'
                        };
                        _context2.next = 4;
                        return _this.session(requestOptions);

                    case 4:
                        orderBook = _context2.sent;
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
                        return _context2.abrupt('return', {
                            asks: asks,
                            bids: bids,
                            timestamp: timestamp
                        });

                    case 11:
                        _context2.prev = 11;
                        _context2.t0 = _context2['catch'](0);

                        console.log(_context2.t0);

                    case 14:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, _this, [[0, 11]]);
    }));

    this.executeTrade = function () {
        var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(tradeDetails) {
            var orderResults;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:

                            // this code should attempt to place limit order that wont incur transaction fees
                            // perhaps place buy orders at prices very close to the ask price but not in a current slot so that no taker fee is taken
                            // likewise place sell orders very close to the bid price but not in a current slot so that no taker fee is taken
                            // even if it is only successful some of the time it will help

                            // place market trade on gdax 
                            _this.logger.info('placing ' + tradeDetails.action + ' trade on Gemini for ' + tradeDetails.quantity + ' ethereum at $' + tradeDetails.rate + '/eth');

                            orderResults = newOrder(_this.session, options);

                            // logic here to retry or whatever depending on results of trade
                            //logic here to figure out what price to place order at so as to get filled?


                            //cancel order
                            // POST https://api.gemini.com/v1/order/cancel
                            /*{
                                // Standard headers
                                "request": "/v1/order/order/cancel",
                                "nonce": <nonce>,
                                 // Request-specific items
                                "order_id": 12345
                            }*/

                            return _context3.abrupt('return', orderResults);

                        case 4:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, _this);
        }));

        return function (_x3) {
            return _ref3.apply(this, arguments);
        };
    }();
};

exports.default = GeminiService;
//# sourceMappingURL=gemini.js.map