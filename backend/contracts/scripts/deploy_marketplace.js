import hre from "hardhat";
import fs from "fs";

async function main() {
    console.log("Deploying PokemonMarketplace...");

    const Marketplace = await hre.ethers.getContractFactory("PokemonMarketplace");
    const marketplace = await Marketplace.deploy();

    await marketplace.waitForDeployment();

    const address = await marketplace.getAddress();
    console.log("Marketplace deployed to:", address);

    fs.writeFileSync("deployed_address.txt", address);
    console.log("Saved address to deployed_address.txt");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
