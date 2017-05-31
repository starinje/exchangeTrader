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

  const timeDelta = 2000
  const tradeThreshhold = .01

  logger.info('running arbitrage strategy...')
  let orderBookGemini = await geminiService.getOrderBook()
  let orderBookGdax = await gdaxService.getOrderBook()
  logger.info(orderBookGemini)
  logger.info(orderBookGdax)

  let actions = determineAction(orderBookGemini, orderBookGdax)

  let results = execute(action)


  await Promise.delay(timeDelta)
  main()
}


async function determineAction(orderBookExchangeA, orderBookExchangeB){

  // compare order books and calculate action
  // if sell price at higher exchange is more than x percent higher than 
  // buy price on lower exchange then sell the one direction

  let action = {
    [`${orderBookA.exchange}`] : {
      action: 'sell',
      units: 'eth',
      rate: 225
    },
     [`${orderBookB.exchange}`]: {
      action: 'buy',
      units: 'eth',
      rate: 220
    }
  }

  return action

}

async function execute(action){

  let results = 

  // iterate over action object
  // sell on one exchange
  // and buy on the other



  
  return actionCompleted

}


