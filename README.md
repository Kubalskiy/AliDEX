# AliDEX - Online Marketplace on Blockchain
Final project for Consensys Academy Developer Bootcamp 2019.

I called this project AliDEX cause of great potential to be next Ali Express in decentralised world, and aslo cause its just shorter.

The projects goal is Smart contract implementation. 
UI is only to show how to interact it with smart contracts.

## Tech task:

Online Marketplace

#### Description: Create an online marketplace that operates on the blockchain and product pictures are stored in IPFS.
 
There are a list of stores on a central marketplace where shoppers can purchase goods posted by the store owners.
 
The central marketplace is managed by a group of administrators. Admins allow store owners to add stores to the marketplace. Store owners can manage their store’s inventory and funds. Shoppers can visit stores and purchase goods that are in stock using cryptocurrency.
 
User Stories:
An administrator opens the web app. The web app reads the address and identifies that the user is an admin, showing them admin only functions, such as managing store owners. An admin can grant shop owner rights for shoppers that has requested shop owner rights. Once shop owner logs into the app, they have access to the store owner functions.
 
An approved store owner logins to the Dapp. The web app recognizes their address and identifies them as a store owner. They are shown the store owner functions. They can create a new storefront that will be displayed on the marketplace. They can also see the storefronts that they have already created. They can click on a storefront to manage it. They can add/remove products to the storefront or change any of the products’ prices. They can also withdraw any funds that the store has collected from sales.
 
A shopper logs into the app. The web app does not recognize their address so they are shown the generic shopper application. From the main page they can browse all of the storefronts that have been created in the marketplace. Clicking on a storefront will take them to a product page. They can see a list of products offered by the store, including their price and quantity. Shoppers can purchase a product, which will debit their account and send it to the store. The quantity of the item in the store’s inventory will be reduced by the appropriate amount.


# Overview
There are a list of stores on a central marketplace where shoppers can purchase goods posted by the store owners.

The central marketplace is managed by a group of administrators. Admins allow store owners to add stores to the marketplace. Store owners can manage their store’s inventory and funds. Shoppers can visit stores and purchase goods that are in stock using cryptocurrency.

###Owner Features
A market owner opens the web app.
The web app reads the address and identifies that the user is an owner, showing them owner only functions.
Market owner can add new admins.
Market owner can stop the market place in case of emergency.
Admin Features
An administrator opens the web app.
The web app reads the address and identifies that the user is an admin, showing them admin only functions, such as managing store owners.
An admin adds an address to the list of approved store owners, so if the owner of that address logs into the app, they have access to the store owner functions.

### Store Owner Features
The web app recognizes their address and identifies them as a store owner.
They are shown the store owner functions.
They can create a new storefront that will be displayed on the marketplace.
They can also see the storefronts that they have already created.
They can click on a storefront to manage it.
They can add/remove products to the storefront or change any of the products’ prices.
They can also withdraw any funds that the store has collected from sales.
Shopper Features
The web app does not recognize their address so they are shown the generic shopper application.
From the main page they can browse all of the storefronts that have been created in the marketplace.
Clicking on a storefront will take them to a product page.
They can see a list of products offered by the store, including their price and quantity. Shoppers can purchase a product, which will debit their account and send it to the store.
The quantity of the item in the store’s inventory will be reduced by the appropriate amount.



## Requirements for accessing hosted project
1. Dapp browser or Metamask extension: https://metamask.io
1. Choose Ropsten testnet from browser/metamask
1. Go to http://52.59.170.91:3000

## Requirements to run project locally
1. Dapp browser or Metamask extension: https://metamask.io
1. npm - JavaScript package manager: https://www.npmjs.com/package/npm
1. Truffle (A Blockchain Development Framework): https://truffleframework.com
1. Truffle Ganache (A Private Testnet for Blockchain Development): https://truffleframework.com/ganache
1. IPFS (a global, versioned, peer-to-peer filesystem): https://github.com/ipfs/go-ipfs#install

## How to set up project:

1. First clone repository to your machine `git clone https://github.com/Kubalskiy/alidex`
1. Start ganache-cli by executing: `ganache-cli`
1. Navigate to cloned `alidex` folder
1. (Optional) Make sure that project compiles by executing: `truffle compile`
1. (Optional) Make sure that project tests are executed successfully: `truffle test`
1. Migrate contract to development environment by executing: `truffle migrate`
1. Install dependencies by executing: `cd frontend && npm install`
1. Start local server that serves UI by executing: `npm run start` 
1. UI is now available in http://localhost:3000 (remember to use Metamask or other dapp browser)
1. Import mnemonic to metamask (printed in ganache-cli's console) to access admin rights. Contract creator will be always administrator.


## How to set up IPFS node:
1. Install IPFS, e.g. https://github.com/ipfs/go-ipfs#install
1. Next you should initialize it, cmd: `ipfs init`
1. Project assumes that node configuration is default, cmd to check: `ipfs config Addresses.API` (Response should something like: /ip4/127.0.0.1/tcp/5001)
1. Enable CORS by executing cmds: `ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'` & `ipfs config --json Gateway.HTTPHeaders.Access-Control-Allow-Origin '["*"]'`
1. Finally you are ready to start IPFS daemon, cmd: `ipfs daemon`
