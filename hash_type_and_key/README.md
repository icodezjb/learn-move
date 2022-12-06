# 链下计算table和object_table的key

### 1. 为什么需要链下计算key?
sui的table和object_table适合存储大量数据, 但链下取值的时候需要用
getObjectsOwnedByObject先取得所有的keys, 这一步受限于rpc server(最大返回 10MB数据).
如果能在链下计算出keys, 就不需要查询rpc server了. 也就是用"计算key"替代"查询key".


### 2. hash_type_and_key
table和object_table都用到了 [hash_type_and_key](https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/src/natives/dynamic_field.rs#L52-L107) 来生成key

`hash_type_and_key`的参数是table_id,key的类型和值,
主要操作就是对table_id,key的值和key的StructTag进行Sha3_256 hash

```rust
// native fun hash_type_and_key<K: copy + drop + store>(parent: address, k: K): address;
pub fn hash_type_and_key(
    context: &mut NativeContext,
    mut ty_args: Vec<Type>,
    mut args: VecDeque<Value>,
) -> PartialVMResult<NativeResult> {
    assert!(ty_args.len() == 1);
    assert!(args.len() == 2);
    let k_ty = ty_args.pop().unwrap();
    let k: Value = args.pop_back().unwrap();
    let parent: SuiAddress = pop_arg!(args, AccountAddress).into();
    let k_tag = context.type_to_type_tag(&k_ty)?;
    // build bytes
    let k_tag_bytes = match bcs::to_bytes(&k_tag) {
        Ok(bytes) => bytes,
        Err(_) => {
            return Ok(NativeResult::err(
                legacy_emit_cost(),
                E_BCS_SERIALIZATION_FAILURE,
            ));
        }
    };
    let k_layout = match context.type_to_type_layout(&k_ty) {
        Ok(Some(layout)) => layout,
        _ => {
            return Ok(NativeResult::err(
                legacy_emit_cost(),
                E_BCS_SERIALIZATION_FAILURE,
            ))
        }
    };
    let k_bytes = match k.simple_serialize(&k_layout) {
        Some(bytes) => bytes,
        None => {
            return Ok(NativeResult::err(
                legacy_emit_cost(),
                E_BCS_SERIALIZATION_FAILURE,
            ))
        }
    };
    // hash(parent || k || K)
    let mut hasher = Sha3_256::default();
    hasher.update(parent);
    hasher.update(k_bytes);
    hasher.update(k_tag_bytes);
    let hash = hasher.finalize();

    // truncate into an ObjectID and return
    // OK to access slice because Sha3_256 should never be shorter than ObjectID::LENGTH.
    let id = ObjectID::try_from(&hash.as_ref()[0..ObjectID::LENGTH]).unwrap();

    Ok(NativeResult::ok(
        legacy_emit_cost(),
        smallvec![Value::address(id.into())],
    ))
}
```

### 3. 最佳实践
用`u32`,`u64`等无符号整数做为`table`或`object_table`的`key`

