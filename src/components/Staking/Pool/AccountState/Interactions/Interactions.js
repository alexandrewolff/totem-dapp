import { useState, useEffect, useCallback } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';

import {
  getStakingContract,
  getErc20Contract,
  tryReadTx,
  tryTransaction,
  parseTokenAmount,
  displayInfo,
} from '../../../../../utils/utils';

import config from '../../../../../config.json';

const Interactions = ({
  poolId,
  token,
  signer,
  minimumNextDeposit,
  isPoolClosed,
  pendingReward,
  deposit,
  updateAccountState,
}) => {
  const [approved, setApproved] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [info, setInfo] = useState('');

  const { account, library: provider } = useWeb3React();

  const isTherePendingReward = pendingReward ? pendingReward.gt(0) : false;
  const isThereWithdrawal = deposit
    ? deposit.amount.gt(0) && deposit.lockTimeEnd * 1000 < new Date().getTime()
    : false;

  const fetchAllowance = useCallback(async () => {
    const tokenContract = getErc20Contract(token, provider);
    const allowance = await tryReadTx(
      async () => tokenContract.allowance(account, config.stakingAddress),
      setInfo
    );
    if (!allowance) {
      console.log('Problem', token, allowance);
      return;
    }
    setApproved(allowance.gt(0));
  }, [token, account, provider]);

  useEffect(() => {
    fetchAllowance();
  }, [fetchAllowance]);

  const valueChangeHandler = ({ target }) => {
    const { name, value } = target;
    switch (name) {
      case 'deposit':
        setDepositAmount(value);
        break;
      case 'withdraw':
        setWithdrawAmount(value);
        break;
    }
  };

  const approveHandler = async () => {
    const tokenContract = getErc20Contract(token, signer);
    await tryTransaction(
      () =>
        tokenContract.approve(
          config.stakingAddress,
          ethers.constants.MaxUint256
        ),
      setInfo,
      'Tokens successfully approved'
    );
    fetchAllowance();
  };

  const depositHandler = async () => {
    const parsedDepositAmount = parseTokenAmount(depositAmount);
    if (parsedDepositAmount.lt(minimumNextDeposit)) {
      return displayInfo(setInfo, 'Deposit amount lower than minimum deposit');
    }

    const stakingContract = getStakingContract(signer);
    await tryTransaction(
      () => stakingContract.deposit(poolId, parsedDepositAmount),
      setInfo,
      'Tokens successfully deposited'
    );
    setDepositAmount('');
    updateAccountState();
  };

  const withdrawHandler = async () => {
    const stakingContract = getStakingContract(signer);
    await tryTransaction(
      () => stakingContract.withdraw(poolId, parseTokenAmount(withdrawAmount)),
      setInfo,
      'Tokens successfully Withdrew'
    );
    setWithdrawAmount('');
    updateAccountState();
  };

  const harvestHandler = async () => {
    const stakingContract = getStakingContract(signer);
    await tryTransaction(
      () => stakingContract.harvest(poolId),
      setInfo,
      'Reward successfully harvested'
    );
    updateAccountState();
  };

  let display;
  if (!approved) {
    display = <button onClick={approveHandler}>Approve</button>;
  } else {
    display = (
      <div>
        {isPoolClosed ? null : (
          <>
            <input
              name="deposit"
              value={depositAmount}
              onChange={valueChangeHandler}
              placeholder="0.0000"
            />
            <button onClick={depositHandler}>Deposit</button>
          </>
        )}
        {isThereWithdrawal ? (
          <>
            <input
              name="withdraw"
              value={withdrawAmount}
              onChange={valueChangeHandler}
              placeholder="0.0000"
            />
            <button onClick={withdrawHandler}>Withdraw</button>
          </>
        ) : null}
        {isTherePendingReward ? (
          <button onClick={harvestHandler}>Harvest</button>
        ) : null}
        {info ? <p>{info}</p> : null}
      </div>
    );
  }

  return display;
};

export default Interactions;
