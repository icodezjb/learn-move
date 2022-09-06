# How to issue your coins on aptos

## precondition for this example
- [aptos-cli](https://github.com/aptos-labs/aptos-core/releases)
- two accounts: 
  - `owner`(default): publish coins contract, mint and burn the coins
  ```txt
  private_key: "0x1d5c699949317f8b41f31ddff29332943b1c31dd916e1b6747f408852e25f16f"
  public_key: "0x027b9579c66cbfae60651b7c5f41fcb65eff5e229f29503f17f1eb0780981b89"
  account: d02617efb7147fc1b313d6a6feadef2fc5b21e38268cea50f51ec2222ae64a2f
  ```
  - `receiver`: receive the coins
  ```txt
  private_key: "0xc43f88efcf5b14dc9ba00f3d73e8a455df260e730133fcd81386df1d463d0332"
  public_key: "0x9a6c8012d9ac973e976cb85d15f611da4f32f95cf0f55e9bf7e03c2fc347bcd1"
  account: 2e39b3b448114792d41ea4ee26f536595a001f734f94b5bd56ae3de6c3096cb0
  ```

### publish by owner
```bash
aptos move publish \
    --named-addresses mycoin=0xd02617efb7147fc1b313d6a6feadef2fc5b21e38268cea50f51ec2222ae64a2f
```

### initialize by owner
```bash
aptos move run \
    --function-id 0x1::managed_coin::initialize \
    --args string:"Test Coin" string:"Test" u8:8 bool:true \
    --type-args 0xd02617efb7147fc1b313d6a6feadef2fc5b21e38268cea50f51ec2222ae64a2f::Coins::TestCoin
```

### register for owner
```bash
aptos move run --function-id 0x1::managed_coin::register \
    --type-args 0xd02617efb7147fc1b313d6a6feadef2fc5b21e38268cea50f51ec2222ae64a2f::Coins::TestCoin
```

### mint to owner
```bash
aptos move run --function-id 0x1::managed_coin::mint \
    --args address:0xd02617efb7147fc1b313d6a6feadef2fc5b21e38268cea50f51ec2222ae64a2f u64:10000 \
    --type-args 0xd02617efb7147fc1b313d6a6feadef2fc5b21e38268cea50f51ec2222ae64a2f::Coins::TestCoin
```

### only burn from owner
```bash
aptos move run --function-id 0x1::managed_coin::burn \
    --args u64:1000 \
    --type-args 0xd02617efb7147fc1b313d6a6feadef2fc5b21e38268cea50f51ec2222ae64a2f::Coins::TestCoin
```

### register for receiver
```bash
aptos move run --function-id 0x1::managed_coin::register \
    --type-args 0xd02617efb7147fc1b313d6a6feadef2fc5b21e38268cea50f51ec2222ae64a2f::Coins::TestCoin \
    --private-key 0xc43f88efcf5b14dc9ba00f3d73e8a455df260e730133fcd81386df1d463d0332
```

### mint to receiver by owner
```bash
aptos move run --function-id 0x1::managed_coin::mint \
    --args address:0x2e39b3b448114792d41ea4ee26f536595a001f734f94b5bd56ae3de6c3096cb0 u64:10000 \
    --type-args 0xd02617efb7147fc1b313d6a6feadef2fc5b21e38268cea50f51ec2222ae64a2f::Coins::TestCoin
```

### transfer from receiver to owner
```bash
aptos move run --function-id 0x1::coin::transfer \
    --args address:0xd02617efb7147fc1b313d6a6feadef2fc5b21e38268cea50f51ec2222ae64a2f u64:111 \
    --type-args 0xd02617efb7147fc1b313d6a6feadef2fc5b21e38268cea50f51ec2222ae64a2f::Coins::TestCoin \
    --private-key 0xc43f88efcf5b14dc9ba00f3d73e8a455df260e730133fcd81386df1d463d0332
```

### query the coin
```bash
# query owner
aptos account list --account 0xd02617efb7147fc1b313d6a6feadef2fc5b21e38268cea50f51ec2222ae64a2f
# quert receiver
aptos account list --account 0x2e39b3b448114792d41ea4ee26f536595a001f734f94b5bd56ae3de6c3096cb0
```

### Ditto for XBTC and XETH
```bash
aptos move run \
    --function-id 0x1::managed_coin::initialize \
    --args string:"XBTC" string:"XBTC" u8:8 bool:true \
    --type-args 0xd02617efb7147fc1b313d6a6feadef2fc5b21e38268cea50f51ec2222ae64a2f::Coins::XBTC

aptos move run \
    --function-id 0x1::managed_coin::initialize \
    --args string:"XETH" string:"XETH" u8:18 bool:true \
    --type-args 0xd02617efb7147fc1b313d6a6feadef2fc5b21e38268cea50f51ec2222ae64a2f::Coins::XETH
```
