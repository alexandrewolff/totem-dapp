import Sale from "./components/Sale";
import { NetworkConnector } from "@web3-react/network-connector";

import ReferralRegister from "./components/ReferralRegister";
import { Web3ReactProvider } from "@web3-react/core";
import { ethers } from "ethers";
// import Web3 from "web3";

const getLibrary = (provider, connector) => {
    // return new Web3(provider);
    if (connector instanceof NetworkConnector) {
        return new ethers.providers.JsonRpcProvider(provider);
    }
    return new ethers.providers.Web3Provider(provider);
};

function App() {
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <div className="App">
                <ReferralRegister />
                {/* <Sale /> */}
            </div>
        </Web3ReactProvider>
    );
}

export default App;
