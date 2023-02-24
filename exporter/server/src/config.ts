import { unreachable } from '@prometheasy-besu/common-ts'

export const PORT = Number(process.env.PORT) || 3030
export const LOG_LEVEL = process.env.LOG_LEVEL ?? 'info'

export const TOKENS_FILE_PATH = process.env.TOKENS_FILE_PATH ?? unreachable('TOKENS_FILE_PATH is not defined')
export const RPC_URL = process.env.RPC_URL ?? unreachable('RPC_URL is not defined')
export const CHAIN_ID = Number(process.env.CHAIN_ID) || unreachable('CHAIN_ID is not defined')
export const MULTICALL4 = process.env.MULTICALL4 ?? unreachable('MULTICALL4 is not defined')
export const LOOP_INTERVAL_MS = Number(process.env.LOOP_INTERVAL_MS) || 10000
