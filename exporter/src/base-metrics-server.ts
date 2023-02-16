import express, { Express } from 'express'
import { Registry, collectDefaultMetrics, Metric } from 'prom-client'
import { ethers } from 'ethers'
import { logger } from './logger'
import Multicall4ABI from './Multicall4.json'

// type ContractEventFilterParam = ethers.ContractEventName
export type Metrics = Record<string, Metric>
export type ContractAddress = string
export type Address = string
export type ContractName = string
export interface ContractInstanceParams {
  address: ContractAddress
  interfaceAbi: ethers.ContractInterface
}

export abstract class BaseMetricsServer {
  readonly app: Express
  readonly registry: Registry
  readonly provider: ethers.providers.StaticJsonRpcProvider
  readonly port: number = 3000 // default port
  readonly loopIntervalMs: number = 10000 // default loop interval in ms
  readonly metrics: Metrics
  readonly multicall4: ethers.Contract | undefined
  contracts: Record<ContractName, ethers.Contract> = {}
  timer: NodeJS.Timeout | undefined
  mainPromise: Promise<void> | undefined
  server: import('http').Server<typeof import('http').IncomingMessage, typeof import('http').ServerResponse> | undefined

  constructor(
    metrics: Metrics,
    contractInstanceParams: Record<ContractName, ContractInstanceParams>,
    config: { port?: number; loopIntervalMs?: number; rpcUrl: string; chainId: number; multicall4?: ContractAddress }
  ) {
    this.metrics = metrics
    this.port = config?.port ?? this.port
    this.loopIntervalMs = config?.loopIntervalMs ?? this.loopIntervalMs

    logger.info(`setting up provider ${config.rpcUrl} chainId: ${config.chainId}`)
    this.provider = new ethers.providers.StaticJsonRpcProvider(config.rpcUrl, config.chainId)
    this.registry = new Registry()

    if (config?.multicall4) {
      logger.info(`setting up multicall ${config.multicall4}`)
      this.multicall4 = new ethers.Contract(config.multicall4, Multicall4ABI.abi, this.provider)
      this.provider.getCode(config.multicall4).then((code) => {
        if (code === '0x') {
          throw new Error(`multicall contract not found at ${config.multicall4}`)
        }
      })
    }

    logger.info('registering contracts')
    logger.info('registering custom metrics')
    this._registerContract(contractInstanceParams)
    this._registerCustomMetrics(this.registry, metrics)

    logger.info('setting up express server')
    this.app = express()
    this._init()
    this.app.get('/metrics', async (req, resp) => {
      resp.setHeader('Content-Type', this.registry.contentType)
      resp.send(await this.registry.metrics())
    })
  }

  startServer() {
    logger.info('starting metrics server')
    this._startServer()

    collectDefaultMetrics({
      register: this.registry,
      gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    })
    this.server = this.app.listen(this.port, () => {
      logger.info(`metrics server listening on port ${this.port} at /metrics`)
    })
  }

  protected _startServer() {}

  private _registerCustomMetrics(registry: Registry, metrics: Metrics): void {
    for (const metric of Object.values(metrics)) {
      registry.registerMetric(metric)
    }
  }

  protected _registerContract(contractInstanceParams: Record<ContractName, ContractInstanceParams>): void {
    for (const [name, params] of Object.entries(contractInstanceParams)) {
      const { address, interfaceAbi } = params
      this.contracts[name] = new ethers.Contract(address, interfaceAbi, this.provider)
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
        // logger.error('caught an unhandled exception', {
        //   message: err.message,
        //   stack: err.stack,
        //   code: err.code,
        // })
      }
      this.timer = setTimeout(doLoop, this.loopIntervalMs)
    }
    doLoop()
  }
}
