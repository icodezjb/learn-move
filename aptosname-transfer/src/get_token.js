const {AptosClient} = require("aptos");

const NODE_URL = "https://fullnode.mainnet.aptoslabs.com/v1";

(async () => {
    const client = new AptosClient(NODE_URL);

    const collectionName = "Aptos Names V1";
    const tokenName = "aptos.apt";
    const creator = "0x305a97874974fdb9a7ba59dc7cab7714c8e8e00004ac887b6e348496e1981838";
    const account = "0xb27f7d329f6d2c8867e5472958c3cfabc781300ca9649f244e267e1d6b966c94";
    const tokenStore = "0x3::token::TokenStore";

    const tokenId = {
        token_data_id: {
            collection: collectionName,
            creator,
            name: tokenName,
        },
        property_version: "1",
    };

    let resources = await client.getAccountResources(account);
    const accountResource = resources.find((r) => r.type === tokenStore);
    const { handle } = accountResource.data.tokens;

    const getTokenTableItemRequest = {
        key_type: "0x3::token::TokenId",
        value_type: "0x3::token::Token",
        key: tokenId,
    };

    const token = await client.getTableItem(handle, getTokenTableItemRequest);
    console.log(JSON.stringify(token))
})();
