# Exporter SDK

Provides a set of tools to interact with exporters for Prometheus.

## Testing

In a separate terminal, run the following command to start a local hardhat node:

```
yarn test
```

<!--
`yarn  test` is equivalent to: the following commands:
```
yarn hardhat node
```

And in another terminal, type:

```
yarn hardhat test
``` -->

TOKENS_FILE_PATH=tokens.json RPC_URL=http://localhost:8545 CHAIN_ID=1337 MULTICALL4=0xb7f8bc63bbcad18155201308c8f3540b07f84f5e yarn dev

## TODO

- [ ] Count transfer events
- [ ] Separate utils into a separate package
