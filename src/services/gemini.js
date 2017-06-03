import rp from 'request-promise'
import crypto from 'crypto';
import shortid from 'shortid';


function createRequestConfig({ key, secret, payload }){
  const encodedPayload = (new Buffer(JSON.stringify(payload)))
    .toString(`base64`);

  const signature = crypto
    .createHmac(`sha384`, secret)
    .update(encodedPayload)
    .digest(`hex`);

  return {
      'X-GEMINI-APIKEY': key,
      'X-GEMINI-PAYLOAD': encodedPayload,
      'X-GEMINI-SIGNATURE': signature,
  };
}


export default class GeminiService {

    constructor(options, sandbox){
        this.options = options || {}
        this.logger = options.logger
        const subdomain = sandbox ? `api.sandbox` : `api`;
        this.baseUrl = `https://${subdomain}.gemini.com/v1`;
        this.session = rp.defaults({
            json: true,
            headers: {
                'User-Agent': 'Request-Promise'
            }
        })
    }

    requestPrivate = async(endpoint, params = {}) => {
        try{
            //code here to send private request
            if (!this.options.key || !this.options.secret) {
                throw new Error(
                    `API key and secret key required to use authenticated methods`,
                );
            }

            const requestUrl = `${this.baseUrl}${endpoint}`

            const payload = {
                nonce: Date.now(),
                request: endpoint,
                ...params,
            };

            const config = createRequestConfig({
                payload,
                key: this.options.key,
                secret: this.options.secret,
            });

            console.log(config)

            const requestOptions = {
                method: 'POST',
                uri: requestUrl,
                headers: config
            }

            console.log(JSON.stringify(requestOptions))

            return await this.session(requestOptions)
        } catch(err) {
            this.logger.info(`error: ${err}`)
            return 
        }
    }

    requestPublic = async (endpoint, params = {}) => {
        try {
            const requestOptions = {
                method: 'GET',
                uri: `${this.options.url}${endpoint}`,
                body: {
                    ...params
                }
            }

            return await this.session(requestOptions) 
        } catch(err) {
            return Promise.reject(err)
        } 
    }

    getOrderBook = async () => {
        try{
            // let orderBook = await this.session(requestOptions)
            let orderBook = await this.requestPublic(`/book/ethusd`, {})

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

            return { asks, bids,timestamp}
        } catch(err){
            console.log(err)
        }

    }

    executeTrade = async (tradeDetails) => {
        this.logger.info(`placing ${tradeDetails.action} trade on Gemini for ${tradeDetails.quantity} ethereum at $${tradeDetails.rate}/eth`)

        let orderParams = { 
            client_order_id: "20150102-4738721", // A client-specified order token
            symbol: 'ethusd',       // Or any symbol from the /symbols api
            quantity: tradeDetails.quantity,        // Once again, a quoted number
            price: tradeDetails.rate,
            side: tradeDetails.action,
            type: 'exchange limit'
        }

        let orderResults = this.newOrder(orderParams)

        //check to make sure order is place

        //return when order is successful

        return Promise.resolve('trade completed for GDAX')
    }

    newOrder = async (params = {}) => {
        return await this.requestPrivate(`/order/new`, {
            client_order_id: shortid(),
            type: `exchange limit`,
            ...params,
        })
    }



}