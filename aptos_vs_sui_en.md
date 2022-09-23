## The differences of smart contract programming on Aptos and Sui
   through the comparison and analysis of OmniBTC's mirror BTC Move code.


## Intro
First introduces the paradigm shift of smart contract development, 
from `code and data together` to `code and data separation`.

Then through the example of [BTC cross-chain mirror asset move contracts](https://github.com/OmniBTC/OmniBridge), 
the differences between Aptos and Sui contract programing are introduced.

## Paradigm Shift in Smart Contract Programming 

#### Harvard vs Von Neumann Architecture
Anyone who has studied computer architecture knows that Harvard and Von Neumann Architecture.

The `Harvard Architecture` appeared earlier. In computer design at the time, program and data were two completely different concepts.
The data is placed in memory and the program is part of the controller.
This architecture is less flexible and requires technicians to understand both hardware design and programming.

In the `Von Neumann Architecture`, the program is treated like data. The program is encoded as data, 
and then stored in memory together with the data. This way the computer can call programs in memory to process the data.
The program is no longer part of the controller. This design thinking leads to the separation of hardware and software, 
that is, hardware design and programming can be performed separately! ! ! This gave birth to the career of programmers! ! !

The `Harvard Architecture` is common in the embedded chip industry (such as ARM9~ARM11 chips, while the ARM7 series adopts the Von Neumann Architecture)
PC and server chips are basically `Von Neumann Architecture`.

It can be said that Internet programmers are all programming under the `Von Neumann Architecture`.

In short, the `Harvard Architecture` is `code and data separated`, and the `Von Neumann Architecture` is `code and data together`.

#### BlockChain VM and Smart Contract
VM executing smart contracts always revolve around this core question:
(1) `Where`: Where is the data to be processed by the contract
- `code and data together`: The data is within the scope of the code, and the code can read the data at any time.
- `code and data separation`: Pass data or data location to code, code can only process these given data (can not access other data).

The smart contract programmer are more concerned with:
(2) `Who`: Who can access the data
(3) `How`: How to process this data (business logic)

In short, we classify common blockchain virtual machines:
- `EVM`: `code and data together`
- `WASM`: `code and data together`
- `Solana-BPF`: `code and data separation`
- `Aptos-Move`: `code and data separation`
- `Sui-Move`: `code and data separation`

Because there is no need to care where the data is stored (as in the Von Neumann Architecture, the programmer does not need to know the hardware circuit),

So it is easier for Web2 programmers to write contract programs on `EVM` and `WASM`.

If you write smart contracts on `Solana-BPF`, `Aptos-Move`, `Sui-Move`,
You need to care about the location of the data, just like the hardware engineer cares about the data controller:
- `Solana contract`: 
  The caller needs to specify the address to access the data and its read/write properties.
- `Sui contract`: 
  Similar to solana, the caller needs to specify the object-id to access the data.
- `Aptos contract`: 
  Simpler, data is bound to signer through `move_to`, contract deployer is bound to contract,
the contract can also have its own state data. And the caller no longer needs to specify the access 
data (but the caller needs to register the data in advance and complete the move_to binding).

## Example Comparison 
Implemented BTC cross-chain mirror asset contracts on Aptos and Sui respectively

[OmniBridge Source Code](https://github.com/OmniBTC/OmniBridge)

- `Similarities`: [Aptos and Sui use the same VM and smart contract development language](https://github.com/move-language/move)
- `Differences`:
  - **(1) Aptos and Sui's VM library functions (for internal calls of contracts) are different.**
  ```bash
  To prevent duplicate deposits, a queue is required to store deposited requests
  
  Table(defined in AptosStdlib) used internally by bridge-aptos's iterable_table.
  vector(defined in MoveStdlib) used internally by bridge-sui's vec_queue.
  ```

  - **(2) Aptos user contract package address is the address of the contract deployer, while Sui unifies all user contract addresses under the `0x0` address.**
  ```bash
  bridge::initialize can only be called by the contract owner

  In bridge-aptos, you can use "@owner" directly for comparison
  In bridge-sui, the creator can only save to Info at init, and take out the comparison when calling initialize.
  ```
  - **(3) Aptos user need to define and call initialize and other functions to complete the initialization of the contract, while Sui user only need to define the init function (can not pass custom parameters), and complete the initialization when the contract is deployed.**
  ```bash
  admin and controller can only be initialized once
  
  The initialization in bridge-aptos checks for existence to ensure that the admin and controller are only initialized once.
  The init in bridge-sui first initializes an object, and then calls initialize to complete the final initialization.
  ```
  - (4) **Aptos resource cannot be directly transferred to receiver address, while Sui object can be directly transferred to receiver address.**
  ```bash
  transfer XBTC
  
  bridge-aptos needs xbtc::register first, then xbtc::transfer
  bridge-sui just one step, xbtc::split_and_transfer
  ```
  - (5) **Fungible tokens in Aptos do not require `merge` operation, while Sui provides `merge` to merge many small objects into 1 object.**
  ```bash
  transfer XBTC
  
  bridge-sui xbtc::join and xbtc::join_vec
  ```
  - (6) **Resources and signers are bound by move_to in Aptos contracts and disabled in Sui contracts.**
  ```bash
  bridge-sui if call move_to in xbtc::init, and the following error occurs when compiling:
  
  ExecutionErrorInner { 
    kind: SuiMoveVerificationError, 
    source: Some(
           "Access to Move global storage is not allowed. 
           Found in function init: [MoveTo(StructDefinitionIndex(1))]"
    ) 
  }
  ```
  - (7) **Aptos can use `public(script)`, while Sui deprecates `public(script)`.**
  ```bash
  bridge-sui if use `public(script)`, and the following error occurs when compiling:
  
  'public(script)' is deprecated in favor of the 'entry' modifier. Replace with 'public entry'
  ```
  - (8) **Aptos address is 32 bytes, while Sui address is 20 bytes.**
  ```bash
  bridge-aptos admin example: 0xa24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c0
  bridge-sui   admin example: 0xdea83a5c27ef936cd9efd3bc596696e1d101d647
  ```
  - (9) **Aptos contracts support upgrades, while Sui contracts currently do not support upgrades.**
  ```bash
  bridge-aptos upgrade-policy
  
  `arbitrary`, `compatible`, `immutable` correspond to 0, 1, 2
  0 does not check, forces code substitution,
  1 Do a compatibility check (the same public function cannot change the memory layout of the existing Resource)
  2 Disable upgrade
  Every release will compare the on-chain strategy with the strategy of this release (default is 1),
  Contract upgrades are only allowed if the current policy is smaller than the on-chain policy
  ```
  - (10) **The layer is handled differently between the move contract call request and the contract interface.**

      - For example, the contract parameters of Aptos can only be primitive types, while Sui can be a custom structure (object-id is passed when calling parameters), and the last parameter can only be TxContext.
      - For example, the signer of Aptos is bound to the resource, so the contract can access the corresponding data through the signer, while Sui can only access the corresponding data through the object-id passed by the caller.
      - For example, Aptos contract is easier to do custom access control, while the access control of Sui contract may be in different objects, which requires developers to actively associate these objects, and it is easy to generate contract security vulnerabilities.
  
  ```bash
  bridge-sui bridge::deposit
  
  Function Signature:
  public entry fun deposit(
      account: &signer,
      receiver: address,
      amount: u64,
      memo: String,
  ) acquires Info
  
  Call:
  aptos move run \
  --private-key=$PRIVATE \
  --url=http://127.0.0.1:8080 \
  --function-id=0xa24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c0::bridge::deposit \
  --args address:0xa24881e004fdbc5550932bb2879129351c21432f21f32d94bf11603bebd9f5c0 \
         u64:100000 \
         string:"test" \

  
  bridge-sui bridge::deposit
  
  Function Signature:
  public entry fun deposit(
      info: &mut Info,
      xbtc_cap: &mut TreasuryCap<XBTC>,
      receiver: address,
      amount: u64,
      memo: vector<u8>,
      ctx: &mut TxContext
  )
  
  Call:
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
