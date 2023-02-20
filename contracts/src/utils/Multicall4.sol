// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./Multicall3.sol";

/// @title Multicall4
/// @dev Updated version of Multicall that supports ERC20 balanceOf
contract Multicall4 is Multicall3 {
    /// @notice Returns the ERC20 token balance of each account
    /// @param token The ERC20 token address
    /// @param accounts The addresses to query
    function getTokenBalances(address token, address[] calldata accounts) public view returns (uint256[] memory) {
        uint256 length = accounts.length;
        uint256[] memory balances = new uint256[](length);
        for (uint256 i = 0; i < length; ) {
            balances[i] = IERC20(token).balanceOf(accounts[i]);
            unchecked {
                ++i;
            }
        }
        return balances;
    }
}
