# Aptos和Sui Move合约开发有哪些异同

## 简介
先介绍了从`code和data一起` 到 `code和data分离` 这种智能合约开发范式转移,
再通过[在Aptos和Sui上BTC跨链镜像资产合约实例](https://github.com/OmniBTC/OmniBridge), 介绍了Aptos和Sui合约开发的异同点

## 智能合约开发范式转移

### 哈佛结构和冯·诺依曼结构
学过计算机体系结构的都知道, 哈佛结构和冯·诺依曼结构。

哈佛结构出现的更早, 当时的计算机设计, 程序和数据是俩个截然不同的概念,
数据放在存储器中，而程序作为控制器的一部分. 
这种架构灵活性较差, 需要技术员既要懂硬件设计,又要懂程序设计.

冯·诺依曼结构中, 将程序和数据一样看待, 将程序编码为数据,然后与数据一同存放在存储器中,
这样计算机就可以调用存储器中的程序来处理数据. 程序不再是控制器的一部分了.
这种设计思想导致了硬件和软件的分离, 即硬件设计和程序设计可以分开执行!!!
这就催生了程序员这个职业的诞生!!! 

哈佛结构在嵌入式芯片行业常见(比如ARM9~ARM11芯片, 而ARM7系列则采用了冯·诺依曼结构)
而PC和服务器芯片基本是冯·诺依曼结构.

可以说, 互联网程序员都是在冯·诺依曼结构下进行程序设计.

简单地, 哈佛结构就是`code和data分离`, 冯·诺依曼结构就是`code和data一起`.

### 区块链虚拟机与智能合约开发

虚拟机执行智能合约始终围绕着这个核心问题:
(1) Where: 合约要处理的数据在哪
- `code和data一起`: data处于code所在的作用域, code随时读取data.
- `code和data分离`: 将data或data的位置传给code, 且code只能处理这些给定的数据(无法访问其他数据).

而合约开发者更关心:
(2) Who: 谁能访问这些数据
(3) How：如何处理这些数据(业务逻辑)

简单地, 我们把常见的区块链虚拟机分类:

- `EVM`: `code和data一起`
- `WASM`: `code和data一起`
- `Solana-BPF`: `code和data分离`
- `Aptos-Move`: `code和data分离`
- `Sui-Move`: `code和data分离`

因为不需要关心data的存储位置(就像冯·诺依曼结构下, 程序员不需要懂硬件电路一样),

所以对于互联网程序员来说, 在`EVM`和`WASM`上编写合约程序更简单.

如果在`Solana-BPF`,`Aptos-Move`,`Sui-Move`上开发智能合约, 
就需要像硬件工程师关心数据控制器一样去关心data的位置:

- `Solana合约`: 调用者需要指定访问data的地址及其读写属性.
- `Sui合约`: 与solana类似, 调用者需要指定访问data的object-id.
- `Aptos合约`: 更简单, 数据通过move_to和signer绑定, 又通过将合约部署者和合约绑定, 
  使得合约也可以拥有自己的状态数据, 调用者不再需要自己指定访问data(但需要调用者提前注册data, 完成move_to绑定)

合约开发难度 `solana` > `sui` > `aptos`

### Aptos和Sui智能合约开发对比
在Aptos和Sui上, 分别实现了BTC跨链镜像资产合约

[OmniBridge 源码链接](https://github.com/OmniBTC/OmniBridge)

- 相同点: [Aptos和Sui使用的是相同的VM和智能合约开发语言](https://github.com/move-language/move) 
- 不同点: 
  - **(1) Aptos和Sui的VM库函数(供合约内部调用)不同.**
  ```bash
  为了防止重复deposit, 需要一个队列存储已deposit的请求
  
  bridge-aptos 的 iterable_table底层用的是table(定义在AptosStdlib)
  bridge-sui 的 vec_queue底层用的是vector(定义在MoveStdlib)
  ```
  - **(2) Aptos用户合约package地址是合约部署者的地址, 而Sui则将所有用户合约地址统一到`0x0`地址下.**
  ```bash
  bridge::initialize只能由合约的owner调用
  
  bridge-aptos 中可以直接用 "@owner"进行对比
  bridge-sui 中只能在init时将creator先保存到Info中, 调用initialize时在取出对比
  ```
  - **(3) Aptos用户需要自己定义调用initialize等函数完成合约的初始化, 而Sui用户只需要自己定义init函数(不能传自定义参数), 合约部署的时候完成初始化.**
  ```bash
  admin和controller只能被初始化一次
  
  bridge-aptos 中的initialize做了存在性检查, 确保admin和controller只被初始化一次
  bridge-sui 中的init先初始化一个object, 在调用initialize完成最后的初始化
  ```
  - (4) **Aptos resource不能直接转移到receiver地址, 而Sui object可以直接转移到receiver地址.**
  ```bash
  XBTC的transfer
  
  bridge-aptos 需要先xbtc::register, 再xbtc::transfer
  bridge-sui 只需一步xbtc::split_and_transfer
  ```
  - (5) **Aptos中的fungible tokens不需要`merge`操作, 而Sui则提供了`merge`,以便将很多小额objects合并为1个object.**
  ```bash
  XBTC的transfer
  
  bridge-sui xbtc::join和xbtc::join_vec
  ```
  - (6) **Aptos合约内通过move_to将resource和signer绑定, 而Sui合约内禁用move_to.**
  ```bash
  bridge-sui xbtc::init 调用move_to, 编译时报如下错误
  
  ExecutionErrorInner { 
      kind: SuiMoveVerificationError, 
      source: Some(
             "Access to Move global storage is not allowed. 
             Found in function init: [MoveTo(StructDefinitionIndex(1))]"
      ) 
  }
  ```
  - (7) **Aptos中可以使用`public(script)`, 而Sui则废弃了`public(script)`.**
  ```bash
  bridge-sui 中使用`public(script)`, 编译时报如下错误
  
  'public(script)' is deprecated in favor of the 'entry' modifier. Replace with 'public entry'
  ```
  - (8) **Aptos地址是32字节, 而Sui地址是20字节.**
  ```bash
  bridge-aptos admin example: 0xa24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c0
  bridge-sui   admin example: 0xdea83a5c27ef936cd9efd3bc596696e1d101d647
  ```
  - (9) **Aptos合约支持升级, 而Sui合约目前不支持升级.**
  ```bash
  bridge-aptos upgrade-policy
  
  `arbitrary`, `compatible`, `immutable` 对应 0， 1，2
  0 不做任何检查，强制替换code,
  1 做兼容性检查(同样的public 函数，不能改变已有Resource的内存布局)
  2 禁止升级
  每次publish的时候会比较链上的policy和此次publish的policy(默认是1),
  只有此次的policy小于链上的policy时才允许合约升级
  ```
  - (10) **在move合约调用请求与合约接口之间这一层的处理不同.**
  
    - 比如 Aptos的合约参数只能是基本类型, 而Sui则可以是自定义结构(调用传参时传object-id)且最后一个参数只能是TxContext.
  
    - 比如 Aptos的signer绑定了resource, 因此合约可以通过signer访问相应的data, 而Sui只能通过调用者传递的object-id访问相应的data.
  
    - 比如 Aptos合约在做自定义访问控制时更容易, 而Sui合约的访问控制可能会在不同的object中, 这就要求开发者主动关联这些objects, 很容易产生合约安全漏洞.
  ```bash
  bridge-sui bridge::deposit 函数签名及函数调用
  
  public entry fun deposit(
        account: &signer,
        receiver: address,
        amount: u64,
        memo: String,
  ) acquires Info
  
  aptos move run \
    --private-key=$PRIVATE \
    --url=http://127.0.0.1:8080 \
    --function-id=0xa24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c0::bridge::deposit \
    --args address:0xa24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c0 u64:10000000 string:"test" \

  
  bridge-sui bridge::deposit 函数签名及函数调用
  
  public entry fun deposit(
        info: &mut Info,
        xbtc_cap: &mut TreasuryCap<XBTC>,
        receiver: address,
        amount: u64,
        memo: vector<u8>,
        ctx: &mut TxContext
  )
  
  sui client call --gas-budget 10000 \
    --package 0xc087a76e0495c395db814587688930b7fd808cad \
    --module "bridge" \
    --function "deposit" \
    --args 0xe57396fb7f2c09ffb0fec0af7e175d106dc18253 \
           0x5c3d9503d9963c0887b13e6b1cca4c9ca341d39d \
           0xdea83a5c27ef936cd9efd3bc596696e1d101d647 \
           100000 \
           "test"
  ```



