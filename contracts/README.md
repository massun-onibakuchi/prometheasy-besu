# <h1 align="center"> ST-sol </h1>

Template for access-controllable token on EVM-based blockchain using Foundry and Hardhat.

> This repo is generated from [massun-onibakuchi/hardhat-foundry-template](https://github.com/massun-onibakuchi/hardhat-foundry-template/).

## Getting Started

### Requirements

The following will need to be installed. Please follow the links and instructions.

- [Foundry](https://github.com/foundry-rs/foundry)
  - Install Foundry (assuming a Linux or macOS system): `curl -L https://foundry.paradigm.xyz | bash`
  - This will download foundryup. To start Foundry, run: `foundryup`
- Node >= 14
- yarn or npm >= 7

Having Foundry installed locally is not strictly required, but it may be helpful for debugging. See [Docker and Foundry](https://book.getfoundry.sh/tutorials/foundry-docker).

### Quickstart

1. Install dependencies

Once you've cloned and entered into your repository, you need to install the necessary dependencies. In order to do so, simply run:

```shell
yarn install
forge install
```

2. Build

```bash
forge build
```

3. Test

```bash
forge test -vvv
npx hardhat test
```

And I'll recommend you to setup command completion for `forge` and `cast` command.
For more information on how to use Foundry, check out the [Foundry Github Repository](https://github.com/foundry-rs/foundry/tree/master/forge) or type `forge help` in your terminal.

## Features

### GitHub Templates

The template comes with a list of templates:

- [feature](.github/ISSUE_TEMPLATE/feature.md)
- [bug](.github/ISSUE_TEMPLATE/bug.md)
- [pull request](.github/pull_request_template.md)

### GitHub Actions

- [CI](.github/workflows/ci.yml)

  - Lint
  - Test
  - Coverage
    - Show coverage report in the workflow summary
    - Set `secrets.CODECOV_TOKEN` on GitHub for visualizing coverage report to [codecov.io](https://about.codecov.io/product/features/) (NOTE: Required for private repo)

- [Static Analyzer](.github/workflows/slither.yml) ([Slither](https://github.com/crytic/slither))
  - To enable the upload of the SARIF file to GitHub, Requires to be public repo or GitHub Enterprise Cloud user.

### Install Libraries

- Install libraries with Foundry which work with Hardhat.
- Libraries are installed in `lib` directory as a git submodule.

```bash
forge install openzeppelin/openzeppelin-contracts # just an example
```

And then update remappings in `foundry.toml`.

```
remappings = [
    "@openzeppelin/=lib/openzeppelin-contracts/",
]
```

This will allow you to import libraries like this:

```solidity
// Instead of import "lib/openzeppelin-contracts/token/ERC20/ERC20.sol";
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
```

### Generate Documentation

- Generates and builds an mdbook from Solidity source files.

```bash
forge doc # generates docs in ./docs
forge doc --serve # generates docs and serves them on localhost:3000
```

### Update Gas Snapshots

```sh
forge snapshot
```

### Coverage

```sh
forge coverage
```

### Custom Tasks

- Use Hardhat's task framework
- You can define custom tasks in `hardhat.config.ts` or `script`.

```bash
npx hardhat example
```

### Utility Commands

- Use `cast` command which is a swiss army knife for smart contract development.

```bash
cast --help
```

## Development

### Rationale

The contract is separated into two parts: `Authorizer` and `AuthorizableToken`. `Authorizer` is a single contract that manages minters, burners and whitelisted accounts. `AuthorizableToken` is a contract that implements the ERC-20 interface. `AuthorizableToken` refers to `Authorizer` to check whether the sender is authorized to mint, burn or transfer.

This pattern is useful when you want to manage multiple tokens with a single authority.

Also, This repo provides the following utility libraries.

- `Batchable` is mixin library that provides batch utility functions.
- `Multicall4` is a stand-alone contract that provides a function to call multiple read-only functions in a single call. This allows you to reduce the number of RPC calls.
- `Loopinator` is a library that provides an array iteration methods like Javascript `Array.map` and `Array.forEach`.

### Name convention

- Event
  - Basically capitalize the first letter of the function name. If function name is `doSomething`, event name is `DoSomething`.
- Test
  - `testMethodName_Ok`
  - `testMethodName_RevertIfCondition`
  - `testMethodName_DoSomethingIfCondition`

### Tracing a tx

Runs a published transaction in a local environment and prints the trace.

```bash
cast run <txhash> --rpc-url <rpc-url>
```

### Deplyment

See [deployment](./deployment.md)

## Contributing

When making a pull request, ensure that:

- All tests pass.
- Code coverage remains at `x`% (coverage tests must currently be written in Foundry).
- All new code adheres to the style guide:
  - All lint checks pass.
  - Code is thoroughly commented with natspec where relevant.
- If making a change to the contracts:
  - New tests (ideally via foundry) are included for all new features or code paths.
- A descriptive summary of the PR has been provided.

## Resources

For more infomation on how to use Foundry features, refer to:

- [forge-std](https://github.com/foundry-rs/forge-std/)
- [cheat codes](https://github.com/foundry-rs/foundry/blob/master/forge/README.md#cheat-codes)
- [Foundry book](https://book.getfoundry.sh/)
