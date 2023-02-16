import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'


const config: HardhatUserConfig = {
  solidity: '0.8.13',
  defaultNetwork: 'hardhat',
  networks: {
    ganache: {
      url: 'http://localhost:8545',
    }
  }
}

export default config
