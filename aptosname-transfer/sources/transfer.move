module myself::functions {
    use std::signer;
    use std::string::{String, utf8};
    use aptos_token::token;

    const ERR_REQUIRE_ALLOW_RECEIVE: u64 = 555;
    const ERR_INSUFFICIENT_BALANCE: u64 = 556;

    public entry fun allow_receive(
        account: &signer
    ) {
        token::initialize_token_store(account);
        token::opt_in_direct_transfer(account, true);
    }

    public entry fun aptosname_transfer(
        from: &signer,
        aptosname: String,
        to: address,
    ) {
        let token_data_id = token::create_token_data_id(
            @aptosnames_creator,
            utf8(b"Aptos Names V1"),
            aptosname
        );
        let token_property_version = token::get_tokendata_largest_property_version(
            @aptosnames_creator,
            token_data_id
        );

        let token_id = token::create_token_id(
            token_data_id,
            token_property_version
        );

        assert!(
            token::has_token_store(to),
            ERR_REQUIRE_ALLOW_RECEIVE,
        );
        assert!(
            token::balance_of(signer::address_of(from), token_id) > 0,
            ERR_INSUFFICIENT_BALANCE,
        );

        token::transfer(from, token_id, to, 1);
    }
}
