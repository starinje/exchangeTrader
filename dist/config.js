'use strict';

module.exports = {
    gemini: {
        url: 'https://api.gemini.com/v1',
        key: 'xsIG0UZ79qeFwhZLu9j3',
        secret: '46aUvMr4nAaRXrpr9rJ65okqF5JR',
        sandbox: true
    },
    gdax: {
        url: 'https://api.gdax.com/products/ETH-USD/book?level=2',
        key: 'key',
        secret: 'secret'
    },
    ethereumTradingQuantity: 1,
    takeProfitTradeThreshold: .7,
    swapFundsTradeThreshold: .7,
    timeDelta: 2000,
    transactionPercentageGemini: .3,
    transactionPercentageGdax: .3
};

// live account
// key: 'A2Vi33Da5ESehulxBYJD',
// secret: '4Xgj1U5HrxgHB7bvVeTjftBzN2nK',

// sandbox account
// key: 'xsIG0UZ79qeFwhZLu9j3',
// secret: '46aUvMr4nAaRXrpr9rJ65okqF5JR',
//# sourceMappingURL=config.js.map