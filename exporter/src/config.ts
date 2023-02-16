import { unreachable } from './utils'

const unwrapToNum = (value: string | undefined): number => {
  if (value === undefined) {
    // I use curly braces to interpolate the variable name
    // print the variable name in the error message
    unreachable(`${{ value }} is undefined`)
  }
  const number = Number(value)
  if (Number.isNaN(number)) {
    unreachable(`${{ value }} is not a number`)
  }
  return number
}

export const PORT = Number(process.env.PORT) || 3000
export const LOG_LEVEL = process.env.LOG_LEVEL ?? 'info'

export const ACCOUNTS_FILE_PATH = process.env.ACCOUNTS_FILE_PATH ?? unreachable('ACCOUNTS_FILE_PATH is not defined')
export const TOKENS_FILE_PATH = process.env.TOKENS_FILE_PATH ?? unreachable('TOKENS_FILE_PATH is not defined')
export const RPC_URL = process.env.RPC_URL ?? unreachable('RPC_URL is not defined')
export const CHAIN_ID = unwrapToNum(process.env.CHAIN_ID)
export const MULTICALL4 = process.env.MULTICALL4 ?? unreachable('MULTICALL4 is not defined')
export const LOOP_INTERVAL_MS = Number(process.env.LOOP_INTERVAL_MS) || 10000
