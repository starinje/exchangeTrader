import rp from 'request-promise'
import crypto from 'crypto';
import shortid from 'shortid';
import Promise from 'bluebird'
import moment from 'moment'


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

    executeTradeOld = async (tradeDetails, orderBook) => {
        try{
            orderBook = await this.getOrderBook()
            this.logger.info('retrieving latest order book from gemini')
            let price

            switch(tradeDetails.action){
                case 'buy':
                    price = orderBook.bids[1].price
                    break
                case 'sell':
                    price = orderBook.asks[1].price
                    break
            }

            this.logger.info(`placing ${tradeDetails.action} trade on Gemini for ${tradeDetails.quantity} ethereum at $${price}/eth`)
        
            let orderParams = { 
                client_order_id: "20150102-4738721", 
                symbol: 'ethusd',       
                amount: tradeDetails.quantity,        
                price: tradeDetails.rate,
                side: tradeDetails.action,
                type: 'exchange limit',
            }

            let orderResults = await this.newOrder(orderParams)
            
            let tradeCompleted = false

            while(!tradeCompleted){
                await Promise.delay(1000)
                let tradeStatus = await this.orderStatus(orderResults.order_id)
                if(tradeStatus.executed_amount == tradeStatus.original_amount){
                    tradeCompleted = true
                }
            }

            let tradeSummary = await this.orderHistory(orderResults.order_id)

            return {...tradeSummary, action: tradeDetails.action}

        } catch(err){
            return Promise.reject(`gemini executeTrade |> ${err}`)
        }
    }

    executeTrade = async (positionChange) => {
        try{

            const tradeDetails = positionChange.gemini
            const counterPrice = positionChange.gdax.rate
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

                    // let highestBuyPrice = parseFloat(orderBook.bids[0].price)
                    // price = highestBuyPrice 

                    let lowestSellPriceLevel = orderBook.asks.find((ask) => {
                        return parseFloat(ask.amount) >= tradeQuantity
                    })

                    price = parseFloat(lowestSellPriceLevel.price)

                    if(price >= counterPrice){ //-(rateDelta/2)
                        tradeProfitable = false
                        continue
                    }
                    break
                case 'sell':
                    // let highestBuyPrice = parseFloat(orderBook.bids[0].price)
                    // price = highestBuyPrice + .01

                    // let lowestSellPrice = parseFloat(orderBook.asks[0].price)
                    // price = lowestSellPrice

                    let highestBuyPriceLevel = orderBook.bids.find((ask) => {
                        return parseFloat(ask.amount) >= tradeQuantity
                    })

                    price = parseFloat(highestBuyPriceLevel.price)


                    if(price <= counterPrice){ //+(rateDelta/2)
                        tradeProfitable = false
                        continue
                    }
                    break
                }

                price = price.toFixed(2).toString()

                this.logger.info(`placing ${tradeDetails.action} trade on Gemini for ${tradeDetails.quantity} ethereum at $${price}/eth`)
            
                let orderParams = { 
                    client_order_id: "20150102-4738721", 
                    symbol: 'ethusd',       
                    amount: tradeQuantity,        
                    price: price,
                    side: tradeDetails.action,
                    type: 'exchange limit',
                    //options: ['maker-or-cancel']
                }

                if(parseFloat(orderParams.price) < 250 || parseFloat(orderParams.price) > 400){
                    this.logger.info(`failed gemini price sanity check. price: ${orderParams.price} `)
                    process.exit()
                }

                let orderResults = await this.newOrder(orderParams)

                if(orderResults.is_cancelled){
                    this.logger.info('gemini order could not be submitted')
                    this.logger.info(orderResults)
                    continue
                }

                await Promise.delay(1000)

                let timeStart = moment.utc(new Date())
                let timeExpired = false

                this.logger.info(`gemini order entered - going into check status loop...`)
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
                        this.logger.info(`time has expired trying to ${tradeDetails.action} ${tradeDetails.quantity} ethereum on gemini at ${price}/eth, canceling order`)
                        await this.cancelOrders()
                        timeExpired = true
                    }
                }
            }

            let tradeSummary

            if(tradeCompleted){
                tradeSummary = await this.orderHistory(finalOrderResults.order_id)
                return {...tradeSummary, action: tradeDetails.action}
            } else if(!tradeProfitable){
                this.logger.info(`${tradeDetails.action} on gemini for ${tradeDetails.quantity} ethereum at ${price}/eth was unsuccesful - order book no longer profitable`)
                process.exit()
            }
        } catch(err){
            return Promise.reject(`gemini executeTrade |> ${err}`)
        }
    }

    newOrder = async (params = {}) => {
        try {
            return this.requestPrivate(`/order/new`, {
                client_order_id: shortid(),
                type: `exchange limit`,
                ...params,
            })
        } catch(err){
            return Promise.reject(`gemini newOrder |> ${err}`)
        }
        
    }

    cancelOrders = async (params = {}) => {
        try {
            return this.requestPrivate(`/order/cancel/all`)
        } catch(err){
            return Promise.reject(`gemini cancelOrders |> ${err}`)
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

    orderHistory = async (orderId) => {
        try {
            let trades = await this.requestPrivate(`/mytrades`, { symbol: 'ETHUSD'} )
            let orderTrades = trades.filter((trade) =>{
                return trade.order_id == orderId
            })

            let fee = 0
            let amount = 0
            let price = 0
            let numberOfTrades = 0

            orderTrades.forEach((trade) => {
                fee = parseFloat(trade.fee_amount) + fee
                amount = parseFloat(trade.amount) + amount
                price = parseFloat(trade.price) + price
                numberOfTrades = numberOfTrades + 1
            })

            let averagePrice = price / numberOfTrades

            let tradeSummary = {
                fee,
                amount,
                price: averagePrice
            }

            return tradeSummary
        } catch(err){
            this.logger.info(`gemini orderStatus |> ${err}`)
            return Promise.reject(`gemini orderStatus |> ${err}`)
        }
    }
}