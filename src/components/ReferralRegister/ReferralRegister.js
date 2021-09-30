import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";

import WalletConnection from "../WalletConnection/WalletConnection";

import {
    getCrowdsaleContract,
    displayInfo,
    tryTransaction,
} from "../../utils/utils";

const ReferralRegister = () => {
    const [signer, setSigner] = useState(undefined);
    const [info, setInfo] = useState("");

    const { account, library: provider } = useWeb3React();

    useEffect(() => {
        if (!provider) return;
        const signer = provider.getSigner();
        setSigner(signer);
    }, [account, provider]);

    const isAlreadyReferral = async () => {
        const contract = getCrowdsaleContract(provider);
        return await contract.isReferral(account);
    };

    const checkIfAlreadyReferral = async () => {
        if (await isAlreadyReferral()) {
            displayInfo(setInfo, "Account already registered as referral");
            return false;
        }
        return true;
    };

    const sendRegisterTx = async () => {
        const contract = getCrowdsaleContract(signer);
        const tx = await contract.registerAsReferral();
        await tx.wait();
    };

    const registerHandler = async () => {
        if (!(await checkIfAlreadyReferral())) return;
        await tryTransaction(
            sendRegisterTx,
            setInfo,
            "Account successfully registered as referral"
        );
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
