'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GeminiService = function GeminiService(options) {
    var _this = this;

    _classCallCheck(this, GeminiService);

    this.getOrderBook = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var requestOptions, orderBook, timestamp, bids, asks;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        requestOptions = {
                            uri: _this.options.url
                        };
                        _context.next = 4;
                        return _this.session(requestOptions);

                    case 4:
                        orderBook = _context.sent;
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
                        return _context.abrupt('return', {
                            asks: asks,
                            bids: bids,
                            timeStamp: timestamp
                        });

                    case 11:
                        _context.prev = 11;
                        _context.t0 = _context['catch'](0);

                        console.log(_context.t0);

                    case 14:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, _this, [[0, 11]]);
    }));

    this.options = options || {};
    this.session = _requestPromise2.default.defaults({
        json: true,
        headers: {
            'User-Agent': 'Request-Promise'
        }
    });
};

exports.default = GeminiService;
//# sourceMappingURL=gemini.js.map