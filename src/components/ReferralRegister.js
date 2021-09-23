import React, { useState } from "react";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { injected, walletconnect } from "./wallets/connectors";
import { ethers } from "ethers";

import config from "../config.json";
import abi from "../abi.json";

const ReferralRegister = () => {
    const [info, setInfo] = useState("");
    const {
        activate,
        deactivate,
        account,
        active,
        error,
        library: provider,
    } = useWeb3React();

    const connect = async (connector) => {
        try {
            await activate(connector);
        } catch (err) {
            console.error(err);
        }
    };

    const registerHandler = async () => {
        const contract = getContract();
        if (await isAlreadyReferral(contract))
            return displayInfo("Account already registered as referral");
        await tryRegisterTx(contract);
    };

    const getContract = () => {
        const signer = provider.getSigner();
        return new ethers.Contract(
            config.crowdsaleAddress,
            abi.crowdsale,
            signer
        );
    };

    const isAlreadyReferral = async (contract) => {
        return await contract.isReferral(account);
    };

    const displayInfo = (info) => {
        setInfo(info);
        setTimeout(() => {
            setInfo("");
        }, 3000);
    };

    const tryRegisterTx = async (contract) => {
        try {
            await sendRegisterTx(contract);
            displayInfo("Account successfully registered as referral");
        } catch (err) {
            console.error(err);
            displayInfo("Transaction failed");
        }
    };

    const sendRegisterTx = async (contract) => {
        const tx = await contract.registerAsReferral();
        await tx.wait();
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
                    <button onClick={() => connect(injected)}>
                        Connect Metamask
                    </button>
                ) : null}
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
