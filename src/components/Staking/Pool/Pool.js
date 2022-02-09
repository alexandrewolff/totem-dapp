import { useWeb3React } from '@web3-react/core';
import humanizeDuration from 'humanize-duration';

import PoolState from './PoolState/PoolState';
import AccountState from './AccountState/AccountState';

import { formatPercentage, formatTokenAmount } from '../../../utils/utils';
import { network } from '../../../config.json';
import poolTokensConfig from '../../../poolTokens.json';

function computeApr(amountPerReward, rewardPerBlock) {
  return (
    (rewardPerBlock / amountPerReward) *
    // to get a percentage
    100 *
    // to get reward per minute (BSC blocks are emitted every 3 seconds)
    20 *
    // to get reward per hour
    60 *
    // to get reward per day
    24 *
    // to get reward per year
    365
  );
}

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
  signer,
}) => {
  const { account } = useWeb3React();

  const isPoolClosed =
    lastRewardedBlock !== 0 ? lastRewardedBlock < currentBlock : false;
  const apr = computeApr(amountPerReward.toNumber(), rewardPerBlock);
  console.log(poolId);
  console.log('apr', apr);

  // Multiply `lockTime` by 1000 to get ms for the library
  return (
    <div>
      <h3>{poolTokensConfig[network][token] || token}</h3>
      <p>APR: {apr.toFixed(2)}%</p>
      <p>
        Minimum deposit:{' '}
        {formatTokenAmount(minimumDeposit.toString()).toString()}
      </p>
      <p>Lock time: {humanizeDuration(lockTime * 1000)}</p>
      <p>Deposit fee: {formatPercentage(depositFee)}%</p>
      <PoolState
        lastRewardedBlock={lastRewardedBlock}
        currentBlock={currentBlock}
        apr={apr}
      />
      {account ? (
        <div>
          <AccountState
            poolId={poolId}
            token={token}
            signer={signer}
            minimumDeposit={minimumDeposit}
            isPoolClosed={isPoolClosed}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Pool;
