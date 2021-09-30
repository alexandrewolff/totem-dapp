import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { NetworkConnector } from "@web3-react/network-connector";

import { getDefaultChainId } from "./utils";
import config from "../config.json";

const defaultChainId = getDefaultChainId();

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
