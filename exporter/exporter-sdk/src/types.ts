import type { ethers } from 'ethers'
import type { Metric, Counter } from 'prom-client'

// metrics types
export type UnhandledErrsMetric = { unhandledErrors: Counter }
export type BaseMetrics = Record<string, Metric> & UnhandledErrsMetric
export type TokenMetrics = { tokenTransfer: Counter<'token_name' | 'transfer_type'> } & BaseMetrics

// ethereum types
export type Address = string
export type ContractName = string
export interface ContractInstanceParams {
  address: Address
  interfaceAbi: ethers.ContractInterface
}
export type TokenInstanceParams = Partial<ContractInstanceParams> & Pick<ContractInstanceParams, 'address'>
