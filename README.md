# prometheasy-besu

**Customized Ethereum Blockchain Monorepo for Besu + Prometheus + Grafana + Solidity**

- [README - Chain stacks (Besu + Prometeus + Grafana)](./chain/README.md)
  - [README - Configs for Besu, Prometheus and Grafana](./chain/config/README.md)
- [README - Solidity contracts](./contracts/README.md): Solidity contracts template
  - See also [Access controllable Token Implementations](https://github.com/shinonome-inc/st-sol/): Opinionated Template for access controllable Token on EVM based chain
- Prometheus Exporter: Export custom metrics from Besu node to Prometheus
  - [README - Exporter SDK](./exporter/exporter-sdk/README.md)
  - [README - Exporter Server](./exporter/server/README.md)
- [README - Performance Test Util](./perf-tester/README.md): Performance test util scripts, sends transactions with configured interval

### Requirements

- Docker and Docker Compose
- Node.js >= 14
- yarn and npm >= 7
- [foundry](https://book.getfoundry.sh/)

## Quick Start

Install dependencies

```bash
yarn
forge install
```

Each package has its own README. See the following links for more details.

[Run Besu with Prometheus + Grafana](./chain/README.md)

[Build Solidity contracts](./contracts/README.md)

[Run Prometheus Exporter](./exporter/server/README.md)

## Development

```
yarn build  # build all packages
yarn test   # run all tests
yarn lint:check   # run all linters
yarn lint:fix   # run all linters
```

## TODO

- [ ] トークン移転などのイベントを取得し、Grafana で可視化する。Prometeus exporter の作成
  - [x] ユニットテスト
  - [ ] Grafana で可視化確認
- [ ] Docker の Besu のデータを永続化する (Besu のバグでデフォルト以外のデータパスをマウントできないっぽい)
- [ ] CI/CD の設定
- [x] ドキュメントの整備 WIP
- [x] project root dir での`yarn` script のコマンドが長くなりすぎるので yarn v2 にアプデして yarn workspaces foreach の plugin 入れるか,`npm run workspaces`を使う
- [ ] `@exporter/exporter-sdk`と`@exporter/server`のユーティリティ系モジュールの切り出し
