# Dimension Doggos

This is a fun and interactive multi chain Nft Game Dapp. It is a decentralised interactive DAPP that currently supports three chains (Linea, goerli ethereum and Celo). With Dimension Doggo you can interact with your very own virtual pet dogs. The full vision for dimension doggos is for users to have virtual pet dogs they can interact across chains. Dimension Doggos is designed to use its multiple chains as a game mechanic. Each chain that you have a doggo in is a different dimension. An important aspect of dimesion doggos is it user abstraction. Doggo owners are abstracted across all the supported chains. This was accomplised by using ipfs to a global shared state of our users that all the chains read and write from.

How it Works
Jump in, create an account an mint your very own virtual doggos. Just like real dogs These virtual have to be fed and pet regularily else they might go to the great blockchain in the sky. But no worries you will always be able to revive your doggos for a fee. You can create doggos across multiple chains (dog dimensions). The plan down the line is to take advantage of this mechanic by allowing for cross chain interactions between your doggos and other people's doggos down the line. One of these mechanics will be the ability to combine and split doggos across dimensions which will result in various state conditions. Every also has a stat called power that increases and decreases based on certain interations with your doggo. The apperance of your doggo morphs depending on the state they are in.

## Consensys Products Leveraged

Metamask sdk: Made use of the metamask's sdk tooling Evidence of its utilisation can be seen in the main.js file in the static directory

Infura Infra: I utilized a suite of the infura dev tool set. I made you of the rpc endpoints for the chains my dapp supported. Made use of the ipfs tooling as well which formed the core around my user account abstraction. As can be evidenced in the user_management.js and main.js code. As well as with foundry configurations

Linea Blockchain: I also utilized the linea blockchain as one of the supporting blockchain my dapp was built upon. Although the overall is to have the dapp on as many chains as it can support. Using Linea as one of the blockchains was a no brainer due to its reduced gas size for transactions(being an eth rollup) and also the benefits of being locked to the consensys ecosystem. 
You can find the deployed contract here: https://goerli.lineascan.build/address/0x574aA290F6A5D8b4181eF7c8dbC282eebEb1b3AF
You can find the smart contract code in the src/DimDogs.sol

## How to run 
You can run the app locally by simply cloning the repo and running the command npm run serve. This will create a dev server at localhost:4040/

### To redeploy any of the contracts simply run any of the following commands below depending on the chain you want to deploy to
forge script script/DimDogs.s.sol:MyScript --rpc-url $LINEA_DEPLOY_ENDPOINT --broadcast --verify -vvvv
 forge script script/DimDogs.s.sol:MyScript --rpc-url $CELO_DEPLOY_ENDPOINT --broadcast --verify -vvvv
  forge script script/DimDogs.s.sol:MyScript --rpc-url $GOERLI_DEPLOY_ENDPOINT --broadcast --verify -vvvv



