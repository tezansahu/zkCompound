<h1 align="center">zkCompound </h1>
<h2 align = "center">Team eeZeeTeeZee</h2>
<p align="center"> Confidential Privacy-Preserving Lending Platform</p>

***

### Problem Statement:

Currently, in the Blockchain Ecosystem, everything that we do is open and visible to all, which is good for some applications but really not appreciated for others. Especially the ones that involve high-value transactions. There is currently no lending protocol that offers built-in privacy for preserving the transaction amount of loans and borrows carried out by the lenders and borrowers respectively.


### Our Solution: zkCompound

<img src="./client/dashboard/images/1.JPG" align="center">

<br />
<br />
We provide a novel solution using zero-knowledge proofs that helps us achieve complete privacy on the MATIC plasma chain. In our solution, the stakeholders can avail of the services of the Platform in complete confidentiality and can still prove its correctness. We do this by integrating AZTEC Protocol with the Compound Finance Protocol.


#### Devfolio Submission

[Here](https://devfolio.co/submissions/zkcompound) is the link to our submission on Devfolio

#### Challenges we ran into

We land up in a lot of challenges during the project, some of which are:

1) Understanding the nuances of the Compound Protocol.

2) Working with AZTEC caused us some trouble as their library is still under heavy development. However, we were able to deal with them. There were issues while collateralizing the assets.

3) We had issues with working with Web3 as we needed to interface it with Aztec.js for Zero-Knowledge Transactions.

4) There were also some issues while deploying the Contracts on MATIC initially

#### How to run?

```js
git clone https://github.com/tezansahu/zkCompound
cd zkCompound
yarn install
cd client
live-server dashboard
node server.js
```


***

<p align="center">Created with :heart: by Tezan Sahu, Sarang Parikh, Akash</p>