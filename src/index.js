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
import logger from './services/logger.js'
import heartbeatLogger from './services/heartbeatLogger.js'

const gdaxService = new GdaxService({...config.gdax, logger, })
const geminiService = new GeminiService({...config.gemini, logger})

main()

async function main(){

  try {
   
    heartbeatLogger.info('running arbitrage strategy...')
 

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

    logger.info('')
    logger.info('NEW TRADE')
    
    let tradeResults = await execute(positionChange)

    let gdaxResults = tradeResults.gdax
    let geminiResults = tradeResults.gemini

    //check here for results from each exchage. If either is bad then process.exit and cancel all orders on both exchanges.

    let buyValue
    let sellValue

    switch(tradeResults.takeProfit){
      case 'gdax':
        buyValue = (tradeResults.gemini.price*tradeResults.gemini.amount) - tradeResults.gemini.fee
        sellValue = (tradeResults.gdax.price*tradeResults.gdax.amount) - tradeResults.gdax.fee
        break
  
      case 'gemini':
        sellValue = (tradeResults.gemini.price*tradeResults.gemini.amount) - tradeResults.gemini.fee
        buyValue = (tradeResults.gdax.price*tradeResults.gdax.amount) - tradeResults.gdax.fee
        break
    }
    
    let profit = (sellValue - buyValue) / buyValue
    
    logger.info(`successful ${tradeResults.gdax.action} on Gdax for ${tradeResults.gdax.amount} ethereum at $${tradeResults.gdax.price}/eth, fee of ${tradeResults.gdax.fee}`)
    logger.info(`successful ${tradeResults.gemini.action} on Gemini for ${tradeResults.gemini.amount} ethereum at ${tradeResults.gemini.price}/eth, fee of ${tradeResults.gemini.fee}`)
    logger.info(`profit percentage: ${profit}`)
    
  } catch(err){
    logger.info(`error: ${err}`)
    geminiService.cancelOrders()
    gdaxService.cancelOrders()
    process.exit()
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


  if(gdaxRateIsHigherAndProfitable){

    logger.info(`bidPriceGemini: ${bidPriceGemini}`)
    logger.info(`bidPriceGdax: ${bidPriceGdax}`)
    logger.info(`askPriceGemini: ${askPriceGemini}`)
    logger.info(`askPriceGdax: ${askPriceGdax}`)

    logger.info(`gdaxBasePercentageDifference: ${gdaxBasePercentageDifference}`)
    logger.info(`geminiBasePercentageDifference: ${geminiBasePercentageDifference}`)

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
      takeProfit: 'gdax',
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
    logger.info(`bidPriceGemini: ${bidPriceGemini}`)
    logger.info(`bidPriceGdax: ${bidPriceGdax}`)
    logger.info(`askPriceGemini: ${askPriceGemini}`)
    logger.info(`askPriceGdax: ${askPriceGdax}`)

    logger.info(`gdaxBasePercentageDifference: ${gdaxBasePercentageDifference}`)
    logger.info(`geminiBasePercentageDifference: ${geminiBasePercentageDifference}`)
    logger.info('Gemini rate is higher and profitable')

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
      takeProfit: 'gemini',
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

  let tradeResults = await Promise.all([gdaxService.executeTrade(positionChange), geminiService.executeTrade(positionChange)])
  //let tradeResults = await Promise.all([gdaxService.executeTrade(positionChange)])

  let tradeLog = {
    gdax: tradeResults[0],
    gemini: tradeResults[1],
    takeProfit: positionChange.takeProfit
  }

  return tradeLog
}

async function determineCurrentEthereumPosition(){

  // determine gemini ethereum balance
  let currentGeminiBalances = await geminiService.availableBalances()
  
  let geminiUsdBalance = currentGeminiBalances.filter(accountDetails => accountDetails.currency == 'USD')
  geminiUsdBalance = parseFloat(geminiUsdBalance[0].amount)

  let geminiEthBalance = currentGeminiBalances.filter(accountDetails => accountDetails.currency == 'ETH')
  geminiEthBalance = parseFloat(geminiEthBalance[0].amount)

  // determine gdax ethereum balance
  let currentGdaxBalances = await gdaxService.availableBalances()
  
  let gdaxUsdBalance = currentGdaxBalances.filter((accountDetails) => accountDetails.currency == 'USD')
  gdaxUsdBalance = parseFloat(gdaxUsdBalance[0].balance)

  let gdaxEthBalance = currentGdaxBalances.filter((accountDetails) => accountDetails.currency == 'ETH')
  gdaxEthBalance = parseFloat(gdaxEthBalance[0].balance)

  logger.info(`geminiEthBalance: ${geminiEthBalance}`)
  logger.info(`geminiUsdBalance: ${geminiUsdBalance}`)
  logger.info(`gdaxEthBalance: ${gdaxEthBalance}`)
  logger.info(`gdaxUsdBalance: ${gdaxUsdBalance}`)

  let ethereumBalance
  if(geminiEthBalance > gdaxEthBalance){
    ethereumBalance = 'gemini'
  } else if (gdaxEthBalance > geminiEthBalance){
    ethereumBalance = 'gdax'
  }

  logger.info(`ethereum balance is in ${ethereumBalance}`)

  return ethereumBalance
}

function calculateBidPrice(bids, ethereumTradingQuantity){

  let priceLevel = bids.find((bid) => {
    return parseFloat(bid.amount) >= ethereumTradingQuantity
  })
  //let priceLevel = bids[0]

  return priceLevel ? parseFloat(priceLevel.price) : 'no match found'
}

function calculateAskPrice(asks, ethereumTradingQuantity){

  let priceLevel = asks.find((ask) => {
    return parseFloat(ask.amount) >= ethereumTradingQuantity
  })
  //let priceLevel = asks[0]

  return priceLevel ? parseFloat(priceLevel.price) : 'no match found'
}

