import React, { useState, useEffect } from "react";
import {
    useWeb3React,
    getWeb3ReactContext,
    UnsupportedChainIdError,
} from "@web3-react/core";
import { injected, walletconnect, network } from "./wallets/connectors";
import { ethers } from "ethers";

import config from "../config.json";
import abi from "../abi.json";

const ReferralRegister = () => {
    const [info, setInfo] = useState("");
    const {
        activate,
        deactivate,
        chainId,
        account,
        active,
        error,
        library: provider,
        connector,
    } = useWeb3React();

    const connect = async (connector) => {
        try {
            await activate(connector);
        } catch (err) {
            console.error(err);
        }
    };

    const registerHandler = async () => {
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
            config.crowdsaleAddress,
            abi.crowdsale,
            signer
        );
        const isAlreadyReferral = await contract.isReferral(account);

        if (isAlreadyReferral)
            return displayInfo("Account already registered as referral");

        try {
            const tx = await contract.registerAsReferral();
            await tx.wait();
            displayInfo("Account successfully registered as referral");
        } catch (err) {
            console.error(err);
            displayInfo("Transaction failed");
        }
    };

    const displayInfo = (info) => {
        setInfo(info);
        setTimeout(() => {
            setInfo("");
        }, 3000);
    };

    let walletConnection;
    const isUnsupportedChainIdError = error instanceof UnsupportedChainIdError;
    if (active || isUnsupportedChainIdError) {
        walletConnection = (
            <div>
                {account ? <p>Account: {account}</p> : null}
                {isUnsupportedChainIdError ? (
                    <p>Please switch to Binance Smart Chain</p>
                ) : null}
                <button onClick={deactivate}>Disconnect Wallet</button>
            </div>
        );
    } else {
        walletConnection = (
            <div>
                <button onClick={() => connect(injected)}>
                    Connect Metamask
                </button>
                <button onClick={() => connect(walletconnect)}>
                    Connect WalletConnect
                </button>
            </div>
        );
    }

    let register;
    if (active) {
        register = (
            <div>
                <button onClick={registerHandler}>Register as referral</button>
                {info ? <p>{info}</p> : null}
            </div>
        );
    }

    return (
        <div>
            <h1>Referral Register</h1>
            {walletConnection}
            {register}
        </div>
    );
};

export default ReferralRegister;
