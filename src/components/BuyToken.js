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
    const [signer, setSigner] = useState(undefined);
    const [paymentTokens, setPaymentTokens] = useState([]);
    const [tokenToSymbol, setTokenToSymbol] = useState(new Map());
    const [tokenSelected, setTokenSelected] = useState("");
    const [buyValue, setBuyValue] = useState("");
    const [tokensInReturn, setTokensInReturn] = useState(0);
    const [acceptedLegualAgreement, setAcceptedLegualAgreement] =
        useState(false);
    const [tokensBought, setTokensBought] = useState("");
    const [info, setInfo] = useState("");

    const { account, library: provider, chainId, error } = useWeb3React();

    useEffect(() => {
        const init = async () => {
            const contract = getContractReader(
                config.crowdsaleAddress,
                abi.crowdsale
            );
            const filter = contract.filters.PaymentCurrenciesAuthorized();
            const events = await contract.queryFilter(filter);
            const { tokens } = events[0].args;

            for (let i = 0; i < tokens.length; i += 1) {
                const contract = new ethers.Contract(
                    tokens[i],
                    abi.erc20,
                    provider
                );
                const symbol = await contract.symbol();
                setTokenToSymbol((prev) =>
                    new Map(prev).set(tokens[i], symbol)
                );
            }

            setPaymentTokens(tokens);
            setTokenSelected(tokens[0]);
        };
        init();
    }, []);

    useEffect(() => {
        const signer = provider.getSigner();
        setSigner(signer);
        updateTokensBought();
    }, [account]);

    const updateTokensBought = async () => {
        const contract = getContractReader(
            config.crowdsaleAddress,
            abi.crowdsale
        );
        let tokensBought;
        try {
            tokensBought = await contract.getClaimableAmount(account);
        } catch (err) {
            console.error(err);
            return;
        }
        setTokensBought(tokensBought.toString());
    };

    const getContractReader = (address, abi) => {
        return new ethers.Contract(address, abi, provider);
    };

    const tokenSelectionHandler = (event) => {
        setTokenSelected(event.target.value);
    };

    const valueHandler = (event) => {
        if (info) {
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
        const contract = new ethers.Contract(tokenSelected, abi.erc20, signer);

        try {
            const tx = await contract.approve(
                config.crowdsaleAddress,
                MAX_UINT256_VALUE
            );
            await tx.wait();
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

        const contract = new ethers.Contract(
            config.crowdsaleAddress,
            abi.crowdsale,
            signer
        );

        const parsedBuyValue = ethers.utils.parseUnits(buyValue, 18);
        try {
            const tx = await contract.buyToken(
                tokenSelected,
                parsedBuyValue,
                ZERO_ADDRESS
            );
            await tx.wait();
            setBuyValue("");
            setTokensInReturn(0);
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

    const tokenOptions = paymentTokens.map((token) => {
        return (
            <option value={token} key={token}>
                {tokenToSymbol.get(token)}
            </option>
        );
    });

    let defaultChainId;
    if (config.network === "mainnet") defaultChainId = 56;
    else if (config.network === "testnet") defaultChainId = 97;

    let display = <p>Loading...</p>;
    if (chainId !== defaultChainId) {
        display = <p>Please switch to Binance Smart Chain</p>;
    } else if (tokenSelected) {
        display = (
            <>
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
                {info ? <p>{info}</p> : null}
                <p>
                    You bought {ethers.utils.formatUnits(tokensBought, 18)}{" "}
                    tokens
                </p>
            </>
        );
    }

    return <div>{display}</div>;
};

export default BuyToken;
