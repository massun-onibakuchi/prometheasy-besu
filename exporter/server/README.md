# Exporter Server

This is the server that runs the exporter for Prometeus. It is a simple nodejs server that uses the [@exporter/exporter-sdk](../exporter-sdk/README.md) library.

## Quickstart

1. Install dependencies: `yarn install`
2. Launch a local hardhat node or connect to a remote node.
3. Deploy a Multicall4 contract and some token.
```
cd ../exporter-sdk
yarn deploy
```
4. Set up the environment variables:

```bash
TOKENS_FILE_PATH= # e.g. 'tokens.json'
RPC_URL=http://localhost:8545
CHAIN_ID=1337
MULTICALL4= # Multicall4 contract address
```

```bash
yarn dev
```

## Development

```bash
yarn build
yarn start
yarn lint:fix
yarn lint:check
```
