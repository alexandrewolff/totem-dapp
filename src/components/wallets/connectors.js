import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { NetworkConnector } from "@web3-react/network-connector";

import config from "../../config.json";

let defaultChainId;
if (config.network === "mainnet") defaultChainId = 56;
else if (config.network === "testnet") defaultChainId = 97;

export const injected = new InjectedConnector({
    supportedChainIds: [defaultChainId],
});

export const walletconnect = new WalletConnectConnector({
    rpc: {
        56: "https://bsc-dataseed.binance.org/",
        97: "https://data-seed-prebsc-1-s2.binance.org:8545",
    },
});

export const network = new NetworkConnector({
    urls: {
        56: "https://bsc-dataseed.binance.org/",
        97: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    },
    defaultChainId,
});
