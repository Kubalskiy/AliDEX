import {TestsHelper} from './helper';

const Alidex = artifacts.require("./Alidex.sol");

/**
 * Tests for common users
 */
contract("Alidex", accounts => {

    const owner = accounts[0];
    const storeOwner = accounts[1];
    const buyer = accounts[2];
    const storeOwner2 = accounts[3];
    const shopper = accounts[4];
    const price = web3.utils.toWei("1", "ether");

    // After user has requested Store owner status, user status should be
    // 'WaitingApproval'. After request admin can grant shop owner rights.
    // This way we store the info that user has made request.
    it("Request store owner status and get all users", async () => {
        const alidexInstance = await Alidex.new();

        await alidexInstance.requestStoreOwnerStatus({from: shopper});

        const usersBefore = await alidexInstance.getUsers.call({from: owner});

        assert.equal(usersBefore[0][0], owner, "User address should be contract owner");
        assert.equal(parseInt(usersBefore[1][0]), 2, "Status should admin");
        assert.equal(usersBefore[0][1], shopper, "User address should be shopper");
        assert.equal(parseInt(usersBefore[1][1]), 3, "Status should be 'Waiting for approval'");

        await alidexInstance.addStoreOwner(shopper, {from: owner});

        const usersAfter = await alidexInstance.getUsers.call({from: owner});

        assert.equal(usersAfter[0][0], owner, "User address should be contract owner");
        assert.equal(parseInt(usersAfter[1][0]), 2, "Status should admin");
        assert.equal(usersAfter[0][1], shopper, "User address should be shopper");
        assert.equal(parseInt(usersAfter[1][1]), 1, "Status should shop owner");
    });

    // Users should be able to purchase products. If too much is paid, rest will be refunded
    // to buyers address. This way we ensure that user doesn't pay too much. If products quantity
    // is sold out (quantity=0), product count will be shown as 0.
    it("Purchase product from storefront and refund", async () => {
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
        var buyerBalanceBefore = await web3.eth.getBalance(buyer);
        await alidexInstance.purchaseProduct(storeOwner, storeIndex, productIndex, quantity, {
            from: buyer,
            value: payment
        });

        const productsAfterPurchase = await alidexInstance.getAllProductsFromStorefront(storeOwner, 0, {from: storeOwner});
        var buyerBalanceAfter = await web3.eth.getBalance(buyer);
        const stores = await alidexInstance.getStorefronts.call(storeOwner, {from: storeOwner});

        assert.equal(productsAfterPurchase[1].length, 0, "Purchased product should be removed quantity is zero");
        assert.equal(parseInt(stores[1][storeIndex]), price, "Storefront account balance doesn't match");
        assert.isAbove(parseInt(buyerBalanceAfter), parseInt(buyerBalanceBefore) - payment, "After refund buyer balance should be more than balance - (payment + gas cost )");
    });

    // User should be able to get combined storefront balance.
    // This way user has good view about overall balance.
    it("Get combined storefront balance by user", async () => {
        const alidexInstance = await Alidex.new();

        await alidexInstance.requestStoreOwnerStatus({from: storeOwner});
        await alidexInstance.addStoreOwner(storeOwner, {from: owner});

        await alidexInstance.addStorefront("Fruit store", {from: storeOwner});

        const price = web3.utils.toWei("1", "ether");
        const quantity = 1;
        await alidexInstance.addProductToStoreFront(0, "banana", price, quantity, {from: storeOwner});

        await alidexInstance.addStorefront("Tool store", {from: storeOwner});
        await alidexInstance.addProductToStoreFront(1, "hammer", price, quantity, {from: storeOwner});

        const productIndex = 0;
        await alidexInstance.purchaseProduct(storeOwner, 0, productIndex, quantity, {from: buyer, value: price});
        await alidexInstance.purchaseProduct(storeOwner, 1, productIndex, quantity, {from: buyer, value: price});

        const totalBalance = await alidexInstance.getUserBalance.call(storeOwner);
        assert.equal(parseInt(totalBalance), price * 2, "User balance doesn't match");
    });

    // Get mass of products at once so there is no need make separate query for every product.
    it("Get all products from storefront", async () => {
        const alidexInstance = await Alidex.new();

        await alidexInstance.requestStoreOwnerStatus({from: storeOwner});
        await alidexInstance.addStoreOwner(storeOwner, {from: owner});
        const storeName = "Fruit store";
        await alidexInstance.addStorefront(storeName, {from: storeOwner});

        const name = "banana";
        const name2 = "orange";
        const name3 = "kiwi";
        const name4 = "lemon";
        const name5 = "melon";

        const quantity = 1;
        const quantity2 = 2;
        const quantity3 = 3;
        const quantity4 = 4;
        const quantity5 = 5;
        const storeIndex = 0;

        await alidexInstance.addProductToStoreFront(storeIndex, name, price, quantity, {from: storeOwner});
        await alidexInstance.addProductToStoreFront(storeIndex, name2, price, quantity2, {from: storeOwner});
        await alidexInstance.addProductToStoreFront(storeIndex, name3, price, quantity3, {from: storeOwner});
        await alidexInstance.addProductToStoreFront(storeIndex, name4, price, quantity4, {from: storeOwner});
        await alidexInstance.addProductToStoreFront(storeIndex, name5, price, quantity5, {from: storeOwner});

        const products = await alidexInstance.getAllProductsFromStorefront.call(storeOwner, storeIndex);
        const productNames = TestsHelper.convertToStringArray(products[0]);

        assert.equal(productNames[0], name, "Product name does not match");
        assert.equal(parseInt(products[1][0]), price, "Product price does not match");
        assert.equal(parseInt(products[2][0]), quantity, "Product quantity does not match");

        assert.equal(productNames[1], name2, "Product name does not match");
        assert.equal(parseInt(products[1][1]), price, "Product price does not match");
        assert.equal(parseInt(products[2][1]), quantity2, "Product quantity does not match");

        assert.equal(productNames[2], name3, "Product name does not match");
        assert.equal(parseInt(products[1][2]), price, "Product price does not match");
        assert.equal(parseInt(products[2][2]), quantity3, "Product quantity does not match");

        assert.equal(productNames[3], name4, "Product name does not match");
        assert.equal(parseInt(products[1][3]), price, "Product price does not match");
        assert.equal(parseInt(products[2][3]), quantity4, "Product quantity does not match");

        assert.equal(productNames[4], name5, "Product name does not match");
        assert.equal(parseInt(products[1][4]), price, "Product price does not match");
        assert.equal(parseInt(products[2][4]), quantity5, "Product quantity does not match");
    });

    // User should be able to query easily users that is able add storefronts.
    // With store owners we can query all the existing storefronts. This way we can
    // iterate all the existing storefronts in UI code.
    it("Get all storefront owners and existing storefronts", async () => {
        const alidexInstance = await Alidex.new();

        await alidexInstance.requestStoreOwnerStatus({from: storeOwner});
        await alidexInstance.addStoreOwner(storeOwner, {from: owner});
        await alidexInstance.requestStoreOwnerStatus({from: storeOwner2});
        await alidexInstance.addStoreOwner(storeOwner2, {from: owner});

        const users = await alidexInstance.getUsers.call();
        const owners = TestsHelper.getUsersThatCanAddStorefronts(users);

        assert.equal(owners[0], owner, "Contract owner should be consider as store owner");
        assert.equal(owners[1], storeOwner, "Store owner not found");
        assert.equal(owners[2], storeOwner2, "Store owner not found");

        const storeName = "Fruit store";
        const storeName2 = "Tool shop";
        await alidexInstance.addStorefront(storeName, {from: storeOwner});
        await alidexInstance.addStorefront(storeName2, {from: storeOwner});

        const name = "banana";
        const name2 = "orange";

        const quantity = 1;
        const quantity2 = 2;
        const storeIndex = 0;
        await alidexInstance.addProductToStoreFront(storeIndex, name, price, quantity, {from: storeOwner});
        await alidexInstance.addProductToStoreFront(storeIndex, name2, price, quantity2, {from: storeOwner});

        let existingStorefronts = [];

        for (var i = 0; i < owners.length; i++) {
            const storeFrontOwner = owners[i];
            const storefronts = await alidexInstance.getStorefronts(storeFrontOwner);
            if (storefronts[2].length > 0) {
                const names = TestsHelper.convertToStringArray(storefronts[0]);
                for (var j = 0; j < storefronts[2].length; j++) {
                    existingStorefronts.push({
                        owner: storeFrontOwner,
                        name: names[j],
                        balance: parseInt(storefronts[1][j]),
                        productCount: parseInt(storefronts[2][j])
                    });
                }
            }
        }

        assert.equal(existingStorefronts[0].owner, storeOwner, "Store is incorrect");
        assert.equal(existingStorefronts[0].name, storeName, "Store name is incorrect");
        assert.equal(existingStorefronts[0].balance, 0, "Store balance should be zero");
        assert.equal(existingStorefronts[0].productCount, 2, "Product count should be two");

        assert.equal(existingStorefronts[1].owner, storeOwner, "Store is incorrect");
        assert.equal(existingStorefronts[1].name, storeName2, "Store name is incorrect");
        assert.equal(existingStorefronts[1].balance, 0, "Store balance should be zero");
        assert.equal(existingStorefronts[1].productCount, 0, "Product count should be two");
    });
});
