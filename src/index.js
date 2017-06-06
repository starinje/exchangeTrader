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

const TIMESTAMP_FORMAT = 'HH:mm:ss.SSS'

// Initialize logger
const logger = new winston.Logger().add(winston.transports.Console, {
    timestamp: () => `[${moment.utc().format(TIMESTAMP_FORMAT)}]`,
    colorize: true,
    prettyPrint: true,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
})

const gdaxService = new GdaxService({...config.gdax, logger, })
const geminiService = new GeminiService({...config.gemini, logger})

let aggregateProfit = 0

main()

async function main(){

  try {
    console.log('')
    console.log('')
    logger.info('running arbitrage strategy...')

    let orderBookGemini = await geminiService.getOrderBook()
    let orderBookGdax = await gdaxService.getOrderBook()

    let orderBooks = {
      gdax: orderBookGdax,
      gemini: orderBookGemini
    }

    let positionChange = await determinePositionChange(orderBooks)

    if(positionChange == 'none'){
      return 
    }
    
    let results = await execute(positionChange)
    
  } catch(err){
    logger.info(`error: ${err}`)
  } finally{
    await Promise.delay(config.timeDelta)
    main()
  }

}

async function determinePositionChange(orderBooks){

  const ethereumTradingQuantity = config.ethereumTradingQuantity
  const takeProfitTradeThreshold = config.takeProfitTradeThreshold
  const swapFundsTradeThreshold = config.swapFundsTradeThreshold

  let bidPriceGemini = calculateBidPrice(orderBooks.gemini.bids, ethereumTradingQuantity)
  let bidPriceGdax = calculateBidPrice(orderBooks.gdax.bids, ethereumTradingQuantity)
  let askPriceGemini = calculateAskPrice(orderBooks.gemini.asks, ethereumTradingQuantity)
  let askPriceGdax = calculateAskPrice(orderBooks.gdax.asks, ethereumTradingQuantity)

  logger.info(`bidPriceGemini: ${bidPriceGemini}`)
  logger.info(`bidPriceGdax: ${bidPriceGdax}`)
  logger.info(`askPriceGemini: ${askPriceGemini}`)
  logger.info(`askPriceGdax: ${askPriceGdax}`)

  const transactionPercentageGemini = config.transactionPercentageGemini
  const transactionPercentageGdax = config.transactionPercentageGdax

  const gdaxBasePercentageDifference = ((bidPriceGdax - askPriceGemini)/askPriceGemini)*100
  const geminiBasePercentageDifference = ((bidPriceGemini - askPriceGdax)/askPriceGdax)*100

  const gdaxRateIsHigherAndProfitable = gdaxBasePercentageDifference > takeProfitTradeThreshold
  const geminiRateIsSwappable = geminiBasePercentageDifference > swapFundsTradeThreshold

  let positionChange
  let estimatedTransactionFees
  let estimatedGrossProfit
  let estimatedNetProfit

  logger.info(`gdaxBasePercentageDifference: ${gdaxBasePercentageDifference}`)
  logger.info(`geminiBasePercentageDifference: ${geminiBasePercentageDifference}`)

  if(gdaxRateIsHigherAndProfitable){
    logger.info('gdax rate is higher and profitable')

    let totalSaleValue = bidPriceGdax*ethereumTradingQuantity
    let totalPurchaseCost = askPriceGemini*ethereumTradingQuantity
    estimatedGrossProfit = totalSaleValue-totalPurchaseCost
    estimatedTransactionFees = ((transactionPercentageGdax/100)*totalSaleValue) + ((transactionPercentageGemini/100)*totalPurchaseCost)
    estimatedNetProfit = estimatedGrossProfit - estimatedTransactionFees
    
    logger.info(`estimated total sale value: ${totalSaleValue}`)
    logger.info(`estimated total purchase cost: ${totalPurchaseCost}`)
    logger.info(`estimated gross profit: ${estimatedGrossProfit}`)
    logger.info(`estimated transaction fees: ${estimatedTransactionFees}`)
    logger.info(`estimated net profit: ${estimatedNetProfit}`)

    positionChange = {
      type: 'takeProfit',
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
  } else if (geminiRateIsSwappable) {
    logger.info('Gemini Rate Is Swappable')

    let totalSaleValue = bidPriceGemini*ethereumTradingQuantity
    let totalPurchaseCost = askPriceGdax*ethereumTradingQuantity
    estimatedGrossProfit = totalSaleValue-totalPurchaseCost
    estimatedTransactionFees = ((transactionPercentageGemini/100)*totalSaleValue) + ((transactionPercentageGdax/100)*totalPurchaseCost)
    estimatedNetProfit = estimatedGrossProfit - estimatedTransactionFees
    
    logger.info(`estimated total sale value: ${totalSaleValue}`)
    logger.info(`estimated total purchase cost: ${totalPurchaseCost}`)
    logger.info(`estimated gross profit: ${estimatedGrossProfit}`)
    logger.info(`estimated transaction fees: ${estimatedTransactionFees}`)
    logger.info(`estimated net profit: ${estimatedNetProfit}`)

    positionChange= {
      type: 'swapFunds',
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
  } else {
    positionChange = 'none'
    return positionChange
  }

  let exchangeWithEthereumBalance = await determineCurrentEthereumPosition()
  
  if(positionChange[exchangeWithEthereumBalance].action == 'sell'){
    return positionChange
  } else {
    return 'none'
  }
}

async function execute(positionChange){

  let tradeResults = await Promise.all([gdaxService.executeTrade(positionChange.gdax), geminiService.executeTrade(positionChange.gemini)])

  let tradeLog = {
    ...tradeResults,
    type: positionChange.type
  }
  
  return tradeLog
}

async function determineCurrentEthereumPosition(){


  let currentGeminiBalances = await geminiService.availableBalances()
  logger.info(`current Gemini Balances: ${JSON.stringify(currentGeminiBalances)}`)

  //let currentGdaxBalances = await gdaxService.getMyAvailableBalances()
  //console.log(`current Gdax Balances: ${currentGdaxBalances}`)

  // check balances on both exchanges
  // return name of exchange with ethereum balance (account to sell from)
  return 'gdax'

}

function calculateBidPrice(bids, ethereumTradingQuantity){

  let priceLevel = bids.find((bid) => {
    return parseFloat(bid.amount) >= ethereumTradingQuantity
  })

  return priceLevel ? parseFloat(priceLevel.price) : 'no match found'
}

function calculateAskPrice(asks, ethereumTradingQuantity){

  let priceLevel = asks.find((ask) => {
    return parseFloat(ask.amount) >= ethereumTradingQuantity
  })

  return priceLevel ? parseFloat(priceLevel.price) : 'no match found'
}

