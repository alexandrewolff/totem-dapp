import humanizeDuration from "humanize-duration";

import { formatPercentage, formatTokenAmount } from "../../../utils/utils";
import { network } from "../../../config.json";
import poolTokensConfig from "../../../poolTokens.json";

const Pool = ({
    token,
    amountPerReward,
    rewardPerBlock,
    depositFee,
    lastRewardedBlock,
    lockTime,
    minimumDeposit,
    currentBlock,
}) => {
    // Multiply by 1000 to get ms
    const formatedLockTime = humanizeDuration(lockTime * 1000);
    console.log({ currentBlock });
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
        </div>
    );
};

export default Pool;
