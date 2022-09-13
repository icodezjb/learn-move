
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
    Aptos 生态 [https://aptospace.com/](https://aptospace.com/)
    
    普通转账
    1. 搭建local测试网(需要编译aptos-node, aptos-faucet)
        https://aptos.dev/nodes/run-a-local-testnet
        
        CARGO_NET_GIT_FETCH_WITH_CLI=true aptos-node --test --test-dir test
        
        水龙头
        aptos-faucet --chain-id TESTING --mint-key-file-path "./test/mint.key" --address 0.0.0.0 --port 8000 --server-url http://127.0.0.1:8080
        
    2. 区块浏览器
        https://explorer.devnet.aptos.dev/?network=local
    
    3. 安装aptos插件钱包
        [https://aptos.dev/guides/building-wallet-extension/](https://aptos.dev/guides/building-wallet-extension/)
    
        钱包连接local测试网(关闭代理, 让钱包连接http://0.0.0.0:8000)
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
    ```

3. ****Awesome Move****

   https://github.com/MystenLabs/awesome-move

4. ****Move Tutorial:****

    https://github.com/move-language/move/tree/main/language/documentation/tutorial

5. ****明星公链Aptos初体验--发送交易和构建合约****

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
10. [Why We Created Sui Move](https://medium.com/mysten-labs/why-we-created-sui-move-6a234656c36b)
