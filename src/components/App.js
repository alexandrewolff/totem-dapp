import { Web3ReactProvider } from "@web3-react/core";
import { NetworkConnector } from "@web3-react/network-connector";
import { ethers } from "ethers";

import ReferralRegister from "./ReferralRegister/ReferralRegister";
import Sale from "./Sale/Sale";

import config from "../config.json";

const getLibrary = (provider, connector) => {
    if (connector instanceof NetworkConnector) {
        return new ethers.providers.JsonRpcProvider(provider);
    }
    return new ethers.providers.Web3Provider(provider);
};

function App() {
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <div className="App">
                <ReferralRegister crowdsaleAddress={config.crowdsaleAddress} />
                <Sale crowdsaleAddress={config.crowdsaleAddress} />
            </div>
        </Web3ReactProvider>
    );
}

export default App;
