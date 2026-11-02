// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

import "./SuperRareToken.sol";

/**
 * @dev Adds the one-time NEWT-held RARE recovery to the deployed token's storage layout.
 */
contract SuperRareTokenV2 is SuperRareToken {
    constructor() initializer {}

    bool private _newtRareRecovered;
    address private constant NEWT_TOKEN = 0xD0eC028a3D21533Fdd200838F39c85B03679285D;

    function recoverNewtRare(address recipient) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "SuperRareToken: caller is not admin");
        require(!_newtRareRecovered, "SuperRareToken: NEWT recovery already used");
        require(recipient != address(0), "SuperRareToken: recipient is the zero address");
        uint256 amount = balanceOf(NEWT_TOKEN);
        require(amount > 0, "SuperRareToken: NEWT holds no RARE");

        _newtRareRecovered = true;
        _transfer(NEWT_TOKEN, recipient, amount);
    }
}
