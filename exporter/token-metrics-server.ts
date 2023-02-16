import { ethers } from 'ethers'
import {
    BaseMetricsServer,
    ContractAddress,
    ContractInstanceParams,
    ContractName,
    Metrics,
} from './base-metrics-server'
import { logger } from './logger'
import IERC20Abi from './IERC20.json'

export class TokenMetricsServer extends BaseMetricsServer {
    lastSyncBlock: number | undefined

    constructor(
        metrics: Metrics,
        contractInstanceParams: Record<ContractName, ContractInstanceParams>,
        config: { port?: number; loopIntervalMs?: number; rpcUrl: string; chainId: number; multicall4: ContractAddress }
    ) {
        super(metrics, contractInstanceParams, config)
    }

    protected _registerContract(contractInstanceParams: Record<string, ContractInstanceParams>): void {
        for (const [contractName, params] of Object.entries(contractInstanceParams)) {
            const interfaceAbi = params?.interfaceAbi
            this.contracts[contractName] = new ethers.Contract(
                params.address,
                interfaceAbi == undefined ? IERC20Abi.abi : interfaceAbi,
                this.provider
            )
        }
    }

    protected async internalMain(): Promise<void> {
        // preconditions
        const currentBlock = await this.provider.getBlockNumber()
        const fromBlock = this.lastSyncBlock ?? currentBlock

        // effects
        this.lastSyncBlock = currentBlock

        // https://www.testingchain.xyz/posts/cheatsheets/ethers-js
        for (const [name, token] of Object.entries(this.contracts)) {
            const dripCreatedEvents: (ethers.EventLog | ethers.Log)[] | [] = await this.contracts['token']
                .queryFilter('Transfer', fromBlock, currentBlock)
                .catch((err) => {
                    logger.info(`got unexpected RPC error`, {
                        section: 'creations',
                        name: 'NULL',
                        err,
                    })
                    // this.metrics.unexpectedRpcErrors.labels(err.message).inc()
                    return []
                })
        }
        // const dripCreatedEvents: (ethers.EventLog | ethers.Log)[] | [] =
        //     await this.contracts['token'].queryFilter("Transfer", fromBlock, currentBlock).catch((err) => {
        //         logger.info(`got unexpected RPC error`, {
        //             section: 'creations',
        //             name: 'NULL',
        //             err,
        //         })
        //         // this.metrics.unexpectedRpcErrors.labels(err.message).inc()
        //         return []
        //     })

        // for (const event of dripCreatedEvents) {
        //     // this.metrics.executedDripCount.labels(event.args?.to).inc()
        // }
    }
}
