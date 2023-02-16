import { expect } from 'chai'
import request from 'supertest'
import { Counter } from 'prom-client'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'

import MockERC20Artifact from './mock/MockERC20.json'
import Multicall4Artifact from './mock/Multicall4.json'

import { TokenMetricsServer } from '../src/token-metrics-server'
import { sleep } from '../src/utils'
import { CustomMetrics, ContractInstanceParams } from '../src/types'

describe('Metrics', function () {
  const rpcUrl = ethers.provider.connection.url

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMetrics(
    metrics: CustomMetrics,
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
      ;({ token, multicall4, owner, user } = await loadFixture(deployFixture))
      ms = await deployMetrics(
        metrics,
        {
          testToken: {
            address: token.address,
            interfaceAbi: MockERC20Artifact.abi,
          },
        },
        {
          port: 3000,
          loopIntervalMs: 1000,
          multicall4: multicall4.address,
          rpcUrl,
        },
        { accounts: [owner.address, user.address] }
      )
    })
    afterEach(async function () {
      ms?.registry.clear()
      ms?.server?.close()
    })
    it('shoud serve metrics', async function () {
      // arrange
      ms.startServer()
      // Create two metrics for testing
      metrics.tokenTransfer.inc()
      metrics.tokenTransfer.inc()

      metrics.balances.inc(100)
      // assert
      // Verify that the registered metrics are served at `/`
      const response = await request(ms.server).get('/metrics').send()
      expect(response.status).eq(200)
      expect(response.text).match(/transfer 2/)
      expect(response.text).match(/balance 100/)
    })
    it('shoud collect metrics when transfer event emitted', async function () {
      // arrange
      ms.startServer()
      // act
      ms.run()
      await token.connect(owner).mint(owner.address, 1000)
      await token.connect(owner).burn(owner.address, 1)
      while (await ms?.mainPromise) {
        await sleep(500)
      }
      // assert
      const response = await request(ms.server).get('/metrics').send()
      expect(response.status).eq(200)
      expect(response.text).match(/transfer 2/)
      // post-action
      await ms.stop()
    })
    it('shoud serve /token', async function () {
      // arrange
      ms.startServer()
      await token.connect(owner).mint(owner.address, 1000)
      const balances = await multicall4.getTokenBalances(token.address, [owner.address, user.address])
      // act
      const response = await request(ms.server)
        .get('/token')
        .set({ 'Content-Type': 'application/json' })
        .send({
          token: token.address,
          accounts: [owner.address, user.address],
        })
      // assert
      expect(response.status).eq(200)
      expect(response.body).have.property('token', token.address) // string
      expect(response.body).have.deep.property(
        'balances',
        balances.map((b) => b.toString())
      ) // string[]
    })
    it('shoud serve /token with error when invalid addresses', async function () {})
    it('shoud serve /token with error when rpc error', async function () {})
  })
})
