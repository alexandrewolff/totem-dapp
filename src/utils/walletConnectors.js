import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { NetworkConnector } from "@web3-react/network-connector";

import config from "../config.json";

let defaultChainId;
if (config.network === "mainnet") defaultChainId = 56;
else if (config.network === "testnet") defaultChainId = 97;

export const injected = new InjectedConnector({
    supportedChainIds: [defaultChainId],
});

export const walletconnect = new WalletConnectConnector({
    rpc: {
        56: config.bsc_mainnet_endpoint,
        97: config.bsc_testnet_endpoint,
    },
});

export const network = new NetworkConnector({
    urls: {
        56: config.bsc_mainnet_endpoint,
        97: config.bsc_testnet_endpoint,
    },
    defaultChainId,
});
