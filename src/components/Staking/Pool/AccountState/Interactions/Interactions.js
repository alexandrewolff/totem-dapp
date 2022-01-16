import { useState } from "react";
import { ethers } from "ethers";

import {
    getStakingContract,
    tryTransaction,
    parseTokenAmount,
    displayInfo,
} from "../../../../../utils/utils";

const Interactions = ({
    poolId,
    signer,
    minimumNextDeposit,
    isPoolClosed,
    isTherePendingReward,
    isThereWithdrawal,
    updateAccountState,
}) => {
    const [depositAmount, setDepositAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [info, setInfo] = useState("");

    const valueChangeHandler = ({ target }) => {
        const { name, value } = target;
        switch (name) {
            case "deposit":
                setDepositAmount(value);
                break;
            case "withdraw":
                setWithdrawAmount(value);
                break;
        }
    };

    const depositHandler = async () => {
        const parsedDepositAmount = parseTokenAmount(depositAmount);
        if (parsedDepositAmount.lt(minimumNextDeposit)) {
            return displayInfo(
                setInfo,
                "Deposit amount lower than minimum deposit"
            );
        }

        const stakingContract = getStakingContract(signer);
        await tryTransaction(
            () => stakingContract.deposit(poolId, parsedDepositAmount),
            setInfo,
            "Tokens successfully deposited"
        );
        setDepositAmount("");
        updateAccountState();
    };
    const withdrawHandler = async () => {
        const stakingContract = getStakingContract(signer);
        await tryTransaction(
            () =>
                stakingContract.withdraw(
                    poolId,
                    parseTokenAmount(withdrawAmount)
                ),
            setInfo,
            "Tokens successfully Withdrew"
        );
        setWithdrawAmount("");
        updateAccountState();
    };
    const harvestHandler = async () => {
        const stakingContract = getStakingContract(signer);
        await tryTransaction(
            () => stakingContract.harvest(poolId),
            setInfo,
            "Reward successfully harvested"
        );
        updateAccountState();
    };

    return (
        <div>
            {isPoolClosed ? null : (
                <>
                    <input
                        name="deposit"
                        value={depositAmount}
                        onChange={valueChangeHandler}
                        placeholder="0.0000"
                    />
                    <button onClick={depositHandler}>Deposit</button>
                </>
            )}
            {isThereWithdrawal ? (
                <>
                    <input
                        name="withdraw"
                        value={withdrawAmount}
                        onChange={valueChangeHandler}
                        placeholder="0.0000"
                    />
                    <button onClick={withdrawHandler}>Withdraw</button>
                </>
            ) : null}
            {isTherePendingReward ? (
                <button onClick={harvestHandler}>Harvest</button>
            ) : null}
            {info ? <p>{info}</p> : null}
        </div>
    );
};

export default Interactions;
