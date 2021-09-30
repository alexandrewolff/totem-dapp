import React, { useState } from "react";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { ethers } from "ethers";

import WalletConnection from "../WalletConnection/WalletConnection";

import abi from "../../abi.json";

const ReferralRegister = ({ crowdsaleAddress }) => {
    const [info, setInfo] = useState("");
    const {
        activate,
        deactivate,
        account,
        active,
        error,
        library: provider,
    } = useWeb3React();

    const registerHandler = async () => {
        const contract = getContractWriter();
        if (await isAlreadyReferral(contract))
            return displayInfo("Account already registered as referral");
        await tryRegisterTx(contract);
    };

    const getContractWriter = () => {
        const signer = provider.getSigner();
        return new ethers.Contract(crowdsaleAddress, abi.crowdsale, signer);
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

    let register;
    if (account) {
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
            <WalletConnection />
            {register}
        </div>
    );
};

export default ReferralRegister;
