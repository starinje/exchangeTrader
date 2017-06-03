module.exports = {
    gemini: {
        url: 'https://api.gemini.com/v1',
        key: 'key',
        secret: 'secret'
    },
    gdax: {
        url: 'https://api.gdax.com/products/ETH-USD/book?level=2',
        key: 'key',
        secret: 'secret'
    },
    ethereumTradingQuantity: 40,
    takeProfitTradeThreshold: -5,
    swapFundsTradeThreshold: -5,
    timeDelta: 2000,
    transactionPercentageGemini: .3,
    transactionPercentageGdax: .3
}