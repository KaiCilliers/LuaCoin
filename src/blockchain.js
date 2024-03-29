const SHA256 = require('crypto-js/sha256')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

class Transaction {
    constructor(fromAddr, toAddr, amount) {
        this.fromAddr = fromAddr
        this.toAddr = toAddr
        this.amount = amount
    }

    calculateHash() {
        return SHA256(
            this.fromAddr +
            this.toAddr +
            this.amount
        ).toString()
    }

    signTransaction(signingKey) {
        if(signingKey.getPublic('hex') !== this.fromAddr) {
            throw new Error(
                'You cannot sign transaction for other wallets!'
            )
        }

        const hashTx = this.calculateHash()
        const sig = signingKey.sign(hashTx, 'base64')
        this.signature = sig.toDER('hex')
    }

    isValid() {
        if(this.fromAddr === null) return true

        if(!this.signature || this.signature.length === 0) {
            throw new Error(
                'No signature in this transaction'
            )
        }

        const publicKey = ec.keyFromPublic(
            this.fromAddr,
            'hex'
        )
        return publicKey.verify(
            this.calculateHash(),
            this.signature
        )
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp
        this.transactions = transactions
        this.previousHash = previousHash
        this.nonce = 0
        this.hash = this.calculateHash()
    }

    calculateHash() {
        return SHA256(
            this.index +
            this.previousHash +
            this.timestamp +
            JSON.stringify(this.transactions) +
            this.nonce
        ).toString()
    }

    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++
            this.hash = this.calculateHash()
        }

        console.log('Block Mined: ' + this.hash)
    }

    hasValidTransaction() {
        for(const tx of this.transactions) {
            if(!tx.isValid()) {
                return false
            }
        }
        return true
    }
}

class BlockChain {
    constructor() {
        this.chain = [this.createGenesisBlock()]
        this.difficulty = 4
        this.pendingTransactions = []
        this.miningReward = 100
    }

    createGenesisBlock() {
        return new Block('01/01/2017', 'Genesis Block', '0')
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1]
    }

    minePendingTransactions(miningRewardAddr) {
        let block = new Block(Date.now(), this.pendingTransactions)
        block.mineBlock(this.difficulty)

        console.log('Block successfully mined!')
        this.chain.push(block)

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddr, this.miningReward)
        ]
    }

    addTransaction(transaction) {
        if(!transaction.fromAddr || !transaction.toAddr) {
            throw new Error(
                'Transaction must include from and to address'
            )
        }

        if(!transaction.isValid()) {
            throw new Error(
                'Cannot add invalid transaction to chain'
            )
        }

        this.pendingTransactions.push(transaction)
    }

    getBalanceOfAddr(addr) {
        let balance = 0

        for(const block of this.chain) {
            for(const trans of block.transactions) {
                if(trans.fromAddr === addr) {
                    balance -= trans.amount
                }
                if(trans.toAddr === addr) {
                    balance += trans.amount
                }
            }
        }

        return balance
    }

    isChainValid() {
        for(let i = 1; i < this.chain.length; i++) {
            const currBlock = this.chain[1]
            const prevBlock = this.chain[i - 1]

            if(!currBlock.hasValidTransaction()) {
                return false
            }

            if(currBlock.hash !== currBlock.calculateHash()) {
                return false
            }

            if(currBlock.previousHash !== prevBlock.calculateHash()) {
                return false
            }

            return true
        }
    }
}

module.exports.BlockChain = BlockChain
module.exports.Transaction = Transaction