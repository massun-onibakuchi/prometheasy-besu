# prometheasy-besu

**Customized Ethereum Blockchain Monorepo for Besu + Prometheus + Grafana + Solidity**

- [README - Chain stacks (Besu + Prometeus + Grafana)](./chain/README.md): `chain` package
  - [README - Configs for Besu, Prometheus and Grafana](./chain/config/README.md)
- [README - Solidity contracts](./contracts/README.md): Solidity contracts template `contracts` package
  - See also [Access controllable Token Implementations](https://github.com/shinonome-inc/st-sol/): Opinionated Template for access controllable Token on EVM based chain
- Prometheus Exporter: Export custom metrics from Besu node to Prometheus
  - [README - Exporter SDK](./exporter/exporter-sdk/README.md) : SDK for exporting custom metrics `@exporter/exporter-sdk`
  - [README - Exporter Server](./exporter/server/README.md) : Server for exporting custom metrics `@exporter/server`
- [README - Performance Test Util](./perf-tester/README.md): Performance test util scripts, sends transactions with configured interval `perf-tester` package
- [README - Common TypeScript utilities](./common-ts/README.md): Common TypeScript utilities `@prometheasy-besu/common-ts`

### Requirements

- Docker and Docker Compose
- Node.js >= 14
- yarn and npm >= 7
- [foundry](https://book.getfoundry.sh/)

## Quick Start

Install dependencies

```bash
yarn
cd contracts && forge install
```

Each package has its own README. See the following links for more details.

[Run Besu with Prometheus + Grafana](./chain/README.md)

[Build Solidity contracts](./contracts/README.md)

[Run Prometheus Exporter](./exporter/server/README.md)

## Development

```
yarn build  # build all packages
yarn build:contracts  # build contracts
yarn build:exporter  # build exporter
yarn build:ts  # build typescript packages
yarn test   # run all tests
yarn dev:exporter  # run exporter server in dev mode
yarn lint:check   # run all linters
yarn lint:fix   # run all linters
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## TODO

- [x] トークン移転などのイベントを取得し、Grafana で可視化する。Prometeus exporter の作成
  - [x] ユニットテスト
  - [x] Grafana で可視化確認
- [ ] Docker の Besu のデータを永続化する (Besu のバグでデフォルト以外のデータパスをマウントできないっぽい)
- [x] CI の設定
  - [x] Slither の CI が落ちるので直す
        ~~- [ ] CD の設定~~
- [x] ドキュメントの整備 WIP
  - [x] Besu node
- [x] project root dir での`yarn` script のコマンドが長くなりすぎるので yarn v2 にアプデして yarn workspaces foreach の plugin 入れるか,`npm run workspaces`を使う
- [x] `@exporter/exporter-sdk`と`@exporter/server`のユーティリティ系モジュールの切り出し
