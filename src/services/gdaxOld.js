import rp from 'request-promise'

export default class GdaxService {

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
            // TODO: update this to match format of gemini service
            const requestOptions = {
                uri: this.options.url,
            }

            let orderBook = await this.session(requestOptions)
    
            const bids = orderBook.bids.map((bidLevel) => {
                return {
                    price: bidLevel[0],
                    amount: bidLevel[1]
                }
            })

            const asks = orderBook.asks.map((askLevel) => {
                return {
                    price: askLevel[0],
                    amount: askLevel[1]
                }
            })

            // reformat order book into standard format
            return {
                asks: asks,
                bids: bids,
                timeStamp: 'timestamp'
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
        this.logger.info(`placing ${tradeDetails.action} trade on Gdax for ${tradeDetails.quantity} ethereum at $${tradeDetails.rate}/eth`)
        return Promise.resolve('trade completed for GDAX')
        
    }

}