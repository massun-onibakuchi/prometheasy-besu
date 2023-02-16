import { ethers } from 'ethers'
import express from 'express'
import { BaseMetricsServer } from './base-metrics-server'
import IERC20Abi from './IERC20.json'
import { Err, retry } from './utils'
import { CustomMetrics, ContractName, ContractInstanceParams, Address } from './types'

export class TokenMetricsServer extends BaseMetricsServer {
  readonly multicall4!: ethers.Contract
  lastSyncBlock: number | undefined

  constructor(
    metrics: CustomMetrics,
    contractInstanceParams: Record<ContractName, ContractInstanceParams>,
    config: {
      port?: number
      loopIntervalMs?: number
      rpcUrl: string
      chainId: number
      multicall4: Address
    },
    private readonly options: { accounts: Address[] }
  ) {
    super(metrics, contractInstanceParams, config)
  }

  protected _init(): void {
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.get('/token', async (req, resp) => {
      this.logger.debug(`got request GET /token`, req.body)
      try {
        const token = req.body?.token as Address
        const accounts = req.body?.accounts as Address[]
        // validate
        if (!ethers.utils.isAddress(token) && !accounts.every(ethers.utils.isAddress)) {
          throw Err({
            status: 400,
            message: 'invalid address. pls check input addresses',
            err: req.body,
          })
        }
        // fetch
        const balances = await this.multicall4.getTokenBalances(token, accounts).catch((err) => {
          throw Err({ status: 400, message: `RPC error`, err })
        })
        resp
          .status(200)
          .json({
            message: 'ok',
            token: token,
            balances: balances.map((balance) => balance.toString()),
          })
          .send()
      } catch (error: any) {
        this.logger.error(error)
        // check if error is instance of Err
        // we can get Err object from previous throw if an error is properly handled

        if ('ok' in error) {
          // maybe error is instance of Err
          return resp.status(error.status).json({ message: error.message }).send()
        }
        resp.status(500).json({ message: 'unhandled error' }).send()
      }
    })
  }

  protected _registerContract(
    contractInstanceParams: Record<
      ContractName,
      Partial<ContractInstanceParams> & Pick<ContractInstanceParams, 'address'>
    >
  ): void {
    for (const [contractName, params] of Object.entries(contractInstanceParams)) {
      const abi = params?.interfaceAbi
      this.contracts[contractName] = new ethers.Contract(
        params.address,
        abi == undefined ? IERC20Abi.abi : abi,
        this.provider
      )
    }
  }

  protected async internalMain(): Promise<void> {
    this.logger.debug(`start internalMain... lastSyncBlock: ${this.lastSyncBlock ?? 'no sync yet'}`)

    // preconditions
    const [currentBlock, err] = await retry(() => this.provider.getBlockNumber(), 3, undefined)
    const fromBlock = this.lastSyncBlock ?? currentBlock

    if (err) {
      this.logger.error(`got unexpected RPC error: getBlockNumber`, err)
      this.metrics.unhandledErrors.labels(err.message).inc()
    }

    // effects
    this.lastSyncBlock = currentBlock

    this.logger.debug(`fetching Transfer events`)
    // ethers-v5 doc https://docs.ethers.io/v5/api/providers/types/#providers-Filter
    // cheatsheets https://www.testingchain.xyz/posts/cheatsheets/ethers-js
    for (const [name, token] of Object.entries(this.contracts)) {
      const transferEvents: ethers.Event[] | [] = await token
        .queryFilter('Transfer', fromBlock, currentBlock)
        .catch((err) => {
          this.logger.error(`got an unhandled RPC error`, err)
          this.metrics.unhandledErrors.labels(err.message).inc()
          return []
        })
    }
  }
}
