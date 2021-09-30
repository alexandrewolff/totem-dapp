import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";

import WalletConnection from "../WalletConnection/WalletConnection";

import { getCrowdsaleContract, displayInfo } from "../../utils/utils";

const ReferralRegister = () => {
    const [signer, setSigner] = useState(undefined);
    const [info, setInfo] = useState("");

    const { account, library: provider } = useWeb3React();

    useEffect(() => {
        if (!provider) return;
        const signer = provider.getSigner();
        setSigner(signer);
    }, [account, provider]);

    const registerHandler = async () => {
        const contract = getCrowdsaleContract(signer);
        if (await isAlreadyReferral(contract))
            return displayInfo(
                setInfo,
                "Account already registered as referral"
            );
        await tryRegisterTx(contract);
    };

    const isAlreadyReferral = async (contract) => {
        return await contract.isReferral(account);
    };

    const tryRegisterTx = async (contract) => {
        try {
            await sendRegisterTx(contract);
            displayInfo(setInfo, "Account successfully registered as referral");
        } catch (err) {
            console.error(err);
            displayInfo(setInfo, "Transaction failed");
        }
    };

    const sendRegisterTx = async (contract) => {
        const tx = await contract.registerAsReferral();
        await tx.wait();
    };

    let display;
    if (account) {
        display = (
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
            {display}
        </div>
    );
};

export default ReferralRegister;
