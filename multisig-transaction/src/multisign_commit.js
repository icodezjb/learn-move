const { program } = require('commander');
const {
    AptosClient, BCS, HexString, TxnBuilderTypes, TransactionBuilderMultiEd25519,
} = require('aptos');
const {
    Ed25519Signature, RawTransaction, MultiEd25519Signature, MultiEd25519PublicKey
} = TxnBuilderTypes;

program
    .requiredOption('-r, --raw_tx <raw_transaction>', "the raw transaction")
    .requiredOption('-s, --signatures <signatures...>', "the signatures of this raw transaction")
    .requiredOption('-b, --bitmap <bit...>', "the bitmap of this transaction in ascending order. eg. [0 3 31]")
    .requiredOption('-u, --url <url>', "the url to a fullnode on the network")
    .requiredOption('-p, --public_key <public_key>', "the multi sign public key")
    .option('--dry_run', "only dry run not commit", false)
    .action(async () => {
        const options = program.opts();

        const signatures = options.signatures.map(function (s) {
            return new Ed25519Signature(new HexString(s).toUint8Array())
        })

        // after aptos v1.3.11
        let deserializer = new BCS.Deserializer(new HexString(options.public_key).toUint8Array());
        const multisig_public_key = MultiEd25519PublicKey.deserialize(deserializer);
        // after aptos v1.3.11

        // before aptos v1.3.11
        // const Ed25519PublicKey = require("aptos").TxnBuilderTypes.Ed25519PublicKey;
        // let deserializer = new BCS.Deserializer(new HexString(options.public_key).toUint8Array());
        // const bytes = deserializer.deserializeBytes();
        // const threshold = bytes[bytes.length - 1];
        // const keys = [];
        // for (let i = 0; i < bytes.length - 1; i += Ed25519PublicKey.LENGTH) {
        //        keys.push(new Ed25519PublicKey(bytes.subarray(i, i + Ed25519PublicKey.LENGTH)));
        // }
        // const multisig_public_key = new MultiEd25519PublicKey(keys, threshold);
        // before aptos v1.3.11

        let cap = multisig_public_key.public_keys.length;
        if (cap > 32) {
            console.log("Invalid multisig public key")
            return
        }

        const bits = options.bitmap.map(function (i) {return parseInt(i)});
        if (bits.length > 32
            || !bits.every(function (i) {return i < 32 && i < cap})
            || !bits.every(function (x,i) {return i === 0 || x >= bits[i-1]})
        ) {
            console.log("Invalid bitmap:", options.bitmap);
            return
        }

        deserializer = new BCS.Deserializer(new HexString(options.raw_tx).toUint8Array());
        const raw_tx = RawTransaction.deserialize(deserializer);

        const expiration = parseInt(raw_tx.expiration_timestamp_secs)
        const format_expiration = new Date(expiration * 1000).toISOString().slice(0, 19);

        const entryFunctionPayload = raw_tx.payload.value;

        const coin_address = HexString.fromUint8Array(entryFunctionPayload.ty_args[0].value.address.address).toShortString();
        const coin_module = entryFunctionPayload.ty_args[0].value.module_name.value;
        const coin_struct = entryFunctionPayload.ty_args[0].value.name.value;
        const coin = coin_address + "::" + coin_module + "::" + coin_struct;

        const receiver = HexString.fromUint8Array(entryFunctionPayload.args[0]).hex();
        const amount = new BCS.Deserializer(entryFunctionPayload.args[1]).deserializeU64();

        console.log("=========bitmap==========");
        console.log("bitmap:", bits);
        console.log("=========bitmap==========\n");

        console.log("=========multi sign transfer==========");
        console.log("Multi-Address: ", HexString.fromUint8Array(raw_tx.sender.address).hex());
        console.log("Send Coin    : ", coin);
        console.log("Receiver     : ", receiver);
        console.log("Amount       : ", parseInt(amount));
        console.log("Expiration   : ", expiration, "("+format_expiration+")");
        console.log("Sequence     : ", parseInt(raw_tx.sequence_number));
        console.log("Chain Id     : ", raw_tx.chain_id.value);
        console.log("Max gas      : ", parseInt(raw_tx.max_gas_amount));
        console.log("=========multi sign transfer==========\n\n");

        if (options.dry_run) {
           return
        }

        const client = new AptosClient(options.url);

        const multisig_txn_builder = new TransactionBuilderMultiEd25519((_signingMessage) => {
            // Bitmap masks which public key has signed transaction.
            const bitmap = MultiEd25519Signature.createBitmap(bits);
            return new MultiEd25519Signature(signatures, bitmap);
        }, multisig_public_key);

        const multisig_signed_tx = multisig_txn_builder.sign(raw_tx);
        const tx_res = await client.submitSignedBCSTransaction(multisig_signed_tx);

        console.log("Multisig Tx hash: ", tx_res.hash);
        const [res] = await Promise.all([
            client.waitForTransactionWithResult(tx_res.hash)
        ]);

        console.log(res);
    })
    .parse();
