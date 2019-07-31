var Alidex = artifacts.require("./Alidex.sol");
var StringUtil = artifacts.require("./StringUtil.sol");

module.exports = function(deployer) {
  // deploy library and link it to Alidex which
  // is the main contract.
  deployer.deploy(StringUtil);
  deployer.link(StringUtil, Alidex);
  // Alidex inherits from AlidexSecurity
  // so deploying Alidex is enough
  deployer.deploy(Alidex);
};
