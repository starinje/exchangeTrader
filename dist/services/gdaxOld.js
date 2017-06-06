'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GdaxService = function GdaxService(options) {
    var _this = this;

    _classCallCheck(this, GdaxService);

    this.getOrderBook = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var requestOptions, orderBook, bids, asks;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;

                        // TODO: update this to match format of gemini service
                        requestOptions = {
                            uri: _this.options.url
                        };
                        _context.next = 4;
                        return _this.session(requestOptions);

                    case 4:
                        orderBook = _context.sent;
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

                        return _context.abrupt('return', {
                            asks: asks,
                            bids: bids,
                            timeStamp: 'timestamp'
                        });

                    case 10:
                        _context.prev = 10;
                        _context.t0 = _context['catch'](0);

                        console.log(_context.t0);

                    case 13:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, _this, [[0, 10]]);
    }));

    this.executeTrade = function () {
        var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(tradeDetails) {
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:

                            // this code should attempt to place limit order that wont incur transaction fees
                            // perhaps place buy orders at prices very close to the ask price but not in a current slot so that no taker fee is taken
                            // likewise place sell orders very close to the bid price but not in a current slot so that no taker fee is taken
                            // even if it is only successful some of the time it will help

                            // place market trade on gdax 
                            _this.logger.info('placing ' + tradeDetails.action + ' trade on Gdax for ' + tradeDetails.quantity + ' ethereum at $' + tradeDetails.rate + '/eth');
                            return _context2.abrupt('return', Promise.resolve('trade completed for GDAX'));

                        case 2:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this);
        }));

        return function (_x) {
            return _ref2.apply(this, arguments);
        };
    }();

    this.options = options || {};
    this.logger = options.logger;
    this.session = _requestPromise2.default.defaults({
        json: true,
        headers: {
            'User-Agent': 'Request-Promise'
        }
    });
};

exports.default = GdaxService;
//# sourceMappingURL=gdaxOld.js.map