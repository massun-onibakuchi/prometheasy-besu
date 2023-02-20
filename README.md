# prometheasy-besu

**Customized Ethereum Blockchain Monorepo for Besu + Prometheus + Grafana + Solidity**

- [README - Configs for Besu, Prometheus and Grafana](./config/)
- [README - Solidity contracts](./contracts/)
  - [Access controllable Token Implementations](https://github.com/shinonome-inc/st-sol/): Opinionated Template for access controllable Token on EVM based chain
- [Prometheus Exporter](./exporter/README.md): Export custom metrics from Besu node to Prometheus
  - [README - Exporter SDK](./exporter/exporter-sdk/README.md)
  - [README - Exporter Server](./exporter/server/README.md)
- [README - Performance Test Util](./perf-tester/README.md): Performance test util scripts, sends transactions with configured interval

# Run Besu with Prometheus + Grafana

Run the latest [Besu](https://github.com/hyperledger/besu) node and monitor it with a Prometheus-powered Grafana dashboard.

![dashboard](dashboard-screenshot.png)

## Quick Start

### Requirements

- Docker and Docker Compose

### Test Deployment (Launching multiple nodes in a single server with QBFT consensus)

1. Set `.env` file with your own values

```
BESU_IMAGE_VERSION=latest # Docker image version
BESU_CONFIG=test # You can also create your own config files in the `config/besu` folder
```

2. Run `docker-compose -f docker-compose-multi.yml up -d`. This will start 4 nodes with a Prometheus server and a Grafana server. You can override or pass options with `BESU_OPTS`. e.g. `BESU_OPTS="--data-path=/opt/besu/database --other-option=foo"`. RPC URL default port is 8545.
3. Verify the node has started up by running `docker-compose logs -f <validator1,validator2, validator3 or rpcnode>`.
4. You can access the Grafana dashboard at `http://localhost:3000` with the default username/password of `admin/admin`. The Prometheus server is available at `http://localhost:9090`.
5. To shut down type: `docker-compose down`

The volumes will persist across restarts, so you can start and stop the node as needed.

## Production Deployment

To Launch nodes with QBFT consensus for production deployment, you have to setup mannually some config files.

Before you start, make sure you have a node key and a validator key. You can generate them with the following commands:

```

```

You have to run these commands on each node.

### Setup genesis.json

You have to generate a public key from a private key with the following command:

```
docker run -it --rm -v $(pwd)/config/keys/production:/opt/besu/config/keys/production hyperledger/besu:<BASU_IMAGE_VERSION>
# and attach to the container
docker attach <container id>
besu --data-path=./config/keys/production/<rpcnode or validtor1...> public-key export
# exit the container
```

And then you have to setup genesis.json and config.toml files in `config/besu/production/` folder for all besu nodes.

QBFT requres `extraData` field in `genesis.json` with the following format:

```

```

you have to add

```

```

### Setup static-nodes.json and permissions_config.toml

You have to setup at least one node in `static-nodes.json` in `config/besu/production/` folder for all besu nodes. Based on permission config in `config.toml` you also have to setup `permissions_config.toml`.

1. Update `BESU_CONFIG` filed in `.env` file.

```
BESU_CONFIG=production
```

2. Run `docker-compose -f docker-compose-single.yml  up -d` on each server.

## How it works

The `docker-compose.yml` file also spins up a Prometheus server and a Grafana server.
The Prometheus server will scrape the Reth node and the Grafana server will display the metrics in a dashboard.

---

## TODO

- [ ] トークン移転などのイベントを取得し、Grafana で可視化する。Prometeus exporter の作成
  - [x] ユニットテスト
  - [ ] Grafana で可視化確認
- [ ] Docker の Besu のデータを永続化する (Besu のバグでデフォルト以外のデータパスをマウントできないっぽい)
- [ ] CI/CD の設定
- [ ] ドキュメントの整備 WIP
- [x] project root dir での`yarn` script のコマンドが長くなりすぎるので yarn v2 にアプデして yarn workspaces foreach の plugin 入れるか,`npm run workspaces`を使う
- [ ] `@exporter/exporter-sdk`と`@exporter/server`のユーティリティ系モジュールの切り出し

## Acknowledgements

The Prometheus + Grafana docker-compose stack is taken from : https://besu.hyperledger.org/en/stable/private-networks/tutorials/quickstart/#4-update-prometheus-configuration
