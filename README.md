# Totem dApp

## How to import the components

### Install the following packages

-   @web3-react/core 6.1.9
-   @web3-react/injected-connector 6.0.7
-   @web3-react/network-connector 6.1.9
-   @web3-react/walletconnect-connector 6.2.4
-   ethers 5.4.7
-   js-cookie 3.0.1

### Copy configuration file

Copy the config.json file at the root of your src file

### Initialize the app for web3-react usage

As done in the App component, go to your root component and:

-   Import Web3ReactProvider, NetworkConnector & ethers
-   Import the config file
-   Copy paste the getLibrary function
-   Wrap your return into the Web3ReactProvider HOC, providing the getLibrary function as a prop
-   Provide the address of the crowdsale contract as a prop to the components that need it

### Import the components and the utils folders in your project

You might have to edit the import paths
