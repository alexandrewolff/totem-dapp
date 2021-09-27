import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";

import LegalAgreement from "./LegalAgreement";

import config from "../config.json";
import abi from "../abi.json";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const MAX_UINT256_VALUE =
    "115792089237316195423570985008687907853269984665640564039457584007913129639935";

const BuyToken = ({ minBuyValue, maxTokenAmountPerAddress, exchangeRate }) => {
    const [paymentTokens, setPaymentTokens] = useState([]);
    const [tokenSelected, setTokenSelected] = useState("");
    const [buyValue, setBuyValue] = useState("");
    const [tokensInReturn, setTokensInReturn] = useState(0);
    const [acceptedLegualAgreement, setAcceptedLegualAgreement] =
        useState(false);
    const [tokensBought, setTokensBought] = useState("");
    const [warning, setInfo] = useState("");

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

            const paymentTokens = [];
            for (let i = 0; i < tokens.length; i += 1) {
                const contract = new ethers.Contract(
                    tokens[i],
                    abi.erc20,
                    provider
                );
                const symbol = await contract.symbol();
                paymentTokens.push({ symbol, address: tokens[i] });
            }

            setPaymentTokens(paymentTokens);
            setTokenSelected(paymentTokens[0]);
        };
        init();
    }, []);

    useEffect(() => {
        updateTokensBought();
    }, []);

    const updateTokensBought = async () => {
        const contract = getContractReader(
            config.crowdsaleAddress,
            abi.crowdsale
        );
        const tokensBought = await contract.getClaimableAmount(account);
        setTokensBought(tokensBought.toString());
    };

    const getContractReader = (address, abi) => {
        return new ethers.Contract(address, abi, provider);
    };

    const tokenSelectionHandler = (event) => {
        setTokenSelected(event.target.value);
    };

    const valueHandler = (event) => {
        if (warning) {
            setInfo("");
        }

        const { value } = event.target;
        let valueFloat;
        if (value === "") {
            valueFloat = 0;
        } else {
            valueFloat = parseFloat(value);
        }

        if (valueFloat < minBuyValue) {
            setInfo(`You can't buy for less that ${minBuyValue}$`);
        }

        const tokensInReturn = valueFloat * exchangeRate;

        if (tokensInReturn > maxTokenAmountPerAddress) {
            setInfo(
                `You can't buy more than ${maxTokenAmountPerAddress} tokens`
            );
        }

        setBuyValue(value);
        setTokensInReturn(tokensInReturn);
    };

    const approveHandler = async () => {
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
            tokenSelected.address,
            abi.erc20,
            signer
        );

        try {
            await contract.approve(config.crowdsaleAddress, MAX_UINT256_VALUE);
            displayInfo("Approval successfull");
        } catch (err) {
            console.error(err);
            displayInfo("Transaction failed");
        }
    };

    const buyHandler = async () => {
        if (buyValue === "") {
            return;
        } else if (!acceptedLegualAgreement) {
            displayInfo(
                "You need to accept legal agreement in order to buy tokens"
            );
            return;
        }

        const signer = provider.getSigner();
        const contract = new ethers.Contract(
            config.crowdsaleAddress,
            abi.crowdsale,
            signer
        );

        try {
            await contract.buyToken(
                tokenSelected.address,
                buyValue,
                ZERO_ADDRESS
            );
            setBuyValue("");
            updateTokensBought();
            displayInfo("Tokens successfully bought");
        } catch (err) {
            console.error(err);
            displayInfo("Transaction failed");
        }
    };

    const displayInfo = (info) => {
        setInfo(info);
        setTimeout(() => {
            setInfo("");
        }, 3000);
    };

    const tokenOptions = paymentTokens.map((token) => (
        <option value={token.address} key={token.address}>
            {token.symbol}
        </option>
    ));

    let display = <p>Loading...</p>;
    if (tokenSelected) {
        display = (
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
                <button onClick={approveHandler}>
                    Approve {tokenSelected.symbol}
                </button>
                <button onClick={buyHandler}>Buy Tokens</button>
                <p>You will get {tokensInReturn} tokens</p>
                {warning ? <p>{warning}</p> : null}
                <p>You bought {tokensBought} tokens</p>
            </div>
        );
    }

    return <>{display}</>;
};

export default BuyToken;
