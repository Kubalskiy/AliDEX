const Alidex = artifacts.require("./Alidex.sol");

contract("Alidex", accounts => {

    const owner = accounts[0];
    const storeOwner = accounts[1];
    const buyer = accounts[2];
    const storeOwner2 = accounts[3];
    const shopper = accounts[4];
    const price = web3.utils.toWei("1", "ether");

    // Common test for logging events. Let's make sure that we don't break UI interaction
    // because UI is updated based on this events. Remember to update UI side as well if Log
    // event has been changed.
    it("Log events for the UI", async () => {
        const alidexInstance = await Alidex.new();

        const requestStoreOwnerStatusTx = await alidexInstance.requestStoreOwnerStatus({from: storeOwner});
        assert.equal(requestStoreOwnerStatusTx.logs[0].event, "LogStoreOwnerRightsRequested", "Event not emitted");
        assert.equal(requestStoreOwnerStatusTx.logs[0].args.addr, storeOwner, "User address that requested store owner rights not found");

        const addStoreOwnerTx = await alidexInstance.addStoreOwner(storeOwner, {from: owner});
        assert.equal(addStoreOwnerTx.logs[0].event, "LogStoreOwnerRightsGranted", "Event not emitted");
        assert.equal(addStoreOwnerTx.logs[0].args.addr, storeOwner, "User address that got store owner rights not found");

        const addAdminTx = await alidexInstance.addAdmin(storeOwner, {from: owner});
        assert.equal(addAdminTx.logs[0].event, "LogAdminRightsGranted", "Event not emitted");
        assert.equal(addAdminTx.logs[0].args.addr, storeOwner, "User address that got admin rights not found");

        const addStorefrontTx = await alidexInstance.addStorefront("Fruit shop", {from: storeOwner});
        assert.equal(addStorefrontTx.logs[0].event, "LogNewStorefrontCreated", "Event not emitted");
        assert.equal(addStorefrontTx.logs[0].args.owner, storeOwner, "Store owner address not found");
        assert.equal(addStorefrontTx.logs[0].args.name, "Fruit shop", "Store name doesn't match");
        assert.equal(parseInt(addStorefrontTx.logs[0].args.balance), 0, "Balance doesn't match");
        assert.equal(parseInt(addStorefrontTx.logs[0].args.productCount), 0, "Product count doesn't match");

        const productName = "banana";
        const quantity = 2;
        const storeIndex = 0;
        const addProductToStoreFrontTx = await alidexInstance.addProductToStoreFront(storeIndex, productName, price, quantity, {from: storeOwner});
        assert.equal(addProductToStoreFrontTx.logs[0].event, "LogNewProductAdded", "Event not emitted");
        assert.equal(addProductToStoreFrontTx.logs[0].args.name, productName, "Product name doesn't match");
        assert.equal(parseInt(addProductToStoreFrontTx.logs[0].args.price), price, "Price doesn't match");
        assert.equal(parseInt(addProductToStoreFrontTx.logs[0].args.quantity), quantity, "Quantity doesn't match");


        const purchaseProductTx = await alidexInstance.purchaseProduct(storeOwner, storeIndex, 0, 1, {
            value: price,
            from: owner
        });
        assert.equal(purchaseProductTx.logs[0].event, "LogPurchaseProduct", "Event not emitted");
        assert.equal(parseInt(purchaseProductTx.logs[0].args.productIndex), 0, "Product index doesn't match");
        assert.equal(parseInt(purchaseProductTx.logs[0].args.storeIndex), storeIndex, "Store index doesn't match");
        assert.equal(purchaseProductTx.logs[0].args.storeOwner, storeOwner, "Store owner address doesn't match");


        const withdrawFundsTx = await alidexInstance.withdrawFunds(storeIndex, price, {from: storeOwner});
        assert.equal(withdrawFundsTx.logs[0].event, "LogWithdraw", "Event not emitted");
        assert.equal(parseInt(withdrawFundsTx.logs[0].args.storeIndex), storeIndex, "Store index doesn't match");
        assert.equal(withdrawFundsTx.logs[0].args.addr, storeOwner, "Store owner address doesn't match");

        const removeProductFromStorefrontTx = await alidexInstance.removeProductFromStorefront(storeOwner, storeIndex, 0, {from: storeOwner});
        assert.equal(removeProductFromStorefrontTx.logs[0].event, "LogProductRemoved", "Event not emitted");
        assert.equal(parseInt(removeProductFromStorefrontTx.logs[0].args.index), 0, "Product index doesn't match");
        assert.equal(parseInt(removeProductFromStorefrontTx.logs[0].args.storeIndex), storeIndex, "Store index doesn't match");
        assert.equal(removeProductFromStorefrontTx.logs[0].args.storeOwner, storeOwner, "Store owner address doesn't match");

        const removeStorefrontTx = await alidexInstance.removeStorefront(storeOwner, storeIndex, {from: storeOwner});
        assert.equal(removeStorefrontTx.logs[0].event, "LogStorefrontRemoved", "Event not emitted");
        assert.equal(parseInt(removeStorefrontTx.logs[0].args.storeIndex), storeIndex, "Store index doesn't match");
        assert.equal(removeStorefrontTx.logs[0].args.storeOwner, storeOwner, "Store owner address doesn't match");

        const deleteUserTx = await alidexInstance.deleteUser(storeOwner, {from: owner});
        assert.equal(deleteUserTx.logs[0].event, "LogDeleteUser", "Event not emitted");
        assert.equal(deleteUserTx.logs[0].args.addr, storeOwner, "Store owner address doesn't match");
    });
});
