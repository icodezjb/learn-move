# Multisig transfer coin transaction

## intro
- `multisign_create`: create a multisig address
```bash
node src/multisign_create.js -h
Usage: multisign_create [options]

Options:
  -p, --pubkey <pubkeys...>    specify ed25519 pubkeys(MAX=32)
  -t, --threshold <threshold>  specify the threshold of multi-sign address
  -h, --help                   display help for command

```

- `multisign_transfer`: transfer coin by single sign
```bash
node src/multisign_transfer.js -h
Usage: multisign_transfer [options]

Options:
  -m, --multi_address <multi_address>  the sender of the coin
  -r, --receiver <receiver>            the receiver of the coin
  -a, --amount <u64>                   the amount of the coin
  --coin <coin>                        the coin type (default: "0x1::aptos_coin::AptosCoin")
  --private_key <private_key>          the privkey for single sign
  --url <url>                          the url to a fullnode on the network
  --chain_id <chain_id>                the chain id, use query if url set
  --sequence <seq>                     the sequence number, use query if url set
  --max_gas <gas>                      the max gas for this transaction (default: "1000")
  --expiration <unix_timestamp>        transaction is discarded if it is not executed before expiration timestamp
  -h, --help                           display help for command
```

- `multisign_commit`: commit multisig transaction to aptos blockchain
```bash
node src/multisign_commit.js -h
Usage: multisign_commit [options]

Options:
  -r, --raw_tx <raw_transaction>    the raw transaction
  -s, --signatures <signatures...>  the signatures of this raw transaction
  -b, --bitmap <bit...>             the bitmap of this transaction in ascending order. eg. [0 3 31]
  -u, --url <url>                   the url to a fullnode on the network
  -p, --public_key <public_key>     the multi sign public key
  --dry_run                         only dry run not commit (default: false)
  -h, --help                        display help for command
```

- `multisign_register`: register coin for multisig address
```bash
node src/multisign_register.js -h
Usage: multisign_register [options]

Options:
  -m, --multi_address <multi_address>  the sender of the coin
  --coin <coin>                        the coin type (default: "0x1::aptos_coin::AptosCoin")
  --private_key <private_key>          the privkey for single sign
  --url <url>                          the url to a fullnode on the network
  --chain_id <chain_id>                the chain id, use query if url set
  --sequence <seq>                     the sequence number, use query if url set
  --max_gas <gas>                      the max gas for this transaction (default: "1000")
  --expiration <unix_timestamp>        transaction is discarded if it is not executed before expiration timestamp
  -h, --help                           display help for command
```

## precondition for this example (2-of-3 multisig)
- [aptos-cli](https://github.com/aptos-labs/aptos-core/releases)
- run `yarn install`
- account1
  ```txt
  private_key: "0x1d5c699949317f8b41f31ddff29332943b1c31dd916e1b6747f408852e25f16f"
  public_key: "0x027b9579c66cbfae60651b7c5f41fcb65eff5e229f29503f17f1eb0780981b89"
  account: d02617efb7147fc1b313d6a6feadef2fc5b21e38268cea50f51ec2222ae64a2f
  ```
- account2
  ```txt
  private_key: "0xc43f88efcf5b14dc9ba00f3d73e8a455df260e730133fcd81386df1d463d0332"
  public_key: "0x9a6c8012d9ac973e976cb85d15f611da4f32f95cf0f55e9bf7e03c2fc347bcd1"
  account: 2e39b3b448114792d41ea4ee26f536595a001f734f94b5bd56ae3de6c3096cb0
  ```
- account3
  ```txt
  private_key: "0x9abfcb4278b1830dc5a0997308ab432a307e42b700f47a374b9ea443e94d5e71"
  public_key: "0xc7d786d56687362612ae0555ae8e3318698f4641bd0f74a6b69608b027acd672"
  account: 1c17d35dc60bfedc67ab25a7967a8153368f072bb5331016894b7d9d455e8dbd
  ```
  
## create a multi-ed25519 account
```bash
node src/multisign_create.js \
    -p 0x027b9579c66cbfae60651b7c5f41fcb65eff5e229f29503f17f1eb0780981b89 \
       0x9a6c8012d9ac973e976cb85d15f611da4f32f95cf0f55e9bf7e03c2fc347bcd1 \
       0xc7d786d56687362612ae0555ae8e3318698f4641bd0f74a6b69608b027acd672 \
    -t 2

---------- 2 -of- 3 Multi-Sign-----
PubKey 0 : 0x027b9579c66cbfae60651b7c5f41fcb65eff5e229f29503f17f1eb0780981b89
PubKey 1 : 0x9a6c8012d9ac973e976cb85d15f611da4f32f95cf0f55e9bf7e03c2fc347bcd1
PubKey 2 : 0xc7d786d56687362612ae0555ae8e3318698f4641bd0f74a6b69608b027acd672
Multi-Sign AuthKey: 0x62f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54
Multi-Sign Address: 0x62f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54
Multi-Sign Pubkey : 0x61027b9579c66cbfae60651b7c5f41fcb65eff5e229f29503f17f1eb0780981b899a6c8012d9ac973e976cb85d15f611da4f32f95cf0f55e9bf7e03c2fc347bcd1c7d786d56687362612ae0555ae8e3318698f4641bd0f74a6b69608b027acd67202
---------- 2 -of- 3 Multi-Sign-----
```
`bitmap`: 
- `0`: account1 `0xd02617efb7147fc1b313d6a6feadef2fc5b21e38268cea50f51ec2222ae64a2f`
- `1`: account2 `0x2e39b3b448114792d41ea4ee26f536595a001f734f94b5bd56ae3de6c3096cb0`
- `2`: account3 `0x1c17d35dc60bfedc67ab25a7967a8153368f072bb5331016894b7d9d455e8dbd`


## fund multi-ed25519 account

transfer some `APT` to `multisig-address`: `0x62f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54`

query balance
```bash
aptos account list --query balance \
    --url https://fullnode.devnet.aptoslabs.com/v1 \
    --account 0x62f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54
{
  "Result": [
    {
      "coin": {
        "value": "100000"
      },
      "deposit_events": {
        "counter": "1",
        "guid": {
          "id": {
            "addr": "0x62f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54",
            "creation_num": "2"
          }
        }
      },
      "frozen": false,
      "withdraw_events": {
        "counter": "0",
        "guid": {
          "id": {
            "addr": "0x62f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54",
            "creation_num": "3"
          }
        }
      }
    }
  ]
}

```

## build multi-ed25519 tx
make a transtion: transfer 1000 APT from `multisig-address` to `0xa24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c0`

account3 first sign, account1 second sign
- account3 sign
```bash
 node src/multisign_transfer.js \
    -m 0x62f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54 \
    -r 0xa24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c0 \
    -a 1000 \
    --private_key 0x9abfcb4278b1830dc5a0997308ab432a307e42b700f47a374b9ea443e94d5e71 \
    --url https://fullnode.devnet.aptoslabs.com/v1 

query chain_id and sequence from the fullnode:
fullnode url:  https://fullnode.devnet.aptoslabs.com/v1

------- 0x1c17d35dc60bfedc67ab25a7967a8153368f072bb5331016894b7d9d455e8dbd build-------

=========multi sign transfer==========
Multi-Address:  0x62f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54
Send Coin    :  0x1::aptos_coin::AptosCoin
Receiver     :  0xa24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c0
Amount       :  1000
Expiration   :  1662609215 (2022-09-08T03:53:35)
Sequence     :  0
Chain Id     :  25
Max gas      :  1000
=========multi sign transfer==========

Raw Transaction(BCS):  0x62f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54000000000000000002000000000000000000000000000000000000000000000000000000000000000104636f696e087472616e73666572010700000000000000000000000000000000000000000000000000000000000000010a6170746f735f636f696e094170746f73436f696e000220a24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c008e803000000000000e80300000000000001000000000000003f6719630000000019

single_signature:  0x91a6b981021abdfb4a1bf3bbf780de1622896857b2f15ef78956aab2e0c1be3177f56d9fa4f65086aed4aadb3fedd2b3b68f4e41746c554ee0b61fe2a35c3101

```

raw transaction: `0x62f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54000000000000000002000000000000000000000000000000000000000000000000000000000000000104636f696e087472616e73666572010700000000000000000000000000000000000000000000000000000000000000010a6170746f735f636f696e094170746f73436f696e000220a24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c008e803000000000000e80300000000000001000000000000003f6719630000000019`

account3 signature: `0x91a6b981021abdfb4a1bf3bbf780de1622896857b2f15ef78956aab2e0c1be3177f56d9fa4f65086aed4aadb3fedd2b3b68f4e41746c554ee0b61fe2a35c3101`

- account1 sign

see the account3 sign info, use `--chain_id`,`--sequence` and `expiration`

make the raw transaction same as account3

```bash
 node src/multisign_transfer.js \
    -m 0x62f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54 \
    -r 0xa24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c0 \
    -a 1000 \
    --chain_id 25 \
    --sequence 0 \
    --expiration 1662609215 \
    --private_key 0x1d5c699949317f8b41f31ddff29332943b1c31dd916e1b6747f408852e25f16f

------- 0xd02617efb7147fc1b313d6a6feadef2fc5b21e38268cea50f51ec2222ae64a2f build-------

=========multi sign transfer==========
Multi-Address:  0x62f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54
Send Coin    :  0x1::aptos_coin::AptosCoin
Receiver     :  0xa24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c0
Amount       :  1000
Expiration   :  1662609215 (2022-09-08T03:53:35)
Sequence     :  0
Chain Id     :  25
Max gas      :  1000
=========multi sign transfer==========

Raw Transaction(BCS):  0x62f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54000000000000000002000000000000000000000000000000000000000000000000000000000000000104636f696e087472616e73666572010700000000000000000000000000000000000000000000000000000000000000010a6170746f735f636f696e094170746f73436f696e000220a24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c008e803000000000000e80300000000000001000000000000003f6719630000000019

single_signature:  0x46afc0a10e1263dfea57c70bc3e482d9fa3f98abeb7406bab8e9b8180190d7619bf9c77730f14c2d1cfdda8b53548699498ff421091c46aa22ea6d9afba55208

```
raw transaction: `0x62f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54000000000000000002000000000000000000000000000000000000000000000000000000000000000104636f696e087472616e73666572010700000000000000000000000000000000000000000000000000000000000000010a6170746f735f636f696e094170746f73436f696e000220a24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c008e803000000000000e80300000000000001000000000000003f6719630000000019`

account1 signature: `0x46afc0a10e1263dfea57c70bc3e482d9fa3f98abeb7406bab8e9b8180190d7619bf9c77730f14c2d1cfdda8b53548699498ff421091c46aa22ea6d9afba55208`


## commit multi-ed25519 tx

Use the bitmap is `[0 2]`, the signatures is
```txt
account1: 0x46afc0a10e1263dfea57c70bc3e482d9fa3f98abeb7406bab8e9b8180190d7619bf9c77730f14c2d1cfdda8b53548699498ff421091c46aa22ea6d9afba55208

account2: 0x91a6b981021abdfb4a1bf3bbf780de1622896857b2f15ef78956aab2e0c1be3177f56d9fa4f65086aed4aadb3fedd2b3b68f4e41746c554ee0b61fe2a35c3101
```

[bitmap `[2 0]` will fail](https://github.com/aptos-labs/aptos-core/blob/main/crates/aptos-crypto/src/unit_tests/multi_ed25519_test.rs#L353-L362)

```bash
$ node src/multisign_commit.js \
    -r 0x62f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54000000000000000002000000000000000000000000000000000000000000000000000000000000000104636f696e087472616e73666572010700000000000000000000000000000000000000000000000000000000000000010a6170746f735f636f696e094170746f73436f696e000220a24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c008e803000000000000e80300000000000001000000000000003f6719630000000019 \
    -s 0x46afc0a10e1263dfea57c70bc3e482d9fa3f98abeb7406bab8e9b8180190d7619bf9c77730f14c2d1cfdda8b53548699498ff421091c46aa22ea6d9afba55208 \
       0x91a6b981021abdfb4a1bf3bbf780de1622896857b2f15ef78956aab2e0c1be3177f56d9fa4f65086aed4aadb3fedd2b3b68f4e41746c554ee0b61fe2a35c3101 \
    -b 0 2 \
    -u https://fullnode.devnet.aptoslabs.com/v1 \
    -p 0x61027b9579c66cbfae60651b7c5f41fcb65eff5e229f29503f17f1eb0780981b899a6c8012d9ac973e976cb85d15f611da4f32f95cf0f55e9bf7e03c2fc347bcd1c7d786d56687362612ae0555ae8e3318698f4641bd0f74a6b69608b027acd67202

=========bitmap==========
bitmap: [ 0, 2 ]
=========bitmap==========

=========multi sign transfer==========
Multi-Address:  0x62f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54
Send Coin    :  0x1::aptos_coin::AptosCoin
Receiver     :  0xa24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c0
Amount       :  1000
Expiration   :  1662609215 (2022-09-08T03:53:35)
Sequence     :  0
Chain Id     :  25
Max gas      :  1000
=========multi sign transfer==========


Multisig Tx hash:  0x9ef5d95c8df8ef1d563ac34f0a2054085cc633f912a7b121c36843267eb69a7a

```

the multisig transaction info 
```txt
{
  version: '77925281',
  hash: '0x9ef5d95c8df8ef1d563ac34f0a2054085cc633f912a7b121c36843267eb69a7a',
  state_change_hash: '0x6cb470baaa2b1329211230420951149b1e982be18ad60172e72efef0bac8339e',
  event_root_hash: '0xb356b99412b16b2cf04920c7932f439651ba06f76f9a5f0ae310f9a50532f120',
  state_checkpoint_hash: null,
  gas_used: '51',
  success: true,
  vm_status: 'Executed successfully',
  accumulator_root_hash: '0x3717573f05ad241373d6d5e28d15cf0492cdde5a47f9626ec0e0b33cde060a37',
  changes: [
    {
      address: '0x62f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54',
      state_key_hash: '0x627f24db005f57a82aed956e50ad943efe69cde7172fe7ee2aae63a2d6cdda31',
      data: [Object],
      type: 'write_resource'
    },
    {
      address: '0x62f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54',
      state_key_hash: '0xb43a7ba20464181eb70e690be84cffdcd48d77677d317d884c09a3607308ae67',
      data: [Object],
      type: 'write_resource'
    },
    {
      address: '0xa24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c0',
      state_key_hash: '0xaf3d556ae274c6c2d759cd269eaa751c237c9009d59b708fcd6eea67d8549263',
      data: [Object],
      type: 'write_resource'
    },
    {
      state_key_hash: '0x6e4b28d40f98a106a65163530924c0dcb40c1349d3aa915d108b4d6cfc1ddb19',
      handle: '0x1b854694ae746cdbd8d44186ca4929b2b337df21d1c74633be19b2710552fdca',
      key: '0x0619dc29a0aac8fa146714058e8dd6d2d0f3bdf5f6331907bf91f3acd81e6935',
      value: '0x12a017c3b10409000100000000000000',
      data: null,
      type: 'write_table_item'
    }
  ],
  sender: '0x62f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54',
  sequence_number: '0',
  max_gas_amount: '1000',
  gas_unit_price: '1',
  expiration_timestamp_secs: '1662609215',
  payload: {
    function: '0x1::coin::transfer',
    type_arguments: [ '0x1::aptos_coin::AptosCoin' ],
    arguments: [
      '0xa24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c0',
      '1000'
    ],
    type: 'entry_function_payload'
  },
  signature: {
    public_keys: [
      '0x027b9579c66cbfae60651b7c5f41fcb65eff5e229f29503f17f1eb0780981b89',
      '0x9a6c8012d9ac973e976cb85d15f611da4f32f95cf0f55e9bf7e03c2fc347bcd1',
      '0xc7d786d56687362612ae0555ae8e3318698f4641bd0f74a6b69608b027acd672'
    ],
    signatures: [
      '0x46afc0a10e1263dfea57c70bc3e482d9fa3f98abeb7406bab8e9b8180190d7619bf9c77730f14c2d1cfdda8b53548699498ff421091c46aa22ea6d9afba55208',
      '0x91a6b981021abdfb4a1bf3bbf780de1622896857b2f15ef78956aab2e0c1be3177f56d9fa4f65086aed4aadb3fedd2b3b68f4e41746c554ee0b61fe2a35c3101'
    ],
    threshold: 2,
    bitmap: '0xa0000000',
    type: 'multi_ed25519_signature'
  },
  events: [
    {
      key: '0x030000000000000062f8da1b73daf749cab1622f4447be56e2f5e42cfd41f000b68f8f01695d4f54',
      sequence_number: '0',
      type: '0x1::coin::WithdrawEvent',
      data: [Object]
    },
    {
      key: '0x0200000000000000a24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c0',
      sequence_number: '3',
      type: '0x1::coin::DepositEvent',
      data: [Object]
    }
  ],
  timestamp: '1662605981259795',
  type: 'user_transaction'
}
```
