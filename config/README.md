# Configuration

- [Besu](./besu/)
- [Grafana](./grafana/)
- [Prometheus](./prometheus/)
- [Nodes' private keys and public addresses](./keys/)

```
├── config
│   ├── besu # Besu configuration
│   │   ├── production # production config. You have to setup files for all besu nodes to run in production
│   │   │   ├── config.toml
│   │   │   └── genesis.json
│   │   |   ├── permissions_config.toml
│   │   |   └── static-nodes.json
│   │   └── test # test config.
│   │       ├── config.toml
│   │       ├── genesis.json
│   │       ├── permissions_config.toml
│   │       └── static-nodes.json
│   ├── grafana # Grafana configuration
│   │   └── provisioning
│   │       ├── dashboards
│   │       │   ├── besu-overview.json
│   │       │   └── dashboard.yml
│   │       └── datasources
│   │           └── datasource.yml
│   ├── keys # Node private keys. Do not commit private keys. You have to setup genesis.json and config.toml files for all besu nodes to run in production
│   │   ├── production # production keys
│   │   │   ├── rpcnode
│   │   │   ├── validator1
│   │   │   ├── validator2
│   │   │   └── validator3
│   │   └── test # test keys. These keys are known to the public and are used for testing purposes only.
│   │       ├── rpcnode
│   │       ├── validator1
│   │       ├── validator2
│   │       └── validator3
│   ├── prometheus # Prometheus configuration
│   │   └── prometheus.yml
│   └── README.md
```
