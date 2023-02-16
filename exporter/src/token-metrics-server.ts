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
import express from 'express'
import { Err } from './utils';

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

    protected _init(): void {
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))
        this.app.get('/token', async (req, resp) => {
            logger.debug(`got request GET /token`, req.body)
            try {
                const token = req.body?.token as Address
                const accounts = req.body?.accounts as Address[]

                if (!ethers.utils.isAddress(token) && !accounts.every(ethers.utils.isAddress)) {
                    throw Err({ status: 400, message: 'invalid address', err: `token: ${token}, accounts ${accounts.toString()}` })
                }
                const balances = await this.multicall4.getTokenBalances(token, accounts)
                    .catch((err) => {
                        throw Err({ status: 400, message: `RPC error`, err })
                    })
                resp.status(200).json({
                    message: 'ok',
                    token: token,
                    balances,
                }).send()
            } catch (error: any) {
                logger.error(error)
                console.log('error :>>', error)
                if ('ok' in error) {
                    // maybe error is instance of Err
                    return resp.status(error.status).json({ message: error.message })
                }
                resp.status(500).json({ message: "unhandled error" }).send()
            }
        })
    }

    protected _startServer(): void { }

    protected _registerContract(
        contractInstanceParams: Record<
            ContractName,
            Partial<ContractInstanceParams> & Pick<ContractInstanceParams, 'address'>
        >
    ): void {
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
            const transferEvents: ethers.Event[] | [] = await token
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
            // const balances = await this.multicall4.getTokenBalances(token.target, this.options.accounts)
        }
    }
}
