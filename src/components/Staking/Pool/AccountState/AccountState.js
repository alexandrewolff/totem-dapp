import { useState, useEffect, useCallback } from "react";
import { useWeb3React } from "@web3-react/core";
import humanizeDuration from "humanize-duration";

import Interactions from "./Interactions/Interactions";

import { formatTokenAmount, getStakingContract } from "../../../../utils/utils";

const AccountState = ({ poolId, signer, minimumDeposit, isPoolClosed }) => {
    const [deposit, setDeposit] = useState(undefined);
    const [pendingReward, setPendingReward] = useState(undefined);
    const [updateRequired, setUpdateRequired] = useState(false);

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

    const updateAccountState = useCallback(() => {
        getDeposit();
        getPendingReward();
    }, [getDeposit, getPendingReward]);

    useEffect(() => {
        updateAccountState();
    }, [account, updateAccountState]);

    useEffect(() => {
        if (updateRequired) {
            updateAccountState();
            setUpdateRequired(false);
        }
    }, [updateRequired, updateAccountState]);

    let minimumNextDeposit = deposit ? minimumDeposit.sub(deposit.amount) : 0;

    const secondsBeforeUnlock =
        deposit && deposit.lockTimeEnd * 1000 - new Date().getTime();

    let accountState = null;
    if (deposit && pendingReward) {
        accountState = (
            <div>
                <p>
                    Token staked: {formatTokenAmount(deposit.amount.toString())}
                </p>
                {deposit.amount.gt(0) && secondsBeforeUnlock > 0 ? (
                    <p>
                        Unlocked in :{" "}
                        {humanizeDuration(
                            deposit.lockTimeEnd * 1000 - new Date().getTime()
                        )}
                    </p>
                ) : null}
                <p>Pending reward: {formatTokenAmount(pendingReward)}</p>
            </div>
        );
    }

    const isTherePendingReward = pendingReward ? pendingReward.gt(0) : false;
    const isThereWithdrawal = deposit
        ? deposit.amount.gt(0) &&
          deposit.lockTimeEnd * 1000 < new Date().getTime()
        : false;

    return (
        <div>
            {accountState}
            <Interactions
                poolId={poolId}
                signer={signer}
                minimumNextDeposit={minimumNextDeposit}
                isPoolClosed={isPoolClosed}
                isTherePendingReward={isTherePendingReward}
                isThereWithdrawal={isThereWithdrawal}
                updateAccountState={() => setUpdateRequired(true)}
            />
        </div>
    );
};

export default AccountState;
