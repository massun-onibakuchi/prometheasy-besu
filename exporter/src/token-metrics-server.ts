import { ethers } from 'ethers'
import {
    Address,
    BaseMetricsServer,
    ContractAddress,
    ContractInstanceParams,
    ContractName,
    Metrics,
} from './base-metrics-server'
import { logger } from './logger'
import IERC20Abi from './IERC20.json'

export class TokenMetricsServer extends BaseMetricsServer {
    readonly multicall4!: ethers.Contract
    lastSyncBlock: number | undefined

    constructor(
        metrics: Metrics,
        contractInstanceParams: Record<ContractName, ContractInstanceParams>,
        config: { port?: number; loopIntervalMs?: number; rpcUrl: string; chainId: number; multicall4: ContractAddress },
        private readonly options: { accounts: Address[] }
    ) {
        super(metrics, contractInstanceParams, config)
    }

    protected _registerContract(contractInstanceParams: Record<ContractName, Partial<ContractInstanceParams> & Pick<ContractInstanceParams, "address">>): void {
        for (const [contractName, params] of Object.entries(contractInstanceParams)) {
            const abi = params?.interfaceAbi
            this.contracts[contractName] = new ethers.Contract(
                params.address,
                abi == undefined ? IERC20Abi.abi : abi,
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
            const transferEvents: (ethers.EventLog | ethers.Log)[] | [] = await token
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
            const balances = await this.multicall4.getTokenBalances(token.target, this.options.accounts)
        }
    }
}
