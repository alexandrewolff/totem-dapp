import React, { useState, useEffect } from "react";
import {
    useWeb3React,
    getWeb3ReactContext,
    UnsupportedChainIdError,
} from "@web3-react/core";
import { injected, walletconnect, network } from "./wallets/connectors";
import { ethers } from "ethers";

// import config from "../config.json";

const ReferralRegister = () => {
    const [showModal, setShowModal] = useState(false);
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

    useEffect(() => {
        const isUnsupportedChainIdError =
            error instanceof UnsupportedChainIdError;
        console.log(active, chainId, account, isUnsupportedChainIdError);
    });

    const connect = async (connector) => {
        try {
            await activate(connector);
        } catch (err) {
            console.error("Failed to connect: ", err);
        }
    };

    let walletConnection;
    const isUnsupportedChainIdError = error instanceof UnsupportedChainIdError;
    if (active || isUnsupportedChainIdError) {
        walletConnection = (
            <>
                {isUnsupportedChainIdError ? (
                    <p>Please switch to Binance Smart Chain</p>
                ) : null}
                <button onClick={deactivate}>Disconnect Wallet</button>
            </>
        );
    } else {
        walletConnection = (
            <>
                <button onClick={() => connect(injected)}>
                    Connect Metamask
                </button>
                <button onClick={() => connect(walletconnect)}>
                    Connect WalletConnect
                </button>
            </>
        );
    }

    return (
        <div>
            <h1>Referral Register</h1>
            {account ? <p>Account: {account}</p> : null}
            {walletConnection}
        </div>
    );
};

export default ReferralRegister;
