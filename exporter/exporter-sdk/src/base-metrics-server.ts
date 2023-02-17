import express, { Express } from 'express'
import { Registry, collectDefaultMetrics } from 'prom-client'
import { ethers } from 'ethers'
import { logger } from './logger'
import Multicall4ABI from './abi/Multicall4.json'
import type { CustomMetrics, ContractName, ContractInstanceParams, Address } from './types'
import type pino from 'pino'

export abstract class BaseMetricsServer {
  readonly app: Express
  readonly registry: Registry
  readonly provider: ethers.providers.StaticJsonRpcProvider
  readonly port: number = 3000 // default port
  readonly loopIntervalMs: number = 10000 // default loop interval in ms
  readonly metrics: CustomMetrics
  readonly multicall4: ethers.Contract | undefined
  readonly logger: typeof logger
  contracts: Record<ContractName, ethers.Contract> = {}
  timer: NodeJS.Timeout | undefined
  mainPromise: Promise<void> | undefined
  server: import('http').Server<typeof import('http').IncomingMessage, typeof import('http').ServerResponse> | undefined

  constructor(
    metrics: CustomMetrics,
    contractInstanceParams: Record<ContractName, ContractInstanceParams>,
    config: {
      port?: number
      loopIntervalMs?: number
      rpcUrl: string
      chainId: number
      multicall4?: Address
      logger?: pino.Logger
    }
  ) {
    this.metrics = metrics
    this.port = config?.port ?? this.port
    this.loopIntervalMs = config?.loopIntervalMs ?? this.loopIntervalMs
    this.logger = config?.logger ?? logger

    this.logger.info(`setting up provider ${config.rpcUrl} chainId: ${config.chainId}`)
    this.provider = new ethers.providers.StaticJsonRpcProvider(config.rpcUrl, config.chainId)
    this.registry = new Registry()

    if (config?.multicall4) {
      this.logger.info(`setting up multicall ${config.multicall4}`)
      this.multicall4 = new ethers.Contract(config.multicall4, Multicall4ABI.abi, this.provider)
      this.provider.getCode(config.multicall4).then((code) => {
        if (code === '0x') {
          throw new Error(`multicall contract not found at ${config.multicall4}`)
        }
      })
    }

    this.logger.info('registering contracts')
    this.logger.info('registering custom metrics')
    this._registerContract(contractInstanceParams)
    this._registerCustomMetrics(this.registry, metrics)

    this.logger.info('setting up express server')
    this.app = express()

    // additionally, we can initialize the server here
    this._init()

    // expose metrics endpoint at /metrics
    this.app.get('/metrics', async (req, resp) => {
      this.logger.debug('metrics request received')
      resp.setHeader('Content-Type', this.registry.contentType)
      resp.send(await this.registry.metrics())
    })
  }

  startServer() {
    this.logger.info('starting metrics server')

    collectDefaultMetrics({
      register: this.registry,
      gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    })
    this.server = this.app.listen(this.port, () => {
      this.logger.info(`metrics server listening on port ${this.port} at /metrics`)
    })
  }

  /**
   * Tries to gracefully stop the service. Service will continue running until the current loop
   * iteration is finished and will then stop looping.
   */
  public async stop(): Promise<void> {
    this.logger.info('stopping main loop...')
    clearTimeout(this.timer)
    this.logger.info('waiting for main to complete')
    // if main is in the middle of running wait for it to complete
    await this.mainPromise
    this.logger.info('main loop stoped.')

    // Shut down the metrics server if it's running.
    if (this.server) {
      this.logger.info('stopping metrics server')
      await new Promise((resolve) => {
        this.server?.close(() => {
          resolve(null)
        })
      })
      this.logger.info('metrics server stopped')
      this.server = undefined
    }
  }

  protected _registerCustomMetrics(registry: Registry, metrics: CustomMetrics): void {
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
    this.logger.info('starting main loop')

    const doLoop = async () => {
      try {
        this.mainPromise = this.internalMain()
        await this.mainPromise
      } catch (err: any) {
        this.metrics.unhandledErrors.labels(err.message).inc()
        logger.error('caught an unhandled exception', err)
      }
      this.timer = setTimeout(doLoop, this.loopIntervalMs)
    }
    doLoop()
  }
}
