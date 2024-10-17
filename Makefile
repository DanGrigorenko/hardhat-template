# Binaries
BIN_HARDHAT := ./node_modules/.bin/hardhat
BIN_ECHIDNA := echidna
BIN_MYTH := myth

# Configs
CONFIG_ECHIDNA := echidna.config.yaml
CONFIG_SOLC := solc.json

# Networks
NETWORK_HARDHAT := hardhat
NETWORK_LOCALHOST := localhost
NETWORK_SEPOLIA := sepolia
NETWORK_AMOY := amoy

# Hardhat contract addresses
HARDHAT_BBTOKEN := 

# Localhost contract addresses
LOCALHOST_BBTOKEN := 

# Sepolia contract addresses
SEPOLIA_BBTOKEN := 

# Amoy contract addresses
AMOY_BBTOKEN := 

all: hardhat

hardhat: deployproxy-bbtoken-hardhat

# Deploy an implementation contract
deployimplementation-bbtoken-localhost:
	$(BIN_HARDHAT) deploy-implementation --network $(NETWORK_LOCALHOST) 
deployimplementation-bbtoken-sepolia:
	$(BIN_HARDHAT) deploy-implementation --network $(NETWORK_SEPOLIA) 
deployimplementation-bbtoken-amoy:
	$(BIN_HARDHAT) deploy-implementation --network $(NETWORK_AMOY) 

# Deploy a proxy contract
deployproxy-bbtoken-hardhat:
	$(BIN_HARDHAT) deploy-proxy:bbtoken --network $(NETWORK_HARDHAT) 
deployproxy-bbtoken-localhost:
	$(BIN_HARDHAT) deploy-proxy:bbtoken --network $(NETWORK_LOCALHOST)
deployproxy-bbtoken-sepolia:
	$(BIN_HARDHAT) deploy-proxy:bbtoken --network $(NETWORK_SEPOLIA) 
deployproxy-bbtoken-amoy:
	$(BIN_HARDHAT) deploy-proxy:bbtoken --network $(NETWORK_AMOY)

# Propose a proxy upgrade
proposeproxyupgrade-bbtoken-sepolia:
	$(BIN_HARDHAT) propose-proxy-upgrade --network $(NETWORK_SEPOLIA) 
proposeproxyupgrade-bbtoken-amoy:
	$(BIN_HARDHAT) propose-proxy-upgrade --network $(NETWORK_AMOY) 

# Upgrade a proxy
upgradeproxy-bbtoken-localhost:
	$(BIN_HARDHAT) upgrade-proxy --network $(NETWORK_LOCALHOST) 

# Verify a contract
verifycontract-bbtoken-sepolia:
	$(BIN_HARDHAT) verify-contract --network $(NETWORK_SEPOLIA) --address $(SEPOLIA_BBTOKEN)
verifycontract-bbtoken-amoy:
	$(BIN_HARDHAT) verify-contract --network $(NETWORK_AMOY) --address $(AMOY_BBTOKEN)