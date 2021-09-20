import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

import config from "../config.json";
import abi from "../abi.json";
import { logDOM } from "@testing-library/dom";

const Sale = () => {
    const [provider, setProvider] = useState(undefined);
    const [web3Modal, setWeb3Modal] = useState(undefined);
    const [crowdsaleContract, setCrowdsaleContract] = useState(undefined);
    const [tokenContract, setTokenContract] = useState(undefined);
    const [saleSettings, setSaleSettings] = useState(undefined);
    const [tokensAtSale, setTokensAtSale] = useState(undefined);
    const [tokensSold, setTokensSold] = useState(undefined);

    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                rpc: {
                    56: config.bsc_mainnet_endpoint,
                    97: config.bsc_testnet_endpoint,
                },
            },
        },
    };

    useEffect(() => {
        const init = async () => {
            let endpoint;
            if (config.network === "mainnet") {
                endpoint = config.bsc_mainnet_endpoint;
            } else if (config.network === "testnet") {
                endpoint = config.bsc_testnet_endpoint;
            } else {
                throw new Error("Invalid network configuration");
            }

            const provider = new ethers.providers.JsonRpcProvider(endpoint);
            const crowdsaleContract = new ethers.Contract(
                config.crowdsaleAddress,
                abi.crowdsale,
                provider
            );

            let saleSettings;
            try {
                saleSettings = await crowdsaleContract.getSaleSettings();
            } catch (err) {
                console.error(err);
                return;
            }

            const tokenContract = new ethers.Contract(
                saleSettings.token,
                abi.erc20,
                provider
            );

            let tokensAtSale;
            try {
                tokensAtSale = await tokenContract.balanceOf(
                    config.crowdsaleAddress
                );
            } catch (err) {
                console.error(err);
            }
            let tokensSold;
            try {
                tokensSold = await crowdsaleContract.getSoldAmount();
            } catch (err) {
                console.error(err);
            }

            setProvider(provider);
            setCrowdsaleContract(crowdsaleContract);
            setTokenContract(tokenContract);
            setSaleSettings(saleSettings);
            setTokensAtSale(tokensAtSale);
            setTokensSold(tokensSold);
        };
        init();
    }, []);

    const connectWalletHandler = async () => {
        let network;
        if (config.network === "mainnet") {
            network = "binance";
        } else if (config.network === "testnet") {
            network = "binance_testnet";
        }
        const web3Modal = new Web3Modal({
            network,
            cacheProvider: false,
            providerOptions,
        });
        setWeb3Modal(web3Modal);

        let web3ModalProvider;
        try {
            web3ModalProvider = await web3Modal.connect();
        } catch (err) {
            console.error("Error while connecting", err);
        }
        const provider = new ethers.providers.Web3Provider(web3ModalProvider);
        setProvider(provider);
    };

    let saleInfo = "Loading...";
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
            <button onClick={connectWalletHandler}>Connect Wallet</button>
        </div>
    );
};

export default Sale;
