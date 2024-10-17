import { task, types } from "hardhat/config";

interface TaskParams {
    address: string;
    contractPath: string;
    constructorArguments: string[];
}

task("verify-contract")
    .setDescription("Verify a contract")
    .addParam<string>("address", "Contract address", undefined, types.string)
    .addOptionalParam<string>("contractPath", "Contract path", undefined, types.string)
    .addOptionalVariadicPositionalParam<string[]>(
        "constructorArguments",
        "Constructor arguments",
        [],
        types.string
    )
    .setAction(
        async (
            { address: contractAddress, contractPath, constructorArguments }: TaskParams,
            { run }
        ) => {
            await run("verify:verify", {
                address: contractAddress,
                contract: contractPath,
                constructorArguments,
            });
        }
    );
