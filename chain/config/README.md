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

## Default Network Configuration

`test/` folder contains default network configuration for testing purposes.

- Network with 4 nodes (1 rpcnode and 3 validators)
- 1 prometheus node and 1 grafana node.
  - Collects metrics from all besu nodes.

See [Quick Start](/README.md#quick-start) for more information.

For production, you have to setup `production/` folder.
And setup `BESU_CONFIG=production` env in `.env` file in the root directory.

## Prometheus

Prometheus is a monitoring system and time series database. It collects metrics from monitored targets by scraping metrics HTTP endpoints on these targets. It stores all scraped time series in a local time series database.

This repo includes a Prometheus configuration file that is used to scrape metrics from all besu nodes.

If you want to add custom metrics to be scraped, you can build a custom Prometheus exporter and expose it on a HTTP endpoint. Then add them to the `scrape_configs` section of the `prometheus.yml` file.

For custom metrics you can build a SDK [exporter/exporter-sdk](/exporter/exporter-sdk/README.md) and [exporter/server](/exporter/server/README.md).

For more information, see [Prometheus documentation](https://prometheus.io/docs/introduction/overview/) and [Prometheus exporters](https://prometheus.io/docs/instrumenting/exporters/).

## Grafana

Grafana is feature rich metrics dashboard and graph editor for Graphite, InfluxDB & Prometheus & More.

Default dashboard is [besu-overview.json](./grafana/provisioning/dashboards/besu-overview.json). It shows the following metrics:
