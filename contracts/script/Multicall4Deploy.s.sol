// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import "../src/utils/Multicall4.sol";

contract Multicall4Deploy is Script {
    Multicall4 public mc;

    /// @notice
    /// Watch out for frontrunning.
    /// Forge simulates your script, generates transaction data from the simulation results, then broadcasts the transactions.
    /// Make sure your script is robust against chain-state changing between the simulation and broadcast
    function run() public {
        vm.startBroadcast();
        mc = new Multicall4();
        vm.stopBroadcast();
    }
}
