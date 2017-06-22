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

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

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

    this.executeTradeOld = function () {
        var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(tradeDetails, orderBook) {
            var price, orderParams, orderResults, tradeCompleted, tradeStatus, tradeSummary;
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.prev = 0;
                            _context4.next = 3;
                            return _this.getOrderBook();

                        case 3:
                            orderBook = _context4.sent;

                            _this.logger.info('retrieving latest order book from gemini');
                            price = void 0;
                            _context4.t0 = tradeDetails.action;
                            _context4.next = _context4.t0 === 'buy' ? 9 : _context4.t0 === 'sell' ? 11 : 13;
                            break;

                        case 9:
                            price = orderBook.bids[1].price;
                            return _context4.abrupt('break', 13);

                        case 11:
                            price = orderBook.asks[1].price;
                            return _context4.abrupt('break', 13);

                        case 13:

                            _this.logger.info('placing ' + tradeDetails.action + ' trade on Gemini for ' + tradeDetails.quantity + ' ethereum at $' + price + '/eth');

                            orderParams = {
                                client_order_id: "20150102-4738721",
                                symbol: 'ethusd',
                                amount: tradeDetails.quantity,
                                price: tradeDetails.rate,
                                side: tradeDetails.action,
                                type: 'exchange limit'
                            };
                            _context4.next = 17;
                            return _this.newOrder(orderParams);

                        case 17:
                            orderResults = _context4.sent;
                            tradeCompleted = false;

                        case 19:
                            if (tradeCompleted) {
                                _context4.next = 28;
                                break;
                            }

                            _context4.next = 22;
                            return _bluebird2.default.delay(1000);

                        case 22:
                            _context4.next = 24;
                            return _this.orderStatus(orderResults.order_id);

                        case 24:
                            tradeStatus = _context4.sent;

                            if (tradeStatus.executed_amount == tradeStatus.original_amount) {
                                tradeCompleted = true;
                            }
                            _context4.next = 19;
                            break;

                        case 28:
                            _context4.next = 30;
                            return _this.orderHistory(orderResults.order_id);

                        case 30:
                            tradeSummary = _context4.sent;
                            return _context4.abrupt('return', _extends({}, tradeSummary, { action: tradeDetails.action }));

                        case 34:
                            _context4.prev = 34;
                            _context4.t1 = _context4['catch'](0);
                            return _context4.abrupt('return', _bluebird2.default.reject('gemini executeTrade |> ' + _context4.t1));

                        case 37:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, _this, [[0, 34]]);
        }));

        return function (_x5, _x6) {
            return _ref5.apply(this, arguments);
        };
    }();

    this.executeTrade = function () {
        var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(positionChange) {
            var _ret;

            return regeneratorRuntime.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            _context6.prev = 0;
                            return _context6.delegateYield(regeneratorRuntime.mark(function _callee5() {
                                var tradeDetails, counterPrice, rateDelta, tradeCompleted, tradeProfitable, finalOrderResults, price, tradeQuantity, orderBook, lowestSellPriceLevel, highestBuyPriceLevel, orderParams, orderResults, timeStart, timeExpired, now, timeSinceTradePlaced, tradeStatus, tradeSummary;
                                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                                    while (1) {
                                        switch (_context5.prev = _context5.next) {
                                            case 0:
                                                tradeDetails = positionChange.gemini;
                                                counterPrice = positionChange.gdax.rate;
                                                rateDelta = Math.abs(positionChange.gdax.rate - positionChange.gemini.rate);
                                                tradeCompleted = false;
                                                tradeProfitable = true;
                                                finalOrderResults = void 0;
                                                price = void 0;
                                                tradeQuantity = tradeDetails.quantity;

                                            case 8:
                                                if (!(!tradeCompleted && tradeProfitable)) {
                                                    _context5.next = 70;
                                                    break;
                                                }

                                                _context5.next = 11;
                                                return _this.getOrderBook();

                                            case 11:
                                                orderBook = _context5.sent;
                                                _context5.t0 = tradeDetails.action;
                                                _context5.next = _context5.t0 === 'buy' ? 15 : _context5.t0 === 'sell' ? 22 : 29;
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
                                                console.log('gemini buy price is: ' + price);

                                                if (!(price >= counterPrice)) {
                                                    _context5.next = 21;
                                                    break;
                                                }

                                                //-(rateDelta/2)
                                                tradeProfitable = false;
                                                return _context5.abrupt('continue', 8);

                                            case 21:
                                                return _context5.abrupt('break', 29);

                                            case 22:
                                                // let highestBuyPrice = parseFloat(orderBook.bids[0].price)
                                                // price = highestBuyPrice + .01

                                                // let lowestSellPrice = parseFloat(orderBook.asks[0].price)
                                                // price = lowestSellPrice

                                                highestBuyPriceLevel = orderBook.bids.find(function (ask) {
                                                    return parseFloat(ask.amount) >= tradeQuantity;
                                                });


                                                price = parseFloat(highestBuyPriceLevel.price);
                                                console.log('gemini sell price is: ' + price);

                                                if (!(price <= counterPrice)) {
                                                    _context5.next = 28;
                                                    break;
                                                }

                                                //+(rateDelta/2)
                                                tradeProfitable = false;
                                                return _context5.abrupt('continue', 8);

                                            case 28:
                                                return _context5.abrupt('break', 29);

                                            case 29:

                                                price = price.toFixed(2).toString();

                                                _this.logger.info('placing ' + tradeDetails.action + ' trade on Gemini for ' + tradeDetails.quantity + ' ethereum at $' + price + '/eth');

                                                orderParams = {
                                                    client_order_id: "20150102-4738721",
                                                    symbol: 'ethusd',
                                                    amount: tradeQuantity,
                                                    price: price,
                                                    side: tradeDetails.action,
                                                    type: 'exchange limit'
                                                };


                                                if (parseFloat(orderParams.price) < 250 || parseFloat(orderParams.price) > 400) {
                                                    _this.logger.info('failed gemini price sanity check. price: ' + orderParams.price + ' ');
                                                    process.exit();
                                                }

                                                _context5.next = 35;
                                                return _this.newOrder(orderParams);

                                            case 35:
                                                orderResults = _context5.sent;

                                                console.log('gemini order results: ' + JSON.stringify(orderResults));

                                                if (!orderResults.is_cancelled) {
                                                    _context5.next = 41;
                                                    break;
                                                }

                                                _this.logger.info('gemini order could not be submitted');
                                                _this.logger.info(orderResults);
                                                return _context5.abrupt('continue', 8);

                                            case 41:
                                                _context5.next = 43;
                                                return _bluebird2.default.delay(1000);

                                            case 43:
                                                timeStart = _moment2.default.utc(new Date());
                                                timeExpired = false;


                                                _this.logger.info('gemini order entered - going into check status loop...');

                                            case 46:
                                                if (!(!timeExpired && !tradeCompleted)) {
                                                    _context5.next = 68;
                                                    break;
                                                }

                                                _context5.next = 49;
                                                return _bluebird2.default.delay(1000);

                                            case 49:
                                                now = _moment2.default.utc(new Date());
                                                timeSinceTradePlaced = _moment2.default.duration(now.diff(timeStart));
                                                _context5.next = 53;
                                                return _this.orderStatus(orderResults.order_id);

                                            case 53:
                                                tradeStatus = _context5.sent;

                                                if (!(tradeStatus.executed_amount == tradeStatus.original_amount)) {
                                                    _context5.next = 60;
                                                    break;
                                                }

                                                tradeCompleted = true;
                                                finalOrderResults = orderResults;
                                                return _context5.abrupt('continue', 46);

                                            case 60:
                                                tradeQuantity = parseFloat(tradeStatus.original_amount) - parseFloat(tradeStatus.executed_amount);

                                            case 61:
                                                if (!(timeSinceTradePlaced.asMinutes() > _this.options.orderFillTime)) {
                                                    _context5.next = 66;
                                                    break;
                                                }

                                                _this.logger.info('time has expired trying to ' + tradeDetails.action + ' ' + tradeDetails.quantity + ' ethereum on gemini at ' + price + '/eth, canceling order');
                                                _context5.next = 65;
                                                return _this.cancelOrders();

                                            case 65:
                                                timeExpired = true;

                                            case 66:
                                                _context5.next = 46;
                                                break;

                                            case 68:
                                                _context5.next = 8;
                                                break;

                                            case 70:
                                                tradeSummary = void 0;

                                                if (!tradeCompleted) {
                                                    _context5.next = 78;
                                                    break;
                                                }

                                                _context5.next = 74;
                                                return _this.orderHistory(finalOrderResults.order_id);

                                            case 74:
                                                tradeSummary = _context5.sent;
                                                return _context5.abrupt('return', {
                                                    v: _extends({}, tradeSummary, { action: tradeDetails.action })
                                                });

                                            case 78:
                                                if (!tradeProfitable) {
                                                    _this.logger.info(tradeDetails.action + ' on gemini for ' + tradeDetails.quantity + ' ethereum at ' + price + '/eth was unsuccesful - order book no longer profitable');
                                                    process.exit();
                                                }

                                            case 79:
                                            case 'end':
                                                return _context5.stop();
                                        }
                                    }
                                }, _callee5, _this);
                            })(), 't0', 2);

                        case 2:
                            _ret = _context6.t0;

                            if (!((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object")) {
                                _context6.next = 5;
                                break;
                            }

                            return _context6.abrupt('return', _ret.v);

                        case 5:
                            _context6.next = 10;
                            break;

                        case 7:
                            _context6.prev = 7;
                            _context6.t1 = _context6['catch'](0);
                            return _context6.abrupt('return', _bluebird2.default.reject('gemini executeTrade |> ' + _context6.t1));

                        case 10:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, _this, [[0, 7]]);
        }));

        return function (_x7) {
            return _ref6.apply(this, arguments);
        };
    }();

    this.newOrder = function () {
        var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7() {
            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            return regeneratorRuntime.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            _context7.prev = 0;
                            return _context7.abrupt('return', _this.requestPrivate('/order/new', _extends({
                                client_order_id: (0, _shortid2.default)(),
                                type: 'exchange limit'
                            }, params)));

                        case 4:
                            _context7.prev = 4;
                            _context7.t0 = _context7['catch'](0);
                            return _context7.abrupt('return', _bluebird2.default.reject('gemini newOrder |> ' + _context7.t0));

                        case 7:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, _this, [[0, 4]]);
        }));

        return function () {
            return _ref7.apply(this, arguments);
        };
    }();

    this.cancelOrders = function () {
        var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8() {
            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            return regeneratorRuntime.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            _context8.prev = 0;
                            return _context8.abrupt('return', _this.requestPrivate('/order/cancel/all'));

                        case 4:
                            _context8.prev = 4;
                            _context8.t0 = _context8['catch'](0);
                            return _context8.abrupt('return', _bluebird2.default.reject('gemini cancelOrders |> ' + _context8.t0));

                        case 7:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, _this, [[0, 4]]);
        }));

        return function () {
            return _ref8.apply(this, arguments);
        };
    }();

    this.availableBalances = _asyncToGenerator(regeneratorRuntime.mark(function _callee9() {
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        _context9.prev = 0;
                        return _context9.abrupt('return', _this.requestPrivate('/balances'));

                    case 4:
                        _context9.prev = 4;
                        _context9.t0 = _context9['catch'](0);
                        return _context9.abrupt('return', _bluebird2.default.reject('gemini availableBalances |> ' + _context9.t0));

                    case 7:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, _callee9, _this, [[0, 4]]);
    }));

    this.orderStatus = function (orderId) {
        try {
            return _this.requestPrivate('/order/status', { order_id: orderId });
        } catch (err) {
            return _bluebird2.default.reject('gemini orderStatus |> ' + err);
        }
    };

    this.orderHistory = function () {
        var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10(orderId) {
            var trades, orderTrades, fee, amount, price, numberOfTrades, averagePrice, tradeSummary;
            return regeneratorRuntime.wrap(function _callee10$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            _context10.prev = 0;
                            _context10.next = 3;
                            return _this.requestPrivate('/mytrades', { symbol: 'ETHUSD' });

                        case 3:
                            trades = _context10.sent;
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
                            return _context10.abrupt('return', tradeSummary);

                        case 15:
                            _context10.prev = 15;
                            _context10.t0 = _context10['catch'](0);

                            _this.logger.info('gemini orderStatus |> ' + _context10.t0);
                            return _context10.abrupt('return', _bluebird2.default.reject('gemini orderStatus |> ' + _context10.t0));

                        case 19:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, _this, [[0, 15]]);
        }));

        return function (_x10) {
            return _ref10.apply(this, arguments);
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