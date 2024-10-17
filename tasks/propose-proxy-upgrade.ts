import { task, types } from "hardhat/config";
import { TASK_CLEAN, TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import { getSigner } from "../utils/account";
import { isLocalNetwork, Network } from "../utils/network";

interface TaskParams {
    name: string;
    address: string;
}

task("propose-proxy-upgrade")
    .setDescription("Propose an upgrade for a proxy contract")
    .addParam<string>("name", "Contract name", undefined, types.string)
    .addParam<string>("address", "Proxy address", undefined, types.string)
    .setAction(
        async (
            { name: contractName, address: proxyAddress }: TaskParams,
            { ethers, defender, network, run }
        ) => {
            if (!ethers.isAddress(proxyAddress)) {
                throw new Error("Invalid proxy address");
            }

            const networkName = network.name as Network;
            console.log(`Network name: ${networkName}`);
            if (isLocalNetwork(networkName)) {
                throw new Error("Unsupported network");
            }

            await run(TASK_CLEAN);
            await run(TASK_COMPILE);

            const signer = await getSigner(ethers, network.provider, network.config.from);
            const ContractFactory = await ethers.getContractFactory(contractName, signer);

            const proposal = await defender.proposeUpgrade(proxyAddress, ContractFactory, {
                unsafeAllowRenames: true,
            });
            console.log(`Upgrade proposal for ${contractName} created at ${proposal.url}`);
        }
    );
