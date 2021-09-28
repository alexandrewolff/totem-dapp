import React, { useState, useEffect } from "react";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { network } from "./wallets/connectors";

import { ethers } from "ethers";

import WalletConnection from "./WalletConnection";
import SaleInfo from "./SaleInfo";
import BuyToken from "./BuyToken";
import WithdrawToken from "./WithdrawToken";

import config from "../config.json";
import abi from "../abi.json";

const Sale = () => {
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
                config.crowdsaleAddress,
                abi.crowdsale
            );
            const saleSettings = await tryReadTx(() =>
                crowdsaleContract.getSaleSettings()
            );
            console.log(saleSettings);
            const tokensSold = await tryReadTx(() =>
                crowdsaleContract.getSoldAmount()
            );
            const tokenContract = getContractReader(
                saleSettings.token,
                abi.erc20
            );
            const tokensAtSale = await tryReadTx(() =>
                tokenContract.balanceOf(config.crowdsaleAddress)
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
    //         config.crowdsaleAddress,
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
    const now = 4;

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
