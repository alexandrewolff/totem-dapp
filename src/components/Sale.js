import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { network } from "./wallets/connectors";

import { ethers } from "ethers";

import WalletConnection from "./WalletConnection";
import SaleInfo from "./SaleInfo";

import config from "../config.json";
import abi from "../abi.json";

const Sale = () => {
    const [saleSettings, setSaleSettings] = useState(undefined);
    const [tokensAtSale, setTokensAtSale] = useState(undefined);
    const [tokensSold, setTokensSold] = useState(undefined);
    const [updateRequired, setUpdateRequired] = useState(true);
    const [txError, setTxError] = useState("");
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
        if (!active) {
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
            console.error("HERRE", err);
            setTxError("Transaction failed");
        }
    };

    return (
        <div>
            <h1>Totem Token Sale</h1>
            <SaleInfo
                saleSettings={saleSettings}
                tokensAtSale={tokensAtSale}
                tokensSold={tokensSold}
                txError={txError}
            />
            <WalletConnection />
        </div>
    );
};

export default Sale;
