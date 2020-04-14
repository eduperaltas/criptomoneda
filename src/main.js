const {Blockchain, Transaction} =require('./blockchain')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

const mkey = ec.keyFromPrivate('30e9d68dfb80bf1db2cea131bc8f06af66886f96490bab2830acd9a3a868644f')
const myWalletAddress = mkey.getPublic('hex')

let criptocoin = new Blockchain()

const tx1 = new Transaction(myWalletAddress,'public key goes here',10)
tx1.signTransaction(mkey)
criptocoin.addTransaction(tx1)


console.log('\n empezando a minar...')
criptocoin.minePendingTransactions(myWalletAddress)

console.log('\nBalance de javier es ', criptocoin.getBalanceofAddress(myWalletAddress))

criptocoin.chain[1].transacciones[0].amount = 1
console.log('es un chain valido?',criptocoin.isChainValid())