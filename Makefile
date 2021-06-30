help: ## Ask for help!
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

clean: ## clean stack
	stack clean
	npx hardhat clean
	rm -rf node_modules \
		artifacts/* 

init: ## install node files
	npm install

compile-contracts: ## compiles contracts 
	npx hardhat compile
	find artifacts/contracts -iname "*.json" ! -path "*.dbg.json" -exec cp {} contracts/abis \;

hs-build: ## Build haskell bindings
	make compile-contracts
	stack build
