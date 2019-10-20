const DaiJSON = require('../build/contracts/DAI.json');
const ZkERC20 = require('../build/contracts/ZkERC20.json');
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
    let DAIInstance = new web3.eth.Contract(DaiJSON.abi, "0xaC01036C321Acef4952f8b610F703533f1F60A6b");
    let ACEInstance = new web3.eth.Contract(ACEJSON.abi, "0x89adbFD83aa3Bc5BF40b0E8db0C76f9b5b0b043d");
    let zkDAIInstance = new web3.eth.Contract(ZkERC20.abi, "0x7924259759c86CAf163128AfD3570Db18925425f")
    
    let depositInputNotes = [];
        let depositOutputNotes = [await aztec.note.create(lender.publicKey, 100)]
        let depositPublicValue = -100;
        let depositInputOwnerAccounts = [];

        const convertProof = new aztec.JoinSplitProof(depositInputNotes, depositOutputNotes, lender.address, depositPublicValue, lender.address);
        const convertData = convertProof.encodeABI("0x89adbFD83aa3Bc5BF40b0E8db0C76f9b5b0b043d");
        const convertSignatures = convertProof.constructSignatures(zkDAIInstance.address, depositInputOwnerAccounts);

        await DAIInstance.methods.approve(ACEInstance.address, -depositPublicValue).send({from: lender.address})

        await ACEInstance.methods.publicApprove(zkDAIInstance.address, convertProof.hash, -depositPublicValue).send({ from: lender.address });
        let tx = await zkDAIInstance.methods.confidentialTransfer(convertData, convertSignatures).send({ from: lender.address });
}

convertToZk()