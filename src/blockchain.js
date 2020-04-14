const SHA256 = require('crypto-js/sha256')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress
        this.toAddress=toAddress
        this.amount=amount
        }

        calculateHash(){
            return SHA256(this.fromAddress+this.toAddress+this.amount).toString()
        }

        signTransaction(signingkey){
            if(signingkey.getPublic('hex') !== this.fromAddress){
                throw new Error('No puedes firmar transacciones para otras billeteras!')
            }

            const hashTx= this.calculateHash()
            const sig = signingkey.sign(hashTx, 'base64')
            this.signature=sig.toDER('hex')
        }
       
        isValid(){
            if(this.fromAddress === null) return true

            if(!this.signature || this.signature.length === 0){
                throw new Error('no hay firma en esta transaccion')
            }

            const publickey = ec.keyFromPublic(this.fromAddress, 'hex')
            return publickey.verify(this.calculateHash(), this.signature)
            
        }
}

class Block{
    constructor( timestamp, transacciones, previousHash = ''){
        this.previousHash = previousHash
        this.timestamp = timestamp
        this.transacciones = transacciones
        this.hash = this.calculateHash()
        this.nonce = 0
    }

    calculateHash(){
        return SHA256(this.index+this.previousHash+this.timestamp+ JSON.stringify(this.data)+this.nonce).toString()

    }

    mineBlock(dificultad){
        while (this.hash.substring(0,dificultad) !== Array(dificultad+1).join("0")) {
            this.nonce++
            this.hash = this.calculateHash()
        }

        console.log("Bloque minado: " + this.hash)
    }

    hasValidTransactions(){
        for(const tx of this.transacciones){
            if(!tx.isValid()){
                return false
            }
        }

        return true
    }
}


class Blockchain{
    constructor(){
        this.chain=[this.createGenesisBlock()]
        this.dificultad = 2
        this.pendingTransactions =[]
        this.miningReward=100
    }

    createGenesisBlock(){
        return new Block("12/04/2020","Genesis block","0")
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1]
    }

    minePendingTransactions(miningRewardAddress){
        let block = new Block(Date.now(), this.pendingTransactions)
        block.mineBlock(this.dificultad)

        console.log('el Bloque se mino!')
        this.chain.push(block)

        this.pendingTransactions =[
            new Transaction(null, miningRewardAddress, this.miningReward)
        ]
    }

    addTransaction(transaction){
        if(!transaction.fromAddress|| !transaction.toAddress){
            throw new Error('Transaction must include from and to address')
        }

        if(!transaction.isValid()){
            throw new Error('Cannot add invalid transaction to chain')
        }

        this.pendingTransactions.push(transaction)
    }

    getBalanceofAddress(address){
        let balance=0

       for(const block of this.chain){
           for(const trans of block.transacciones){
               if(trans.fromAddress === address){
                   balance -= trans.amount
               }

               if(trans.toAddress === address){
                   balance += trans.amount
               }
           }
       }
       return balance
    }

    isChainValid(){
        for(let i=1;i<this.chain.length;i++){
            const Blockactual = this.chain[i]
            const Blockanterior = this.chain[i-1]
            if(!Blockactual.hasValidTransactions()){
                return false
            }

            if(Blockactual.hash !== Blockactual.calculateHash()){
                return false
            }
            if (Blockactual.previousHash !== Blockanterior.hash) {
                return false
            }
        }
        return true
    }
}

module.exports.Blockchain = Blockchain
module.exports.Transaction = Transaction
