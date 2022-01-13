import { useState, useEffect, useCallback } from "react";
import { useWeb3React } from "@web3-react/core";
import humanizeDuration from "humanize-duration";

import {
    formatPercentage,
    formatTokenAmount,
    getStakingContract,
} from "../../../utils/utils";
import { network } from "../../../config.json";
import poolTokensConfig from "../../../poolTokens.json";

const Pool = ({
    id,
    token,
    amountPerReward,
    rewardPerBlock,
    depositFee,
    lastRewardedBlock,
    lockTime,
    minimumDeposit,
    currentBlock,
    account,
}) => {
    const [deposit, setDeposit] = useState(null);
    const [pendingReward, setPendingReward] = useState(null);

    const { library: provider } = useWeb3React();

    const getDeposit = useCallback(async () => {
        const stakingContract = getStakingContract(provider);
        const deposit = await stakingContract.deposits(id, account);
        setDeposit(deposit);
    }, [provider, account, id]);

    const getPendingReward = useCallback(async () => {
        const stakingContract = getStakingContract(provider);
        const pendingReward = await stakingContract.pendingReward(id, account);
        setPendingReward(pendingReward);
    }, [provider, account, id]);

    useEffect(() => {
        if (account) {
            getDeposit();
            getPendingReward();
            console.log({ pendingReward });
        }
    }, [account, getDeposit, getPendingReward]);

    console.log(`mount pool ${id}`); // REMOVE
    // Multiply by 1000 to get ms
    const formatedLockTime = humanizeDuration(lockTime * 1000);

    let poolState;
    if (lastRewardedBlock === 0) {
        poolState = null;
    } else if (lastRewardedBlock >= currentBlock) {
        // Multiply by 3000 because blocktime on BSC is 3 seconds
        poolState = (
            <p>
                Reward will stop in approximativaly{" "}
                {humanizeDuration((lastRewardedBlock - currentBlock) * 3000)}
            </p>
        );
    } else {
        poolState = <p>Reward ended</p>;
    }

    let accountState;
    if (!deposit) {
        accountState = null;
    } else {
        accountState = (
            <div>
                <p>Token staked: {formatTokenAmount(deposit.amount)}</p>
                {deposit.amount.gt(0) ? (
                    <p>
                        Unlocked in :{" "}
                        {humanizeDuration(
                            deposit.lockTimeEnd.sub(new Date().getTime())
                        ).mul(1000)}
                    </p>
                ) : null}
                <p>
                    Pending reward:{" "}
                    {pendingReward ? pendingReward.toString() : 0}
                </p>
            </div>
        );
    }

    return (
        <div>
            <h3>{poolTokensConfig[network][token]}</h3>
            <p>
                Minimum deposit:{" "}
                {formatTokenAmount(minimumDeposit.toString()).toString()}
            </p>
            <p>Lock time: {formatedLockTime}</p>
            <p>Deposit fee: {formatPercentage(depositFee)}%</p>
            {poolState}
            {accountState}
        </div>
    );
};

export default Pool;
