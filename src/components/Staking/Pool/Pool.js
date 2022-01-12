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
    const formatedLockTime = humanizeDuration(lockTime * 1000);
    const poolState =
        lastRewardedBlock !== 0 && lastRewardedBlock <= currentBlock ? (
            <p>
                Reward will stop in approximativaly{" "}
                {humanizeDuration((lastRewardedBlock - currentBlock) * 3000)}
            </p>
        ) : (
            <p>Pool is closed</p>
        );
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
