const { program } = require('commander');
const HexString = require("aptos").HexString;
const MultiEd25519PublicKey = require("aptos").TxnBuilderTypes.MultiEd25519PublicKey;
const Ed25519PublicKey = require("aptos").TxnBuilderTypes.Ed25519PublicKey;
const AuthenticationKey = require("aptos").TxnBuilderTypes.AuthenticationKey;
const Serializer = require("aptos").BCS.Serializer;

program
    .requiredOption('-p, --pubkey <pubkeys...>', 'specify ed25519 pubkeys(MAX=32)')
    .requiredOption('-t, --threshold <threshold>', 'specify the threshold of multi-sign address')
    .action(()=>{
        const options = program.opts();
        console.log("\n----------",options.threshold,"-of-",options.pubkey.length, "Multi-Sign-----");

        let threshold = parseInt(options.threshold);
        if (threshold < 1 || threshold > 32 || threshold > options.pubkey.length) {
            console.log("Invalid threshold: ", options.threshold)
            return
        }

        let pubkeys = []
        let i = 0;
        while (i < options.pubkey.length) {
            console.log("PubKey", i, ":", options.pubkey[i]);
            pubkeys.push(
                new Ed25519PublicKey(new HexString(options.pubkey[i]).toUint8Array())
            )
            i = i + 1;
        }

        const pubKeyMultiSig = new MultiEd25519PublicKey(
            pubkeys,
            threshold,
        );

        const authKey = AuthenticationKey.fromMultiEd25519PublicKey(pubKeyMultiSig);
        console.log("Multi-Sign AuthKey:", HexString.fromUint8Array(authKey.bytes).hex());
        console.log("Multi-Sign Address:", authKey.derivedAddress().hex());

        let serializer = new Serializer();
        pubKeyMultiSig.serialize(serializer);
        console.log("Multi-Sign Pubkey :", HexString.fromUint8Array(serializer.getBytes()).hex());

        console.log("----------",options.threshold,"-of-",options.pubkey.length, "Multi-Sign-----");
    })
    .parse();
