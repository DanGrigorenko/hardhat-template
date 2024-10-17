export enum Provider {
    Alchemy = "alchemy",
    Infura = "infura",
}

export enum Network {
    Sepolia = "sepolia",
    Amoy = "amoy",
    AmoyAlt = "amoy_testnet",
    Localhost = "localhost",
    Hardhat = "hardhat",
}

export function getProviderUrl(provider: Provider, network: Network, apiKey: string): string {
    const apiVersions: Record<Provider, number> = {
        [Provider.Alchemy]: 2,
        [Provider.Infura]: 3,
    };
    const urls: Record<Network, Record<Provider, string | undefined>> = {
        [Network.Sepolia]: {
            [Provider.Alchemy]: "https://eth-sepolia.g.alchemy.com",
            [Provider.Infura]: "https://sepolia.infura.io",
        },
        [Network.Amoy]: {
            [Provider.Alchemy]: "https://polygon-amoy.g.alchemy.com",
            [Provider.Infura]: "https://polygon-amoy.infura.io",
        },
        [Network.AmoyAlt]: {
            [Provider.Alchemy]: "https://polygon-amoy.g.alchemy.com",
            [Provider.Infura]: "https://polygon-amoy.infura.io",
        },
        [Network.Localhost]: {
            [Provider.Alchemy]: undefined,
            [Provider.Infura]: undefined,
        },
        [Network.Hardhat]: {
            [Provider.Alchemy]: undefined,
            [Provider.Infura]: undefined,
        },
    };

    return `${urls[network][provider]}/v${apiVersions[provider]}/${apiKey}`;
}

export function isLocalNetwork(network: Network): boolean {
    return [Network.Hardhat, Network.Localhost].includes(network);
}

export function isTestNetwork(network: Network): boolean {
    return [Network.Sepolia, Network.Amoy, Network.AmoyAlt].includes(network);
}
