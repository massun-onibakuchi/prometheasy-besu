import fs from 'fs'
import { TokenMetricsServer } from '@exporter/exporter-sdk'
import { Counter } from 'prom-client'
import { logger } from './logger'

import { CHAIN_ID, TOKENS_FILE_PATH, MULTICALL4, PORT, RPC_URL } from './config'

const metrics = {
  tokenTransfer: new Counter({
    name: 'token_transfer_events_count',
    help: 'Number of transfers',
    labelNames: ['token_name', 'transfer_type'],
  }),
  unhandledErrors: new Counter({
    name: 'unhandled_errors',
    help: 'Unhandled errors',
  }),
}

if (require.main === module) {
  const tokenAddresses = JSON.parse(fs.readFileSync(TOKENS_FILE_PATH, 'utf8'))
  const service = new TokenMetricsServer(metrics, tokenAddresses, {
    port: PORT,
    rpcUrl: RPC_URL,
    chainId: CHAIN_ID,
    multicall4: MULTICALL4,
  })
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
