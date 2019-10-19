const express = require('express');

const getBalanceAccount = require('./ethjs/getBalanceAccount');

const app = express()

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.get('/', (req,res) => {
    res.send('Saru')
})

app.get('/ethBalance', (req,res) => {
    getBalanceAccount.getBalance(req.query.accountIndex, (bal) => {
        res.send(bal);
    })
})

app.listen(3000, () => {
    console.log(`Server Started at 3000`);
})