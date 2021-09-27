import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";

import LegalAgreement from "./LegalAgreement";

import config from "../config.json";
import abi from "../abi.json";

const BuyToken = ({ minBuyValue, maxTokenAmountPerAddress, exchangeRate }) => {
    const [paymentTokens, setPaymentTokens] = useState([]);
    const [tokenSelected, setTokenSelected] = useState("");
    const [buyValue, setBuyValue] = useState("");
    const [tokensInReturn, setTokensInReturn] = useState(0);
    const [acceptedLegualAgreement, setAcceptedLegualAgreement] =
        useState(false);
    const [tokensBought, setTokensBought] = useState("");
    const [warning, setWarning] = useState("");

    const { account, library: provider } = useWeb3React();

    useEffect(() => {
        const init = async () => {
            const contract = getContractReader(
                config.crowdsaleAddress,
                abi.crowdsale
            );
            const filter = contract.filters.PaymentCurrenciesAuthorized();
            const events = await contract.queryFilter(filter);
            const { tokens } = events[0].args;
            const test = [...tokens, "k9878adsfas8dfy"];
            setPaymentTokens(test);
            setTokenSelected(test[0]);
        };
        init();
    }, []);

    useEffect(() => {
        const init = async () => {
            const contract = getContractReader(
                config.crowdsaleAddress,
                abi.crowdsale
            );
            const tokensBought = await contract.getClaimableAmount(account);
            setTokensBought(tokensBought.toString());
        };
        init();
    }, []);

    const getContractReader = (address, abi) => {
        return new ethers.Contract(address, abi, provider);
    };

    const tokenSelectionHandler = (event) => {
        setTokenSelected(event.target.value);
    };

    const valueHandler = (event) => {
        if (warning) {
            setWarning("");
        }

        const { value } = event.target;
        let valueFloat;
        if (value === "") {
            valueFloat = 0;
        } else {
            valueFloat = parseFloat(value);
        }

        if (valueFloat < minBuyValue) {
            setWarning(`You can't buy for less that ${minBuyValue}$`);
        }

        const tokensInReturn = valueFloat * exchangeRate;

        if (tokensInReturn > maxTokenAmountPerAddress) {
            setWarning(
                `You can't buy more than ${maxTokenAmountPerAddress} tokens`
            );
        }

        setBuyValue(value);
        setTokensInReturn(tokensInReturn);
    };

    const tokenOptions = paymentTokens.map((token) => (
        <option value={token} key={token}>
            {token}
        </option>
    ));

    return (
        <div>
            {acceptedLegualAgreement ? null : (
                <LegalAgreement
                    acceptLegualAgreement={() =>
                        setAcceptedLegualAgreement(true)
                    }
                />
            )}
            <select value={tokenSelected} onChange={tokenSelectionHandler}>
                {tokenOptions}
            </select>
            <input
                value={buyValue}
                onChange={valueHandler}
                placeholder="0.0000"
            />
            <button>Buy Tokens</button>
            <p>You will get {tokensInReturn} tokens</p>
            {warning ? <p>{warning}</p> : null}
            <p>You bought {tokensBought} tokens</p>
        </div>
    );
};

export default BuyToken;
