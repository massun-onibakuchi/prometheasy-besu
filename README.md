# prometheasy-besu

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
- [ ] Besu のデータを永続化する

## Acknowledgements

The Prometheus + Grafana docker-compose stack is taken from https://github.com/vegasbrianc/prometheus

https://besu.hyperledger.org/en/stable/private-networks/tutorials/quickstart/#4-update-prometheus-configuration

besu --data-path=<node data path> public-key export --node-private-key-file=/home/me/me_node/myPrivateKey --to=/home/me/me_project/not_precious_pub_key --ec-curve=secp256k1

besu --data-path=<node data path> public-key export-address --node-private-key-file=/home/me/me_node/myPrivateKey --to=/home/me/me_project/me_node_address --ec-curve=secp256k1
