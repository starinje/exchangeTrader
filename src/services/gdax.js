import rp from 'request-promise'

export default class GdaxService {

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

}