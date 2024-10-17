import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import {
    impersonateAccount,
    loadFixture,
    setBalance,
} from "@nomicfoundation/hardhat-network-helpers";

describe("BBToken", function () {
    const nameOfToken = "BBToken";
    const symbolOfToken = "BBT";
    const initialSuply = 1000000000000000000000000n;

    async function deployContractFixture() {
        const [deployer, executor, spender] = await ethers.getSigners();

        const BBToken = await ethers.getContractFactory("BBToken");
        const bbToken = await upgrades.deployProxy(BBToken, [initialSuply], {
            initializer: "initialize",
        });
        const bbTokenAddress = await bbToken.getAddress();

        await impersonateAccount(ethers.ZeroAddress);
        await setBalance(ethers.ZeroAddress, ethers.parseEther("10000"));
        const zeroAccount = await ethers.provider.getSigner(ethers.ZeroAddress);

        return {
            bbToken,
            bbTokenAddress,
            deployer,
            executor,
            spender,
            zeroAccount,
        };
    }

    describe("Deploy the contract", function () {
        describe("Validations", function () {
            it("Should forbid to reinitialize the contract", async function () {
                const { bbToken } = await loadFixture(deployContractFixture);

                const promise = bbToken.initialize(initialSuply);
                await expect(promise).to.be.revertedWithCustomError(
                    bbToken,
                    "InvalidInitialization"
                );
            });
        });

        describe("Checks", function () {
            it("Should return the right balance of the deployer", async function () {
                const { bbToken, deployer } = await loadFixture(deployContractFixture);
                const deployerBalance = await bbToken.balanceOf(deployer.address);

                expect(await bbToken.totalSupply()).to.equal(deployerBalance);
            });

            it("Should return the right name of token", async function () {
                const { bbToken } = await loadFixture(deployContractFixture);
                const currentName = await bbToken.name();

                expect(currentName).to.equal(nameOfToken);
            });

            it("Should return the right symbol of token", async function () {
                const { bbToken } = await loadFixture(deployContractFixture);
                const currentSymbol = await bbToken.symbol();

                expect(currentSymbol).to.equal(symbolOfToken);
            });
        });
    });

    describe("Upgrade the contract", function () {
        describe("Checks", function () {
            it("Should return a new address of the implementation if upgrading the contract", async function () {
                const { bbTokenAddress } = await loadFixture(deployContractFixture);

                const initialImplementationAddress =
                    await upgrades.erc1967.getImplementationAddress(bbTokenAddress);

                const TestBBToken = await ethers.getContractFactory("TestBBToken");
                await upgrades.upgradeProxy(bbTokenAddress, TestBBToken);

                const currentImplementationAddress =
                    await upgrades.erc1967.getImplementationAddress(bbTokenAddress);
                expect(initialImplementationAddress).not.to.equal(currentImplementationAddress);
            });

            it("Should return the same address of the implementation if not upgrading the contract", async function () {
                const { bbTokenAddress } = await loadFixture(deployContractFixture);

                const initialImplementationAddress =
                    await upgrades.erc1967.getImplementationAddress(bbTokenAddress);

                const BBToken = await ethers.getContractFactory("BBToken");
                await upgrades.upgradeProxy(bbTokenAddress, BBToken);

                const currentImplementationAddress =
                    await upgrades.erc1967.getImplementationAddress(bbTokenAddress);
                expect(currentImplementationAddress).to.equal(initialImplementationAddress);
            });
        });
    });

    describe("Approve", function () {
        const approveAmount = 10000000000000000000n;

        describe("Validations", function () {
            it("Should return the right error if approver adress is zero", async function () {
                const { bbToken, executor, zeroAccount } = await loadFixture(deployContractFixture);

                const promise = (bbToken.connect(zeroAccount) as any).approve(
                    executor.address,
                    approveAmount
                );

                await expect(promise).revertedWithCustomError(bbToken, "ERC20InvalidApprover");
            });

            it("Should return the right error if spender adress is zero", async function () {
                const { bbToken, zeroAccount } = await loadFixture(deployContractFixture);
                const promise = bbToken.approve(zeroAccount.address, approveAmount);

                await expect(promise).revertedWithCustomError(bbToken, "ERC20InvalidSpender");
            });
        });

        describe("Checks", function () {
            it("Should approve the right account", async function () {
                const { bbToken, deployer, executor } = await loadFixture(deployContractFixture);

                await bbToken.approve(executor, approveAmount);
                const allowance = await bbToken.allowance(deployer.address, executor.address);

                expect(allowance).to.equal(approveAmount);
            });
        });
    });

    describe("Trasfer", function () {
        const transferAmount = 10000000000000000000n;

        describe("Validations", function () {
            it("Should return the right error if sender adress is zero", async function () {
                const { bbToken, executor, zeroAccount } = await loadFixture(deployContractFixture);
                const promise = (bbToken.connect(zeroAccount) as any).transfer(
                    executor.address,
                    transferAmount
                );

                await expect(promise).revertedWithCustomError(bbToken, "ERC20InvalidSender");
            });

            it("Should return the right error if receiver adress is zero", async function () {
                const { bbToken, zeroAccount } = await loadFixture(deployContractFixture);
                const promise = bbToken.transfer(zeroAccount.address, transferAmount);

                await expect(promise).revertedWithCustomError(bbToken, "ERC20InvalidReceiver");
            });

            it("Should return the right error if insufficient balance", async function () {
                const { bbToken, executor, spender } = await loadFixture(deployContractFixture);
                const promise = (bbToken.connect(executor) as any).transfer(
                    spender.address,
                    transferAmount
                );

                await expect(promise).revertedWithCustomError(bbToken, "ERC20InsufficientBalance");
            });
        });

        describe("Events", function () {
            it("Should emit Transfer event", async function () {
                const { bbToken, executor, deployer } = await loadFixture(deployContractFixture);
                const promise = bbToken.transfer(executor.address, transferAmount);

                await expect(promise)
                    .to.emit(bbToken, "Transfer")
                    .withArgs(deployer.address, executor.address, transferAmount);
            });
        });

        describe("Checks", function () {
            it("Should return the right balance of the token after transfer", async function () {
                const { bbToken, deployer, executor } = await loadFixture(deployContractFixture);
                const tx = await bbToken.transfer(executor.address, transferAmount);

                await expect(() => tx).to.changeTokenBalances(
                    bbToken,
                    [deployer, executor],
                    [-transferAmount, transferAmount]
                );
            });
        });
    });

    describe("Trasfer from", function () {
        const transferAmount = 10000000000000000000n;

        describe("Validations", function () {
            it("Should return the right error if receiver adress is zero", async function () {
                const { bbToken, deployer, executor, zeroAccount } = await loadFixture(
                    deployContractFixture
                );

                await bbToken.approve(executor.address, transferAmount);
                const promise = (bbToken.connect(executor) as any).transferFrom(
                    deployer.address,
                    zeroAccount.address,
                    transferAmount
                );

                await expect(promise).revertedWithCustomError(bbToken, "ERC20InvalidReceiver");
            });

            it("Should return the right error if insufficient allowance", async function () {
                const { bbToken, deployer, executor, spender } = await loadFixture(
                    deployContractFixture
                );

                await bbToken.approve(executor.address, transferAmount);
                const promise = (bbToken.connect(executor) as any).transferFrom(
                    deployer.address,
                    spender.address,
                    20000000000000000000n
                );

                await expect(promise).revertedWithCustomError(
                    bbToken,
                    "ERC20InsufficientAllowance"
                );
            });
        });

        describe("Events", function () {
            it("Should emit Transfer event", async function () {
                const { bbToken, executor, spender, deployer } = await loadFixture(
                    deployContractFixture
                );

                await bbToken.approve(executor.address, transferAmount);
                const promise = (bbToken.connect(executor) as any).transferFrom(
                    deployer.address,
                    spender.address,
                    transferAmount
                );
                await expect(promise)
                    .to.emit(bbToken, "Transfer")
                    .withArgs(deployer.address, spender.address, transferAmount);
            });
        });

        describe("Checks", function () {
            it("Should return the right balance of the token after transfer", async function () {
                const { bbToken, deployer, executor, spender } = await loadFixture(
                    deployContractFixture
                );

                await bbToken.approve(executor.address, transferAmount);
                const tx = await (bbToken.connect(executor) as any).transferFrom(
                    deployer.address,
                    spender.address,
                    transferAmount
                );

                await expect(() => tx).to.changeTokenBalances(
                    bbToken,
                    [deployer, spender],
                    [-transferAmount, transferAmount]
                );
            });
        });
    });
});
