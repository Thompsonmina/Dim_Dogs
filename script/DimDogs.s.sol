pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/DimDogs.sol";

contract MyScript is Script {

    enum Unit {
        wk,
        day,
        hr,
        min,
        sec
    }

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        DimDogs doggo_contract = new DimDogs(uint(Unit.min), uint(Unit.min), 5, 5, 5);

        vm.stopBroadcast();
    }
}