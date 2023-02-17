import type { ethers } from 'ethers'
import type { Metric, Counter } from 'prom-client'

export type UnhandledErrsMetric = { unhandledErrors: Counter }
export type CustomMetrics = Record<string, Metric> & UnhandledErrsMetric
export type Address = string
export type ContractName = string
export interface ContractInstanceParams {
  address: Address
  interfaceAbi: ethers.ContractInterface
}
export type TokenInstanceParams = Partial<ContractInstanceParams> & Pick<ContractInstanceParams, 'address'>
