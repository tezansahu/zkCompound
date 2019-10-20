const DaiJSON = require('../build/contracts/DAI.json');
const zkDAIJSON = require('../build/contracts/zkDAI.json');
const ACEJSON = require('../build/contracts/ACE.json');
const aztecAccounts = require('../test/accounts.json');

const Web3 = require('web3');
const aztec = require('aztec.js');
const dotenv = require('dotenv');

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
let lender = aztecAccounts[1];
let borrower = aztecAccounts[2];

async function convertToZk(amount, callback){
    let accounts = await web3.eth.getAccounts();
    let chainID  = await web3.eth.net.getId();
    let DAIInstance = new web3.eth.Contract(DaiJSON.abi, DaiJSON["networks"][chainID.toString()]["address"]);
    let ACEInstance = new web3.eth.Contract(ACEJSON.abi, ACEJSON["networks"][chainID.toString()]["address"]);
    let zkDAIInstance = new web3.eth.Contract(zkDAIJSON.abi, zkDAIJSON["networks"][chainID.toString()]["address"])
    
    let depositInputNotes = [];
        let depositOutputNotes = [await aztec.note.create(lender.publicKey, 100)]
        let depositPublicValue = -100;
        let depositInputOwnerAccounts = [];

        const convertProof = new aztec.JoinSplitProof(depositInputNotes, depositOutputNotes, lender.address, depositPublicValue, lender.address);
        const convertData = convertProof.encodeABI(zkDAIInstance.address);
        const convertSignatures = convertProof.constructSignatures(zkDAIInstance.address, depositInputOwnerAccounts);

        await DAIInstance.methods.approve(ACEInstance.address, -depositPublicValue).send({from: lender.address})

        await ACEInstance.methods.publicApprove(zkDAIInstance.address, convertProof.hash, -depositPublicValue).send({ from: lender.address });
        let tx = await zkDAIInstance.methods.confidentialTransfer(convertData, convertSignatures).send({ from: lender.address });
}

convertToZk()