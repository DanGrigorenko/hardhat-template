import { TASK_CLEAN, TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import { task, types } from "hardhat/config";
import { getSigner } from "../utils/account";
import { isLocalNetwork, Network } from "../utils/network";
import { number } from "joi";

interface TaskParams {
    initialSupply: string;
}

task("deploy-proxy:bbtoken")
    .setDescription("Deploy a proxy and implementation for the BBToken contract")
    .addParam<string>("initialSupply", "initial supply", "1000000000000000000000000", types.string)
    .setAction(async ({initialSupply}: TaskParams, { ethers, upgrades, network, run }) => {
        const networkName = network.name as Network;
        console.log(`Network name: ${networkName}`);
        if (!isLocalNetwork(networkName)) {
            await run(TASK_CLEAN);
        }
        await run(TASK_COMPILE);

        const deployer = await getSigner(ethers, network.provider, network.config.from);
        const BBToken = await ethers.getContractFactory("BBToken", deployer);

        // const bbToken = await upgrades.deployProxy(BBToken, { initializer: "initialize" });
        const bbToken = await upgrades.deployProxy(BBToken, [initialSupply]);

        await bbToken.waitForDeployment();
        const bbTokenAddress = await bbToken.getAddress();
        console.log(`BBToken Proxy deployed at ${bbTokenAddress}`);

        const implementationAddress = await upgrades.erc1967.getImplementationAddress(
            bbTokenAddress
        );
        console.log(`BBToken Implementation deployed at ${implementationAddress}`);

        const adminAddress = await upgrades.erc1967.getAdminAddress(bbTokenAddress);
        console.log(`BBToken Admin deployed at ${adminAddress}`);
    });
