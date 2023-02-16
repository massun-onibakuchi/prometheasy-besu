import express, { Express } from 'express'
import { Registry, collectDefaultMetrics, Metric } from 'prom-client'
import { createClient } from 'redis';
import { ethers } from 'ethers';
import { metrics } from './metrics'
import { logger } from './logger'

type RedisClient = ReturnType<typeof createClient>;
type Metrics = Record<string, Metric>

export abstract class BaseMetricsServer {
    readonly app: Express
    readonly registry: Registry
    readonly provider: ethers.JsonRpcProvider;
    readonly redis: RedisClient
    metrics: any;
    mainPromise: Promise<void>;
    timer: NodeJS.Timeout;
    loopIntervalMs = 10000
    options: any;

    constructor(private readonly port = 3000, metrics: Metrics, options: any) {
        this.options = options
        this.provider = new ethers.JsonRpcProvider('http://localhost:8545');
        // const redisUrl = 'redis://localhost:6379';
        // this.redis = createClient({
        //     url: redisUrl,
        // });

        this.registry = new Registry()
        this._registerCustomMetrics(this.registry, metrics)
        this.app = express()
        this.app.get('/metrics', async (req, resp) => {
            resp.setHeader('Content-Type', this.registry.contentType)
            resp.send(await this.registry.metrics())
        })
    }

    startServer() {
        this._init()
        // await this.redis.connect();
        collectDefaultMetrics({
            register: this.registry,
            gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
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

    protected abstract _init(): Promise<void> | void

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
                this.metrics.unhandledErrors.inc()
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

export class MetricsServer extends BaseMetricsServer {
    lastSyncBlock: number | undefined;
    contracts: Record<string, ethers.Contract>;

    protected _init(): void {
        this.contracts = { token: new ethers.Contract(tokenAddress, , this.provider) }
    }

    protected async internalMain(): Promise<void> {
        const toBlock = await this.provider.getBlockNumber()
        const fromBlock = this.lastSyncBlock ?? toBlock
        this.lastSyncBlock = toBlock

        let dripCreatedEvents: (ethers.EventLog | ethers.Log)[]
        try {
            dripCreatedEvents = await this.contracts['token'].queryFilter("Transfer", fromBlock, toBlock)
        } catch (err) {
            logger.info(`got unexpected RPC error`, {
                section: 'creations',
                name: 'NULL',
                err,
            })

            this.metrics.unexpectedRpcErrors.inc({
                section: 'creations',
                name: 'NULL',
            })

            return
        }

        for (const event of dripCreatedEvents) {
            this.metrics.executedDripCount.inc()
        }
    }
}

if (require.main === module) {
    const service = new MetricsServer(3000, metrics, {})
    service.startServer()
    service.run()
}