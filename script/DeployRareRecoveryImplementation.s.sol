// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

import "../contracts/erc20/SuperRareTokenV2.sol";

interface Vm {
    function startBroadcast() external;
    function stopBroadcast() external;
}

contract DeployRareRecoveryImplementation {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    event ImplementationDeployed(address indexed implementation);

    function run() external returns (address implementation) {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        require(chainId == 1, "deployment is mainnet-only");

        vm.startBroadcast();
        SuperRareTokenV2 deployed = new SuperRareTokenV2();
        vm.stopBroadcast();

        implementation = address(deployed);
        emit ImplementationDeployed(implementation);
    }
}
