import rp from 'request-promise'
import crypto from 'crypto';
import shortid from 'shortid';
import Promise from 'bluebird'
import Gdax from 'gdax'
import moment from 'moment'

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

    executeTrade = async (positionChange) => {
        try{

            const tradeDetails = positionChange.gdax
            const counterPrice = positionChange.gemini.rate
            const rateDelta = Math.abs(positionChange.gdax.rate - positionChange.gemini.rate)

            let tradeCompleted = false
            let tradeProfitable = true

            let finalOrderResults
            let price
            let tradeQuantity = tradeDetails.quantity

            while(!tradeCompleted && tradeProfitable){

                let orderBook = await this.getOrderBook()
                
                switch(tradeDetails.action){
                case 'buy':
                    // let lowestSellPrice = parseFloat(orderBook.asks[0].price)
                    // price = lowestSellPrice - .01
                    let highestBuyPrice = parseFloat(orderBook.bids[0].price)
                    price = highestBuyPrice 
                    if(price >= counterPrice){ //-(rateDelta/2)
                        tradeProfitable = false
                        continue
                    }
                    break
                case 'sell':
                   // let highestBuyPrice = parseFloat(orderBook.bids[0].price)
                    // price = highestBuyPrice + .01
                    let lowestSellPrice = parseFloat(orderBook.asks[0].price)
                    price = lowestSellPrice
                    if(price <= counterPrice){ //+(rateDelta/2)
                        tradeProfitable = false
                        continue
                    }
                    break
                }

                price = price.toFixed(2).toString()

                this.logger.info(`placing ${tradeDetails.action} trade on Gdax for ${tradeDetails.quantity} ethereum at $${price}/eth`)

                let orderParams = { 
                    productId: 'ETH-USD',       
                    size: tradeQuantity,        
                    price: price,
                    action: tradeDetails.action,
                    postOnly: true
                }

                if(parseFloat(orderParams.price) < 320){
                    logger.info(`failed gdax price sanity check. price: ${orderParams.price} `)
                    process.exit()
                }

                let orderResults = await this.newOrder(orderParams)
                orderResults = JSON.parse(orderResults.body)
                console.log(`gdax order results: ${JSON.stringify(orderResults)}`)

                //TODO - need to check for order sucess - not for order failure....

                if(!(orderResults.hasOwnProperty('status')) || !(orderResults.status == 'pending')){
                    this.logger.info('gdax order could not be submitted')
                    this.logger.info(orderResults)
                    continue
                }

                await Promise.delay(1000)

                let timeStart = moment.utc(new Date())
                let timeExpired = false

                this.logger.info(`gdax order entered - going into check status loop...`)
                while(!timeExpired && !tradeCompleted){
                    await Promise.delay(1000)
                    let now = moment.utc(new Date())
                    let timeSinceTradePlaced = moment.duration(now.diff(timeStart))

                    let tradeStatus = await this.orderStatus(orderResults.order_id)
                    if(tradeStatus.executed_amount == tradeStatus.original_amount){
                        tradeCompleted = true
                        finalOrderResults = orderResults
                        continue
                    } else {
                        tradeQuantity = parseFloat(tradeStatus.original_amount) - parseFloat(tradeStatus.executed_amount)
                    }

                    if(timeSinceTradePlaced.asMinutes() > this.options.orderFillTime){
                        this.logger.info(`time has expired trying to ${tradeDetails.action} ${tradeDetails.quantity} ethereum on gdax at ${price}/eth, canceling order`)
                        await this.cancelOrders()
                        timeExpired = true
                    }
                }
            }

            let tradeSummary

            if(tradeCompleted){

                let tradeSummary = {
                    fee: parseFloat(finalOrderResults.fill_fees),
                    amount: parseFloat(finalOrderResults.size),
                    price: parseFloat(finalOrderResults.price),
                }

                return {...tradeSummary, action: tradeDetails.action}
            } else if(!tradeProfitable){
                this.logger.info(`${tradeDetails.action} on gdax for ${tradeDetails.quantity} ethereum at ${price}/eth was unsuccesful - order book no longer profitable`)
                process.exit()
            }
        } catch(err){
            return Promise.reject(`gdax executeTrade |> ${err}`)
        }
    }

    // executeTradeOld = async (tradeDetails, orderBook) => {
    //     try{
    //         //this.logger.info(`placing ${tradeDetails.action} trade on Gdax for ${tradeDetails.quantity} ethereum at $${tradeDetails.rate}/eth`)

    //         // here we have the desired buy/sell level
    //         // need to place a maker-or-cancel order
    //         // switch on action (buy/sell)
    //         // generate array of available priceLevels 
    //         // if trying to sell, place maker-only sell in the spread lower than the current 
    //         //logic here to sweep across the price range attempting to place maker only orders
    //         //if it cant then just place market order

    //         orderBook = await this.getOrderBook()
    //         this.logger.info('retrieving latest order book from gdax')
    //         let price

    //         switch(tradeDetails.action){
    //             case 'buy':
    //                 price = orderBook.bids[1].price
    //                 break
    //             case 'sell':
    //                 price = orderBook.asks[1].price
    //                 break
    //         }

    //         this.logger.info(`placing ${tradeDetails.action} trade on Gdax for ${tradeDetails.quantity} ethereum at $${price}/eth`)
        
    //         let orderParams = { 
    //             productId: 'ETH-USD',       
    //             size: tradeDetails.quantity,        
    //             price: price,
    //             action: tradeDetails.action,
    //             postOnly: true
    //         }

    //         let orderResults = await this.newOrder(orderParams)
    //         orderResults = JSON.parse(orderResults.body)

    //         let tradeCompleted = false
    //         let tradeCompletedDetails

    //         while(!tradeCompleted){
    //             let tradeStatus = await this.orderStatus(orderResults.id)
    //             if(tradeStatus.status == 'done'){
    //                 tradeCompleted = true
    //                 tradeCompletedDetails = tradeStatus
    //             }
    //             await Promise.delay(1000)
    //         }

    //         let tradeSummary = {
    //             fee: parseFloat(tradeCompletedDetails.fill_fees),
    //             amount: parseFloat(tradeCompletedDetails.size),
    //             price: parseFloat(tradeCompletedDetails.price),
    //             action: tradeDetails.action
    //         }

    //         return tradeSummary
    //     } catch(err){
    //         return Promise.reject(`gdax executeTrade |> ${err}`)
    //     } 
       
    // }

    // executeTradeOldest = async (tradeDetails, orderBook) => {
    //     try{
    //         this.logger.info(`placing ${tradeDetails.action} trade on Gdax for ${tradeDetails.quantity} ethereum at $${tradeDetails.rate}/eth`)

    //         //should pass in profitable price range
    //         //logic here to sweep across the price range attempting to place maker only orders
    //         //if it cant then just place market order
        
    //         let orderParams = { 
    //             productId: 'ETH-USD',       
    //             size: tradeDetails.quantity,        
    //             price: tradeDetails.rate,
    //             action: tradeDetails.action
    //         }

    //         let orderResults = await this.newOrder(orderParams)
    //         orderResults = JSON.parse(orderResults.body)

    //         let tradeCompleted = false
    //         let tradeCompletedDetails

    //         while(!tradeCompleted){
    //             let tradeStatus = await this.orderStatus(orderResults.id)
    //             if(tradeStatus.status == 'done'){
    //                 tradeCompleted = true
    //                 tradeCompletedDetails = tradeStatus
    //             }
    //             await Promise.delay(1000)
    //         }

    //         let tradeSummary = {
    //             fee: parseFloat(tradeCompletedDetails.fill_fees),
    //             amount: parseFloat(tradeCompletedDetails.size),
    //             price: parseFloat(tradeCompletedDetails.price),
    //             action: tradeDetails.action
    //         }

    //         return tradeSummary

    //     } catch(err){
    //         return Promise.reject(`gdax executeTrade |> ${err}`)
    //     } 
       
    // }

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

    cancelOrders = async () => {
        try {
            return new Promise((resolve, reject) => {
                this.authedClient.cancelAllOrders( (err, results, data) => {
                    return resolve(results)
                })
            })
        } catch(err){
            return Promise.reject(`gdax cancelOrders Error: ${err}`)
            
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