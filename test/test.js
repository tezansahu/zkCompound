const utils = require('@aztec/dev-utils');

const JoinSplitFluid = artifacts.require('../contracts/AZTEC/ACE/validators/joinSplitFluid/JoinSplitFluid.sol');
const Swap = artifacts.require('../contracts/AZTEC/ACE/validators/swap/Swap.sol');
// const Dividend = artifacts.require('./Dividend.sol');
// const PrivateRange = artifacts.require('./PrivateRange.sol');
const JoinSplit = artifacts.require('../contracts/AZTEC/ACE/validators/joinSplit/JoinSplit.sol');
const ACE = artifacts.require("../contracts/AZTEC/ACE/ACE.sol")

const DAI = artifacts.require("../contracts/DAI.sol");
const cDAI = artifacts.require("../contracts/cDAI.sol");

const ZkERC20 = artifacts.require("../contracts/ZkERC20.sol");
const CompoundDAIMarket = artifacts.require("../contracts/CompoundDAIMarket");

const aztec = require('aztec.js');
const dotenv = require('dotenv');
dotenv.config();


const {
        constants,
        proofs: {
            JOIN_SPLIT_PROOF,
            MINT_PROOF,
            SWAP_PROOF,
        },
    } = utils;

let aztecAccounts = require("./accounts.json");

function signNote(validatorAddress, noteHash, spender, privateKey) {
    let signature = aztec.signer.signNote(validatorAddress, noteHash, spender, privateKey);
    return signature;
}


contract('CompoundDAIMarket', (accounts) => {
    let ACEInstance;
    let CompoundDAIMarketInstance;
    // let KernelInstance;
    let DAIInstance;
    let cDAIInstance;
    let zkDAIInstance;
    let czkDAIInstance;
    // let protocolTokenInstance;
    const sender = accounts[0];
    // console.log(sender);
    // const protocolTokenAddress = web3.utils.toChecksumAddress("0xf1d712736ff2b06dda9ba03d959aa70a297ad99b");

    let lender = aztecAccounts[1];
    let borrower = aztecAccounts[2];
    // let relayer = aztecAccounts[2];
    // let wrangler = aztecAccounts[3];

    let dummyPublicKey = "0x047c7b4dfedccb80aa11132e4b5411e96d9fc4057e1cb74a8058ca003fc707473f34d40713927ebdd721bd4ac4f7bef50456a5eff02bc888127c40e2c67eeda823"
    let salt = "0x7bf20bc9c53493cfd19f9378b1bb9f36ceeee7e76b724efeca38f7d1c96f8a04";

    beforeEach(async () => {
        AdjustSupplyInstance = await JoinSplitFluid.new();
        BilateralSwapInstance = await Swap.new();
        JoinSplitInstance = await JoinSplit.new();
        ACEInstance = await ACE.new();
        await ACEInstance.setCommonReferenceString(constants.CRS);
        await ACEInstance.setProof(MINT_PROOF, AdjustSupplyInstance.address);
        await ACEInstance.setProof(SWAP_PROOF, BilateralSwapInstance.address);
        // await ACEContract.setProof(DIVIDEND_PROOF, Dividend.address);
        await ACEInstance.setProof(JOIN_SPLIT_PROOF, JoinSplitInstance.address);
        // await ACEContract.setProof(PRIVATE_RANGE_PROOF, PrivateRange.address);

        DAIInstance = await DAI.new({from: accounts[0]});
        cDAIInstance = await cDAI.new({from: accounts[0]});

        // protocolTokenInstance = await LSTProtocolToken.new({from: aztecAccounts});

        zkDAIInstance = await ZkERC20.new(ACEInstance.address, DAIInstance.address, {from: accounts[0]});
        czkDAIInstance = await ZkERC20.new(ACEInstance.address, cDAIInstance.address, {from: accounts[0]});

        // KernelInstance = await Kernel.new();
        CompoundDAIMarketInstance = await CompoundDAIMarket.new(zkDAIInstance.address, czkDAIInstance.address, {from: accounts[0]});
    })

    it('should be able to deploy', () => {
        assert.notEqual(CompoundDAIMarketInstance.address, "0x0000000000000000000000000000000000000000");
    });


    it("should convert DAI tokens to zkDAI Notes", async () => {

        // minting DAI tokens for lender 

        let { receipt } = await DAIInstance.mint(lender.address, 200);
        assert.equal(receipt.status, true);

        // Proofs for converting ERC20 tokens to AZTEC notes
        let depositInputNotes = [];
        let depositOutputNotes = [await aztec.note.create(lender.publicKey, 100)]
        let depositPublicValue = -100;
        let depositInputOwnerAccounts = [];

        const depositProof = new aztec.JoinSplitProof(depositInputNotes, depositOutputNotes, lender.address, depositPublicValue, lender.address);
        const depositData = depositProof.encodeABI(zkDAIInstance.address);
        const depositSignatures = depositProof.constructSignatures(zkDAIInstance.address, depositInputOwnerAccounts);

        await DAIInstance.approve(ACEInstance.address, -depositPublicValue, {from: lender.address})

        await ACEInstance.publicApprove(zkDAIInstance.address, depositProof.hash, -depositPublicValue, { from: lender.address });
        let tx = await zkDAIInstance.confidentialTransfer(depositData, depositSignatures, { from: lender.address });
        assert.equal(tx.receipt.status, true);

    });
    
    it("should lend zkDAI & receive czkDAI in return", async() => {
        
    })

    return;
    it("should fill a kernel", async() => {

        await CompoundDAIMarketInstance.set_token_support(zkDAIInstance.address, true);
        await CompoundDAIMarketInstance.set_token_support(zkcDAIInstance.address, true);
        await CompoundDAIMarketInstance.set_wrangler_status(wrangler.address, true);

        // Approve CompoundDAIMarket contrcat to spend the protocol token (ie, LST)
        await protocolTokenInstance.approve(CompoundDAIMarketInstance.address, 1, {from: lender.address})

        // Proofs for converting ERC20 tokens to AZTEC notes

        // For lending token
        let depositInputNotes1 = [];
        let depositOutputNotes1 = [await aztec.note.create(lender.publicKey, 100)]
        let depositPublicValue1 = -100;
        let depositInputOwnerAccounts1 = [];

        const depositProof1 = new aztec.JoinSplitProof(depositInputNotes1, depositOutputNotes1, lender.address, depositPublicValue1, lender.address);
        const depositData1 = depositProof1.encodeABI(zkDAIInstance.address);
        const depositSignatures1 = depositProof1.constructSignatures(zkDAIInstance.address, depositInputOwnerAccounts1);

        await DAIInstance.approve(ACEInstance.address, -depositPublicValue1, {from: lender.address})

        await ACEInstance.publicApprove(zkDAIInstance.address, depositProof1.hash, -depositPublicValue1, { from: lender.address });
        const { receipt } = await zkDAIInstance.confidentialTransfer(depositData1, depositSignatures1, { from: lender.address });
        assert.equal(receipt.status, true);

        // For collateral token
        let depositInputNotes2 = [];
        let depositOutputNotes2 = [await aztec.note.create(borrower.publicKey, 50)];
        let depositPublicValue2 = -50;
        let depositInputOwnerAccounts2 = []

        const depositProof2 = new aztec.JoinSplitProof(depositInputNotes2, depositOutputNotes2, borrower.address, depositPublicValue2, borrower.address);
        const depositData2 = depositProof2.encodeABI(zkcDAIInstance.address);
        const depositSignatures2 = depositProof2.constructSignatures(zkcDAIInstance.address, depositInputOwnerAccounts2);

        await cDAIInstance.approve(ACEInstance.address, -depositPublicValue2, {from: borrower.address})

        await ACEInstance.publicApprove(zkcDAIInstance.address, depositProof2.hash, -depositPublicValue2, { from: borrower.address });
        let tx = await zkcDAIInstance.confidentialTransfer(depositData2, depositSignatures2, { from: borrower.address });
        assert.equal(tx.receipt.status, true);

        // Details to create the kernel & position
        let lendCurrencyNote = depositOutputNotes1[0];
        let borrowCurrencyNote = depositOutputNotes2[0];
        let lendCurrencyOwedNote = await aztec.note.create(lender.publicKey, 105);

        let lendCurrencyNoteTransferred = await aztec.note.create(borrower.publicKey, 100);
        let borrowCurrencyNoteTransferred = await aztec.note.create(dummyPublicKey, 50, CompoundDAIMarketInstance.address);

        let monitoringFee = 1;
        let nonce = 1;
        let expires_at = parseInt(Date.now()/1000) + 1000000;
        let wrangler_expires_at = parseInt(Date.now()/1000) + 1000000;
        let daily_interest_rate = 5;
        let position_duration_in_seconds = 86400;

        //create proofs for lend & collateral
        const lendProof = new aztec.JoinSplitProof([lendCurrencyNote], [lendCurrencyNoteTransferred], CompoundDAIMarketInstance.address, 0, lender.address);
        const lendData = lendProof.encodeABI(zkDAIInstance.address);
        const lendSignature = signNote(zkDAIInstance.address, lendCurrencyNote.noteHash, CompoundDAIMarketInstance.address, lender.privateKey);
        const lendProofOutputs = lendProof.eth.output;

        const collateralProof = new aztec.JoinSplitProof([borrowCurrencyNote], [borrowCurrencyNoteTransferred], CompoundDAIMarketInstance.address, 0, borrower.address);
        const collateralData = collateralProof.encodeABI(zkcDAIInstance.address);
        const collateralSignature = signNote(zkcDAIInstance.address, borrowCurrencyNote.noteHash, CompoundDAIMarketInstance.address, borrower.privateKey);
        const collateralProofOutputs = collateralProof.eth.output;

        await CompoundDAIMarketInstance.fill_kernel(
            [lender.address, borrower.address, relayer.address, wrangler.address, zkcDAIInstance.address, zkDAIInstance.address],
            [monitoringFee, nonce, daily_interest_rate, expires_at, wrangler_expires_at, position_duration_in_seconds],
            [borrowCurrencyNoteTransferred.noteHash, lendCurrencyNote.noteHash, lendCurrencyOwedNote.noteHash],
            true,
            salt,
            lendData, lendSignature, lendProofOutputs,
            collateralData, collateralSignature, collateralProofOutputs,
            {from: accounts[2]}
        );
    })

    it("should repay a loan successfully", async() => {

        await CompoundDAIMarketInstance.set_token_support(zkDAIInstance.address, true);
        await CompoundDAIMarketInstance.set_token_support(zkcDAIInstance.address, true);
        await CompoundDAIMarketInstance.set_wrangler_status(wrangler.address, true);

        // Approve CompoundDAIMarket contrcat to spend the protocol token (ie, LST)
        await protocolTokenInstance.approve(CompoundDAIMarketInstance.address, 1, {from: lender.address})

        // Proofs for converting ERC20 tokens to AZTEC notes

        // For lending token
        let depositInputNotes1 = [];
        let depositOutputNotes1 = [await aztec.note.create(lender.publicKey, 100)]
        let depositPublicValue1 = -100;
        let depositInputOwnerAccounts1 = [];

        const depositProof1 = new aztec.JoinSplitProof(depositInputNotes1, depositOutputNotes1, lender.address, depositPublicValue1, lender.address);
        const depositData1 = depositProof1.encodeABI(zkDAIInstance.address);
        const depositSignatures1 = depositProof1.constructSignatures(zkDAIInstance.address, depositInputOwnerAccounts1);

        await DAIInstance.approve(ACEInstance.address, -depositPublicValue1, {from: lender.address})

        await ACEInstance.publicApprove(zkDAIInstance.address, depositProof1.hash, -depositPublicValue1, { from: lender.address });
        const { receipt } = await zkDAIInstance.confidentialTransfer(depositData1, depositSignatures1, { from: lender.address });
        assert.equal(receipt.status, true);

        // For collateral token
        let depositInputNotes2 = [];
        let depositOutputNotes2 = [await aztec.note.create(borrower.publicKey, 50)];
        let depositPublicValue2 = -50;
        let depositInputOwnerAccounts2 = []

        const depositProof2 = new aztec.JoinSplitProof(depositInputNotes2, depositOutputNotes2, borrower.address, depositPublicValue2, borrower.address);
        const depositData2 = depositProof2.encodeABI(zkcDAIInstance.address);
        const depositSignatures2 = depositProof2.constructSignatures(zkcDAIInstance.address, depositInputOwnerAccounts2);

        await cDAIInstance.approve(ACEInstance.address, -depositPublicValue2, {from: borrower.address})

        await ACEInstance.publicApprove(zkcDAIInstance.address, depositProof2.hash, -depositPublicValue2, { from: borrower.address });
        let tx = await zkcDAIInstance.confidentialTransfer(depositData2, depositSignatures2, { from: borrower.address });
        assert.equal(tx.receipt.status, true);

        // Details to create the kernel & position
        let lendCurrencyNote = depositOutputNotes1[0];
        let borrowCurrencyNote = depositOutputNotes2[0];
        let lendCurrencyOwedNote = await aztec.note.create(lender.publicKey, 105);

        let lendCurrencyNoteTransferred = await aztec.note.create(borrower.publicKey, 100);
        let borrowCurrencyNoteTransferred = await aztec.note.create(dummyPublicKey, 50, CompoundDAIMarketInstance.address);

        let monitoringFee = 1;
        let nonce = 1;
        let expires_at = parseInt(Date.now()/1000) + 1000000;
        let wrangler_expires_at = parseInt(Date.now()/1000) + 1000000;
        let daily_interest_rate = 5;
        let position_duration_in_seconds = 86400;

        //create proofs for lend & collateral
        const lendProof = new aztec.JoinSplitProof([lendCurrencyNote], [lendCurrencyNoteTransferred], CompoundDAIMarketInstance.address, 0, lender.address);
        const lendData = lendProof.encodeABI(zkDAIInstance.address);
        const lendSignature = signNote(zkDAIInstance.address, lendCurrencyNote.noteHash, CompoundDAIMarketInstance.address, lender.privateKey);
        const lendProofOutputs = lendProof.eth.output;

        const collateralProof = new aztec.JoinSplitProof([borrowCurrencyNote], [borrowCurrencyNoteTransferred], CompoundDAIMarketInstance.address, 0, borrower.address);
        const collateralData = collateralProof.encodeABI(zkcDAIInstance.address);
        const collateralSignature = signNote(zkcDAIInstance.address, borrowCurrencyNote.noteHash, CompoundDAIMarketInstance.address, borrower.privateKey);
        const collateralProofOutputs = collateralProof.eth.output;

        tx = await CompoundDAIMarketInstance.fill_kernel(
            [lender.address, borrower.address, relayer.address, wrangler.address, zkcDAIInstance.address, zkDAIInstance.address],
            [monitoringFee, nonce, daily_interest_rate, expires_at, wrangler_expires_at, position_duration_in_seconds],
            [borrowCurrencyNoteTransferred.noteHash, lendCurrencyNote.noteHash, lendCurrencyOwedNote.noteHash],
            true,
            salt,
            lendData, lendSignature, lendProofOutputs,
            collateralData, collateralSignature, collateralProofOutputs,
            {from: accounts[2]}
        );
        // print(tx);
        assert.equal(tx.receipt.status, true);

        // After some time, repay the loan
        await DAIInstance.transfer(borrower.address, 105); // Assue somehow that borrower gets the money to repay the loan

        let depositInputNotes3 = [];
        let depositOutputNotes3 = [await aztec.note.create(borrower.publicKey, 105)];
        let depositPublicValue3 = -105;
        let depositInputOwnerAccounts3 = []
        return;
        const depositProof3 = new aztec.JoinSplitProof(depositInputNotes3, depositOutputNotes3, borrower.address, depositPublicValue3, borrower.address);
        const depositData3 = depositProof2.encodeABI(zkDAIInstance.address);
        const depositSignatures3 = depositProof2.constructSignatures(zkDAIInstance.address, depositInputOwnerAccounts3);

        await DAIInstance.approve(ACEInstance.address, -depositPublicValue3, {from: borrower.address})

        await ACEInstance.publicApprove(zkDAIInstance.address, depositProof3.hash, -depositPublicValue3, { from: borrower.address });
        tx = await zkDAIInstance.confidentialTransfer(depositData3, depositSignatures3, { from: borrower.address });
        assert.equal(tx.receipt.status, true);
        let positionAddress = tx.receipt.logs[0].args["_position"];
        
        return;
        // Notes for repayment & collateral return
        lendCurrencyNote = depositOutputNotes3[0];
        borrowCurrencyNote = borrowCurrencyNoteTransferred;
        lendCurrencyOwedNote = await aztec.note.create(lender.publicKey, 105);

        // let lendCurrencyNoteTransferred = await aztec.note.create(borrower.publicKey, 100);
        borrowCurrencyNoteTransferred = await aztec.note.create(borrower.publicKey, 50);

        //create proofs for repayment & collateral return
        const repayProof = new aztec.JoinSplitProof([lendCurrencyNote], [lendCurrencyNoteTransferred], CompoundDAIMarketInstance.address, 0, borrower.address);
        const repayData = repayProof.encodeABI(zkDAIInstance.address);
        const repaySignature = signNote(zkDAIInstance.address, lendCurrencyNote.noteHash, CompoundDAIMarketInstance.address, borrower.privateKey);
        const repayProofOutputs = repayProof.eth.output;

        const collateralReturnProof = new aztec.JoinSplitProof([borrowCurrencyNote], [borrowCurrencyNoteTransferred], CompoundDAIMarketInstance.address, 0, borrower.address);
        const collateralReturnData = collateralReturnProof.encodeABI(zkcDAIInstance.address);
        // const collateralReturnSignature = signNote(zkcDAIInstance.address, borrowCurrencyNote.noteHash, CompoundDAIMarketInstance.address, borrower.privateKey);
        const collateralReturnProofOutputs = collateralReturnProof.eth.output;

        tx = await CompoundDAIMarketInstance.close_position(positionAddress, repayData, repaySignature, repayProofOutputs, collateralReturnData, collateralReturnProofOutputs);
        assert.equal(tx.receipt.status, true);
    })
})
