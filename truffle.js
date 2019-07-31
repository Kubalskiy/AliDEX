var HDWalletProvider = require("truffle-hdwallet-provider")

var mnemonic = "meadow caution enable answer canyon utility good repeat try ten road cute"
var infura = "https://ropsten.infura.io/K05mMTrbf5KLmqxZ5NrI "

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  contracts_build_directory: "./frontend/src/contracts",
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 5500000,
    },
    ropsten: {
        provider: new HDWalletProvider(mnemonic, infura),
        network_id: "3",
        gas: 5500000,
    }
  },
  solc: {
    optimizer: {
        enabled: true,
        runs: 200
    }
  }
};
