import { useState, useEffect, useCallback } from "react";
import { useWeb3React } from "@web3-react/core";

import Loader from "../UI/Loader";
import WalletConnection from "../WalletConnection/WalletConnection";
import SaleInfo from "./SaleInfo/SaleInfo";
import BuyToken from "./BuyToken/BuyToken";
import WithdrawToken from "./WithdrawToken/WithdrawToken";

import {
    formatTimestamp,
    getCrowdsaleContract,
    getErc20Contract,
} from "../../utils/utils";
import { network } from "../../utils/walletConnectors";

const Sale = ({ crowdsaleAddress }) => {
    const [saleSettings, setSaleSettings] = useState(undefined);
    const [tokensAtSale, setTokensAtSale] = useState(undefined);
    const [tokensSold, setTokensSold] = useState(undefined);
    const [updateRequired, setUpdateRequired] = useState(true);
    const [readError, setReadError] = useState("");

    const {
        activate,
        account,
        active,
        error,
        library: provider,
    } = useWeb3React();

    useEffect(() => {
        const activateNetwork = async () => {
            await activate(network);
        };
        if (!active && !error) {
            activateNetwork();
        }
    }, [active, error, activate]);

    const getSaleInfo = useCallback(async () => {
        const crowdsaleContract = getCrowdsaleContract(provider);
        const saleSettings = await tryReadTx(crowdsaleContract.getSaleSettings);
        const tokensSold = await tryReadTx(crowdsaleContract.getSoldAmount);
        const tokenContract = getErc20Contract(saleSettings.token, provider);
        const tokensAtSale = await tryReadTx(() =>
            tokenContract.balanceOf(crowdsaleAddress)
        );
        return { saleSettings, tokensSold, tokensAtSale };
    }, [provider, crowdsaleAddress]);

    useEffect(() => {
        const fetchContractInfo = async () => {
            const { saleSettings, tokensSold, tokensAtSale } =
                await getSaleInfo();
            setSaleSettings(saleSettings);
            setTokensAtSale(tokensAtSale);
            setTokensSold(tokensSold);
            setUpdateRequired(false);
        };
        if (provider && updateRequired) {
            fetchContractInfo();
        }
    }, [provider, updateRequired, getSaleInfo]);

    const tryReadTx = async (call) => {
        try {
            return await call();
        } catch (err) {
            console.error(err);
            setReadError("Transaction failed");
        }
    };

    // const now = Math.floor(new Date() / 1000);
    const now = 2;

    let display;
    if (!saleSettings || !tokensAtSale || !tokensSold) {
        display = <Loader />;
    } else if (now < saleSettings.saleStart) {
        display = readError ? (
            <p>{readError}</p>
        ) : (
            <SaleInfo
                saleSettings={saleSettings}
                tokensAtSale={tokensAtSale}
                tokensSold={tokensSold}
            />
        );
    } else if (now < saleSettings.saleEnd) {
        display = (
            <div>
                <SaleInfo
                    saleSettings={saleSettings}
                    tokensAtSale={tokensAtSale}
                    tokensSold={tokensSold}
                />
                <WalletConnection />
                {account ? (
                    <BuyToken
                        crowdsaleAddress={crowdsaleAddress}
                        minBuyValue={saleSettings.minBuyValue}
                        maxTokenAmountPerAddress={
                            saleSettings.maxTokenAmountPerAddress
                        }
                        exchangeRate={saleSettings.exchangeRate}
                    />
                ) : null}
            </div>
        );
    } else if (now < saleSettings.withdrawalStart) {
        display = (
            <p>
                Sale ended. You can start to claim your tokens from{" "}
                {formatTimestamp(saleSettings.withdrawalStart)}
            </p>
        );
    } else {
        display = (
            <div>
                <WalletConnection />
                {account ? (
                    <WithdrawToken
                        crowdsaleAddress={crowdsaleAddress}
                        now={now}
                        withdrawalStart={saleSettings.withdrawalStart}
                        withdrawPeriodDuration={
                            saleSettings.withdrawPeriodDuration
                        }
                        withdrawPeriodNumber={saleSettings.withdrawPeriodNumber}
                    />
                ) : null}
            </div>
        );
    }

    return (
        <div>
            <h1>Totem Token Sale</h1>
            {display}
        </div>
    );
};

export default Sale;
