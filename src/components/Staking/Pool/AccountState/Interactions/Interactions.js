import { useState } from "react";

import { getStakingContract, tryTransaction } from "../../../../../utils/utils";

const Interactions = ({ poolId, signer, updateAccountState }) => {
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
        const stakingContract = getStakingContract(signer);
        await tryTransaction(
            () => stakingContract.deposit(poolId, depositAmount),
            setInfo,
            "Tokens successfully deposited"
        );
        updateAccountState();
    };
    const withdrawHandler = async () => {
        const stakingContract = getStakingContract(signer);
        await tryTransaction(
            () => stakingContract.withdraw(poolId, withdrawAmount),
            setInfo,
            "Tokens successfully Withdrew"
        );
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
            <input
                name="deposit"
                value={depositAmount}
                onChange={valueChangeHandler}
                placeholder="0.0000"
            />

            <button onClick={depositHandler}>Deposit</button>
            <input
                name="withdraw"
                value={withdrawAmount}
                onChange={valueChangeHandler}
                placeholder="0.0000"
            />
            <button onClick={withdrawHandler}>Withdraw</button>
            <button onClick={harvestHandler}>Harvest</button>
            {info ? <p>{info}</p> : null}
        </div>
    );
};

export default Interactions;
