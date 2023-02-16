import { TokenMetricsServer } from './token-metrics-server'
import { Counter, Gauge } from 'prom-client'
// import { metrics } from './metrics'

const metrics = {
    tokenTransfer: new Counter({
        name: 'rpc_provider_method',
        help: 'RPC provider method call',
        labelNames: ['url', 'method', 'params', 'instance_hostname'],
    }),
    balances: new Counter({
        name: 'rpc_provider_method',
        help: 'RPC provider method call',
        labelNames: ['url', 'method', 'params', 'instance_hostname'],
    }),
    unhandledErrors: new Counter({
        name: 'unhandled_errors',
        help: 'Unhandled errors',
    }),
}

if (require.main === module) {
    const service = new TokenMetricsServer(
        metrics,
        {},
        { port: 3000, rpcUrl: 'http://localhost:8545', chainId: 1337, multicall4: '0x' },
        { accounts: [] }
    )
    service.startServer()
    service.run()
}
