import request from 'supertest'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'

import MockERC20Artifact from './mock/MockERC20.json'
import Multicall4Artifact from './mock/Multicall4.json'

import { TokenMetricsServer } from '../src/token-metrics-server'
import { Metrics, ContractInstanceParams } from '../src/base-metrics-server'
import { Counter } from 'prom-client'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

describe('Metrics', function () {
  const rpcUrl = ethers.provider.connection.url

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMetrics(
    metrics: Metrics,
    contractInstanceParams: Record<string, ContractInstanceParams>,
    config,
    options
  ) {
    const chainId = await ethers.provider.getNetwork().then((network) => network.chainId)
    return new TokenMetricsServer(
      metrics,
      contractInstanceParams,
      { ...config, chainId, rpcUrl: config.rpcUrl },
      options
    )
  }
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, user] = await ethers.getSigners()
    const MockERC20 = new ethers.ContractFactory(MockERC20Artifact.abi, MockERC20Artifact.bytecode, owner)
    const Multicall4 = new ethers.ContractFactory(Multicall4Artifact.abi, Multicall4Artifact.bytecode, owner)
    const token = await MockERC20.deploy()
    const multicall4 = await Multicall4.deploy()

    return { token, multicall4, owner, user }
  }

  let ms: TokenMetricsServer
  let token: Contract
  let multicall4: Contract
  let owner: SignerWithAddress
  let user: SignerWithAddress
  describe('Metrics', function () {
    const metrics = {
      tokenTransfer: new Counter({
        name: 'transfer',
        help: 'RPC provider method call',
        labelNames: ['url', 'method', 'params', 'instance_hostname'],
      }),
      balances: new Counter({
        name: 'balance',
        help: 'RPC provider method call',
        labelNames: ['url', 'method', 'params', 'instance_hostname'],
      }),
      unhandledErrors: new Counter({
        name: 'unhandled_errors',
        help: 'Unhandled errors',
      }),
    }
    beforeEach(async function () {
      ; ({ token, multicall4, owner, user } = await loadFixture(deployFixture))
      ms = await deployMetrics(
        metrics,
        {
          testToken: {
            address: token.address,
            interfaceAbi: MockERC20Artifact.abi,
          },
        },
        { port: 3000, multicall4: multicall4.address, rpcUrl },
        { accounts: [owner.address, user.address] }
      )
    })
    this.afterEach(async function () {
      ms?.registry.clear()
    })
    it('shoud serve metrics', async function () {
      ms.startServer()
      try {
        // Create two metrics for testing
        metrics.tokenTransfer.inc()
        metrics.tokenTransfer.inc()

        metrics.balances.inc(100)

        // Verify that the registered metrics are served at `/`
        const response = await request(ms.server).get('/metrics').send()
        expect(response.status).eq(200)
        expect(response.text).match(/transfer 2/)
        expect(response.text).match(/balance 100/)
      } finally {
        ms.server?.close()
      }
    })
    it('shoud serve /token', async function () {
      // prepare
      ms.startServer()
      await token.connect(owner).mint(owner.address, 1000)
      const balances = await multicall4.getTokenBalances(token.address, [owner.address, user.address])
      try {
        const response = await request(ms.server)
          .get('/token')
          .set({ 'Content-Type': 'application/json' })
          .send({
            token: token.address,
            accounts: [owner.address, user.address],
          })
        expect(response.status).eq(200)
        console.log('response.body :>> ', response.body)
      } finally {
        ms.server?.close()
      }
    })
  })
})
