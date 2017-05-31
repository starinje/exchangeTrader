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
            // reformat order book into standard format
            return {
                exchange: 'gemini',
                asks: [],
                sells: [],
                timeStamp: 'timestamp'
            }

        } catch(err){
            console.log(err)
        }

    }

}