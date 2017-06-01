import rp from 'request-promise'

export default class GeminiService {

    constructor(options){
        this.options = options || {}
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
                uri: this.options.url,
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
                asks: asks,
                bids: bids,
                timeStamp: timestamp
            }

        } catch(err){
            console.log(err)
        }

    }

}