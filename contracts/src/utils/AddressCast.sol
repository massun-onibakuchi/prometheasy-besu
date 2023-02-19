// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library AddressCast {
    function toUint256(address addr) internal pure returns (uint256) {
        return uint256(uint160(addr));
    }
}
