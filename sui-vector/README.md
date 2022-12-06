# cmd

```move
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
```

```bash
sui client publish --gas-budget 10000
package=0xce6cab8be08edcfb12e2f26c2ac288de35a0b9a6
sui_coin1=0xdbdae62c692525b893b33e413664946ef07ef30c
sui_coin2=0xccfe11e303b81749a2c3a1288e73e4cf88843844
sui_coin3=0xb24e1287006d04acc2526cd058ba916094120472
sui_coin4=0x50db356f3d971ac5e15bb2c87076eb3185baf388

sui client call \
  --gas-budget 10000 \
  --package $package \
  --module vector \
  --function vec \
  --args $sui_coin1 \
         '[true]' \
         '[0, 1]' \
         '[78, 89, 32]' \
         '["0xb811881d75c77acec51ff1622a3cc1bd6b247707"]' \
         "[\"$sui_coin2\"]"

sui client call \
  --gas-budget 10000 \
  --package $package \
  --module vector \
  --function vec \
  --args $sui_coin1 \
         '[true]' \
         '0x1234' \
         '[78, 89, 32]' \
         '["0xb811881d75c77acec51ff1622a3cc1bd6b247707"]' \
         "[\"$sui_coin3\"]"

sui client call \
  --gas-budget 10000 \
  --package $package \
  --module vector \
  --function vec \
  --args $sui_coin1 \
         '[true, false]' \
         'test' \
         '[78, 89, 32]' \
         '["0xb811881d75c77acec51ff1622a3cc1bd6b247707", "0xa52f14e21c49d03f7a9e615c3bb56bb3de926b92"]' \
         "[\"$sui_coin4\"]"

```

[sui-json vector](https://github.com/MystenLabs/sui/blob/main/crates/sui-json/src/lib.rs#L209-L245)
```rust
            (JsonValue::String(s), MoveTypeLayout::Vector(t)) => {
                match &**t {
                    MoveTypeLayout::U8 => {
                        // We can encode U8 Vector as string in 2 ways
                        // 1. If it starts with 0x, we treat it as hex strings, where each pair is a
                        //    byte
                        // 2. If it does not start with 0x, we treat each character as an ASCII
                        //    encoded byte
                        // We have to support both for the convenience of the user. This is because
                        // sometime we need Strings as arg Other times we need vec of hex bytes for
                        // address. Issue is both Address and Strings are represented as Vec<u8> in
                        // Move call
                        let vec = if s.starts_with(HEX_PREFIX) {
                            // If starts with 0x, treat as hex vector
                            Hex::decode(s).map_err(|e| anyhow!(e))?
                        } else {
                            // Else raw bytes
                            s.as_bytes().to_vec()
                        };
                        MoveValue::Vector(vec.iter().copied().map(MoveValue::U8).collect())
                    }
                    MoveTypeLayout::Struct(MoveStructLayout::Runtime(inner)) => {
                        Self::handle_inner_struct_layout(inner, val, ty, s)?
                    }
                    _ => bail!("Cannot convert string arg {s} to {ty}"),
                }
            }

            // We have already checked that the array is homogeneous in the constructor
            (JsonValue::Array(a), MoveTypeLayout::Vector(inner)) => {
                // Recursively build an IntermediateValue array
                MoveValue::Vector(
                    a.iter()
                        .map(|i| Self::to_move_value(i, inner))
                        .collect::<Result<Vec<_>, _>>()?,
                )
            }
```
