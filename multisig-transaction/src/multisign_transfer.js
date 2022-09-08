const { program } = require('commander');
const {
    AptosClient, AptosAccount, BCS, HexString, TxnBuilderTypes,
    TransactionBuilder
} = require('aptos');
const {
    TypeTagStruct, StructTag, TransactionPayloadEntryFunction,
    EntryFunction, AccountAddress, RawTransaction
} = TxnBuilderTypes;

// 1 hour
const MAX_DURATION = 3600;

program
    .requiredOption('-m, --multi_address <multi_address>', "the sender of the coin")
    .requiredOption('-r, --receiver <receiver>', "the receiver of the coin")
    .requiredOption('-a, --amount <u64>', "the amount of the coin")
    .requiredOption('--coin <coin>', 'the coin type', "0x1::aptos_coin::AptosCoin")
    .requiredOption('--private_key <private_key>', 'the privkey for single sign')
    .option('--url <url>', "the url to a fullnode on the network")
    .option('--chain_id <chain_id>', 'the chain id, use query if url set')
    .option('--sequence <seq>', 'the sequence number, use query if url set')
    .option('--max_gas <gas>', 'the max gas for this transaction', "1000")
    .option('--expiration <unix_timestamp>', 'transaction is discarded if it is not executed before expiration timestamp')
    .action(async () => {
        const options = program.opts();
        const max_gas = parseInt(options.max_gas) < 4000000n ? parseInt(options.max_gas): 4000000n;
        const private_key_bytes = new HexString(options.private_key).toUint8Array();
        const sign_account = new AptosAccount(private_key_bytes);
        let chain_id = 0;
        let sequence = 0;
        if (options.url === undefined) {
            if (options.chain_id === undefined || options.sequence === undefined) {
                console.log("chain_id or sequence is not set")
                return
            }

            chain_id = parseInt(options.chain_id);
            sequence = options.sequence;
        } else {
            console.log("query chain_id and sequence from the fullnode:")
            console.log("fullnode url: ", options.url);

            const client = new AptosClient(options.url);
            const [{ sequence_number }, _chain_id] = await Promise.all([
                client.getAccount(options.multi_address),
                client.getChainId(),
            ]);
            sequence = sequence_number;
            chain_id = _chain_id;
        }

        const expiration = options.expiration === undefined ?
            Math.floor(Date.now() / 1000) + MAX_DURATION :
            parseInt(options.expiration);
        const format_expiration = new Date(expiration * 1000).toISOString().slice(0, 19);

        console.log("\n-------", sign_account.address().hex(), "build-------\n");
        console.log("=========multi sign transfer==========");
        console.log("Multi-Address: ", options.multi_address);
        console.log("Send Coin    : ", options.coin);
        console.log("Receiver     : ", options.receiver);
        console.log("Amount       : ", options.amount);
        console.log("Expiration   : ", expiration, "("+format_expiration+")");
        console.log("Sequence     : ", sequence)
        console.log("Chain Id     : ", chain_id)
        console.log("Max gas      : ", max_gas);
        console.log("=========multi sign transfer==========");

        const coin = new TypeTagStruct(StructTag.fromString(options.coin));
        const receiver = AccountAddress.fromHex(options.receiver);
        const amount = parseInt(BigInt.asUintN(64, BigInt(options.amount)));

        const entryFunctionPayload = new TransactionPayloadEntryFunction(
            EntryFunction.natural(
                // Fully qualified module name, `AccountAddress::ModuleName`
                "0x1::coin",
                // Module function
                "transfer",
                // The coin type to transfer
                [coin],
                // Arguments for function `transfer`: receiver account address and amount to transfer
                [
                    BCS.bcsToBytes(receiver),
                    BCS.bcsSerializeUint64(amount)
                ],
            ),
        );

        const mutisig_address = AccountAddress.fromHex(options.multi_address);
        const rawTxn = new RawTransaction(
            // Transaction sender account address
            mutisig_address,
            BigInt(sequence),
            entryFunctionPayload,
            // Max gas unit to spend
            max_gas,
            // Gas price per unit
            1n,
            // Expiration timestamp. Transaction is discarded if it is not executed within 1 hour from now.
            BigInt(expiration),
            new TxnBuilderTypes.ChainId(chain_id),
        );

        let serializer = new BCS.Serializer();
        rawTxn.serialize(serializer);

        console.log("\nRaw Transaction(BCS): ", HexString.fromUint8Array(serializer.getBytes()).hex())

        const sign_message = TransactionBuilder.getSigningMessage(rawTxn);
        const single_signature = sign_account.signBuffer(sign_message).hex()

        console.log("\nsingle_signature: ", single_signature)
    })
    .parse();
