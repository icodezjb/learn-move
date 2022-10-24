
# move 开发者资料

0. 项目白皮书
    - [aptos白皮书英文原版](https://aptos.dev/assets/files/2022.08.11.10.00.aptos_whitepaper-47099b4b907b432f81fc0effd34f3b6a.pdf)
    - [aptos白皮书中文版](./docs/aptos_whitepaper_by_moveworld.pdf)
    - [sui白皮书英文原版](https://github.com/MystenLabs/sui/blob/main/doc/paper/sui.pdf)
    - [sui白皮书中文版](./docs/sui_whitepaper_by_moveworld.pdf)

1. ****Aptos****
    ```txt
    Aptos 官网 [https://aptoslabs.com/](https://aptoslabs.com/)
    Aptos 代码 [https://github.com/aptos-labs/aptos-core](https://github.com/aptos-labs/aptos-core)
    Aptos 官方钱包 [https://aptos.dev/guides/building-wallet-extension/](https://aptos.dev/guides/building-wallet-extension/)
    Aptos 第三方钱包 [https://martianwallet.xyz/](https://martianwallet.xyz/)
    Aptos 区块浏览器 [https://explorer.devnet.aptos.dev/](https://explorer.devnet.aptos.dev/)
    Aptos 官方文档 [https://aptos.dev/](https://aptos.dev/)
    Aptos 生态 [https://aptos.super.site/](https://aptos.super.site/)
    
    普通转账
    1. 搭建local测试网
        方式1：(需要编译aptos)
        aptos node run-local-testnet --force-restart --with-faucet

        方式2：(需要编译aptos-node, aptos-faucet)
        https://aptos.dev/nodes/run-a-local-testnet
        
        CARGO_NET_GIT_FETCH_WITH_CLI=true aptos-node --test --test-dir test
        
        水龙头
        aptos-faucet --chain-id TESTING --mint-key-file-path "./test/mint.key" --address 0.0.0.0 --port 8000 --server-url http://127.0.0.1:8080
        
        领取localnet测试币
        curl --location --request POST 'http://127.0.0.1:8000/mint?amount=10000000&address=a24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c0'
        领取aptos devnet测试币
        curl --location --request POST 'https://faucet.devnet.aptoslabs.com/mint?amount=1000&address=a24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c0'
    
    2. 区块浏览器
        https://explorer.devnet.aptos.dev/?network=local
    
    3. 安装aptos插件钱包: https://petra.app/
    
        钱包连接local测试网(关闭代理, 让钱包连接Localhost)
        
        Petra 默认调用 http://localhost:80 领取水龙头测试币
        所以需要本地配置端口转发(80 -> 8000), 
        
        sudo socat TCP4-LISTEN:80,reuseaddr,fork TCP4:127.0.0.1:8000
   
        如果不用插件钱包，可以编译aptos，可用这个命令行工具转账
      注意: 
        (1) pubkey不等于address(aptos init的时候需要填写私钥,如果没有注册,会打印出account 地址)
        (2) transfer 相关的from和to都必须在链上存在才能转账成功
        aptos key generate --output-file testkey
        
        aptos account create --account \
                0xb00939ac2e339fca870ee96826e75f851ea74d65039f850f980906744f7a7cdd \
                --url http://127.0.0.1:8080 --faucet-url http://127.0.0.1:8000 \
                --use-faucet
        aptos account list --account \
                0xb00939ac2e339fca870ee96826e75f851ea74d65039f850f980906744f7a7cdd \
                --url http://127.0.0.1:8080
    
        aptos account create --account \
                0x96ea2aac87bd650548a1bf6d740fff4b86e7a82d6daa2b9673d026bfe363a32d \
                --url http://127.0.0.1:8080 --faucet-url http://127.0.0.1:8000 \
                --use-faucet
    
        aptos account list --account \
                0x96ea2aac87bd650548a1bf6d740fff4b86e7a82d6daa2b9673d026bfe363a32d \
                --url http://127.0.0.1:8080
        
        ./aptos account transfer --account \
                0x96ea2aac87bd650548a1bf6d740fff4b86e7a82d6daa2b9673d026bfe363a32d \
                --amount 1000 --private-key-file testkey  \
                --url http://127.0.0.1:8080
    
    4. 通过插件钱包进行普通转账
    
    合约开发
    5. 编译aptos
        cd crates/aptos && cargo build --release
    6. aptos move提供了move合约开发的系列工具，且内置使用aptos-framework(
        aptos自带的move合约库，以及move自带的，这些基础的move合约开箱即用)
        https://aptos.dev/cli-tools/aptos-cli-tool/use-aptos-cli/#move-examples
        
        (1) mkdir move-example && cd move-example
        (2) aptos move init --name basecoin --named-addresses basecoin=0xCAFE
                本地开发，修改Move.toml，指定本地依赖 AptosFramework
                AptosFramework = { local = "../../aptos-move/framework/aptos-framework" }
        (3) 编写 basecoin 合约内容
        (4) aptos move compile
        (5) aptos move test
        (6) aptos move publish \
                --named-addresses basecoin=0xb00939ac2e339fca870ee96826e75f851ea74d65039f850f980906744f7a7cdd \
                --private-key-file testkey 
              --url http://127.0.0.1:8080
        (7) aptos move run \
                --function-id 0xb00939ac2e339fca870ee96826e75f851ea74d65039f850f980906744f7a7cdd::BasicCoin::mint \ 
                --private-key-file testkey \
              --url http://127.0.0.1:8080 \
                --args u64:5555
        (8) apt init
                将url和私钥配置到.apt目录，上面的命令就可以不用指定url和私钥了
    
    合约升级
    7. aptos move publish --upgrade-policy 
        `arbitrary`, `compatible`, `immutable` 对应 0， 1，2
        0 不做任何检查，强制替换code,
        1 做兼容性检查(同样的public 函数，不能改变已有Resource的内存布局)
        2 禁止升级
        每次publish的时候会比较链上的policy和此次publish的policy(默认是1),
        只有此次的policy小于链上的policy时才允许合约升级
    ```

2. ****Sui****
    ```txt
    Sui 官网: https://sui.io/#
    Sui 代码: https://github.com/MystenLabs/sui
    Sui 官方钱包(浏览器插件): https://docs.sui.io/devnet/explore/wallet-browser
    Sui 浏览器: https://explorer.devnet.sui.io/
    Sui 官方文档: https://docs.sui.io/learn
   
    1. 源码编译
      git clone https://github.com/MystenLabs/sui.git
      git checkout devnet-0.9.0
      cargo build --release
      
      得 sui,sui-node,sui-faucet,sui-test-validator
    
    2. 本地测试网搭建1(快速启动,数据不复用)
      sui-test-validator会在临时目录下创建4个validators+1个fullnode的local测试网(faucet账户1000个gas object,即 100000000000)
      (1) 执行命令, 起测试网
      $ sui-test-validator
      Fullnode RPC URL: http://127.0.0.1:9000
      Fullnode Websocket URL: 127.0.0.1:9001
      Gateway RPC URL: http://127.0.0.1:5001
      Faucet URL: http://127.0.0.1:9123

      (2) 检查代理, 浏览器打开 https://explorer.devnet.sui.io/, 选择Local

      (3) 执行命令, 领测试币
      $ curl -H "Content-Type: application/json" -X POST -d '{"recipient":"0x017614990a894ad7c26f5bd174ea9c8095b06242"}' "http://127.0.0.1:9123/faucet"
      {"ok":true}
    
    3. 本地测试网搭建2(重启后数据可复用)
      默认目录(linux): ~/.sui/
      (1) 生成genesis及配置文件(4个validators+1个fullnode)
      $ sui genesis
      2022-09-14T06:01:24.030408Z  INFO sui_config::genesis_config: Creating accounts and gas objects...
      2022-09-14T06:01:24.069524Z  INFO sui::sui_commands: Network genesis completed.
      2022-09-14T06:01:24.070775Z  INFO sui::sui_commands: Network config file is stored in "/home/chain/.sui/sui_config/network.yaml".
      2022-09-14T06:01:24.070783Z  INFO sui::sui_commands: Client keystore is stored in "/home/chain/.sui/sui_config/sui.keystore".
      2022-09-14T06:01:24.070872Z  INFO sui::sui_commands: Gateway config file is stored in "/home/chain/.sui/sui_config/gateway.yaml".
      2022-09-14T06:01:24.070970Z  INFO sui::sui_commands: Client config file is stored in "/home/chain/.sui/sui_config/client.yaml".

      (2) validators 组网
      $ sui start
   
      (3) 启动fullnode(http和websocket服务)
      $ sui-node --config-path ~/.sui/sui_config/fullnode.yaml
   
      (4) 检查代理, 浏览器打开 https://explorer.devnet.sui.io/, 选择Local
   
      (5) 检查代理, 启动水龙头
      $ sui-faucet
      2022-09-14T06:09:15.489118Z  INFO sui_faucet: Max concurrency: 30.
      2022-09-14T06:09:15.489631Z  INFO sui_faucet: Initialize wallet from config path: "/home/chain/.sui/sui_config/client.yaml"
      2022-09-14T06:09:15.555282Z  INFO sui_storage::lock_service: LockService command processing loop started
      2022-09-14T06:09:15.555280Z  INFO sui_storage::lock_service: LockService queries processing loop started
      2022-09-14T06:09:15.577705Z  INFO sui_faucet: Starting Prometheus HTTP endpoint at 0.0.0.0:9184
      2022-09-14T06:09:15.579142Z  INFO sui_faucet::faucet::simple_faucet: SimpleFaucet::new with active address: 0x07eab5bb4dbdffd5d2c12c6431da8609ae3b5dd8
      2022-09-14T06:09:15.600278Z  INFO sui_faucet: listening on 127.0.0.1:5003
   
      (6) 检查水龙头服务
      $ curl http://127.0.0.1:5003
      OK
   
      (7) 执行命令, 领测试币
      $ curl -H "Content-Type: application/json" \
        -X POST \
        -d '{"FixedAmountRequest":{"recipient":"0x017614990a894ad7c26f5bd174ea9c8095b06242"}}' \
        "http://127.0.0.1:5003/gas"
   
    4. 普通转账
      (1) 查看默认账户(用于签名交易)
      $ sui client active-address
      0x07eab5bb4dbdffd5d2c12c6431da8609ae3b5dd8
      
      (2) 查看当前客户端下的所有账户
      $ sui client addresses
      Showing 5 results.
      0x07eab5bb4dbdffd5d2c12c6431da8609ae3b5dd8
      0x143eaa9b239382f6a5c360c0c407571183efea5a
      0x62427915aba4c593e4d6092ebe8740f3de73d413
      0x7ab69f783fdd9f3f1021cb6249bd9b373be950e3
      0xc2bfdd8e835d9419414eb20d6d85da54b6d7ef83
   
      (3) 查看默认账户所有的objects
      $ sui client objects
                      Object ID                  |  Version   |                    Digest                    |   Owner Type    |               Object Type               
      ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
      0x25500da23617b95f5cc40c6695f12ac97c29b9fa |     1      | sr4wny/27v+VuHZhsTyv5UQCuXa33MijQBuCJTi4UVg= |  AddressOwner   |      0x2::coin::Coin<0x2::sui::SUI>     
      0x619d9baa1fc679736a16298f433057874ef1c9cb |     1      | oG7nB0qgghNjvKQS2iRj/2ffXFcM4TzqgtyFNP8cFmA= |  AddressOwner   |      0x2::coin::Coin<0x2::sui::SUI>     
      0x86169c6f94351861f4203d9bec4074483ece743b |     1      | NagZV0AvyYeBM5T4+Qqewu9dhrOsWoI6N/F1s3hshfU= |  AddressOwner   |      0x2::coin::Coin<0x2::sui::SUI>     
      0x9f9a9bce97390e0cc2580b337f6f25c77b031668 |     1      | sD/Cpl/DVpETNNQW8iY+dfiEC4UzBbQrx0X5bffF7t0= |  AddressOwner   |      0x2::coin::Coin<0x2::sui::SUI>     
      0xa98efc17c852db6970541e31409a1c9e83d26f02 |     1      | n9HhBXkhhGytAGiugM9QPxDb/nAqoMUc/lFSjiGixCM= |  AddressOwner   |      0x2::coin::Coin<0x2::sui::SUI>     
      Showing 5 results.

      (4) 查看指定object
      $ sui client object --id 0x25500da23617b95f5cc40c6695f12ac97c29b9fa
      ----- Move Object (0x25500da23617b95f5cc40c6695f12ac97c29b9fa[1]) -----
      Owner: Account Address ( 0x07eab5bb4dbdffd5d2c12c6431da8609ae3b5dd8 )
      Version: 1
      Storage Rebate: 16
      Previous Transaction: Avc/mpGqjUKSspkklOHI7d0xTkFdx36e2hRowMPrP+w=
      ----- Data -----
      type: 0x2::coin::Coin<0x2::sui::SUI>
      balance: 99949907
      id: 0x25500da23617b95f5cc40c6695f12ac97c29b9fa
      
      (5) 查看指定账户余额
      $ sui client gas --address 0x07eab5bb4dbdffd5d2c12c6431da8609ae3b5dd8
                       Object ID                  |  Gas Value 
      ----------------------------------------------------------------------
      0x25500da23617b95f5cc40c6695f12ac97c29b9fa |  99949746  
      0x619d9baa1fc679736a16298f433057874ef1c9cb |  99949907  
      0x86169c6f94351861f4203d9bec4074483ece743b |  99949907  
      0x9f9a9bce97390e0cc2580b337f6f25c77b031668 |  99949907  
      0xa98efc17c852db6970541e31409a1c9e83d26f02 |  99949907

      (6) 转 500 sui 到 0x017614990a894ad7c26f5bd174ea9c8095b06242
      $ sui client transfer-sui \
        --amount 100 \
        --to 0x017614990a894ad7c26f5bd174ea9c8095b06242 \
        --sui-coin-object-id 0x25500da23617b95f5cc40c6695f12ac97c29b9fa \
        --gas-budget 10000

      ----- Certificate ----
      Transaction Hash: 9WNSiDt4kHvHJbuwcYPgA5qMXpLzFRadirDtXpuMaEU=
      Transaction Signature: AA==@o1IqHwSDateWAaxquRdrk0nlSrn0LszM9YTTV4HAn0Urlo2mOK07ppSCXEWHutsZQffMdzkC2Ri8vfwr4FwxBA==@DRaRxLuGWh9Y7gU0bePmmBNaSF+xXrZita1rfGgdZa0=
      Signed Authorities Bitmap: RoaringBitmap<[0, 1, 2]>
      Transaction Kind : Transfer SUI
      Recipient : 0x017614990a894ad7c26f5bd174ea9c8095b06242
      Amount: 100

      ----- Transaction Effects ----
      Status : Success
      Created Objects:
      - ID: 0x7cbeb294db017cc6c1f95e1151738642640fa36e , Owner: Account Address ( 0x017614990a894ad7c26f5bd174ea9c8095b06242 )
        Mutated Objects:
      - ID: 0x25500da23617b95f5cc40c6695f12ac97c29b9fa , Owner: Account Address ( 0x07eab5bb4dbdffd5d2c12c6431da8609ae3b5dd8 )

    5. sui的合并与拆解
      (1) merge-coin
      合并前
      $ sui client gas --address 0x07eab5bb4dbdffd5d2c12c6431da8609ae3b5dd8
                       Object ID                  |  Gas Value 
      ----------------------------------------------------------------------
      0x25500da23617b95f5cc40c6695f12ac97c29b9fa |  99949746  
      0x619d9baa1fc679736a16298f433057874ef1c9cb |  99949907  
      0x86169c6f94351861f4203d9bec4074483ece743b |  99949907  
      0x9f9a9bce97390e0cc2580b337f6f25c77b031668 |  99949907  
      0xa98efc17c852db6970541e31409a1c9e83d26f02 |  99949907
      
      将 0xa98efc17c852db6970541e31409a1c9e83d26f02 合并到 0x9f9a9bce97390e0cc2580b337f6f25c77b031668
      $ sui client merge-coin \
        --primary-coin 0x9f9a9bce97390e0cc2580b337f6f25c77b031668 \
        --coin-to-merge 0xa98efc17c852db6970541e31409a1c9e83d26f02 \
        --gas-budget 1000
      ----- Certificate ----
      Transaction Hash: tolTzRhi+D0i1OxW7Av/lAAj0AlSvEwJTHcThXwiy9E=
      Transaction Signature: AA==@yKbytoEFIkG4hgD69w4B/x0OpOdeFuwTYwMNmLYWC3ccC2HHqj10d3EQJhUddjiXOSA4DTrvcDXg+RbQfi5jCg==@DRaRxLuGWh9Y7gU0bePmmBNaSF+xXrZita1rfGgdZa0=
      Signed Authorities Bitmap: RoaringBitmap<[0, 2, 3]>
      Transaction Kind : Call
      Package ID : 0x2
      Module : coin
      Function : join
      Arguments : ["0x9f9a9bce97390e0cc2580b337f6f25c77b031668", "0xa98efc17c852db6970541e31409a1c9e83d26f02"]
      Type Arguments : ["0x2::sui::SUI"]
      ----- Transaction Effects ----
      Status : Success
      Mutated Objects:
      - ID: 0x25500da23617b95f5cc40c6695f12ac97c29b9fa , Owner: Account Address ( 0x07eab5bb4dbdffd5d2c12c6431da8609ae3b5dd8 )
      - ID: 0x9f9a9bce97390e0cc2580b337f6f25c77b031668 , Owner: Account Address ( 0x07eab5bb4dbdffd5d2c12c6431da8609ae3b5dd8 )
        Deleted Objects:
      - ID: 0xa98efc17c852db6970541e31409a1c9e83d26f02
        ----- Merge Coin Results ----
        Updated Coin : Coin { id: 0x9f9a9bce97390e0cc2580b337f6f25c77b031668, value: 199899814 }
        Updated Gas : Coin { id: 0x25500da23617b95f5cc40c6695f12ac97c29b9fa, value: 99949299 }

      合并后
      $ sui client gas --address 0x07eab5bb4dbdffd5d2c12c6431da8609ae3b5dd8
                       Object ID                  |  Gas Value 
      ----------------------------------------------------------------------
      0x25500da23617b95f5cc40c6695f12ac97c29b9fa |  99949299  
      0x619d9baa1fc679736a16298f433057874ef1c9cb |  99949907  
      0x86169c6f94351861f4203d9bec4074483ece743b |  99949907  
      0x9f9a9bce97390e0cc2580b337f6f25c77b031668 |  199899814

      (2) split-coin
      2等分一个coin object
      $ sui client split-coin \
           --coin-id 0x9f9a9bce97390e0cc2580b337f6f25c77b031668 \
           --count 2  \
           --gas-budget 1000
      ----- Certificate ----
      Transaction Hash: AIxZ7PdmmIe1xrDmSj9mVfnd+CH3bowZhNQemCDNX80=
      Transaction Signature: AA==@MSJHoyxe5TQTbcc4F3/aqXEMzczVEE5gyvHmPDc6+md9sBbz0aX4RnZl7B67Yhj8/fgXsL/ZdsubuidO1w5qBA==@DRaRxLuGWh9Y7gU0bePmmBNaSF+xXrZita1rfGgdZa0=
      Signed Authorities Bitmap: RoaringBitmap<[0, 2, 3]>
      Transaction Kind : Call
      Package ID : 0x2
      Module : coin
      Function : split_n
      Arguments : ["0x9f9a9bce97390e0cc2580b337f6f25c77b031668", 2]
      Type Arguments : ["0x2::sui::SUI"]
      ----- Transaction Effects ----
      Status : Success
      Created Objects:
      - ID: 0xcce677fe40fb33fb5825498b2d379985c4f080c4 , Owner: Account Address ( 0x07eab5bb4dbdffd5d2c12c6431da8609ae3b5dd8 )
        Mutated Objects:
      - ID: 0x25500da23617b95f5cc40c6695f12ac97c29b9fa , Owner: Account Address ( 0x07eab5bb4dbdffd5d2c12c6431da8609ae3b5dd8 )
      - ID: 0x9f9a9bce97390e0cc2580b337f6f25c77b031668 , Owner: Account Address ( 0x07eab5bb4dbdffd5d2c12c6431da8609ae3b5dd8 )
        ----- Split Coin Results ----
        Updated Coin : Coin { id: 0x9f9a9bce97390e0cc2580b337f6f25c77b031668, value: 99949907 }
        New Coins : Coin { id: 0xcce677fe40fb33fb5825498b2d379985c4f080c4, value: 99949907 }
        Updated Gas : Coin { id: 0x25500da23617b95f5cc40c6695f12ac97c29b9fa, value: 99948788 }
   
    6. 合约调用
       sui合约初始化函数init
       https://github.com/MystenLabs/sui/blob/main/crates/sui-verifier/src/lib.rs#L20
       
       每个sui module可以设置一个init函数(在publish的时候完成初始化), 最多只有两个参数, 
       (TxContext) 或 (Struct, TxContext) 

       (1) 启动临时测试网:
       $ sui-test-validator 
       Fullnode RPC URL: http://127.0.0.1:9000
       Fullnode Websocket URL: 127.0.0.1:9001
       Gateway RPC URL: http://127.0.0.1:5001
       Faucet URL: http://127.0.0.1:9123

       (2) 切换目录
       cd sui/sui_programmability/examples/fungible_tokens
   
       (3) 准备2个测试账户
       新建2个目录: account1和account2, 使用sui keytool generate ed25519创建新账户
       最终结果如下:
       $ cat account1/0x43e298abf29753ca0638637c98a1b5dfc766bccf.key
        [
          "AMbJQfNGb5jYS66TzSCYpOt2SKe/NWy/++6hYKozZoMRpeShBjqifL4lMmw163mrEvLFecoI/QEi9p7tbPTMfFE="
        ]
   
       $ cat account1/client.yaml
       ---
       keystore:
       File: /home/chain/workrust/sui/sui_programmability/examples/fungible_tokens/account1/0x43e298abf29753ca0638637c98a1b5dfc766bccf.key
       gateway:
       rpc:
       - "http://127.0.0.1:5001"
       active_address: "0x43e298abf29753ca0638637c98a1b5dfc766bccf"
       fullnode: ~
       
       $ cat account2/0x967669e360b1d8d860459ca3978d76a895ee292f.key 
        [
          "ABcvObCLf9kDCjKTHjxZy28h/yScv61X0qChL+IovRGz52ZHZGwcj1q2IlklJ5ifR+cjl5Ku0bgKodoSGMcu5Kc="
        ]

       $ cat account2/client.yaml 
       ---
       keystore:
       File: /home/chain/workrust/sui/sui_programmability/examples/fungible_tokens/account2/0x967669e360b1d8d860459ca3978d76a895ee292f.key
       gateway:
       rpc:
       - "http://127.0.0.1:5001"
       active_address: "0x967669e360b1d8d860459ca3978d76a895ee292f"
       fullnode: ~

       测试一下:
       $ sui client --client.config="account1/client.yaml" active-address
        0x43e298abf29753ca0638637c98a1b5dfc766bccf
       $ sui client --client.config="account2/client.yaml" active-address
        0x967669e360b1d8d860459ca3978d76a895ee292f
       
       领sui测试币
       $ curl -H "Content-Type: application/json" \
         -X POST \
         -d '{"recipient":"0x43e298abf29753ca0638637c98a1b5dfc766bccf"}' \
         "http://127.0.0.1:9123/faucet" 
       {"ok":true}
       
       $ curl -H "Content-Type: application/json" \
         -X POST \
         -d '{"recipient":"0x967669e360b1d8d860459ca3978d76a895ee292f"}' \
         "http://127.0.0.1:9123/faucet" 
       {"ok":true}

       (4) 检查代理, 浏览器打开 https://explorer.devnet.sui.io/, 选择Local
       
       (5) 部署 FungibleTokens 合约
       $ sui client --client.config="account1/client.yaml" publish --gas-budget 10000
        
        部分关键信息如下:
        package      :       0x3fd65126702428870d4f8263c876ee35b6149399
        abc::Registry:       0x522b9cb893a607409f77d42b484773dd8523f655
        RegulatedCoin:       0x6473ce590af3b0274e0ab0d1a3ce2886f407bcc4
        abc::AbcTreasuryCap: 0x92befce929b4194dbf5c989ee4e2ca506dd9c52f

       (6) account1 调用 abc::mint 
       $ sui client --client.config="account1/client.yaml" call \
          --gas-budget 10000 \
          --package 0x3fd65126702428870d4f8263c876ee35b6149399 \
          --module "abc" \
          --function "mint" \
          --args "0x92befce929b4194dbf5c989ee4e2ca506dd9c52f" \
                 "0x6473ce590af3b0274e0ab0d1a3ce2886f407bcc4" \
                 10000
       
       (7) account1 调用 abc::create
       $ sui client --client.config="account1/client.yaml" call \
         --gas-budget 10000 \
         --package 0x3fd65126702428870d4f8263c876ee35b6149399 \
         --module "abc" \
         --function "create" \
         --args "0x92befce929b4194dbf5c989ee4e2ca506dd9c52f" \
                "0x967669e360b1d8d860459ca3978d76a895ee292f"  
       
       $ sui client --client.config="account1/client.yaml" objects
   
       得新的object 0x11809317d32a9237dc40ef51c3eb76f3904436f0
       
       (8) account1 调用 abc::transfer 
       $ sui client --client.config="account1/client.yaml" call \
         --gas-budget 10000 \
         --package 0x3fd65126702428870d4f8263c876ee35b6149399 \
         --module "abc" \
         --function "transfer" \
         --args "0x522b9cb893a607409f77d42b484773dd8523f655" \
                "0x6473ce590af3b0274e0ab0d1a3ce2886f407bcc4"  
                1000     \
               "0x967669e360b1d8d860459ca3978d76a895ee292f"
      
       得新的object 0x7ee38468711ada525091db16a36d98b745a24685
       
       (9) account2 调用 abc::accept_transfer
       $ sui client --client.config="account2/client.yaml" call \
          --gas-budget 10000 \
          --package 0x3fd65126702428870d4f8263c876ee35b6149399 \
          --module "abc" \
          --function "accept_transfer"  \
          --args "0x522b9cb893a607409f77d42b484773dd8523f655" \
                 "0x11809317d32a9237dc40ef51c3eb76f3904436f0" \
                 "0x7ee38468711ada525091db16a36d98b745a24685"

3. [Aptos和Sui Move合约开发有哪些异同](./aptos_vs_sui.md)

4. ****Awesome Move****

   https://github.com/MystenLabs/awesome-move

5. ****Move Tutorial:****

    https://github.com/move-language/move/tree/main/language/documentation/tutorial

6. ****明星公链Aptos初体验--发送交易和构建合约****

   https://learnblockchain.cn/article/4466

   ****无需合约，在Aptos上发行一个nft****

   https://learnblockchain.cn/article/4473

   ****全方位讲解Move开发测试部署工具栈****

   https://learnblockchain.cn/article/3005


6. **[Global Storage - Operators](https://move-language.github.io/move/global-storage-operators.html#global-storage---operators)**

- 用key修饰的struct, 可以通过 move_to 放到链上，有相应的地址
- 用store修饰的struct, 一般作为被key 修饰的struct的字段, 存在链上
- 用copy修饰的struct，可以隐式的复制struct的值，
- 用drop修饰的struct, 一般作为被key 修饰的struct的字段, 从链上删除

   key,store,drop控制的是我的资源要不要放到链上，要不要从链上删除，copy 更多的是用到中间处理过程中

7. ****aptos公钥转地址****

    ed25519公钥是32字节, AuthenticationKey也是32字节, AccountAddress有16，20，32字节，aptos keygen工具用的是32字节的AccountAddress

    32字节的AccountAddress等于32字节的AuthenticationKey

    以ed25519公钥为例计算对应的地址(AccountAddress)

    (1) 取32字节ed25519公钥+1字节Scheme

    **32字节公钥**: C0DE9BE730372641908F9DADD560E4B10C644051ED947E8E148A7833A71DA00A00

    **1字节Scheme**:

    00 (ed25519对应00)

    https://github.com/aptos-labs/aptos-core/blob/main/types/src/transaction/authenticator.rs#L241

    (2) 对33字节数据进行Sha3-256 hash即得32字节的AuthenticationKey，也就是32字节的地址

    **33字节preimage**:
    C0DE9BE730372641908F9DADD560E4B10C644051ED947E8E148A7833A71DA00A0000

    **AuthenticationKey:**

    845f4d5332df61d39d77c19f1af2bae1af5a803ee11f323eeed72b054ff10002

    **AccountAddress:**

    845f4d5332df61d39d77c19f1af2bae1af5a803ee11f323eeed72b054ff10002

    在线工具: https://emn178.github.io/online-tools/sha3_256.html

    (Input type选Hex, Hash算法选SHA3-256)

8. [如何在Aptos上发行coin?](./mycoin/README.md)
9. [如何在Aptos上用多签账户转账(coin)?](./multisig-transaction/README.md)
10. [为什么要创造 Sui 版本的Move](https://move-china.com/topic/144)

11. [直接transfer aptosnames域名NFT](./aptosname-transfer)

    publish tx result on aptos mainnet
   ```txt
   {
     "Result": {
       "transaction_hash": "0x6995a293f280211742beb8b1b0d2cf03e408ed369991467d550452560523c82c",
       "gas_used": 6830,
       "gas_unit_price": 100,
       "sender": "a24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c0",
       "sequence_number": 10,
       "success": true,
       "timestamp_us": 1666612074120064,
       "version": 10634090,
       "vm_status": "Executed successfully"
     }
   }
   ```
