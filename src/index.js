// Poloniex API documentation: https://poloniex.com/support/api/
import fs from 'fs'

import autobahn from 'autobahn'
import program from 'commander'
import moment from 'moment'
import winston from 'winston'
import Promise from 'bluebird'
import request from 'request'
import rp from 'request-promise'

import config from './config'

import GdaxService from './services/gdax'
import GeminiService from './services/gemini'


const gdaxService = new GdaxService(config.gdax)
const geminiService = new GeminiService(config.gemini)

const TIMESTAMP_FORMAT = 'HH:mm:ss.SSS'


// Initialize logger
const logger = new winston.Logger().add(winston.transports.Console, {
    timestamp: () => `[${moment.utc().format(TIMESTAMP_FORMAT)}]`,
    colorize: true,
    prettyPrint: true,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
})


main()

async function main(){

  logger.info('running arbitrage strategy...')

  logger.info(`timeDelta is ${config.timeDelta}`)
  logger.info(`tradeThreshold is ${config.tradeThreshold}`)

  
  let orderBookGemini = await geminiService.getOrderBook()
  let orderBookGdax = await gdaxService.getOrderBook()

  let orderBooks = {
    gdax: orderBookGdax,
    gemini: orderBookGemini
  }

  let actions = determineAction(orderBooks)

  console.log('actions: ', actions)

  // let results = execute(action)


  await Promise.delay(config.timeDelta)
  main()
}


function determineAction(orderBooks){

  const ethereumTradingQuantity = config.ethereumTradingQuantity
  const tradeThreshold = config.tradeThreshold

  let bidPriceGemini = calculateBidPrice(orderBooks.gemini.bids, ethereumTradingQuantity)
  let bidPriceGdax = calculateBidPrice(orderBooks.gdax.bids, ethereumTradingQuantity)

  let askPriceGemini = calculateAskPrice(orderBooks.gemini.asks, ethereumTradingQuantity)
  let askPriceGdax = calculateAskPrice(orderBooks.gdax.asks, ethereumTradingQuantity)

  let actions

  if(bidPriceGdax > (askPriceGemini + tradeThreshold)){
    actions = {
      gdax : {
        action: 'sell',
        quantity: ethereumTradingQuantity,
        units: 'eth',
        rate: bidPriceGdax
      },
      gemini: {
        action: 'buy',
        quantity: ethereumTradingQuantity,
        units: 'eth',
        rate: askPriceGemini
      }
    }
  } else if (bidPriceGemini > (askPriceGdax + tradeThreshold)) {
    actions = {
      gemini: {
        action: 'sell',
        quantity: ethereumTradingQuantity,
        units: 'eth',
        rate: bidPriceGemini
      },
      gdax : {
        action: 'buy',
        quantity: ethereumTradingQuantity,
        units: 'eth',
        rate: askPriceGdax
      }
    }
  } else{
    actions = 'no trade opportunity'
    return action
  }

  let exchangeWithEthereumBalance = determineEthereumBalance()
  // console.log('action: ', action)


  console.log(actions[exchangeWithEthereumBalance].action)
  if(actions[exchangeWithEthereumBalance].action == 'sell'){
    return actions
  } else {
    return 'no trade opportunity'
  }
}

async function execute(action){

  // let results = 

  // // iterate over action object
  // // sell on one exchange
  // // and buy on the other



  
  // return actionCompleted

}



function determineEthereumBalance(){

  // check balances on both exchanges
  // return name of exchange with ethereum balance (account to sell from)
  return 'gdax'

}

function calculateBidPrice(bids, ethereumTradingQuantity){

  let priceLevel = bids.find((bid) => {
    return parseFloat(bid.amount) >= ethereumTradingQuantity
  })

  return priceLevel.price
}

function calculateAskPrice(asks, ethereumTradingQuantity){

  let priceLevel = asks.find((ask) => {
    return parseFloat(ask.amount) >= ethereumTradingQuantity
  })


  return priceLevel.price
}

