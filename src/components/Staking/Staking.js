import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";

import Loader from "../UI/Loader";
import Pool from "./Pool/Pool";

import { getStakingContract } from "../../utils/utils";
import { network } from "../../utils/walletConnectors";

const Staking = () => {
    const [currentBlock, setCurrentBlock] = useState(undefined);
    const [pools, setPools] = useState(undefined);
    const [readError, setReadError] = useState("");

    const { activate, active, error, library: provider } = useWeb3React();

    useEffect(() => {
        const activateNetwork = async () => {
            await activate(network);
        };
        if (!active && !error) {
            activateNetwork();
        }
    }, [active, error, activate]);

    useEffect(() => {
        const getCurrentBlock = async () => {
            const currentBlock = await provider.getBlockNumber();
            setCurrentBlock(currentBlock);
        };
        const fetchPools = async () => {
            const stakingContract = getStakingContract(provider);
            console.log("get pools"); // REMOVE
            const pools = await tryReadTx(stakingContract.getPools);
            setPools(pools);
        };
        if (provider) {
            getCurrentBlock();
            fetchPools();
        }
    }, [provider, setPools]);

    // duplicated with Sale.js
    const tryReadTx = async (call) => {
        try {
            return await call();
        } catch (err) {
            console.error(err);
            setReadError("Read failed");
        }
    };

    let display;
    if (readError) {
        display = <p>{readError}</p>;
    } else if (!pools) {
        display = <Loader />;
    } else if (pools.length === 0) {
        display = <p>No pool has been created</p>;
    } else {
        display = pools.map((pool, index) => (
            <Pool
                key={index}
                index={index}
                {...pool}
                currentBlock={currentBlock}
            />
        ));
    }

    return (
        <div>
            <h1>Staking Pools</h1>
            {display}
        </div>
    );
};

export default Staking;
