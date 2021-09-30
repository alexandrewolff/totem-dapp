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

export const getCrowdsaleWriter = (signer) => {
    return new ethers.Contract(config.crowdsaleAddress, abi.crowdsale, signer);
};
