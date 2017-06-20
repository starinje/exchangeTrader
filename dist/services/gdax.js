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
        var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(positionChange) {
            var tradeDetails, counterPrice, rateDelta, tradeCompleted, tradeProfitable, finalOrderResults, price, tradeQuantity, orderBook, highestBuyPrice, lowestSellPrice, orderParams, orderResults, timeStart, timeExpired, now, timeSinceTradePlaced, tradeStatus, tradeSummary, _tradeSummary;

            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.prev = 0;
                            tradeDetails = positionChange.gdax;
                            counterPrice = positionChange.gemini.rate;
                            rateDelta = Math.abs(positionChange.gdax.rate - positionChange.gemini.rate);
                            tradeCompleted = false;
                            tradeProfitable = true;
                            finalOrderResults = void 0;
                            price = void 0;
                            tradeQuantity = tradeDetails.quantity;

                        case 9:
                            if (!(!tradeCompleted && tradeProfitable)) {
                                _context2.next = 70;
                                break;
                            }

                            _context2.next = 12;
                            return _this.getOrderBook();

                        case 12:
                            orderBook = _context2.sent;
                            _context2.t0 = tradeDetails.action;
                            _context2.next = _context2.t0 === 'buy' ? 16 : _context2.t0 === 'sell' ? 22 : 28;
                            break;

                        case 16:
                            // let lowestSellPrice = parseFloat(orderBook.asks[0].price)
                            // price = lowestSellPrice - .01
                            highestBuyPrice = parseFloat(orderBook.bids[0].price);

                            price = highestBuyPrice;

                            if (!(price >= counterPrice)) {
                                _context2.next = 21;
                                break;
                            }

                            //-(rateDelta/2)
                            tradeProfitable = false;
                            return _context2.abrupt('continue', 9);

                        case 21:
                            return _context2.abrupt('break', 28);

                        case 22:
                            // let highestBuyPrice = parseFloat(orderBook.bids[0].price)
                            // price = highestBuyPrice + .01
                            lowestSellPrice = parseFloat(orderBook.asks[0].price);

                            price = lowestSellPrice;

                            if (!(price <= counterPrice)) {
                                _context2.next = 27;
                                break;
                            }

                            //+(rateDelta/2)
                            tradeProfitable = false;
                            return _context2.abrupt('continue', 9);

                        case 27:
                            return _context2.abrupt('break', 28);

                        case 28:

                            price = price.toFixed(2).toString();

                            _this.logger.info('placing ' + tradeDetails.action + ' trade on Gdax for ' + tradeDetails.quantity + ' ethereum at $' + price + '/eth');

                            orderParams = {
                                productId: 'ETH-USD',
                                size: tradeQuantity,
                                price: price,
                                action: tradeDetails.action,
                                postOnly: true
                            };


                            if (parseFloat(orderParams.price) < 320) {
                                logger.info('failed gdax price sanity check. price: ' + orderParams.price + ' ');
                                process.exit();
                            }

                            _context2.next = 34;
                            return _this.newOrder(orderParams);

                        case 34:
                            orderResults = _context2.sent;

                            orderResults = JSON.parse(orderResults.body);
                            console.log('gdax order results: ' + JSON.stringify(orderResults));

                            //TODO - need to check for order sucess - not for order failure....

                            if (!(!orderResults.hasOwnProperty('status') || !(orderResults.status == 'pending'))) {
                                _context2.next = 41;
                                break;
                            }

                            _this.logger.info('gdax order could not be submitted');
                            _this.logger.info(orderResults);
                            return _context2.abrupt('continue', 9);

                        case 41:
                            _context2.next = 43;
                            return _bluebird2.default.delay(1000);

                        case 43:
                            timeStart = _moment2.default.utc(new Date());
                            timeExpired = false;


                            _this.logger.info('gdax order entered - going into check status loop...');

                        case 46:
                            if (!(!timeExpired && !tradeCompleted)) {
                                _context2.next = 68;
                                break;
                            }

                            _context2.next = 49;
                            return _bluebird2.default.delay(1000);

                        case 49:
                            now = _moment2.default.utc(new Date());
                            timeSinceTradePlaced = _moment2.default.duration(now.diff(timeStart));
                            _context2.next = 53;
                            return _this.orderStatus(orderResults.order_id);

                        case 53:
                            tradeStatus = _context2.sent;

                            if (!(tradeStatus.executed_amount == tradeStatus.original_amount)) {
                                _context2.next = 60;
                                break;
                            }

                            tradeCompleted = true;
                            finalOrderResults = orderResults;
                            return _context2.abrupt('continue', 46);

                        case 60:
                            tradeQuantity = parseFloat(tradeStatus.original_amount) - parseFloat(tradeStatus.executed_amount);

                        case 61:
                            if (!(timeSinceTradePlaced.asMinutes() > _this.options.orderFillTime)) {
                                _context2.next = 66;
                                break;
                            }

                            _this.logger.info('time has expired trying to ' + tradeDetails.action + ' ' + tradeDetails.quantity + ' ethereum on gdax at ' + price + '/eth, canceling order');
                            _context2.next = 65;
                            return _this.cancelOrders();

                        case 65:
                            timeExpired = true;

                        case 66:
                            _context2.next = 46;
                            break;

                        case 68:
                            _context2.next = 9;
                            break;

                        case 70:
                            tradeSummary = void 0;

                            if (!tradeCompleted) {
                                _context2.next = 76;
                                break;
                            }

                            _tradeSummary = {
                                fee: parseFloat(finalOrderResults.fill_fees),
                                amount: parseFloat(finalOrderResults.size),
                                price: parseFloat(finalOrderResults.price)
                            };
                            return _context2.abrupt('return', _extends({}, _tradeSummary, { action: tradeDetails.action }));

                        case 76:
                            if (!tradeProfitable) {
                                _this.logger.info(tradeDetails.action + ' on gdax for ' + tradeDetails.quantity + ' ethereum at ' + price + '/eth was unsuccesful - order book no longer profitable');
                                process.exit();
                            }

                        case 77:
                            _context2.next = 82;
                            break;

                        case 79:
                            _context2.prev = 79;
                            _context2.t1 = _context2['catch'](0);
                            return _context2.abrupt('return', _bluebird2.default.reject('gdax executeTrade |> ' + _context2.t1));

                        case 82:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this, [[0, 79]]);
        }));

        return function (_x) {
            return _ref2.apply(this, arguments);
        };
    }();

    this.newOrder = function () {
        var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.prev = 0;
                            return _context3.abrupt('return', new _bluebird2.default(function (resolve, reject) {

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
                            _context3.prev = 4;
                            _context3.t0 = _context3['catch'](0);
                            return _context3.abrupt('return', _bluebird2.default.reject('gdax newOrder Error: ' + _context3.t0));

                        case 7:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, _this, [[0, 4]]);
        }));

        return function () {
            return _ref3.apply(this, arguments);
        };
    }();

    this.cancelOrders = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.prev = 0;
                        return _context4.abrupt('return', new _bluebird2.default(function (resolve, reject) {
                            _this.authedClient.cancelAllOrders(function (err, results, data) {
                                return resolve(results);
                            });
                        }));

                    case 4:
                        _context4.prev = 4;
                        _context4.t0 = _context4['catch'](0);
                        return _context4.abrupt('return', _bluebird2.default.reject('gdax cancelOrders Error: ' + _context4.t0));

                    case 7:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, _this, [[0, 4]]);
    }));
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
}

// executeTradeOld = async (tradeDetails, orderBook) => {
//     try{
//         //this.logger.info(`placing ${tradeDetails.action} trade on Gdax for ${tradeDetails.quantity} ethereum at $${tradeDetails.rate}/eth`)

//         // here we have the desired buy/sell level
//         // need to place a maker-or-cancel order
//         // switch on action (buy/sell)
//         // generate array of available priceLevels 
//         // if trying to sell, place maker-only sell in the spread lower than the current 
//         //logic here to sweep across the price range attempting to place maker only orders
//         //if it cant then just place market order

//         orderBook = await this.getOrderBook()
//         this.logger.info('retrieving latest order book from gdax')
//         let price

//         switch(tradeDetails.action){
//             case 'buy':
//                 price = orderBook.bids[1].price
//                 break
//             case 'sell':
//                 price = orderBook.asks[1].price
//                 break
//         }

//         this.logger.info(`placing ${tradeDetails.action} trade on Gdax for ${tradeDetails.quantity} ethereum at $${price}/eth`)

//         let orderParams = { 
//             productId: 'ETH-USD',       
//             size: tradeDetails.quantity,        
//             price: price,
//             action: tradeDetails.action,
//             postOnly: true
//         }

//         let orderResults = await this.newOrder(orderParams)
//         orderResults = JSON.parse(orderResults.body)

//         let tradeCompleted = false
//         let tradeCompletedDetails

//         while(!tradeCompleted){
//             let tradeStatus = await this.orderStatus(orderResults.id)
//             if(tradeStatus.status == 'done'){
//                 tradeCompleted = true
//                 tradeCompletedDetails = tradeStatus
//             }
//             await Promise.delay(1000)
//         }

//         let tradeSummary = {
//             fee: parseFloat(tradeCompletedDetails.fill_fees),
//             amount: parseFloat(tradeCompletedDetails.size),
//             price: parseFloat(tradeCompletedDetails.price),
//             action: tradeDetails.action
//         }

//         return tradeSummary
//     } catch(err){
//         return Promise.reject(`gdax executeTrade |> ${err}`)
//     } 

// }

// executeTradeOldest = async (tradeDetails, orderBook) => {
//     try{
//         this.logger.info(`placing ${tradeDetails.action} trade on Gdax for ${tradeDetails.quantity} ethereum at $${tradeDetails.rate}/eth`)

//         //should pass in profitable price range
//         //logic here to sweep across the price range attempting to place maker only orders
//         //if it cant then just place market order

//         let orderParams = { 
//             productId: 'ETH-USD',       
//             size: tradeDetails.quantity,        
//             price: tradeDetails.rate,
//             action: tradeDetails.action
//         }

//         let orderResults = await this.newOrder(orderParams)
//         orderResults = JSON.parse(orderResults.body)

//         let tradeCompleted = false
//         let tradeCompletedDetails

//         while(!tradeCompleted){
//             let tradeStatus = await this.orderStatus(orderResults.id)
//             if(tradeStatus.status == 'done'){
//                 tradeCompleted = true
//                 tradeCompletedDetails = tradeStatus
//             }
//             await Promise.delay(1000)
//         }

//         let tradeSummary = {
//             fee: parseFloat(tradeCompletedDetails.fill_fees),
//             amount: parseFloat(tradeCompletedDetails.size),
//             price: parseFloat(tradeCompletedDetails.price),
//             action: tradeDetails.action
//         }

//         return tradeSummary

//     } catch(err){
//         return Promise.reject(`gdax executeTrade |> ${err}`)
//     } 

// }

;

exports.default = GdaxService;
//# sourceMappingURL=gdax.js.map