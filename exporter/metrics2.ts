// import { createClient } from 'redis';
// import { ethers } from 'ethers';
// import express, { Response } from 'express';
// import { Counter, Gauge, Histogram, register } from 'prom-client';
// import logger from 'pino';

// class MetricsCollector {
//     prefix = 'indexer';
//     events: any;
//     logger: any;
//     private latency: Histogram<string>;
//     private rpcRequests: Counter<string>;
//     private rpcLatency: Histogram<string>;
//     private rpcErrors: Counter<string>;
//     constructor(logger: any) {
//         this.events = new Counter({
//             name: this.prefix + '_events',
//             help: 'Counter that tracks amount of events successfully applied to messages during live run (not the initial feed ie. after restart)',
//             labelNames: ['stage', 'network', 'replica', 'environment'],
//         });
//     }
//     incEvents(stage: string, network: string, replica: string, count?: number) {
//         this.events.labels(stage, network, replica, "").inc(count);
//     }
// }

// class MetricsExporter extends MetricsCollector {
//     eventsPool: EventsPool;
//     constructor(eventsPool: any, logger: any) {
//         super(logger)
//         this.eventsPool = eventsPool;
//     }
//     public startServer(port: number) {
//         const server = express();

//         // どうやってメトリクスを取得してんの？？
//         // EventPool classとの関係性がわからん
//         server.get('/metrics', async (_, res: Response) => {
//             res.set('Content-Type', register.contentType);
//             res.end(await register.metrics());
//         });

//         this.logger.info(
//             {
//                 endpoint: `http://0.0.0.0:${port}/metrics`,
//             },
//             'Prometheus metrics exposed',
//         );

//         server.listen(port);
//     }
//     subscribeStatisticEvents() {
//         // queryFilterでイベントを取得する? or event listener?
//         this.eventsPool.provider().on('dispatched', (message: any, event: any) => {
//             const homeName = 'hoge'
//             const replicaName = 'fuga'
//             const logger = this.logger.child()

//             this.incEvents('dispatched', homeName, replicaName);
//         });
//     }
// }
// type RedisClient = ReturnType<typeof createClient>;

// class EventsPool {
//     redis: RedisClient;
//     _provider: ethers.JsonRpcProvider;

//     constructor(redis: RedisClient) {
//         this._provider = new ethers.JsonRpcProvider('http://localhost:8545');
//         this.redis = redis
//     }
//     provider() {
//         return this._provider
//     }
//     // async storeEvent(event: any) { }
// }

// (async () => {
//     const redisUrl = 'redis://localhost:6379';
//     const port = 3000;
//     const redis = createClient({
//         url: redisUrl,
//     });
//     await redis.connect();

//     const eventsPool = new EventsPool(redis);

//     const m = new MetricsExporter(eventsPool, logger);
//     m.startServer(port);
//     m.subscribeStatisticEvents();
// })();
