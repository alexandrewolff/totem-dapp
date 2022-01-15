import { useWeb3React } from "@web3-react/core";
import humanizeDuration from "humanize-duration";

import PoolState from "./PoolState/PoolState";
import AccountState from "./AccountState/AccountState";
import Interactions from "./Interactions/Interactions";

import { formatPercentage, formatTokenAmount } from "../../../utils/utils";
import { network } from "../../../config.json";
import poolTokensConfig from "../../../poolTokens.json";

const Pool = ({
    poolId,
    token,
    amountPerReward,
    rewardPerBlock,
    depositFee,
    lastRewardedBlock,
    lockTime,
    minimumDeposit,
    currentBlock,
}) => {
    const { account } = useWeb3React();

    // Multiply `lockTime` by 1000 to get ms for the library
    return (
        <div>
            <h3>{poolTokensConfig[network][token] || token}</h3>
            <p>
                Minimum deposit:{" "}
                {formatTokenAmount(minimumDeposit.toString()).toString()}
            </p>
            <p>Lock time: {humanizeDuration(lockTime * 1000)}</p>
            <p>Deposit fee: {formatPercentage(depositFee)}%</p>
            <PoolState
                lastRewardedBlock={lastRewardedBlock}
                currentBlock={currentBlock}
            />
            {account ? (
                <div>
                    <AccountState poolId={poolId} />
                    <Interactions />
                </div>
            ) : null}
        </div>
    );
};

export default Pool;
