import fs from 'fs'
import { TokenMetricsServer } from './token-metrics-server'
import { Counter, Gauge } from 'prom-client'
import { logger } from './logger'
import { CHAIN_ID, TOKENS_FILE_PATH, ACCOUNTS_FILE_PATH, MULTICALL4, PORT, RPC_URL } from './config'

const metrics = {
  tokenTransfer: new Counter({
    name: 'transfer',
    help: 'transfer event counter',
    labelNames: ['token', 'params'],
  }),
  unhandledErrors: new Counter({
    name: 'unhandled_errors',
    help: 'Unhandled errors',
  }),
}

if (require.main === module) {
  const accounts = JSON.parse(fs.readFileSync(ACCOUNTS_FILE_PATH, 'utf8'))
  const tokenAddresses = JSON.parse(fs.readFileSync(TOKENS_FILE_PATH, 'utf8'))
  const service = new TokenMetricsServer(
    metrics,
    tokenAddresses,
    {
      port: PORT,
      rpcUrl: RPC_URL,
      chainId: CHAIN_ID,
      multicall4: MULTICALL4,
    },
    { accounts: accounts }
  )
  service.startServer()
  service.run()
}

process.on('uncaughtException', (err) => {
  logger.error(err)
  process.exit(1)
})
process.on('unhandledRejection', (err) => {
  logger.error(err)
  process.exit(1)
})
