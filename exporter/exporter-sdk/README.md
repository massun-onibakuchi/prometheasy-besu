# Exporter SDK

Provides a set of exporters for Prometheus.

## Testing

Type:

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

## Development

```
yarn build
yarn lint:fix
yarn lint:check
```

`BaseMetricsServer` is the base class for all metrics servers.

To create a new custom metrics server, extend the `BaseMetricsServer` class and override the `internalMain` method. The `internalMain` method is called every `loopIntervalMs` seconds. This method should be used to collect metrics and update the `metrics` property. The metrics is exposed in the `/metrics` endpoint.

## Usage

```ts
import { BaseMetricsServer, TokenMetricsServer } from '@exporter/exporter-sdk'
```

### Metrics endpoint `/metrics`

`TokenMetricsServer` provides a set of metrics to monitor the token transfers.

```
token_transfer_events_count 2
token_transfer_events_count{token_name="testToken",transfer_type="mint"} 0
token_transfer_events_count{token_name="testToken",transfer_type="burn"} 0
token_transfer_events_count{token_name="testToken",transfer_type="transfer"} 0
```

### API endpoint `/token`

Returns the token balances for a given token and a list of accounts.

```

curl -H "accept: application/json" -H "Content-Type: application/json" -d '{"token": "0x42699a7612a82f1d9c36148af9c77354759b210b","accounts":["0xb663c7630697442c10Bdd44E1Ea1c3bed44F1c3e"]}' -XGET http://localhost:3030/token

> {"message":"ok","token":"0x42699a7612a82f1d9c36148af9c77354759b210b","balances":["100000"]}

```

## TODO

- [x] Count transfer events
- [x] Separate utils into a separate package
