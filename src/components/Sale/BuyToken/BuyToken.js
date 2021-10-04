import { useState, useEffect, useCallback } from "react";
import { useWeb3React } from "@web3-react/core";
import Cookies from "js-cookie";

import Loader from "../../UI/Loader";
import LegalAgreement from "./LegalAgreement/LegalAgreement";

import {
    getDefaultChainId,
    displayInfo,
    formatTokenAmount,
    parseTokenAmount,
    getCrowdsaleContract,
    getErc20Contract,
    tryReadTx,
    tryTransaction,
} from "../../../utils/utils";
import { ZERO_ADDRESS, MAX_UINT256_VALUE } from "../../../utils/constants";

const BuyToken = ({
    crowdsaleAddress,
    minBuyValue,
    maxTokenAmountPerAddress,
    exchangeRate,
}) => {
    const [signer, setSigner] = useState(undefined);
    const [paymentTokens, setPaymentTokens] = useState([]);
    const [tokenToSymbol, setTokenToSymbol] = useState(new Map());
    const [tokenSelected, setTokenSelected] = useState("");
    const [buyValue, setBuyValue] = useState("");
    const [tokensInReturn, setTokensInReturn] = useState(0);
    const [tokensBought, setTokensBought] = useState("");
    const [acceptedLegualAgreement, setAcceptedLegualAgreement] =
        useState(false);
    const [info, setInfo] = useState("");
    const [readError, setReadError] = useState("");

    const { account, library: provider, chainId } = useWeb3React();

    const extractTokensFromEvents = (events) => {
        const tokenSet = new Set();
        events.forEach((event) => {
            event.args.tokens.forEach((token) => tokenSet.add(token));
        });
        return Array.from(tokenSet);
    };

    const fetchPaymentTokens = useCallback(async (contract) => {
        const filter = contract.filters.PaymentCurrenciesAuthorized();
        const events = await contract.queryFilter(filter);
        return extractTokensFromEvents(events);
    }, []);

    const fetchTokenSymbol = useCallback(
        async (token) => {
            const contract = getErc20Contract(token, provider);
            return await contract.symbol();
        },
        [provider]
    );

    const getTokenToSymbol = useCallback(
        async (tokens) => {
            const tokenToSymbol = new Map();
            for (let i = 0; i < tokens.length; i += 1) {
                const symbol = await fetchTokenSymbol(tokens[i]);
                tokenToSymbol.set(tokens[i], symbol);
            }
            return tokenToSymbol;
        },
        [fetchTokenSymbol]
    );

    useEffect(() => {
        const init = async () => {
            const contract = getCrowdsaleContract(provider);
            const paymentTokens = await fetchPaymentTokens(contract);
            const tokenToSymbol = await getTokenToSymbol(paymentTokens);

            setPaymentTokens(paymentTokens);
            setTokenSelected(paymentTokens[0]);
            setTokenToSymbol(tokenToSymbol);
        };
        init();
    }, [provider, fetchPaymentTokens, getTokenToSymbol]);

    const updateTokensBought = useCallback(async () => {
        const contract = getCrowdsaleContract(provider);
        const tokensBought = await tryReadTx(
            () => contract.getClaimableAmount(account),
            setReadError
        );
        setTokensBought(tokensBought.toString());
    }, [provider, account]);

    useEffect(() => {
        setSigner(provider.getSigner());
        updateTokensBought();
    }, [account, provider, updateTokensBought]);

    const resetInfo = () => {
        if (info) {
            setInfo("");
        }
    };

    const parseStringToFloat = (value) => {
        if (value === "") {
            return 0;
        } else {
            return parseFloat(value);
        }
    };

    const checkMinBuyValue = (value) => {
        if (value < minBuyValue) {
            setInfo(`You can't buy for less that ${minBuyValue}$`);
        }
    };

    const checkMaxTokenAmountPerAddress = (tokensInReturn) => {
        if (tokensInReturn > maxTokenAmountPerAddress) {
            setInfo(
                `You can't buy more than ${maxTokenAmountPerAddress} tokens`
            );
        }
    };

    const valueChangeHandler = ({ target }) => {
        resetInfo();

        const { value } = target;

        let valueFloat = parseStringToFloat(value);
        checkMinBuyValue(valueFloat);

        const tokensInReturn = valueFloat * exchangeRate;
        checkMaxTokenAmountPerAddress(tokensInReturn);

        setBuyValue(value);
        setTokensInReturn(tokensInReturn);
    };

    const sendApproveTx = async () => {
        const contract = getErc20Contract(tokenSelected, signer);
        const tx = await contract.approve(crowdsaleAddress, MAX_UINT256_VALUE);
        await tx.wait();
    };

    const approveHandler = async () => {
        await tryTransaction(sendApproveTx, setInfo, "Approval successfull");
    };

    const checkBuyValue = () => {
        if (buyValue === "") {
            return false;
        }
        return true;
    };

    const checkAcceptedLegualAgreement = () => {
        if (!acceptedLegualAgreement) {
            displayInfo(
                setInfo,
                "You need to accept legal agreement in order to buy tokens"
            );
            return false;
        }
        return true;
    };

    const sendBuyTokenTx = async () => {
        const contract = getCrowdsaleContract(signer);
        const parsedBuyValue = parseTokenAmount(buyValue);
        const referral = Cookies.get("referral");
        const referralOrZero = referral ? referral : ZERO_ADDRESS;
        const tx = await contract.buyToken(
            tokenSelected,
            parsedBuyValue,
            referralOrZero
        );
        await tx.wait();
    };

    const buyHandler = async () => {
        if (!checkBuyValue()) return;
        if (!checkAcceptedLegualAgreement()) return;

        await tryTransaction(
            sendBuyTokenTx,
            setInfo,
            "Tokens successfully bought"
        );

        setBuyValue("");
        setTokensInReturn(0);
        updateTokensBought();
    };

    const tokenOptions = paymentTokens.map((token) => {
        return (
            <option value={token} key={token}>
                {tokenToSymbol.get(token)}
            </option>
        );
    });

    const defaultChainId = getDefaultChainId();

    let display = <Loader />;
    if (chainId !== defaultChainId) {
        display = <p>Please switch to Binance Smart Chain</p>;
    } else if (tokenSelected) {
        display = (
            <div>
                {acceptedLegualAgreement ? null : (
                    <LegalAgreement
                        acceptLegualAgreement={() =>
                            setAcceptedLegualAgreement(true)
                        }
                    />
                )}
                <select
                    value={tokenSelected}
                    onChange={({ target }) => setTokenSelected(target.value)}
                >
                    {tokenOptions}
                </select>
                <input
                    value={buyValue}
                    onChange={valueChangeHandler}
                    placeholder="0.0000"
                />
                <button onClick={approveHandler}>
                    Approve {tokenToSymbol.get(tokenSelected)}
                </button>
                <button onClick={buyHandler}>Buy Tokens</button>
                <p>You will get {tokensInReturn} tokens</p>
                {info ? <p>{info}</p> : null}
                {readError ? (
                    <p>{readError}</p>
                ) : (
                    <p>
                        You can claim {formatTokenAmount(tokensBought)} tokens
                    </p>
                )}
            </div>
        );
    }

    return <div>{display}</div>;
};

export default BuyToken;
