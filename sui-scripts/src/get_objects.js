const {JsonRpcProvider} = require("@mysten/sui.js");

(async ()=> {
    const TESTNET_URL = "https://fullnode.testnet.sui.io:443";

    let client = new JsonRpcProvider(TESTNET_URL);
    let bagId = "0x9f7e2cd16df60de1ba4425053a87e284706256db";
    let keys = await client.getObjectsOwnedByObject(bagId);

    console.log(keys);

    let value = await client.getObject(keys[0].objectId);

    console.log(value);
})()
