module.exports = {
    gemini: {
        url: 'https://api.gemini.com/v1/book/ethusd'
    },
    gdax: {
        url: 'https://api.gdax.com/products/ETH-USD/book?level=2'
    },
    ethereumTradingQuantity: 40,
    takeProfitTradeThreshold: .8,
    swapFundsTradeThreshold: -.5,
    timeDelta: 2000,
    transactionPercentageGemini: .3,
    transactionPercentageGdax: .3
}