import humanizeDuration from "humanize-duration";

const PoolState = ({ lastRewardedBlock, currentBlock }) => {
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

    return poolState;
};

export default PoolState;
