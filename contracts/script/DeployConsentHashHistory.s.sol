// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {ConsentHashHistory} from "../src/ConsentHashHistory.sol";

contract DeployConsentHashHistoryScript is Script {
    ConsentHashHistory public consentHashHistory;

    function setUp() public {}

    function run() public returns (ConsentHashHistory deployed) {
        vm.startBroadcast();

        consentHashHistory = new ConsentHashHistory();

        vm.stopBroadcast();

        console2.log("ConsentHashHistory deployed at:", address(consentHashHistory));
        return consentHashHistory;
    }
}
