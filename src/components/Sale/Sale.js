import { useState, useEffect, useCallback } from "react";
import { useWeb3React } from "@web3-react/core";
import Cookies from "js-cookie";

import Loader from "../UI/Loader";
import WalletConnection from "../WalletConnection/WalletConnection";
import SaleInfo from "./SaleInfo/SaleInfo";
import BuyToken from "./BuyToken/BuyToken";
import WithdrawToken from "./WithdrawToken/WithdrawToken";

import { formatTimestamp, getCrowdsaleContract } from "../../utils/utils";
import { network } from "../../utils/walletConnectors";

const Sale = ({ crowdsaleAddress }) => {
    const [saleSettings, setSaleSettings] = useState(undefined);
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

    const getReferral = () => {
        const url = window.location.href;
        const path = url.split("/");
        return path[path.length - 1];
    };

    useEffect(() => {
        const referral = getReferral();
        if (referral) {
            Cookies.set("referral", referral, { expires: 365 });
        }
    }, []);

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
        return { saleSettings, tokensSold };
    }, [provider]);

    useEffect(() => {
        const fetchContractInfo = async () => {
            const { saleSettings, tokensSold } = await getSaleInfo();
            setSaleSettings(saleSettings);
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

    const now = Math.floor(new Date() / 1000);
    let thereAreTokensLeft = true;
    if (saleSettings.amountToSell && tokensSold) {
        thereAreTokensLeft = !saleSettings.amountToSell.sub(tokensSold).eq(0);
    }

    let display;
    if (!saleSettings || !saleSettings.amountToSell || !tokensSold) {
        display = <Loader />;
    } else if (now < saleSettings.saleStart) {
        display = readError ? (
            <p>{readError}</p>
        ) : (
            <SaleInfo
                saleSettings={saleSettings}
                tokensAtSale={saleSettings.amountToSell}
                tokensSold={tokensSold}
            />
        );
    } else if (now < saleSettings.saleEnd && thereAreTokensLeft) {
        display = (
            <div>
                <SaleInfo
                    saleSettings={saleSettings}
                    tokensAtSale={saleSettings.amountToSell}
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
                        updateSaleSettings={() => setUpdateRequired(true)}
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
