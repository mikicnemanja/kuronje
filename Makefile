include .env

build:; forge build
test :; forge test 
format :; forge fmt
anvil :; anvil

# Sepolia deployment
deploy-sepolia:
	@forge script script/DeployKuronjeNFT.s.sol:DeployKuronjeNFT --rpc-url $(SEPOLIA_RPC_URL) --private-key $(PRIVATE_KEY) --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvv
	@make update-frontend-address

# Local anvil deployment  
deploy-local:
	@forge script script/DeployKuronjeNFT.s.sol:DeployKuronjeNFT --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
	@make update-frontend-address

# Update frontend with latest contract address
update-frontend-address:
	@echo "📄 Updating frontend with latest contract address..."
	@forge script script/GetLatestDeployment.s.sol
	@echo "✅ Frontend updated with latest contract address!"

mint-sepolia:
	@forge script script/Interactions.s.sol:MintKuronjeNft --rpc-url $(SEPOLIA_RPC_URL) --private-key $(PRIVATE_KEY) --broadcast

mint-local:
	@forge script script/Interactions.s.sol:MintKuronjeNft --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast