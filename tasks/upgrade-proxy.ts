import { task, types } from "hardhat/config";
import { TASK_CLEAN, TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import { getSigner } from "../utils/account";
import { isLocalNetwork, Network } from "../utils/network";

interface TaskParams {
    name: string;
    address: string;
}

task("upgrade-proxy")
    .setDescription("Upgrade a proxy contract")
    .addParam<string>("name", "Contract name", undefined, types.string)
    .addParam<string>("address", "Proxy address", undefined, types.string)
    .setAction(
        async (
            { name: contractName, address: proxyAddress }: TaskParams,
            { ethers, upgrades, network, run }
        ) => {
            const networkName = network.name as Network;
            console.log(`Network name: ${networkName}`);

            await run(TASK_CLEAN);
            await run(TASK_COMPILE);

            const signer = await getSigner(ethers, network.provider, network.config.from);
            const adjustedContractName = isLocalNetwork(networkName)
                ? `Test${contractName}`
                : contractName;
            const ContractFactory = await ethers.getContractFactory(adjustedContractName, signer);

            const contract = await upgrades.upgradeProxy(proxyAddress, ContractFactory);
            console.log(`${contractName} Proxy upgraded at ${contract.address}`);
        }
    );
