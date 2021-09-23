import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { network } from "./wallets/connectors";

import { ethers } from "ethers";

import WalletConnection from "./WalletConnection";

import config from "../config.json";
import abi from "../abi.json";

const Sale = () => {
    const [saleSettings, setSaleSettings] = useState(undefined);
    const [tokensAtSale, setTokensAtSale] = useState(undefined);
    const [tokensSold, setTokensSold] = useState(undefined);
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
        };
        fetchContractInfo();
    }, []);

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
            setTxError("Transaction failed");
        }
    };

    let saleInfo = <p>Loading...</p>;
    if (saleSettings) {
        saleInfo = (
            <div>
                <p>
                    Sale start:{" "}
                    {new Date(
                        saleSettings.saleStart.toNumber() * 1000
                    ).toDateString()}
                </p>
                <p>
                    Sale end:{" "}
                    {new Date(
                        saleSettings.saleEnd.toNumber() * 1000
                    ).toDateString()}
                </p>
                <p>
                    Tokens at sale:{" "}
                    {tokensAtSale
                        ? ethers.utils.formatEther(tokensAtSale)
                        : null}
                </p>
                <p>
                    Tokens sold:{" "}
                    {tokensSold ? ethers.utils.formatEther(tokensSold) : null}
                </p>
                <p>
                    Price per token: {1 / saleSettings.exchangeRate.toNumber()}$
                </p>
            </div>
        );
    }

    return (
        <div>
            <h1>Totem Token Sale</h1>
            {saleInfo}
            <WalletConnection />
        </div>
    );
};

export default Sale;
