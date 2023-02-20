// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import "forge-std/Test.sol";
import {AddressCast} from "../../src/utils/AddressCast.sol";

contract TestAddressCast is Test {
    function testCast(address addr) public {
        // invariant: address(uint160(uint256(addr))) == addr
        assertEq(address(uint160(AddressCast.toUint256(addr))), addr);
    }
}
