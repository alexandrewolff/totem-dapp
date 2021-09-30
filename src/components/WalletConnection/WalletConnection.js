import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";

import { injected, walletconnect } from "../../utils/walletConnectors";

const WalletConnection = () => {
    const { activate, deactivate, account, error } = useWeb3React();

    const connectHandler = async (connector) => {
        try {
            await activate(connector);
        } catch (err) {
            console.error(err);
        }
    };

    let walletConnection;
    const isUnsupportedChainIdError = error instanceof UnsupportedChainIdError;
    if (account || isUnsupportedChainIdError) {
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
                    <button onClick={() => connectHandler(injected)}>
                        Connect Metamask
                    </button>
                ) : null}
                <button onClick={() => connectHandler(walletconnect)}>
                    Connect WalletConnect
                </button>
            </div>
        );
    }

    return walletConnection;
};

export default WalletConnection;
