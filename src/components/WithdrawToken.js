import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";

import config from "../config.json";
import abi from "../abi.json";
const SECONDS_PER_DAY = ethers.BigNumber.from("86400");

const WithdrawToken = ({ withdrawPeriodNumber, withdrawPeriodDuration }) => {
    const [tokensBought, setTokensBought] = useState(undefined);
    const [tokensWithdrew, setTokensWithdrew] = useState(undefined);
    const [signer, setSigner] = useState(undefined);

    const { account, library: provider, chainId, error } = useWeb3React();

    useEffect(() => {
        const signer = provider.getSigner();
        setSigner(signer);
        updateTokensBought();
    }, [account]);

    const updateTokensBought = async () => {
        const contract = getContractReader(
            config.crowdsaleAddress,
            abi.crowdsale
        );
        let tokensBought;
        try {
            tokensBought = await contract.getClaimableAmount(account);
        } catch (err) {
            console.error(err);
            return;
        }
        let tokensWithdrew;
        try {
            tokensWithdrew = await contract.getWithdrewAmount(account);
        } catch (err) {
            console.error(err);
            return;
        }
        setTokensBought(tokensBought);
        setTokensWithdrew(tokensWithdrew);
    };

    const getContractReader = (address, abi) => {
        return new ethers.Contract(address, abi, provider);
    };

    console.log(withdrawPeriodNumber.toString());

    let display = <p>Loading...</p>;
    if (tokensBought && tokensWithdrew) {
        display = (
            <>
                <p>
                    You have{" "}
                    {ethers.utils.formatUnits(
                        tokensBought.sub(tokensWithdrew).toString(),
                        18
                    )}{" "}
                    tokens left to claim
                </p>
                <p>
                    You can claim{" "}
                    {ethers.utils.formatUnits(
                        tokensBought.div(withdrawPeriodNumber).toString(),
                        18
                    )}{" "}
                    tokens every{" "}
                    {withdrawPeriodDuration.div(SECONDS_PER_DAY).toString()}{" "}
                    days
                </p>
            </>
        );
    }

    return <div>{display}</div>;
};

export default WithdrawToken;
