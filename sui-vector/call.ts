import {
    Ed25519Keypair,
    JsonRpcProvider,
    RawSigner,
    TransactionBlock,
    testnetConnection,
    bcs
} from '@mysten/sui.js';

async function main() {

    const privkey = process.env.PRIVKEY ?? "empty"
    console.log("privkey:", Buffer.from(privkey, "hex").toString("hex"))

    const keypair = Ed25519Keypair.fromSecretKey(Uint8Array.from(Buffer.from(privkey, "hex")))

    const provider = new JsonRpcProvider(testnetConnection);
    const signer = new RawSigner(keypair, provider);
    const txb = new TransactionBlock();

    // https://github.com/MystenLabs/sui/blob/main/crates/sui-protocol-config/src/lib.rs#L746
    const max_pure_argument_size = 16 * 1024

    let vec_address: string[] = []
    let vec_u8: number[] = []
    for (var i=0; i < 500; i++) {
        vec_address.push("0x28b140d21386129f4e08380cadbbd560df92e01b28a53fc96d97464f384d923b")
        vec_u8.push(2)
    }

    const vec_address_bytes = bcs.ser('vector<address>', vec_address, {maxSize: max_pure_argument_size}).toBytes()
    const vec_u8_bytes = bcs.ser('vector<u8>', vec_u8, {maxSize: max_pure_argument_size}).toBytes()

    const coins = txb.splitCoins(
        txb.gas,
        [txb.pure(1000), txb.pure(2000)]
    )

    // public entry fun vec(
    //     self: &mut Coin<SUI>,
    //     vec_bool: vector<bool>,
    //     vec_u8: vector<u8>,
    //     vec_u64: vector<u64>,
    //     vec_address: vector<address>,
    //     vec_coins: vector<Coin<SUI>>
    // )
    txb.moveCall(
        {
            target: "0x28b140d21386129f4e08380cadbbd560df92e01b28a53fc96d97464f384d923b::vector::vec",
            arguments: [
                txb.gas,
                txb.pure([true, false, true], 'vector<bool>'),
                txb.pure(vec_u8_bytes),
                txb.pure([1,2,3], 'vector<u64>'),
                txb.pure(vec_address_bytes),
                txb.makeMoveVec({objects: [coins[0], coins[1]]})
            ]
        }
    );

    const result = await signer.signAndExecuteTransactionBlock({
        transactionBlock: txb,
    });
    console.log({ result });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
