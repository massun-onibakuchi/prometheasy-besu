# perf-tester

Simple performance tester for the Blockchain node.
To see the results of the test, you can use the Grafana dashboard.

## Usage

Sends ERC20 transfer transactions every configurable time interval.

Script deploys a new mitable simple ERC20 token contract and mint some tokens.
Repeatedly sends tokens to a generated address.

1.  Install dependencies: `yarn install`
2.  Set up the environment variables:

```bash
   - `RPC_URL` - RPC URL of the node to test
   - `PRIVATE_KEY` - private key of the account to send transactions from
   - `TXS_PER_SECOND` - number of transactions to send per second
```

3.  Run the script: `yarn dev`
