import { ethers } from "ethers";

import config from "../config.json";
import abi from "../abi.json";

export const getDefaultChainId = () => {
    if (config.network === "mainnet") return 56;
    else if (config.network === "testnet") return 97;
};

export const displayInfo = (setter, info) => {
    setter(info);
    setTimeout(() => {
        setter("");
    }, 3000);
};

export const formatTimestamp = (timestamp) => {
    return new Date(timestamp.toNumber() * 1000).toDateString();
};

export const getCrowdsaleContract = (provider) => {
    return getContract(config.crowdsaleAddress, abi.crowdsale, provider);
};

export const getErc20Contract = (address, provider) => {
    return getContract(address, abi.erc20, provider);
};

const getContract = (address, abi, provider) => {
    return new ethers.Contract(address, abi, provider);
};
