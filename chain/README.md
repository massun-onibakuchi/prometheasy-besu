# prometheasy-besu

- [README - Configs for Besu, Prometheus and Grafana](./config/)

# Run Besu with Prometheus + Grafana

Run the latest [Besu](https://github.com/hyperledger/besu) node and monitor it with a Prometheus-powered Grafana dashboard.

<img src="../assets/dashboard1.png" alt="dashboard1" width="49%" height="49%">
<img src="../assets/dashboard2.png" alt="dashboard2" width="49%" height="49%">

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
3. Verify the node has started up by running `docker-compose -f docker-compose-multi.yml logs`.
4. You can access the Grafana dashboard at `http://localhost:3000` with the default username/password of `admin/admin`. The Prometheus server is available at `http://localhost:9090`.
5. To shut down type: `docker-compose -f docker-compose-multi.yml down`

The volumes will persist across restarts, so you can start and stop the node as needed.

## Production Deployment

To Launch nodes with QBFT consensus for production deployment, you have to setup mannually some config files.

Before you start, make sure you have a node key and public key. You can generate them with the following commands:

Run these commands on each node in `chain` folder.

for each node you have to set `NODE_LABEL` to node label. e.g. `NODE_LABEL=rpcnode`, `NODE_LABEL=validator1`, `NODE_LABEL=validator2`, `NODE_LABEL=validator3`.

```
cd chain # move to chain folder
yarn install
NODE_LABEL=<label> node generate-node-key.js
```

This will generate `nodekey`, `nodekey.pub` and `address` files in `config/keys/production/<label>/` folder.

<!-- ```
docker run -it --rm -v $(pwd)/config/keys/production:/opt/besu/config/keys/production hyperledger/besu:22.10.3 --data-path=/opt/besu/data public-key export --to=/opt/besu/config/keys/production/nodekey.pub
``` -->

### Setup genesis.json and config.toml

And then you have to setup genesis.json and config.toml files in `config/besu/production/` folder for all besu nodes.
QBFT requres `extraData` field in `genesis.json` with [the specific format](https://besu.hyperledger.org/en/stable/private-networks/how-to/configure/consensus/ibft/?h=extra#configure-ibft-20-consensus).

Then set bootnodes in `config.toml` file in `config/besu/production/` folder for all besu nodes.

```yml
bootnodes = ["enode://<nodekey>@<ip>:<port>"] # At least one node is required
```

Some worth mentioning options in `config.toml` are:

```yml
host-allowlist = ["*"] # Specifying '*' for --host-allowlist is not recommended for production code.
rpc-http-enabled = true # true for rpc node.
rpc-http-host = "0.0.0.0" # To allow remote connections, in produnction environment set to 0.0.0.0. ensure you are using a firewall to avoid exposing your node to the internet.
revert-reason-enabled = true # useful for debugging but memory intensive according to Besu docs
tx-pool-limit-by-account-percentage = "1.0" # This should be 1.0 for private chains
metrics-enabled = true # true if you want to visualize metrics in Grafana dashboard + Prometheus
```

### Setup static-nodes.json and permissions_config.toml

You have to setup at least one node in `static-nodes.json` in `config/besu/production/` folder for all besu nodes. Based on permission config in `config.toml` you also have to setup `permissions_config.toml`.

1. Update `BESU_CONFIG` filed in `.env` file.

```
BESU_CONFIG=production
NODE_LABEL=<label> # setup `rpcnode`, `validator1`, `validator2` or `validator3` for each node. You can also create your own config files e.g. `config/keys/production/<label>` folder
```

2. Run `docker-compose -f docker-compose-single.yml up -d` on each server.
   Optionally you can override or pass options with `BESU_OPTS`. e.g. `BESU_OPTS="--revert-reason-enabled=true" `.

## How it works

The `docker-compose-multi.yml` file also spins up a Prometheus server and a Grafana server.
The Prometheus server will scrape the Besu node and the Grafana server will display the metrics in a dashboard.

---

## Acknowledgements

The Prometheus + Grafana docker-compose stack is taken from : https://besu.hyperledger.org/en/stable/private-networks/tutorials/quickstart/#4-update-prometheus-configuration
