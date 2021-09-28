import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";

import config from "../config.json";
import abi from "../abi.json";
const SECONDS_PER_DAY = ethers.BigNumber.from("86400");

const WithdrawToken = ({
    now,
    withdrawPeriodNumber,
    withdrawPeriodDuration,
    withdrawalStart,
}) => {
    const [tokensBought, setTokensBought] = useState(undefined);
    const [tokensWithdrew, setTokensWithdrew] = useState(undefined);
    const [signer, setSigner] = useState(undefined);
    const [info, setInfo] = useState("");

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

    const withdrawHandler = async () => {
        const contract = new ethers.Contract(
            config.crowdsaleAddress,
            abi.crowdsale,
            signer
        );
        try {
            const tx = await contract.withdrawToken();
            await tx.wait();
            updateTokensBought();
            displayInfo("Tokens successfully claimed");
        } catch (err) {
            console.error(err);
            displayInfo("Transaction failed");
        }
    };

    const displayInfo = (info) => {
        setInfo(info);
        setTimeout(() => {
            setInfo("");
        }, 3000);
    };

    let display = <p>Loading...</p>;
    if (tokensBought?.eq(0)) {
        display = <p>Sale ended</p>;
    } else if (tokensBought && tokensWithdrew) {
        const withdrawableAmountPerPeriod =
            tokensBought.div(withdrawPeriodNumber);
        const periodsElapsed = ethers.BigNumber.from(now)
            .sub(withdrawalStart)
            .div(withdrawPeriodDuration)
            .add(ethers.BigNumber.from("1"));
        const withdrawableAmount = periodsElapsed.lt(withdrawPeriodNumber)
            ? withdrawableAmountPerPeriod
                  .mul(periodsElapsed)
                  .sub(tokensWithdrew)
            : tokensBought.sub(tokensWithdrew);
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
                        withdrawableAmountPerPeriod.toString(),
                        18
                    )}{" "}
                    tokens every{" "}
                    {withdrawPeriodDuration.div(SECONDS_PER_DAY).toString()}{" "}
                    days
                </p>
                <p>
                    You can claim{" "}
                    {ethers.utils.formatUnits(
                        withdrawableAmount.toString(),
                        18
                    )}{" "}
                    tokens right now
                </p>
                <button onClick={withdrawHandler}>Claim tokens</button>
                {info ? <p>{info}</p> : null}
            </>
        );
    }

    return <div>{display}</div>;
};

export default WithdrawToken;
