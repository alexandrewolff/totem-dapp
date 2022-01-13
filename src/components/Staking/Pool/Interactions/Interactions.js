import { useState } from "react";
import { useWeb3React } from "@web3-react/core";
import TransactionCaller from "./TransactionCaller/TransactionCaller";

import { getStakingContract, tryTransaction } from "../../../../utils/utils";

const Interactions = ({ poolId }) => {
    const [info, setInfo] = useState("");

    const { library: provider } = useWeb3React();

    const depositHandler = (amount) => {
        const stakingContract = getStakingContract(provider);
        tryTransaction(
            stakingContract.deposit(poolId, amount),
            setInfo,
            "Tokens successfully deposited"
        );
    };
    const withdrawHandler = () => {
        console.log("withdraw");
    };
    const harvestHandler = () => {
        console.log("harvest");
    };
    return (
        <div>
            <TransactionCaller action={depositHandler}>
                Deposit
            </TransactionCaller>
            <TransactionCaller action={withdrawHandler}>
                Withdraw
            </TransactionCaller>
            <TransactionCaller action={harvestHandler}>
                Harvest
            </TransactionCaller>
            {info ? <p>{info}</p> : null}
        </div>
    );
};

export default Interactions;
