import {
    formatTimestamp,
    formatTokenAmount,
    computePricePerToken,
} from "../../../utils/utils";

const SaleInfo = ({ saleSettings, tokensAtSale, tokensSold }) => {
    return (
        <div>
            <p>Sale start: {formatTimestamp(saleSettings.saleStart)}</p>
            <p>Sale end: {formatTimestamp(saleSettings.saleEnd)}</p>
            <p>Tokens at sale: {formatTokenAmount(tokensAtSale)}</p>
            <p>Tokens sold: {formatTokenAmount(tokensSold)}</p>
            <p>
                Price per token:{" "}
                {computePricePerToken(saleSettings.exchangeRate)}$
            </p>
        </div>
    );
};

export default SaleInfo;
