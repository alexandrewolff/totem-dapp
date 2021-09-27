import { ethers } from "ethers";

export const getContract = (address, abi, provider) => {
    return new ethers.Contract(address, abi, provider);
};
