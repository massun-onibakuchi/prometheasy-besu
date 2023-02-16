import express, { Express } from 'express'
import { Registry, collectDefaultMetrics, Metric } from 'prom-client'
import { ethers } from 'ethers'
import { logger } from './logger'
import { Network } from 'ethers/types/providers'
import Multicall4ABI from './Multicall4.json'

// type ContractEventFilterParam = ethers.ContractEventName
export type Metrics = Record<string, Metric>
export type ContractAddress = string
export type ContractName = string
export interface ContractInstanceParams {
  address: ContractAddress
  interfaceAbi: ethers.InterfaceAbi
}

export abstract class BaseMetricsServer {
  readonly app: Express
  readonly registry: Registry
  readonly provider: ethers.JsonRpcProvider
  readonly port: number = 3000 // default port
  readonly loopIntervalMs: number = 10000 // default loop interval in ms
  readonly metrics: Metrics
  contracts: Record<ContractName, ethers.Contract>
  timer: NodeJS.Timeout
  mainPromise: Promise<void>

  constructor(
    metrics: Metrics,
    contractInstanceParams: Record<ContractName, ContractInstanceParams>,
    config: { port?: number; loopIntervalMs?: number; rpcUrl: string; chainId: number; multicall4?: ContractAddress }
  ) {
    this.metrics = metrics
    this.port = config?.port ?? this.port
    this.loopIntervalMs = config?.loopIntervalMs ?? this.loopIntervalMs

    this.provider = new ethers.JsonRpcProvider(config.rpcUrl, config.chainId, {
      staticNetwork: Network.from(config.chainId),
    })
    this.registry = new Registry()

    const _contractInstanceParams = config?.multicall4
      ? { multicall4: { address: config.multicall4, interfaceAbi: Multicall4ABI.abi }, ...contractInstanceParams }
      : contractInstanceParams
    this._registerContract(_contractInstanceParams)
    this._registerCustomMetrics(this.registry, metrics)

    this._init()
    this.app = express()
    this.app.get('/metrics', async (req, resp) => {
      resp.setHeader('Content-Type', this.registry.contentType)
      resp.send(await this.registry.metrics())
    })
  }

  startServer() {
    collectDefaultMetrics({
      register: this.registry,
      gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    })
    this.app.listen(this.port, () => {
      logger.info(`metrics server listening on port ${this.port} at /metrics`)
    })
  }

  private _registerCustomMetrics(registry: Registry, metrics: Metrics): void {
    for (const metric of Object.values(metrics)) {
      registry.registerMetric(metric)
    }
  }

  protected _registerContract(contractInstanceParams: Record<ContractName, ContractInstanceParams>): void {
    for (const [contractName, params] of Object.entries(contractInstanceParams)) {
      const { address, interfaceAbi } = params
      this.contracts[contractName] = new ethers.Contract(address, interfaceAbi, this.provider)
    }
  }
  protected _init(): void {}

  protected abstract internalMain(): Promise<void>

  /// Runs the main function. If this service is set up to loop, will repeatedly loop around the
  /// main function. Will also catch unhandled errors.
  public async run(): Promise<void> {
    logger.info('starting main loop')

    const doLoop = async () => {
      try {
        this.mainPromise = this.internalMain()
        await this.mainPromise
      } catch (err) {
        // this.metrics.unhandledErrors.labels(err.message).inc()
        logger.error('caught an unhandled exception', {
          message: err.message,
          stack: err.stack,
          code: err.code,
        })
      }
      this.timer = setTimeout(doLoop, this.loopIntervalMs)
    }
    doLoop()
  }
}
