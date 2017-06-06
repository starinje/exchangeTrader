import rp from 'request-promise'
import crypto from 'crypto';
import shortid from 'shortid';
import Promise from 'bluebird'


// function createRequestConfig({ key, secret, payload }){

//   const encodedPayload = (new Buffer(JSON.stringify(payload)))
//     .toString(`base64`);

//   const signature = crypto
//     .createHmac(`sha384`, secret)
//     .update(encodedPayload)
//     .digest(`hex`);

//   return {
//       'X-GEMINI-APIKEY': key,
//       'X-GEMINI-PAYLOAD': encodedPayload,
//       'X-GEMINI-SIGNATURE': signature,
//   };
// }


export default class GdaxService {

    constructor(options){
        this.options = options || {}
        this.logger = this.options.logger
        this.baseUrl = this.options.sandbox ? `https://api-public.sandbox.gdax.com` : `https://api.gdax.com`
        this.session = rp.defaults({
            json: true,
            headers: {
                'User-Agent': 'Request-Promise'
            }
        })
    }

    requestPrivate = async(endpoint, params = {}) => {
        try{
            // //code here to send private request
            // if (!this.options.key || !this.options.secret) {
            //     throw new Error(
            //         `API key and secret key required to use authenticated methods`,
            //     );
            // }

            // const requestUrl = `${this.baseUrl}${endpoint}`

            // const payload = {
            //     nonce: Date.now(),
            //     request: `/v1${endpoint}`,
            //     ...params,
            // };


            // const config = createRequestConfig({
            //     payload,
            //     key: this.options.key,
            //     secret: this.options.secret,
            // });

            // const requestOptions = {
            //     method: 'POST',
            //     uri: requestUrl,
            //     headers: config
            // }

            // return await this.session(requestOptions)
        } catch(err) {
            this.logger.info(`error: ${err}`)
            return 
        }
    }

    requestPublic = async (endpoint, params = {}) => {
        try {
            const requestOptions = {
                method: 'GET',
                uri: `${this.baseUrl}${endpoint}`,
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
            let orderBook = await this.requestPublic(`/products/ETH-USD/book?level=2`, {})

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

            return {
                asks: asks,
                bids: bids,
                timeStamp: 'timestamp'
            }
        } catch(err){
            this.logger.info(err)
        }

    }

    executeTrade = async (tradeDetails) => {
        this.logger.info(`placing ${tradeDetails.action} trade on Gemini for ${tradeDetails.quantity} ethereum at $${tradeDetails.rate}/eth`)

        console.log('code to execute gdax trade...')

        // TODO: pick up code here....
        
        // let orderParams = { 
        //     client_order_id: "20150102-4738721", 
        //     symbol: 'ethusd',       
        //     amount: tradeDetails.quantity,        
        //     price: tradeDetails.rate,
        //     side: tradeDetails.action,
        //     type: 'exchange limit'
        // }

        // let orderResults = await this.newOrder(orderParams)

        // let tradeCompleted = false
        // let tradeCompletedDetails

        // while(!tradeCompleted){
        //     await Promise.delay(1000)
        //     let tradeStatus = await this.orderStatus(orderResults.order_id)
        //     if(tradeStatus.executed_amount == tradeStatus.original_amount){
        //         tradeCompleted = true
        //         tradeCompletedDetails = tradeStatus
        //     }
        // }

        // return tradeCompletedDetails
    }

    newOrder = async (params = {}) => {
        // return await this.requestPrivate(`/order/new`, {
        //     client_order_id: shortid(),
        //     type: `exchange limit`,
        //     ...params,
        // })
    }

    availableBalances = async () => {
        // return this.requestPrivate(`/balances`)
    }

    orderStatus = (orderId) => {
        // return this.requestPrivate(`/order/status`, { order_id: orderId })
    }
}