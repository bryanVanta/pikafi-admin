import dotenv from "dotenv";
dotenv.config();

import "@nomicfoundation/hardhat-ethers";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
    solidity: "0.8.24",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        arbitrumSepolia: {
            url: process.env.ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc",
            accounts: process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.startsWith("0x") ? [process.env.PRIVATE_KEY] : [],
            chainId: 421614,
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
};
