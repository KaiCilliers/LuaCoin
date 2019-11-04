const {BlockChain, Transaction} = require('./blockchain')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

const myKey = ec.keyFromPrivate(
    'b472c0afbbe63ce4e3702d1031e29c2d31961c43a76a87378e1d37dacf14ce6a'
)
const myWalletAddr = myKey.getPublic('hex')

let luaCoin = new BlockChain()

const tx1 = new Transaction(
    myWalletAddr,
    'public key goes here',
    10
)
tx1.signTransaction(
    myKey
)
luaCoin.addTransaction(
    tx1
)

console.log('\nStarting the miner...')
luaCoin.minePendingTransactions(myWalletAddr)

console.log(
    '\nBalance of miner is',
    luaCoin.getBalanceOfAddr(
        myWalletAddr
    )
)

console.log('\nStarting the miner again...')
const tx2 = new Transaction(
    myWalletAddr,
    'public key goes here',
    20
)
tx2.signTransaction(
    myKey
)
luaCoin.addTransaction(
    tx2
)
luaCoin.minePendingTransactions(myWalletAddr)

console.log(
    '\nBalance of miner is',
    luaCoin.getBalanceOfAddr(
        myWalletAddr
    )
)

console.log('Is chain valid?', luaCoin.isChainValid())