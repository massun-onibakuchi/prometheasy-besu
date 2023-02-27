const fs = require('fs')
const ethers = require('ethers')
const { randomBytes } = require('crypto')

const dotenv = require('dotenv')
dotenv.config()

const BESU_CONFIG = process.env.BESU_CONFIG
const keyPath = `config/keys/${BESU_CONFIG}`
const NODE_LABEL = process.env.NODE_LABEL

console.log('BESU_CONFIG :>> ', BESU_CONFIG)
console.log('NODE_LABEL :>> ', NODE_LABEL)

if (!BESU_CONFIG || !NODE_LABEL) throw new Error('BESU_CONFIG or NODE_LABEL not set')

const main = () => {
  if (fs.existsSync(`${keyPath}/${NODE_LABEL}/nodekey`)) {
    console.log('key exists. skip generating keys')
    console.log(`nodekey.pub :>>`, fs.readFileSync(`${keyPath}/${NODE_LABEL}/nodekey.pub`).toString())
    return
  }

  console.log(`Generating keys for ${NODE_LABEL} ENV: ${BESU_CONFIG}...\n`)
  const wallet = ethers.Wallet.createRandom({
    extraEntropy: randomBytes(32),
  })
  const { privateKey, publicKey, address } = wallet
  console.log(`nodeKey.pub: ${publicKey}`)
  console.log(`address: ${address} `)

  console.log(`files generated: nodekey, nodekey.pub, address`)
  fs.writeFileSync(`${keyPath}/${NODE_LABEL}/nodekey`, privateKey)
  fs.writeFileSync(`${keyPath}/${NODE_LABEL}/nodekey.pub`, publicKey)
  fs.writeFileSync(`${keyPath}/${NODE_LABEL}/address`, address)
}

main()
