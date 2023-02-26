# Exporter Server

This is the server that runs the exporter for Prometeus. It is a simple nodejs server that uses the [@exporter/exporter-sdk](../exporter-sdk/README.md) library.

<image src="../../assets/token-events-metrics.png" alt="exporter-server" width="100%" height="100%">

## Quickstart

1. Install dependencies: `yarn install`
2. Launch a local hardhat node or connect to a remote node.
3. Deploy a Multicall4 contract and some token.

4. Set up the environment variables:

```bash
TOKENS_FILE_PATH= # e.g. 'tokens.json'
RPC_URL=    # e.g. http://localhost:8545
CHAIN_ID=   # e.g. 1337
MULTICALL4= # Multicall4 contract address
```

5. Add `scrap_config` to [`prometheus.yml`](../../chain/config/prometheus/prometheus.yml) and restart prometheus.

```yaml
scrape_configs:
  - job_name: 'token_metrics_exporter'
    scrape_interval: 15s
    metrics_path: /metrics
    scheme: http
    static_configs:
      # if you are running the exporter server on same machine as prometheus, set the target to 'host.docker.internal:3030'
      # NOTE: host.docker.internal == IP of your host machine
      # For more info search `docker access host machine from container`
      - targets: ['host.docker.internal:3030'] # e.g. ['<ip>:3030']
```

6. Run the server:

```bash
yarn build
yarn start
```

Check the exported metrics at `http://localhost:3030/metrics`. And check the status from Target tab at `/target` on Prometheus.

7. Add the metrics to Grafana.

Go to `http://localhost:3000` and add the metrics to Grafana and click `add a new panel` and select queries (e.g. `token_transfer_events_count` if `TokenMetricsExporter` is used)

See [chain/config/README.md](../../chain/config/README.md) for more details.

## Development

```bash
yarn build
yarn dev
yarn start
yarn lint:fix
yarn lint:check
```
