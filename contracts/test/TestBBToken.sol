// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import { BBToken } from "../BBToken.sol";

contract TestBBToken is BBToken {
    uint256 public value;

    event ValueSet(uint256 value);

    function setValue(uint256 value_) external {
        value = value_;
        emit ValueSet(value_);
    }
}