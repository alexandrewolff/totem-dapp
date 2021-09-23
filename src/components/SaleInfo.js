import React from "react";
import { ethers } from "ethers";

const SaleInfo = ({ saleSettings, tokensAtSale, tokensSold, txError }) => {
    let saleInfo = txError ? <p>{txError}</p> : <p>Loading...</p>;
    if (saleSettings && tokensAtSale && tokensSold) {
        saleInfo = (
            <div>
                <p>
                    Sale start:{" "}
                    {new Date(
                        saleSettings.saleStart.toNumber() * 1000
                    ).toDateString()}
                </p>
                <p>
                    Sale end:{" "}
                    {new Date(
                        saleSettings.saleEnd.toNumber() * 1000
                    ).toDateString()}
                </p>
                <p>
                    Tokens at sale:{" "}
                    {tokensAtSale
                        ? ethers.utils.formatEther(tokensAtSale)
                        : null}
                </p>
                <p>
                    Tokens sold:{" "}
                    {tokensSold ? ethers.utils.formatEther(tokensSold) : null}
                </p>
                <p>
                    Price per token: {1 / saleSettings.exchangeRate.toNumber()}$
                </p>
            </div>
        );
    }

    return saleInfo;
};

export default SaleInfo;
