import rp from 'request-promise'
import crypto from 'crypto';
import shortid from 'shortid';
import Promise from 'bluebird'
import Gdax from 'gdax'

export default class GdaxService {

    constructor(options){
        this.options = options || {}
        this.logger = this.options.logger
        this.baseUrl = this.options.sandbox ? `https://api-public.sandbox.gdax.com` : `https://api.gdax.com`
        this.publicClient = new Gdax.PublicClient('ETH-USD', this.baseUrl);
        this.authedClient = new Gdax.AuthenticatedClient(
            this.options.key, this.options.secret, this.options.passphrase, this.baseUrl);
        }

    getOrderBook = async () => {
        return new Promise((resolve, reject) => {
            this.publicClient.getProductOrderBook({'level': 2}, (err, response, data) => {

                let orderBook = {...data}
            
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

                let reformattedOrderBook = {
                    asks: asks,
                    bids: bids,
                    timeStamp: 'timestamp'
                }

                return resolve(reformattedOrderBook)
            })
        })
    }

    executeTrade = async (tradeDetails) => {
        this.logger.info(`placing ${tradeDetails.action} trade on Gemini for ${tradeDetails.quantity} ethereum at $${tradeDetails.rate}/eth`)
        
        let orderParams = { 
            productId: 'ETH-USD',       
            size: tradeDetails.quantity,        
            price: tradeDetails.rate,
            action: tradeDetails.action
        }

        let orderResults = await this.newOrder(orderParams)

        let tradeCompleted = false
        let tradeCompletedDetails

        while(!tradeCompleted){
            await Promise.delay(1000)
            let tradeStatus = await this.orderStatus(orderResults.order_id)
            if(tradeStatus.length < 1){
                tradeCompleted = true
                tradeCompletedDetails = tradeStatus
            }
        }

        return tradeCompletedDetails
    }

    newOrder = async (params = {}) => {
        return new Promise((resolve, reject) => {

            const reformattedParams = {
                price: params.price,
                size: params.size,
                product_id: params.productId
            }

            this.authedClient[params.action](reformattedParams, (err, results, data) => {
                return resolve(results)
            })
        })

    }

    availableBalances = async () => {
        // return this.requestPrivate(`/balances`)
    }

    orderStatus = (orderId) => {
        console.log('in orderStatus function')
        return new Promise((resolve, reject) => {
            this.authedClient.getOrders((err, results, data) => {
                return resolve(data)
            })
        })
    }
}