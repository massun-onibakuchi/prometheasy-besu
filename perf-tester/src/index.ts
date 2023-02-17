import { ethers } from 'ethers'
import MockERC20Artifact from './MockERC20.json'

require('dotenv').config()

const unreachable = (msg: any) => {
  throw new Error(`unreachable: ${msg}`)
}

const DEFAULT_KEYS = [
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
]
const RPC_URL = process.env.RPC_URL ?? unreachable('RPC_URL is not set')
const TXS_PER_SECOND = Number(process.env.TXS_PER_SECOND) || unreachable('TXS_PER_SECOND is not set')
const PRIVATE_KEY = process.env.PRIVATE_KEY ?? unreachable('PRIVATE_KEY is not set')

const main = async () => {
  const provider = new ethers.providers.StaticJsonRpcProvider(RPC_URL)
  const sender = new ethers.Wallet(PRIVATE_KEY).connect(provider)
  const receiver = ethers.Wallet.createRandom().connect(provider)

  console.log(`Sender: ${sender.address}`)
  console.log(`Receiver: ${receiver.address}`)

  // setup
  console.log('Deploying token contract...')
  console.log(`Sender balance: ${await provider.getBalance(sender.address)}`)
  const token = await new ethers.ContractFactory(MockERC20Artifact.abi, MockERC20Artifact.bytecode, sender).deploy()
  // wait for contract to be deployed
  await token.deployed()
  console.log(`Token address: ${token.address}`)

  // fund sender 1000000 * 10^18 tokens
  await token.connect(sender).mint(sender.address, ethers.utils.parseEther('1000000'))

  // start stress test
  console.log(`Sending ${TXS_PER_SECOND} tx per second....`)
  const iterData = {
    counts: 0,
    lastTime: 0,
  }
  const intervalMs = 1000 / TXS_PER_SECOND
  while (true) {
    // pre-send tx
    const counts = iterData['counts']
    const lastTime = iterData['lastTime']
    const now = Date.now() / 1000
    const blockNumber = await provider.getBlockNumber()
    console.log(
      `#block: ${blockNumber}, time diff(sec): ${(now - lastTime).toFixed(1)}`.padEnd(45) +
        ` :: # of sent tx: ${counts}`
    )

    const amount = 10
    const tx = await token.connect(sender).transfer(receiver.address, amount)
    // console.log(`Sent ${amount} from ${sender.address} to ${receiver.address}`);

    // post-send tx
    iterData['counts'] += 1
    iterData['lastTime'] = now
    await sleep(intervalMs)
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const getTokenInstance = async (provider, address) => {
  const abi = [
    'function balanceOf(address owner) view returns (uint)',
    'event Transfer(address indexed from, address indexed to, uint value)',
    'function transfer(address to, uint value) returns (bool)',
  ]
  return new ethers.Contract(address, abi, provider)
}

main().catch(console.error)
