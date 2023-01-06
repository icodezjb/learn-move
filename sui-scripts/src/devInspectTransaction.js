const {
    JsonRpcProvider, Ed25519Keypair, LocalTxnDataSerializer, RawSigner
} = require("@mysten/sui.js");
const { retry } = require("ts-retry-promise");

(async ()=> {
    const DEVNET_URL = "https://fullnode.devnet.sui.io:443";
    const DEVNET_FAUCET_URL = "https://faucet.devnet.sui.io/gas";

    const keypair = Ed25519Keypair.deriveKeypair(process.env.TEST_MNEMONIC);
    const address = keypair.getPublicKey().toSuiAddress();
    console.log("address: ", address);

    const provider = new JsonRpcProvider(
        DEVNET_URL,
        {
            skipDataValidation: false,
            faucetURL: DEVNET_FAUCET_URL,
        }
    );

    // try {
    //     await retry(() => provider.requestSuiFromFaucet(address), {
    //         backoff: 'EXPONENTIAL',
    //         // overall timeout in 6 seconds
    //         timeout: 1000 * 6,
    //         logger: (msg) => console.warn('Retrying requesting from faucet: ' + msg),
    //     });
    // } catch (e) {
    //     // nothing
    // }

    const signer = new RawSigner(
        keypair,
        provider,
        new LocalTxnDataSerializer(provider)
    );
    const coins = await provider.getGasObjectsOwnedByAddress(address);
    console.log("coins[0]: ", coins[0].objectId);
    console.log("coins[1]: ", coins[1].objectId);

    const result = await signer.devInspectTransaction(
        {
            kind: 'moveCall',
            data: {
                packageObjectId: '0x2',
                module: 'coin',
                function: 'value',
                typeArguments: ["0x2::sui::SUI"],
                arguments: [coins[1].objectId],
                gasBudget: 10000,
                gasPayment: coins[0].objectId
            },
        }
    );

    let buffer = Buffer.from(result.results.Ok[0][1].returnValues[0][0]);
    let balance = buffer.readBigUInt64LE(0);
    console.log("coins[1] balance: ",balance.toString());
})()