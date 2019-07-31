import {TestsHelper} from './helper';

const Alidex = artifacts.require("./Alidex.sol");

/**
 * Tests for admin or store owner
 */
contract("Alidex", accounts => {

    const owner = accounts[0];
    const storeOwner = accounts[1];
    const buyer = accounts[2];

    // Address that creates contract should be granted with admin rights.
    // This way we ensure that creator has access to admin functionality.
    it("Contract owner should be admin", async () => {
        const alidexInstance = await Alidex.deployed();

        const userStatus = await alidexInstance.getUserStatus.call(owner);

        assert.equal(parseInt(userStatus), 2, "Contract owner should always be admin");
    });

    // Admin should be able to give shop owner and admin rights for user. User needs
    // to request shop owner rights first. This way we ensure that there will
    // sellers in the alidex.
    it("Admin can grant rights for store owners", async () => {
        const alidexInstance = await Alidex.deployed();

        await alidexInstance.requestStoreOwnerStatus({from: storeOwner});
        await alidexInstance.addStoreOwner(storeOwner, {from: owner});

        const userStatus = await alidexInstance.getUserStatus.call(storeOwner);
        assert.equal(parseInt(userStatus), 1, "Store owner status in not granted for user");

        await alidexInstance.addAdmin(storeOwner, {from: owner});
        const adminStatus = await alidexInstance.getUserStatus.call(storeOwner);
        assert.equal(parseInt(adminStatus), 2, "Admin status in not granted for user");

    });

    // Users with "Store owner" or "Admin" status should be able to add new storefronts and
    // remove them. In storefront removal process last storefront is moved to replace storefront that is
    // removed and then count will be decreased. So storefront index will be changing. Replacement
    // is done to safe gas costs. Admin may also want to sell something.
    it("Store owner and admin can add and remove storefronts", async () => {
        const alidexInstance = await Alidex.new();

        await alidexInstance.requestStoreOwnerStatus({from: storeOwner});
        await alidexInstance.addStoreOwner(storeOwner, {from: owner});

        const storeFrontName1 = "Fruit store";
        const storeFrontName2 = "Weapon store";
        const storeFrontName3 = "Game store";

        await alidexInstance.addStorefront(storeFrontName1, {from: storeOwner});
        await alidexInstance.addStorefront(storeFrontName2, {from: storeOwner});
        await alidexInstance.addStorefront(storeFrontName3, {from: storeOwner});

        await alidexInstance.addStorefront(storeFrontName1, {from: owner});

        const storeFrontsBeforeRemoval = await alidexInstance.getStorefronts.call(storeOwner, {from: storeOwner});
        const storefrontsNamesBeforeRemoval = TestsHelper.convertToStringArray(storeFrontsBeforeRemoval[0]);

        assert.equal(parseInt(storeFrontsBeforeRemoval[1].length), 3, "Storefront count for store owner should be 3");
        assert.equal(storefrontsNamesBeforeRemoval[0], storeFrontName1, "Product name should match");
        assert.equal(storefrontsNamesBeforeRemoval[1], storeFrontName2, "Product name should match");
        assert.equal(storefrontsNamesBeforeRemoval[2], storeFrontName3, "Product name should match");

        const adminsStoreFrontsBeforeRemoval = await alidexInstance.getStorefronts.call(owner, {from: owner});
        assert.equal(parseInt(adminsStoreFrontsBeforeRemoval[1].length), 1, "Storefront count for admin should be 1");

        await alidexInstance.removeStorefront(owner, 0);
        await alidexInstance.removeStorefront(storeOwner, 0);

        const storeFrontsAfterRemoval = await alidexInstance.getStorefronts.call(storeOwner, {from: storeOwner});
        const storefrontsNamesAfterRemoval = TestsHelper.convertToStringArray(storeFrontsAfterRemoval[0]);

        assert.equal(parseInt(storeFrontsAfterRemoval[1].length), 2, "Storefront count for store owner should be 2");
        assert.equal(storefrontsNamesAfterRemoval[0], storeFrontName3, "Product name should match");
        assert.equal(storefrontsNamesAfterRemoval[1], storeFrontName2, "Product name should match");

        const adminsStoreFrontsAfterRemoval = await alidexInstance.getStorefronts.call(owner, {from: owner});
        assert.equal(parseInt(adminsStoreFrontsAfterRemoval[1].length), 0, "Storefront count for admin should be 0 after removal");
    });

    // Store owner should be able add remove products. In product removal process last product
    // is moved to replace product that is removed and then count will be decreased. So product index
    // will be changing. Replacement is done to safe gas costs. Products should be able
    // fetch with one query to avoid multiple queries. Names will be returned as bytes,
    // prices and quantities in arrays.
    it("Add and remove products", async () => {
        const alidexInstance = await Alidex.new();

        await alidexInstance.requestStoreOwnerStatus({from: storeOwner});
        await alidexInstance.addStoreOwner(storeOwner, {from: owner});

        const storeFrontName = "Fruit store";
        await alidexInstance.addStorefront(storeFrontName, {from: storeOwner});

        const storefronts = await alidexInstance.getStorefronts(storeOwner, {from: storeOwner});
        const count = storefronts[1].length;
        const lastIndex = parseInt(count) - 1;
        const productName1 = "One";
        const productName2 = "Two";
        const productName3 = "Three";

        const price = web3.utils.toWei("1", "ether");
        const quantity = 1;

        await alidexInstance.addProductToStoreFront(lastIndex, productName1, price, quantity, {from: storeOwner});
        await alidexInstance.addProductToStoreFront(lastIndex, productName2, price, quantity, {from: storeOwner});
        await alidexInstance.addProductToStoreFront(lastIndex, productName3, price, quantity, {from: storeOwner});

        const productsBeforeRemoval = await alidexInstance.getAllProductsFromStorefront(storeOwner, lastIndex, {from: storeOwner});
        const productNamesBeforeRemoval = TestsHelper.convertToStringArray(productsBeforeRemoval[0]);

        assert.equal(productNamesBeforeRemoval.length, 3, "Product count doesn't match");
        assert.equal(productNamesBeforeRemoval[0], productName1, "Product name should match");
        assert.equal(parseInt(productsBeforeRemoval[1][0]), price, "Product price should match");
        assert.equal(productNamesBeforeRemoval[1], productName2, "Product name should match");
        assert.equal(parseInt(productsBeforeRemoval[1][1]), price, "Product price should match");
        assert.equal(productNamesBeforeRemoval[2], productName3, "Product name should match");
        assert.equal(parseInt(productsBeforeRemoval[1][2]), price, "Product price should match");

        await alidexInstance.removeProductFromStorefront(storeOwner, lastIndex, 0, {from: storeOwner});

        const productsAfterRemoval = await alidexInstance.getAllProductsFromStorefront(storeOwner, lastIndex, {from: storeOwner});
        const productNamesAfterRemoval = TestsHelper.convertToStringArray(productsAfterRemoval[0]);

        assert.equal(productNamesAfterRemoval.length, 2, "Product count doesn't match");
        assert.equal(productNamesAfterRemoval[0], productName3, "Product name should match");
        assert.equal(parseInt(productsAfterRemoval[1][0]), price, "Product price should match");
        assert.equal(productNamesAfterRemoval[1], productName2, "Product name should match");
        assert.equal(parseInt(productsAfterRemoval[1][1]), price, "Product price should match");
    });

    // Once existing user is deleted, user should be able to request shop owner rights back.
    // This way we can block shop owner if detect disorder behaviour.
    it("Delete existing user and request again store owner rights", async () => {
        const alidexInstance = await Alidex.new();

        await alidexInstance.requestStoreOwnerStatus({from: storeOwner});
        await alidexInstance.addStoreOwner(storeOwner, {from: owner});

        const usersBeforeDelete = await alidexInstance.getUsers.call();
        assert.equal(parseInt(usersBeforeDelete[1].length), 2, "User count should be 2 after addition");

        await alidexInstance.deleteUser(storeOwner);

        const usersAfterDelete = await alidexInstance.getUsers.call();
        assert.equal(parseInt(usersAfterDelete[1].length), 1, "User count should be 1 after addition");

        const userStatusAfter = await alidexInstance.getUserStatus.call(storeOwner);
        assert.equal(parseInt(userStatusAfter), 0, "User status should be shopper after delete");

        await alidexInstance.requestStoreOwnerStatus({from: storeOwner});
    });

    // Store owner should be able to update product price.
    // If the demand for product is big, then store owner can increase price.
    it("Update product price and update IPFS hash of product picture in storefront", async () => {
        const alidexInstance = await Alidex.new();

        await alidexInstance.requestStoreOwnerStatus({from: storeOwner});
        await alidexInstance.addStoreOwner(storeOwner, {from: owner});

        const storeFrontName = "Fruit store";
        await alidexInstance.addStorefront(storeFrontName, {from: storeOwner});

        const productName = "banana";
        const price = web3.utils.toWei("1", "ether");
        const updatedPrice = web3.utils.toWei("2", "ether");
        const quantity = 1;
        const ipfsPictureHashHex = "0x79065c5acd65a299993f8fd12496c9cad810388ee6cec6bee0595dfd6f74e2e5";
        const emptyPictureHashHex = "0x0000000000000000000000000000000000000000000000000000000000000000";

        await alidexInstance.addProductToStoreFront(0, productName, price, quantity, {from: storeOwner});
        const productsBeforePriceUpdate = await alidexInstance.getAllProductsFromStorefront(storeOwner, 0, {from: storeOwner});
        assert.equal(parseInt(productsBeforePriceUpdate[1][0]), price, "Product price should 1 ether");
        assert.equal(parseInt(productsBeforePriceUpdate[3][0]), emptyPictureHashHex, "Product should not have IPFS hash by default");

        await alidexInstance.updatePrice(0, 0, updatedPrice, {from: storeOwner});
        await alidexInstance.updateIpfsHashForProductPic(0, 0, ipfsPictureHashHex, {from: storeOwner});

        const productsAfterPriceUpdate = await alidexInstance.getAllProductsFromStorefront(storeOwner, 0, {from: storeOwner});
        assert.equal(parseInt(productsAfterPriceUpdate[1][0]), updatedPrice, "Product price should be updated to 2 ether");
        assert.equal(parseInt(productsAfterPriceUpdate[3][0]), ipfsPictureHashHex, "Product should not have IPFS hash by default");
    });

    // Shop owner should be able withdraw funds from storefronts. Every storefront have own balance.
    it("Withdraw funds from storefront", async () => {
        const alidexInstance = await Alidex.new();

        await alidexInstance.requestStoreOwnerStatus({from: storeOwner});
        await alidexInstance.addStoreOwner(storeOwner, {from: owner});

        const storeFrontName = "Fruit store";
        await alidexInstance.addStorefront(storeFrontName, {from: storeOwner});

        const productName = "banana";
        const price = web3.utils.toWei("1", "ether");
        const quantity = 1;
        await alidexInstance.addProductToStoreFront(0, productName, price, quantity, {from: storeOwner});

        const productIndex = 0;
        const storeIndex = 0;
        const payment = web3.utils.toWei("2", "ether");

        await alidexInstance.purchaseProduct(storeOwner, storeIndex, productIndex, quantity, {
            from: buyer,
            value: payment
        });

        const stores = await alidexInstance.getStorefronts.call(storeOwner, {from: storeOwner});
        assert.equal(parseInt(stores[1][storeIndex]), price, "Storefront account balance doesn't match");

        var ownerBalanceBefore = await web3.eth.getBalance(storeOwner);
        const tx = await alidexInstance.withdrawFunds(storeIndex, price, {from: storeOwner});

        var ownerBalanceAfter = await web3.eth.getBalance(storeOwner);
        assert.isTrue(parseInt(ownerBalanceBefore) < parseInt(ownerBalanceAfter), "Balance should be bigger after withdraw");
    });

    // In case of emergency, contract owner should be able to deactivate contract and withdraw all
    // the funds from the storefronts to contract owner's address
    it("Contract owner can deactivate contract and withdraw funds", async () => {
        const alidexInstance = await Alidex.new();

        await alidexInstance.requestStoreOwnerStatus({from: storeOwner});
        await alidexInstance.addStoreOwner(storeOwner, {from: owner});

        const storeFrontName = "Fruit store";
        await alidexInstance.addStorefront(storeFrontName, {from: storeOwner});

        const productName = "banana";
        const price = web3.utils.toWei("1", "ether");
        const quantity = 1;
        await alidexInstance.addProductToStoreFront(0, productName, price, quantity, {from: storeOwner});

        const productIndex = 0;
        const storeIndex = 0;
        const payment = web3.utils.toWei("2", "ether");

        await alidexInstance.purchaseProduct(storeOwner, storeIndex, productIndex, quantity, {
            from: buyer,
            value: payment
        });

        const stores = await alidexInstance.getStorefronts.call(storeOwner, {from: storeOwner});
        assert.equal(parseInt(stores[1][storeIndex]), price, "Storefront account balance doesn't match");

        var ownerBalanceBefore = await web3.eth.getBalance(owner);

        await alidexInstance.toggleContractActive({from: owner});
        await alidexInstance.emergencyWithdraw({from: owner});

        var ownerBalanceAfter = await web3.eth.getBalance(owner);
        assert.isTrue(parseInt(ownerBalanceBefore) < parseInt(ownerBalanceAfter), "Balance should be bigger after withdraw");
    });

    // Emergency withdraw function is available for contract owner only if contract is deactivated.
    it("Emergency withdraw function should be callable only if contract is deactivated", async () => {
        const alidexInstance = await Alidex.deployed();
        try {
            await alidexInstance.emergencyWithdraw({from: owner});
            assert.fail("The emergencyWithdraw function should have thrown an error");
        } catch (err) {
            assert.include(err.message, "revert", "The error message should contain 'revert'");
        }
    });
});
