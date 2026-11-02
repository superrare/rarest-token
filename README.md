# rarest-token

## RARE / NEWT recovery

`SuperRareTokenV2.recoverNewtRare(recipient)` transfers the full RARE balance held
by the NEWT token contract (`0xd0ec028a3d21533fdd200838f39c85b03679285d`) to
`recipient`. It is restricted to `DEFAULT_ADMIN_ROLE` and can succeed only once.
It changes balances but not total supply. The existing global pause must be off
for the transfer to succeed.

The Foundry mainnet-fork test uses the latest Ethereum state available at
invocation, impersonates the configured RARE admin locally to exercise the
authorization, full-balance recovery, and unchanged total supply. It sends no
mainnet transactions:

```sh
MAINNET_RPC_URL=https://ethereum-rpc.publicnode.com \
  forge test --match-path test/erc20/SuperRareTokenRecovery.t.sol -vv
```

Forge needs Solidity `0.7.3` to compile the contracts. The fork uses the test
contract as the recipient. Local Safe impersonation tests contract behavior; it
does not produce the Safe's required four signatures or authorize a mainnet
upgrade.

## Deployment and Safe execution

Build and dry-run the implementation deployment first:

```sh
forge build
forge script script/DeployRareRecoveryImplementation.s.sol:DeployRareRecoveryImplementation \
  --rpc-url "$MAINNET_RPC_URL" --sender "$DEPLOYER_ADDRESS" -vvvv
```

`SuperRareTokenV2` inherits `SuperRareToken` and appends the recovery logic and
one-time flag. Its constructor locks the V2 implementation's initializer state.
The proxy has separate storage; do not call `init()` during an upgrade.

After reviewing the dry-run, deploy the implementation with a Foundry keystore
account:

```sh
forge script script/DeployRareRecoveryImplementation.s.sol:DeployRareRecoveryImplementation \
  --rpc-url "$MAINNET_RPC_URL" --account "$FOUNDRY_ACCOUNT" --broadcast --slow -vvvv
```

Copy the deployed implementation address from Forge's output or the broadcast
record. The deployer only publishes the implementation; it does not control the
RARE proxy or move tokens.

In the RARE admin Safe's Transaction Builder, add both calls below to one batch:

1. **ProxyAdmin** (`0x714C85F8de8632FaC4042C06B95329b9E78AeDB5`): call
   `upgrade(proxy, implementation)` with proxy
   `0xba5BDe662c17e2aDFF1075610382B9B691296350` and the deployed implementation
   address.
2. **RARE proxy** (`0xba5BDe662c17e2aDFF1075610382B9B691296350`): call
   `recoverNewtRare(recipient)` with the reviewed recipient address.

If the UI cannot load the ABIs automatically, add these minimal function ABIs
when creating each call:

```json
[{"type":"function","name":"upgrade","stateMutability":"nonpayable","inputs":[{"name":"proxy","type":"address"},{"name":"implementation","type":"address"}],"outputs":[]}]
```

```json
[{"type":"function","name":"recoverNewtRare","stateMutability":"nonpayable","inputs":[{"name":"recipient","type":"address"}],"outputs":[]}]
```

Submit these as one Safe batch using the Transaction Builder's MultiSend path;
do not submit either call separately. The batch executes the ProxyAdmin upgrade
first, then calls the new implementation through the proxy with the Safe as
caller. Do not replace the batch with `ProxyAdmin.upgradeAndCall`: that routes
the recovery call as `ProxyAdmin`, which does not hold the RARE admin role.
If the token is paused, the recovery call reverts and the whole Safe batch rolls
back. The batch requires the Safe's approval threshold; it does not bypass Safe
signatures.

