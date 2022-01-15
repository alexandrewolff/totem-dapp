import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";

import Loader from "../UI/Loader";
import Pool from "./Pool/Pool";
import WalletConnection from "../WalletConnection/WalletConnection";

import { getStakingContract, tryReadTx } from "../../utils/utils";
import { network } from "../../utils/walletConnectors";

const Staking = () => {
    const [currentBlock, setCurrentBlock] = useState(undefined);
    const [pools, setPools] = useState(undefined);
    const [signer, setSigner] = useState(undefined);
    const [readError, setReadError] = useState("");

    const {
        activate,
        active,
        error,
        account,
        library: provider,
    } = useWeb3React();

    useEffect(() => {
        if (account) setSigner(provider.getSigner());
    }, [provider, account]);

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
            const pools = await tryReadTx(
                stakingContract.getPools,
                setReadError
            );
            setPools(pools);
        };
        if (provider) {
            getCurrentBlock();
            fetchPools();
        }
    }, [provider, account, setPools]);

    let display;
    if (readError) {
        display = <p>{readError}</p>;
    } else if (!pools) {
        display = <Loader />;
    } else if (pools.length === 0) {
        display = <p>No pool has been created</p>;
    } else {
        display = pools.map((pool, poolId) => (
            <Pool
                key={poolId}
                poolId={poolId}
                {...pool}
                currentBlock={currentBlock}
                signer={signer}
            />
        ));
    }

    return (
        <div>
            <h1>Staking Pools</h1>
            <WalletConnection />
            {display}
        </div>
    );
};

export default Staking;
