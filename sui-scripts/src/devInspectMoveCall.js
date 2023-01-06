const { JsonRpcProvider } = require("@mysten/sui.js");

(async ()=> {
    const DEVNET_URL = "https://fullnode.devnet.sui.io:443";

    const address = "0xf15b467c66c983310d3966e84bdf0c399963842c";

    const provider = new JsonRpcProvider(DEVNET_URL);

    const coins = await provider.getGasObjectsOwnedByAddress(address);
    console.log("coins[0]: ", coins[0].objectId);
    console.log("coins[1]: ", coins[1].objectId);

    const result = await provider.devInspectMoveCall(
        address,
        {
            packageObjectId: '0x2',
            module: 'coin',
            function: 'value',
            typeArguments: ["0x2::sui::SUI"],
            arguments: [coins[1].objectId],
        }
    );

    let buffer = Buffer.from(result.results.Ok[0][1].returnValues[0][0]);
    let balance = buffer.readBigUInt64LE(0);
    console.log("coins[1] balance: ",balance.toString());
})()