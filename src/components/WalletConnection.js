import React from "react";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { injected, walletconnect } from "./wallets/connectors";

const WalletConnection = () => {
    const { activate, deactivate, account, active, error } = useWeb3React();

    const connect = async (activate, connector) => {
        try {
            await activate(connector);
        } catch (err) {
            console.error(err);
        }
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
                {window.ethereum ? (
                    <button onClick={() => connect(activate, injected)}>
                        Connect Metamask
                    </button>
                ) : null}
                <button onClick={() => connect(activate, walletconnect)}>
                    Connect WalletConnect
                </button>
            </div>
        );
    }

    return walletConnection;
};

export default WalletConnection;