import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

const config: HardhatUserConfig = {
  solidity: '0.8.13',
  defaultNetwork: 'hardhat',
  networks: {
    anvil: {
      url: 'https://localhost:8545',
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk'
      }
    }
  }
}

export default config
