## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```

# Dimension Doggos

This is a fun and interactive multi chain Nft Game Dapp. It is a decentralised interactive DAPP that currently supports three chains (Linea, goerli ethereum and Celo). With Dimension Doggo you can interact with your very own virtual pet dogs. The full vision for dimension doggos is for users to have virtual pet dogs they can interact across chains. Dimension Doggos is designed to use its multiple chains as a game mechanic. Each chain that you have a doggo in is a different dimension. An important aspect of dimesion doggos is it user abstraction. Doggo owners are abstracted across all the supported chains. This was accomplised by using ipfs to a global shared state of our users that all the chains read and write from.

How it Works
Jump in, create an account an mint your very own virtual doggos. Just like real dogs These virtual have to be fed and pet regularily else they might go to the great blockchain in the sky. But no worries you will always be able to revive your doggos for a fee. You can create doggos across multiple chains (dog dimensions). The plan down the line is to take advantage of this mechanic by allowing for cross chain interactions between your doggos and other people's doggos down the line. One of these mechanics will be the ability to combine and split doggos across dimensions which will result in various state conditions. Every also has a stat called power that increases and decreases based on certain interations with your doggo
