import { ethers } from "ethers";

import config from "../config.json";
import abi from "../utils/abi.json";

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

export const formatPercentage = (percentage) => {
    return percentage.toNumber() / 10;
};

export const formatTokenAmount = (tokenAmount) => {
    return ethers.utils.formatUnits(tokenAmount, 18);
};

export const parseTokenAmount = (tokenAmount) => {
    return ethers.utils.parseUnits(tokenAmount, 18);
};

export const computePricePerToken = (exchangeRate) => {
    return 1 / exchangeRate.toNumber();
};

export const getCrowdsaleContract = (provider) => {
    return getContract(config.crowdsaleAddress, abi.crowdsale, provider);
};

export const getStakingContract = (provider) => {
    return getContract(config.stakingAddress, abi.staking, provider);
};

export const getErc20Contract = (address, provider) => {
    return getContract(address, abi.erc20, provider);
};

const getContract = (address, abi, provider) => {
    return new ethers.Contract(address, abi, provider);
};

export const tryReadTx = async (call, setError) => {
    try {
        return await call();
    } catch (err) {
        console.error(err);
        setError("Can't read the contract");
    }
};

export const tryTransaction = async (call, setInfo, successMessage) => {
    try {
        await call();
        displayInfo(setInfo, successMessage);
    } catch (err) {
        console.error(err);
        displayInfo(setInfo, "Transaction failed");
    }
};
