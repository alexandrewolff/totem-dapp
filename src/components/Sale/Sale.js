import React, { useState, useEffect } from "react";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { ethers } from "ethers";

import WalletConnection from "../WalletConnection/WalletConnection";
import SaleInfo from "./SaleInfo/SaleInfo";
import BuyToken from "./BuyToken/BuyToken";
import WithdrawToken from "./WithdrawToken/WithdrawToken";

import { network } from "../../utils/walletConnectors";
import abi from "../../abi.json";

const Sale = ({ crowdsaleAddress }) => {
    const [saleSettings, setSaleSettings] = useState(undefined);
    const [tokensAtSale, setTokensAtSale] = useState(undefined);
    const [tokensSold, setTokensSold] = useState(undefined);
    const [updateRequired, setUpdateRequired] = useState(true);
    const [warning, setWarning] = useState("");
    const {
        activate,
        deactivate,
        account,
        active,
        error,
        connector,
        library: provider,
    } = useWeb3React();

    useEffect(() => {
        const activateNetwork = async () => {
            await activate(network);
        };
        if (!active && !error) {
            activateNetwork();
        }
    }, [active, activate]);

    useEffect(() => {
        const fetchContractInfo = async () => {
            const crowdsaleContract = getContractReader(
                crowdsaleAddress,
                abi.crowdsale
            );
            const saleSettings = await tryReadTx(() =>
                crowdsaleContract.getSaleSettings()
            );
            const tokensSold = await tryReadTx(() =>
                crowdsaleContract.getSoldAmount()
            );
            const tokenContract = getContractReader(
                saleSettings.token,
                abi.erc20
            );
            const tokensAtSale = await tryReadTx(() =>
                tokenContract.balanceOf(crowdsaleAddress)
            );

            setSaleSettings(saleSettings);
            setTokensAtSale(tokensAtSale);
            setTokensSold(tokensSold);
            setUpdateRequired(false);
        };
        if (provider && updateRequired) {
            fetchContractInfo();
        }
    }, [provider, updateRequired]);

    const getContractReader = (address, abi) => {
        return new ethers.Contract(address, abi, provider);
    };

    // const getContractWriter = () => {
    //     const signer = provider.getSigner();
    //     return new ethers.Contract(
    //         crowdsaleAddress,
    //         abi.crowdsale,
    //         signer
    //     );
    // };

    const tryReadTx = async (call) => {
        try {
            return await call();
        } catch (err) {
            console.error(err);
            setWarning("Transaction failed");
        }
    };

    // const now = Math.floor(new Date() / 1000);
    const now = 2;

    let display;
    if (!saleSettings) {
        display = <p>Loading...</p>;
    } else if (now < saleSettings.saleStart) {
        display = (
            <SaleInfo
                saleSettings={saleSettings}
                tokensAtSale={tokensAtSale}
                tokensSold={tokensSold}
                warning={warning}
            />
        );
    } else if (now < saleSettings.saleEnd) {
        display = (
            <>
                <SaleInfo
                    saleSettings={saleSettings}
                    tokensAtSale={tokensAtSale}
                    tokensSold={tokensSold}
                    warning={warning}
                />
                <WalletConnection />
                {account ? (
                    <BuyToken
                        crowdsaleAddress={crowdsaleAddress}
                        minBuyValue={saleSettings.minBuyValue}
                        maxTokenAmountPerAddress={
                            saleSettings.maxTokenAmountPerAddress
                        }
                        exchangeRate={saleSettings.exchangeRate}
                    />
                ) : null}
            </>
        );
    } else if (now < saleSettings.withdrawalStart) {
        display = (
            <p>
                Sale ended. You can start to claim your tokens from{" "}
                {new Date(
                    saleSettings.withdrawalStart.toNumber() * 1000
                ).toDateString()}
            </p>
        );
    } else {
        display = (
            <>
                <WalletConnection />
                {account ? (
                    <WithdrawToken
                        crowdsaleAddress={crowdsaleAddress}
                        now={now}
                        withdrawalStart={saleSettings.withdrawalStart}
                        withdrawPeriodDuration={
                            saleSettings.withdrawPeriodDuration
                        }
                        withdrawPeriodNumber={saleSettings.withdrawPeriodNumber}
                    />
                ) : null}
            </>
        );
    }

    return (
        <div>
            <h1>Totem Token Sale</h1>
            {display}
        </div>
    );
};

export default Sale;
