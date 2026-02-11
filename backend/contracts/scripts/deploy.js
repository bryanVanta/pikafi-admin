import hre from "hardhat";
import fs from "fs";

async function main() {
    console.log("Deploying TransactionPublisher...");

    const TransactionPublisher = await hre.ethers.getContractFactory("TransactionPublisher");
    const transactionPublisher = await TransactionPublisher.deploy();

    await transactionPublisher.waitForDeployment();

    const address = await transactionPublisher.getAddress();
    console.log(`TransactionPublisher deployed to: ${address}`);

    fs.writeFileSync("address.txt", address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
