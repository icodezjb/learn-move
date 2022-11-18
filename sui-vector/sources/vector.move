module 0x0::vector {
    use std::vector;
    use sui::coin::Coin;
    use sui::sui::SUI;
    use sui::pay;

    public entry fun vec(
        self: &mut Coin<SUI>,
        vec_bool: vector<bool>,
        vec_u8: vector<u8>,
        vec_u64: vector<u64>,
        vec_address: vector<address>,
        vec_coins: vector<Coin<SUI>>
    ) {
        assert!(vector::length(&vec_bool) > 0, 1);
        assert!(vector::length(&vec_u8) > 0, 2);
        assert!(vector::length(&vec_u64) > 0, 3);
        assert!(vector::length(&vec_address) > 0, 4);

        pay::join_vec(self, vec_coins)
    }
}
