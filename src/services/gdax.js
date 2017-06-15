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
        try{
            return new Promise((resolve, reject) => {
                this.publicClient.getProductOrderBook({'level': 2}, (err, response, data) => {

                    if(err){
                        return reject(err)
                    }

                    let orderBook = {...data}

                    if(orderBook.bids.length < 1 || orderBook.asks.length < 1){
                        return reject(new Error('order book is corrupted'))
                    }
                
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
        } catch(err){
            return Promise.reject(`gdax getOrderBook |> ${err}`)
        }
      
    }

    executeTrade = async (tradeDetails, orderBook) => {
        try{
            //this.logger.info(`placing ${tradeDetails.action} trade on Gdax for ${tradeDetails.quantity} ethereum at $${tradeDetails.rate}/eth`)

            // here we have the desired buy/sell level
            // need to place a maker-or-cancel order
            // switch on action (buy/sell)
            // generate array of available priceLevels 
            // if trying to sell, place maker-only sell in the spread lower than the current 
            //logic here to sweep across the price range attempting to place maker only orders
            //if it cant then just place market order

            orderBook = await this.getOrderBook()
            this.logger.info('retrieving latest order book from gdax')
            let price

            switch(tradeDetails.action){
                case 'buy':
                    price = orderBook.bids[2].price
                    break
                case 'sell':
                    price = orderBook.asks[2].price
                    break
            }

            this.logger.info(`placing ${tradeDetails.action} trade on Gdax for ${tradeDetails.quantity} ethereum at $${price}/eth`)
        
            let orderParams = { 
                productId: 'ETH-USD',       
                size: tradeDetails.quantity,        
                price: price,
                action: tradeDetails.action,
                postOnly: true
            }

            let orderResults = await this.newOrder(orderParams)
            orderResults = JSON.parse(orderResults.body)

            let tradeCompleted = false
            let tradeCompletedDetails

            while(!tradeCompleted){
                let tradeStatus = await this.orderStatus(orderResults.id)
                if(tradeStatus.status == 'done'){
                    tradeCompleted = true
                    tradeCompletedDetails = tradeStatus
                }
                await Promise.delay(1000)
            }

            let tradeSummary = {
                fee: parseFloat(tradeCompletedDetails.fill_fees),
                amount: parseFloat(tradeCompletedDetails.size),
                price: parseFloat(tradeCompletedDetails.price),
                action: tradeDetails.action
            }

            return tradeSummary

            return 
        } catch(err){
            return Promise.reject(`gdax executeTrade |> ${err}`)
        } 
       
    }

    executeTradeOld = async (tradeDetails, orderBook) => {
        try{
            this.logger.info(`placing ${tradeDetails.action} trade on Gdax for ${tradeDetails.quantity} ethereum at $${tradeDetails.rate}/eth`)

            //should pass in profitable price range
            //logic here to sweep across the price range attempting to place maker only orders
            //if it cant then just place market order
        
            let orderParams = { 
                productId: 'ETH-USD',       
                size: tradeDetails.quantity,        
                price: tradeDetails.rate,
                action: tradeDetails.action
            }

            let orderResults = await this.newOrder(orderParams)
            orderResults = JSON.parse(orderResults.body)

            let tradeCompleted = false
            let tradeCompletedDetails

            while(!tradeCompleted){
                let tradeStatus = await this.orderStatus(orderResults.id)
                if(tradeStatus.status == 'done'){
                    tradeCompleted = true
                    tradeCompletedDetails = tradeStatus
                }
                await Promise.delay(1000)
            }

            let tradeSummary = {
                fee: parseFloat(tradeCompletedDetails.fill_fees),
                amount: parseFloat(tradeCompletedDetails.size),
                price: parseFloat(tradeCompletedDetails.price),
                action: tradeDetails.action
            }

            return tradeSummary

        } catch(err){
            return Promise.reject(`gdax executeTrade |> ${err}`)
        } 
       
    }

    newOrder = async (params = {}) => {
        try {
            return new Promise((resolve, reject) => {

                const reformattedParams = {
                    price: params.price,
                    size: params.size,
                    product_id: params.productId,
                    post_only: params.postOnly,
                }

                this.authedClient[params.action](reformattedParams, (err, results, data) => {
                    return resolve(results)
                })
            })
        } catch(err){
            return Promise.reject(`gdax newOrder Error: ${err}`)
            
        }
    }

    
    availableBalances = async () => {
        try {
            return new Promise((resolve, reject) => {
                this.authedClient.getAccounts((err, results, data) => {
                    return resolve(data)
                })
            })
           
        } catch(err){
            return Promise.reject(`gdax accounts |> ${err}`)
        }
    }

    orderStatus = (orderId) => {
        try {  
           return new Promise((resolve, reject) => {
               this.authedClient.getOrder(orderId, (err, results, data) => {
                   return resolve(data)
               });
            })
        } catch(err){
            return Promise.reject(`gdax orderStatus |> ${err}`)
        }
    }
}