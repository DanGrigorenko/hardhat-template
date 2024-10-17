// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { IBBToken } from "./interfaces/IBBToken.sol";

contract BBToken is ERC20Upgradeable, IBBToken {
    string private constant _NAME = "BBToken";
    string private constant _SYMBOL = "BBT";

    uint256 private _initialSupply;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(uint256 initialSupply_) public initializer {
        __ERC20_init(_NAME, _SYMBOL);
        _initialSupply = initialSupply_;
        _mint(msg.sender, _initialSupply);
    }
}
