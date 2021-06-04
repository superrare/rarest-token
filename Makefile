help: ## Ask for help!
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

clean: ## clean stack
	stack clean
	npx hardhat clean
	rm -rf node_modules \
		artifacts/* \
		contracts/abis/*

init: ## install node files
	npm install

compile-contracts: ## compiles contracts 
	make init
	npx hardhat compile
	rsync -avm --exclude='*.dbg.json' --include='*.json' -f 'hide,! */' artifacts/contracts contracts/abis

hs-build: ## Build haskell bindings
	make compile-contracts
	stack build
