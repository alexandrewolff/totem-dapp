import { useState } from "react";

import { getStakingContract, tryTransaction } from "../../../../utils/utils";

const Interactions = ({ poolId, signer }) => {
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

    const depositHandler = () => {
        const stakingContract = getStakingContract(signer);
        tryTransaction(
            () => stakingContract.deposit(poolId, depositAmount),
            setInfo,
            "Tokens successfully deposited"
        );
    };
    const withdrawHandler = () => {
        const stakingContract = getStakingContract(signer);
        tryTransaction(
            () => stakingContract.withdraw(poolId, withdrawAmount),
            setInfo,
            "Tokens successfully Withdrew"
        );
    };
    const harvestHandler = () => {
        const stakingContract = getStakingContract(signer);
        tryTransaction(
            () => stakingContract.harvest(poolId),
            setInfo,
            "Reward successfully harvested"
        );
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
