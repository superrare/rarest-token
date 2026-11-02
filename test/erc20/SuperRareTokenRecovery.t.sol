// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

import "../../contracts/erc20/SuperRareTokenV2.sol";
import "../../contracts/erc20/SuperRareToken.sol";
import "../../contracts/proxy/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/TransparentUpgradeableProxy.sol";

interface Vm {
    function envString(string calldata name) external returns (string memory value);
    function createSelectFork(string calldata url, uint256 blockNumber) external returns (uint256 forkId);
    function createSelectFork(string calldata url) external returns (uint256 forkId);
    function prank(address sender) external;
    function expectRevert() external;
    function expectRevert(bytes calldata revertData) external;
}

contract SuperRareTokenRecoveryForkTest {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    address private constant RARE_TOKEN = 0xba5BDe662c17e2aDFF1075610382B9B691296350;
    address private constant NEWT_TOKEN = 0xD0eC028a3D21533Fdd200838F39c85B03679285D;
    address private constant PROXY_ADMIN = 0x714C85F8de8632FaC4042C06B95329b9E78AeDB5;
    address private constant RARE_ADMIN_SAFE = 0x860a80d33E85e97888F1f0C75c6e5BBD60b48DA9;
    uint256 private constant EXPECTED_LOCKED_RARE = 25997401000000000238813184;

    function testImplementationIsLockedAndProxyInitializes() external {
        SuperRareTokenV2 implementation = new SuperRareTokenV2();
        vm.expectRevert(abi.encodeWithSignature("Error(string)", "Initializable: contract is already initialized"));
        implementation.init(address(this));

        bytes memory initData = abi.encodeWithSelector(SuperRareToken.init.selector, address(this));
        TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
            address(implementation),
            address(0xdead),
            initData
        );
        SuperRareTokenV2 token = SuperRareTokenV2(address(proxy));
        require(token.totalSupply() == 1000000000000000000000000000, "incorrect initialized supply");
    }

    function testSafeUpgradeRecoversOnlyNewtHeldRareWithoutChangingSupply() external {
        vm.createSelectFork(vm.envString("MAINNET_RPC_URL"));

        SuperRareTokenV2 token = SuperRareTokenV2(RARE_TOKEN);
        ProxyAdmin proxyAdmin = ProxyAdmin(PROXY_ADMIN);
        require(token.balanceOf(NEWT_TOKEN) == EXPECTED_LOCKED_RARE, "unexpected NEWT RARE balance");
        uint256 originalSupply = token.totalSupply();
        require(proxyAdmin.owner() == RARE_ADMIN_SAFE, "unexpected ProxyAdmin owner");

        SuperRareTokenV2 recoveryImplementation = new SuperRareTokenV2();
        vm.prank(RARE_ADMIN_SAFE);
        proxyAdmin.upgrade(
            TransparentUpgradeableProxy(payable(RARE_TOKEN)),
            address(recoveryImplementation)
        );

        address recipient = address(this);
        vm.expectRevert(abi.encodeWithSignature("Error(string)", "SuperRareToken: caller is not admin"));
        token.recoverNewtRare(recipient);

        vm.expectRevert(abi.encodeWithSignature("Error(string)", "SuperRareToken: recipient is the zero address"));
        vm.prank(RARE_ADMIN_SAFE);
        token.recoverNewtRare(address(0));

        vm.prank(RARE_ADMIN_SAFE);
        token.recoverNewtRare(recipient);

        require(token.balanceOf(NEWT_TOKEN) == 0, "NEWT balance was not cleared");
        require(token.balanceOf(recipient) == EXPECTED_LOCKED_RARE, "recipient did not receive full balance");
        require(token.totalSupply() == originalSupply, "recovery changed total supply");

        vm.expectRevert(abi.encodeWithSignature("Error(string)", "SuperRareToken: NEWT recovery already used"));
        vm.prank(RARE_ADMIN_SAFE);
        token.recoverNewtRare(recipient);
    }
}
