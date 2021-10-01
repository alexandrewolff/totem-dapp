import { useState, useEffect, useCallback } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";

import Loader from "../../UI/Loader";

import {
    getCrowdsaleContract,
    tryReadTx,
    tryTransaction,
    formatTokenAmount,
} from "../../../utils/utils";
import { SECONDS_PER_DAY } from "../../../utils/constants";

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
    const [readError, setReadError] = useState("");

    const { account, library: provider } = useWeb3React();

    const updateTokensBought = useCallback(async () => {
        const contract = getCrowdsaleContract(provider);
        const tokensBought = await tryReadTx(
            () => contract.getClaimableAmount(account),
            setReadError
        );
        setTokensBought(tokensBought);
    }, [provider, account]);

    const updateTokensWithdrew = useCallback(async () => {
        const contract = getCrowdsaleContract(provider);
        const tokensWithdrew = await tryReadTx(
            () => contract.getWithdrewAmount(account),
            setReadError
        );
        setTokensWithdrew(tokensWithdrew);
    }, [provider, account]);

    useEffect(() => {
        const signer = provider.getSigner();
        setSigner(signer);
        updateTokensBought();
        updateTokensWithdrew();
    }, [account, provider, updateTokensBought, updateTokensWithdrew]);

    const sendWithdrawTokenTx = async () => {
        const contract = getCrowdsaleContract(signer);
        const tx = await contract.withdrawToken();
        await tx.wait();
    };

    const withdrawHandler = async () => {
        await tryTransaction(
            sendWithdrawTokenTx,
            setInfo,
            "Tokens successfully claimed"
        );
        updateTokensBought();
        updateTokensWithdrew();
    };

    const computeWithdrawableAmountPerPeriod = () =>
        tokensBought.div(withdrawPeriodNumber);

    const computePeriodsElapsed = () =>
        ethers.BigNumber.from(now)
            .sub(withdrawalStart)
            .div(withdrawPeriodDuration)
            .add(1);

    const computeWithdrawableAmount = (withdrawableAmountPerPeriod) => {
        const periodsElapsed = computePeriodsElapsed();
        return periodsElapsed.lt(withdrawPeriodNumber)
            ? withdrawableAmountPerPeriod
                  .mul(periodsElapsed)
                  .sub(tokensWithdrew)
            : tokensBought.sub(tokensWithdrew);
    };

    let display = <Loader />;
    if (readError) {
        display = <p>readError</p>;
    } else if (tokensBought?.eq(0)) {
        display = <p>Sale ended</p>;
    } else if (tokensBought && tokensWithdrew) {
        const withdrawableAmountPerPeriod =
            computeWithdrawableAmountPerPeriod();
        const withdrawableAmount = computeWithdrawableAmount(
            withdrawableAmountPerPeriod
        );
        display = (
            <div>
                <p>
                    You have{" "}
                    {formatTokenAmount(
                        tokensBought.sub(tokensWithdrew).toString()
                    )}{" "}
                    tokens left to claim
                </p>
                <p>
                    You can claim{" "}
                    {formatTokenAmount(withdrawableAmountPerPeriod.toString())}{" "}
                    tokens every{" "}
                    {withdrawPeriodDuration.div(SECONDS_PER_DAY).toString()}{" "}
                    days
                </p>
                <p>
                    You can claim{" "}
                    {formatTokenAmount(withdrawableAmount.toString())} tokens
                    right now
                </p>
                <button onClick={withdrawHandler}>Claim tokens</button>
                {info ? <p>{info}</p> : null}
            </div>
        );
    }

    return display;
};

export default WithdrawToken;
