import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import { HardhatNetworkHDAccountsConfig, HardhatNetworkMiningUserConfig } from "hardhat/types";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-solhint";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-contract-sizer";
import "./tasks/deploy-proxy-bbtoken";
import "./tasks/verify-contract";
import "./tasks/upgrade-proxy";
import { extractEnvironmentVariables } from "./utils/environment";
import { getProviderUrl, Network } from "./utils/network";

const isCI = process.env.CI;
dotenv.config({
    path: isCI ? ".env.example" : ".env",
});

const envVars = extractEnvironmentVariables();

const accounts: Omit<HardhatNetworkHDAccountsConfig, "accountsBalance"> = {
    mnemonic: envVars.DEPLOYER_MNEMONIC,
    passphrase: envVars.DEPLOYER_PASSPHRASE,
    path: "m/44'/60'/0'/0",
    initialIndex: 0,
    count: 10,
};

const mining: HardhatNetworkMiningUserConfig = {
    auto: true,
    mempool: {
        order: "fifo",
    },
};

const config: HardhatUserConfig = {
    networks: {
        [Network.Hardhat]: {
            initialBaseFeePerGas: 0, // See https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136
            blockGasLimit: 30_000_000,
            mining,
        },
        [Network.Localhost]: {
            url: "http://127.0.0.1:8545",
            blockGasLimit: 30_000_000,
            mining,
        },
        [Network.Sepolia]: {
            url: getProviderUrl(envVars.API_PROVIDER, Network.Sepolia, envVars.SEPOLIA_API_KEY),
            chainId: 11155111,
            from: envVars.DEPLOYER_ADDRESS,
            accounts,
        },
        [Network.Amoy]: {
            url: getProviderUrl(envVars.API_PROVIDER, Network.Amoy, envVars.AMOY_API_KEY),
            chainId: 80002,
            from: envVars.DEPLOYER_ADDRESS,
            accounts,
        },
    },
    defaultNetwork: Network.Hardhat,
    solidity: {
        version: "0.8.22",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    mocha: {
        reporter: isCI ? "dot" : "nyan",
        timeout: "10s",
    },
    etherscan: {
        apiKey: {
            [Network.Sepolia]: envVars.ETHERSCAN_API_KEY,
            [Network.AmoyAlt]: envVars.OKLINK_API_KEY,
        },
        customChains: [
            {
                network: Network.AmoyAlt,
                chainId: 80002,
                urls: {
                    apiURL: `https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/${Network.AmoyAlt}`,
                    browserURL: `https://www.oklink.com/${Network.Amoy}`,
                },
            },
        ],
    },

    gasReporter: {
        coinmarketcap: envVars.COINMARKETCAP_API_KEY,
        excludeContracts: ["@openzeppelin/", "interfaces/", "test/"],
        gasPriceApi: "https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice",
        currency: "USD",
        token: "MATIC",
        //   gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
        //   currency: "USD",
        //   token: "ETH",
    },
    contractSizer: {
        alphaSort: false,
        runOnCompile: false,
        disambiguatePaths: false,
        strict: true,
        only: ["GldToken"],
        except: ["@openzeppelin/", "interfaces/", "test/"],
    },
};

export default config;
