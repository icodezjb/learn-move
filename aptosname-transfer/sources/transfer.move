module myself::functions {
    use std::string::{String, utf8};
    use aptos_token::token;

    entry fun allow_receive(
        account: &signer
    ) {
        token::initialize_token_store(account);
        token::opt_in_direct_transfer(account, true);
    }

    entry fun aptosname_transfer(
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

        let token_id = token::create_token_id_raw(
            @aptosnames_creator,
            utf8(b"Aptos Names V1"),
            aptosname,
            token_property_version
        );

        token::transfer(from, token_id, to, 1);
    }
}
