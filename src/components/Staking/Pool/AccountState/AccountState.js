import { useState, useEffect, useCallback } from "react";
import { useWeb3React } from "@web3-react/core";

import humanizeDuration from "humanize-duration";

import { formatTokenAmount, getStakingContract } from "../../../../utils/utils";

const AccountState = ({ poolId }) => {
    const [deposit, setDeposit] = useState(null);
    const [pendingReward, setPendingReward] = useState(undefined);

    const { account, library: provider } = useWeb3React();

    const getDeposit = useCallback(async () => {
        const stakingContract = getStakingContract(provider);
        const deposit = await stakingContract.deposits(poolId, account);
        setDeposit(deposit);
    }, [provider, account, poolId]);

    const getPendingReward = useCallback(async () => {
        const stakingContract = getStakingContract(provider);
        const pendingReward = await stakingContract.pendingReward(
            poolId,
            account
        );
        setPendingReward(pendingReward);
    }, [provider, account, poolId]);

    useEffect(() => {
        getDeposit();
        getPendingReward();
    }, [account, getDeposit, getPendingReward]);

    let accountState = null;
    if (deposit) {
        accountState = (
            <div>
                <p>Token staked: {formatTokenAmount(deposit.amount)}</p>
                {deposit.amount.gt(0) ? (
                    <p>
                        Unlocked in :{" "}
                        {humanizeDuration(
                            deposit.lockTimeEnd * 1000 - new Date().getTime()
                        )}
                    </p>
                ) : null}
                <p>
                    Pending reward:{" "}
                    {pendingReward ? formatTokenAmount(pendingReward) : 0}
                </p>
            </div>
        );
    }

    return accountState;
};

export default AccountState;
