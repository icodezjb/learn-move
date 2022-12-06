use std::str::FromStr;

use move_core_types::{
    account_address::AccountAddress,
    identifier::Identifier,
    language_storage::{StructTag, TypeTag},
    value::{MoveStructLayout, MoveTypeLayout},
};
use move_vm_types::{values::{Struct, Value}};
use sha3::{Digest, Sha3_256};

fn main() {
    for_object_table_first_key("0xa236bdcab2880a9c7d5ef9974796bd4126c52eef");

    for_table_first_key("0x03c8e4462dfb7deecabb5af3dc6e95a02619ebae");
}

fn for_object_table_first_key(table_id: &str) {
    let struct_tag = StructTag {
        address: AccountAddress::from_hex_literal("0x0000000000000000000000000000000000000002").unwrap(),
        module: Identifier::from_str("dynamic_object_field").unwrap(),
        name: Identifier::from_str("Wrapper").unwrap(),
        type_params: vec![TypeTag::U64],
    };

    let wrapper_u64_tag = TypeTag::Struct(struct_tag.clone());
    let wrapper_u64_tag_bytes = bcs::to_bytes(&wrapper_u64_tag).unwrap();
    // println!("{:?}", wrapper_u64_tag_bytes);
    let expect = [
        7u8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 20,
        100, 121, 110, 97, 109, 105, 99, 95, 111, 98, 106, 101, 99, 116, 95,
        102, 105, 101, 108, 100, 7, 87, 114, 97, 112, 112, 101, 114, 1, 2].to_vec();
    assert_eq!(expect, wrapper_u64_tag_bytes);

    let wrapper_u64_layout = MoveTypeLayout::Struct(
        MoveStructLayout::Runtime {
            0: vec![MoveTypeLayout::U64]
        }
    );

    let wrapper_u64_value = Value::struct_(Struct::pack([Value::u64(0)]));
    let wrapper_u64_value_bytes = wrapper_u64_value.simple_serialize(&wrapper_u64_layout).unwrap();
    // println!("{:?}", wrapper_u64_value_bytes);
    assert_eq!(wrapper_u64_value_bytes, [0, 0, 0, 0, 0, 0, 0, 0]);

    let table_id = AccountAddress::from_hex_literal(table_id).unwrap();

    let mut hasher = Sha3_256::new();
    hasher.update(table_id);
    hasher.update(wrapper_u64_value_bytes);
    hasher.update(wrapper_u64_tag_bytes);
    let hash = hasher.finalize();
    let first_key = format!("0x{}", hex::encode(hash[..20].to_vec()));

    // println!("{:?}", first_key);
    assert_eq!("0xdf50efa50e58c86d8417095299c0c7cbec92deb7", first_key);
}

fn for_table_first_key(table_id: &str) {
    let u64_tag = TypeTag::U64;
    let u64_tag_bytes = bcs::to_bytes(&u64_tag).unwrap();
    // println!("{:?}", u64_tag_bytes);
    assert_eq!(u64_tag_bytes, [2]);

    let u64_value = Value::u64(0);
    let u64_value_bytes = u64_value.simple_serialize(&MoveTypeLayout::U64).unwrap();
    // println!("{:?}", u64_value_bytes);
    assert_eq!(u64_value_bytes, [0, 0, 0, 0, 0, 0, 0, 0]);

    let table_id = AccountAddress::from_hex_literal(table_id).unwrap();

    let mut hasher = Sha3_256::new();
    hasher.update(table_id);
    hasher.update(u64_value_bytes);
    hasher.update(u64_tag_bytes);
    let hash = hasher.finalize();
    let first_key = format!("0x{}", hex::encode(hash[..20].to_vec()));

    // println!("{:?}", first_key);
    assert_eq!("0xb55d2a87319747315615cb05a62d1b59307c832e", first_key);
}
