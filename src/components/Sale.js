import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

import config from "../config.json";
import abi from "../abi.json";

const Sale = () => {
    const [provider, setProvider] = useState(undefined);
    const [web3Modal, setWeb3Modal] = useState(undefined);
    const [crowdsaleContract, setCrowdsaleContract] = useState(undefined);
    const [tokenContract, setTokenContract] = useState(undefined);
    const [saleSettings, setSaleSettings] = useState(undefined);
    const [tokensAtSale, setTokensAtSale] = useState(undefined);
    const [tokensSold, setTokensSold] = useState(undefined);
    const [signer, setSigner] = useState("");
    const [account, setAccount] = useState("");
    const [web3Provider, setWeb3Provider] = useState(undefined);
    const [network, setNetwork] = useState("");

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

    console.log("load");

    useEffect(() => {
        if (provider?.on) {
            provider.on("accountsChanged", (accounts) => {
                console.log("accountsChanged event");
                setAccount(accounts[0]);
            });
            provider.on("chainChanged", (accounts) => {
                console.log("chainChanged event");

                setAccount(accounts[0]);
            });
            provider.on("disconnect", async () => {
                console.log("disconnect event");

                try {
                    await web3Modal.clearCachedProvider();
                } catch (err) {
                    console.log("Error while clearing provider", err);
                }

                let newProvider;
                if (config.network === "mainnet") {
                    newProvider = config.bsc_mainnet_endpoint;
                } else if (config.network === "testnet") {
                    newProvider = config.bsc_testnet_endpoint;
                } else {
                    throw new Error("Invalid network configuration");
                }

                const web3Provider = new ethers.providers.JsonRpcProvider(
                    newProvider
                );
                console.log("disconnect from event");
                setProvider(newProvider);
                setWeb3Provider(web3Provider);
                setAccount("");
            });
        }

        return () => {
            if (provider?.removeListener) {
                provider.removeListener("accountsChanged", (accounts) => {
                    console.log("un accountsChanged event");
                    setAccount(accounts[0]);
                });
                provider.removeListener("chainChanged", (accounts) => {
                    console.log("un chainChanged event");
                    setAccount(accounts[0]);
                });
                provider.removeListener("disconnect", async () => {
                    console.log("disconnect event");

                    try {
                        await web3Modal.clearCachedProvider();
                    } catch (err) {
                        console.log("Error while clearing provider", err);
                    }

                    let newProvider;
                    if (config.network === "mainnet") {
                        newProvider = config.bsc_mainnet_endpoint;
                    } else if (config.network === "testnet") {
                        newProvider = config.bsc_testnet_endpoint;
                    } else {
                        throw new Error("Invalid network configuration");
                    }

                    const web3Provider = new ethers.providers.JsonRpcProvider(
                        newProvider
                    );
                    console.log("disconnect from event");
                    setProvider(newProvider);
                    setWeb3Provider(web3Provider);
                    setAccount("");
                });
            }
        };
    }, [provider]);

    useEffect(() => {
        const init = async () => {
            let provider;
            let network;
            if (config.network === "mainnet") {
                provider = config.bsc_mainnet_endpoint;
                network = "binance";
            } else if (config.network === "testnet") {
                provider = config.bsc_testnet_endpoint;
                network = "binance-testnet";
            } else {
                throw new Error("Invalid network configuration");
            }

            const web3Modal = new Web3Modal({
                network,
                cacheProvider: true,
                providerOptions,
            });

            const web3Provider = new ethers.providers.JsonRpcProvider(provider);

            setNetwork(network);
            setWeb3Modal(web3Modal);
            setProvider(provider);
            setWeb3Provider(web3Provider);
        };
        init();
    }, []);

    useEffect(() => {
        const init = async () => {
            if (!web3Provider) return;

            const crowdsaleContract = new ethers.Contract(
                config.crowdsaleAddress,
                abi.crowdsale,
                web3Provider
            );

            let saleSettings;
            try {
                saleSettings = await crowdsaleContract.getSaleSettings();
            } catch (err) {
                console.error("Sale settings fetch error: ", err);
                return;
            }

            const tokenContract = new ethers.Contract(
                saleSettings.token,
                abi.erc20,
                web3Provider
            );

            let tokensAtSale;
            try {
                tokensAtSale = await tokenContract.balanceOf(
                    config.crowdsaleAddress
                );
            } catch (err) {
                console.error("tokensAtSale: ", err);
            }

            let tokensSold;
            try {
                tokensSold = await crowdsaleContract.getSoldAmount();
            } catch (err) {
                console.error("tokensSold: ", err);
            }

            setCrowdsaleContract(crowdsaleContract);
            setTokenContract(tokenContract);
            setSaleSettings(saleSettings);
            setTokensAtSale(tokensAtSale);
            setTokensSold(tokensSold);
        };
        init();
    }, [web3Provider]);

    const connectWalletHandler = async () => {
        let provider;
        try {
            provider = await web3Modal.connect();
        } catch (err) {
            console.error("Error while connecting", err);
            return;
        }
        const web3Provider = new ethers.providers.Web3Provider(provider);
        const signer = web3Provider.getSigner();
        const account = await signer.getAddress();

        setProvider(provider);
        setWeb3Provider(web3Provider);
        setSigner(signer);
        setAccount(account);
    };

    const disconnectWalletHandler = async () => {
        try {
            await web3Modal.clearCachedProvider();
        } catch (err) {
            console.log("Error while clearing provider", err);
        }

        if (provider?.close && typeof provider.close === "function") {
            try {
                await provider.close();
            } catch (err) {
                console.log("Error while closing", err);
            }
        } else if (
            provider?.disconnect &&
            typeof provider.disconnect === "function"
        ) {
            try {
                await provider.disconnect();
            } catch (err) {
                console.log("Error while disconnecting", err);
            }
        }

        let newProvider;
        if (config.network === "mainnet") {
            newProvider = config.bsc_mainnet_endpoint;
        } else if (config.network === "testnet") {
            newProvider = config.bsc_testnet_endpoint;
        } else {
            throw new Error("Invalid network configuration");
        }

        const web3Provider = new ethers.providers.JsonRpcProvider(newProvider);
        console.log("disconnect");
        setProvider(newProvider);
        setWeb3Provider(web3Provider);
        setAccount("");
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

    let walletConnection;
    if (account) {
        walletConnection = (
            <>
                <p>Account connected: {account}</p>
                <button onClick={disconnectWalletHandler}>Disconnect</button>
            </>
        );
    } else {
        walletConnection = (
            <button onClick={connectWalletHandler}>Connect Wallet</button>
        );
    }

    return (
        <div>
            <h1>Totem Token Sale</h1>
            {saleInfo}
            {walletConnection}
        </div>
    );
};

export default Sale;
