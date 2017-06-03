import rp from 'request-promise'


async function newOrder(session, options){
   
        const orderOptions = {
            method: 'POST',
            uri: `${options.url}/order/new`,
            json: true,
            body: {
                request: "/v1/order/new", //is this needed?
                nonce: '<nonce>',
                client_order_id: "20150102-4738721",
                symbol: config.gemini.currencyPair,       
                amount: options.amount,        
                price: options.price,
                side: options.action,            
                type: config.gemini.orderType,  
                // options: ["maker-or-cancel"] 
            }
        }

        let orderResults = await session(orderOptions)

        //return the object below
        // {
        //     // These are the same fields returned by order/status
        //     "order_id": "22333",
        //     "client_order_id": "20150102-4738721",
        //     "symbol": "btcusd",
        //     "price": "34.23",
        //     "avg_execution_price": "34.24",
        //     "side": "buy",
        //     "type": "exchange limit",
        //     "timestamp": "128938491",
        //     "timestampms": 128938491234,
        //     "is_live": true,
        //     "is_cancelled": false,
        //     "options": ["maker-or-cancel"], 
        //     "executed_amount": "12.11",
        //     "remaining_amount": "16.22",
        //     "original_amount": "28.33"
        // }

        return orderResults
}


export default class GeminiService {

    constructor(options){
        this.options = options || {}
        this.logger = options.logger
        this.session = rp.defaults({
            json: true,
            headers: {
                'User-Agent': 'Request-Promise'
            }
        })
    }

    getOrderBook = async () => {
        try{
            const requestOptions = {
                uri: `${this.options.url}/book/ethusd`,
            }

            let orderBook = await this.session(requestOptions)
            let timestamp = orderBook.bids[0].timestamp

            const bids = orderBook.bids.map((bidLevel) => {
                return {
                    price: bidLevel.price,
                    amount: bidLevel.amount
                }
            })

            const asks = orderBook.asks.map((askLevel) => {
                return {
                    price: askLevel.price,
                    amount: askLevel.amount
                }
            })

            return {
                asks,
                bids,
                timestamp
            }

        } catch(err){
            console.log(err)
        }

    }

    executeTrade = async (tradeDetails) => {

         // this code should attempt to place limit order that wont incur transaction fees
        // perhaps place buy orders at prices very close to the ask price but not in a current slot so that no taker fee is taken
        // likewise place sell orders very close to the bid price but not in a current slot so that no taker fee is taken
        // even if it is only successful some of the time it will help

        // place market trade on gdax 
        this.logger.info(`placing ${tradeDetails.action} trade on Gemini for ${tradeDetails.quantity} ethereum at $${tradeDetails.rate}/eth`)



        let orderResults = newOrder(this.session, options)

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

        return orderResults

        return Promise.resolve('trade completed for GDAX')
    }

}