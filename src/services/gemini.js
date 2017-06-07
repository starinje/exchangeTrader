import rp from 'request-promise'
import crypto from 'crypto';
import shortid from 'shortid';
import Promise from 'bluebird'


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

    constructor(options){
        this.options = options || {}
        this.logger = this.options.logger
        const subdomain = this.options.sandbox ? `api.sandbox` : `api`;
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
            if (!this.options.key || !this.options.secret) {
                throw new Error(
                    `API key and secret key required to use authenticated methods`,
                );
            }

            const requestUrl = `${this.baseUrl}${endpoint}`

            const payload = {
                nonce: Date.now(),
                request: `/v1${endpoint}`,
                ...params,
            };


            const config = createRequestConfig({
                payload,
                key: this.options.key,
                secret: this.options.secret,
            });

            const requestOptions = {
                method: 'POST',
                uri: requestUrl,
                headers: config
            }

            return await this.session(requestOptions)
        } catch(err) {
            return Promise.reject(`gemini requestPrivate |> ${err}`)
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
            return Promise.reject(`gemini requestPublic |> ${err}`)
        } 
    }

    getOrderBook = async () => {
        try{
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
            return Promise.reject(`gemini getOrderBook |> ${err}`)
        }

    }

    executeTrade = async (tradeDetails) => {
        try{
            this.logger.info(`placing ${tradeDetails.action} trade on Gemini for ${tradeDetails.quantity} ethereum at $${tradeDetails.rate}/eth`)
        
            let orderParams = { 
                client_order_id: "20150102-4738721", 
                symbol: 'ethusd',       
                amount: tradeDetails.quantity,        
                price: tradeDetails.rate,
                side: tradeDetails.action,
                type: 'exchange limit'
            }

            let orderResults = await this.newOrder(orderParams)
            
            let tradeCompleted = false
            let tradeCompletedDetails

            while(!tradeCompleted){
                await Promise.delay(1000)
                let tradeStatus = await this.orderStatus(orderResults.order_id)
                if(tradeStatus.executed_amount == tradeStatus.original_amount){
                    tradeCompleted = true
                    tradeCompletedDetails = tradeStatus
                }
            }
            return tradeCompletedDetails

        } catch(err){
            return Promise.reject(`gemini executeTrade |> ${err}`)
        }
    }

    newOrder = async (params = {}) => {
        try {
            return await this.requestPrivate(`/order/new`, {
                client_order_id: shortid(),
                type: `exchange limit`,
                ...params,
            })
        } catch(err){
            return Promise.reject(`gemini newOrder |> ${err}`)
        }
        
    }

    availableBalances = async () => {
        try {
            return this.requestPrivate(`/balances`)
        } catch(err){
            return Promise.reject(`gemini availableBalances |> ${err}`)
        }
    }

    orderStatus = (orderId) => {
        try {
            return this.requestPrivate(`/order/status`, { order_id: orderId })
        } catch(err){
            return Promise.reject(`gemini orderStatus |> ${err}`)
        }
    }
}