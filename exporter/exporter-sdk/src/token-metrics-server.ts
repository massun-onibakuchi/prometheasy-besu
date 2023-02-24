import { BigNumber, ethers } from 'ethers'
import express from 'express'
import { BaseMetricsServer } from './base-metrics-server'
import { Result, retry, rwrap as wrapResult } from '@prometheasy-besu/common-ts'
import IERC20Abi from './abi/IERC20.json'
import type { TokenMetrics, ContractName, Address, TokenInstanceParams } from './types'

namespace Express {
  export interface Request {
    body: { token: Address; accounts: Address[] }
  }
}
export class TokenMetricsServer extends BaseMetricsServer<TokenMetrics> {
  readonly multicall4!: ethers.Contract
  lastSyncBlock: number | undefined

  constructor(
    metrics: TokenMetrics,
    contractInstanceParams: Record<ContractName, TokenInstanceParams>,
    config: {
      port?: number
      loopIntervalMs?: number
      rpcUrl: string
      chainId: number
      multicall4: Address
    }
  ) {
    // TODO: use Generic type to make sure contractInstanceParams has TokenInstanceParams
    super(metrics, contractInstanceParams as any, config)
  }

  protected _init(): void {
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.get('/token', async (req: Express.Request, resp) => {
      this.logger.debug(`got request GET /token`, req.body)
      try {
        const token = req.body?.token as Address
        const accounts = req.body?.accounts as Address[]
        // validate
        if (!ethers.utils.isAddress(token) || !accounts || !accounts.every(ethers.utils.isAddress)) {
          this.logger.warn({ token, accounts, reason: 'invalid  address' }, `/token: resp with status 400`)
          return resp.status(400).json({ message: 'invalid addresses. please check address' }).send()
        }

        // fetch
        // result.value is an array of balances
        this.logger.debug(`fetching balances for token ${token}`)
        const result: Result<BigNumber[], undefined> = await wrapResult(
          async () => await this.multicall4.getTokenBalances(token, accounts),
          undefined,
          this.logger
        )
        if (result.ok == false) {
          this.logger.warn({ token, accounts, reason: 'rpc error' }, `/token: resp with status 400`)
          return resp.status(400).json({ message: `got RPC error` }).send()
        }

        this.logger.info('/token resp with status 200')
        resp
          .status(200)
          .json({
            message: 'ok',
            token: token,
            balances: result.value.map((balance) => balance.toString()),
          })
          .send()
      } catch (error: any) {
        this.logger.error(error, `unhandled error at /token`)
        resp.status(500).json({ message: 'unhandled error' }).send()
      }
    })
  }

  protected _registerContract(contractInstanceParams: Record<ContractName, TokenInstanceParams>): void {
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
    this.logger.info(`start internalMain... lastSyncBlock: ${this.lastSyncBlock ?? 'no sync yet'}`)

    // preconditions
    const [currentBlock, err] = await retry(() => this.provider.getBlockNumber(), 3, undefined)
    const fromBlock = this.lastSyncBlock ?? currentBlock

    if (err) {
      this.logger.error(err, `got unexpected RPC error: getBlockNumber`)
      this.metrics.unhandledErrors.labels(err.message).inc()
    }

    // effects
    this.lastSyncBlock = currentBlock

    // ethers-v5 doc https://docs.ethers.io/v5/api/providers/types/#providers-Filter
    // cheatsheets https://www.testingchain.xyz/posts/cheatsheets/ethers-js
    for (const [token_name, token] of Object.entries(this.contracts)) {
      this.logger.info(`fetching Transfer events for token ${token_name}`)
      const transferEvents: ethers.Event[] | [] = await token
        .queryFilter(token.filters.Transfer(), fromBlock, currentBlock)
        .catch((err) => {
          this.logger.error(err, `got an unhandled RPC error`)
          this.metrics.unhandledErrors.labels(err.message).inc()
          return []
        })
      this.logger.debug(`got ${transferEvents.length} Transfer events for token ${token_name}`)
      // TODO: collect metrics for each token

      // TODO: array#reduce
      const eventCounts = { mint: 0, burn: 0, transfer: 0 }
      for (const event of transferEvents) {
        if (event.args == undefined) {
          this.logger.error(`got Transfer event without args`)
        }
        const { from, to } = event.args as unknown as { from: Address; to: Address }
        const transfer_type =
          from == ethers.constants.AddressZero ? 'mint' : to == ethers.constants.AddressZero ? 'burn' : 'transfer'
        eventCounts[transfer_type] = eventCounts[transfer_type] + 1
      }
      // increment metrics
      Object.entries(eventCounts).forEach(([transfer_type, count]) => {
        this.metrics.tokenTransfer.labels({ token_name, transfer_type }).inc(count)
      })
    }
  }
}
