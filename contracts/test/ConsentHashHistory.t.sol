// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {ConsentHashHistory} from "../src/ConsentHashHistory.sol";

contract ConsentHashHistoryTest is Test {
    ConsentHashHistory public history;

    bytes32 internal constant CONSENT_A = keccak256("consent-a");
    bytes32 internal constant CONSENT_B = keccak256("consent-b");
    bytes32 internal constant HASH_1 = keccak256("hash-1");
    bytes32 internal constant HASH_2 = keccak256("hash-2");
    bytes32 internal constant HASH_3 = keccak256("hash-3");
    bytes32 internal constant HASH_4 = keccak256("hash-4");
    string internal constant CID_1 = "ipfs://cid-1";
    string internal constant CID_2 = "ipfs://cid-2";
    string internal constant CID_3 = "ipfs://cid-3";
    string internal constant CID_4 = "ipfs://cid-4";

    function setUp() public {
        history = new ConsentHashHistory();
    }

    function test_RecordConsentHash_AppendsHistory() public {
        vm.prank(address(0x1234));
        vm.expectEmit(true, true, true, true);
        emit ConsentHashHistory.ConsentHashRecorded(CONSENT_A, HASH_1, CID_1, address(0x1234), block.timestamp);
        history.recordConsentHash(CONSENT_A, HASH_1, CID_1);

        vm.prank(address(0x1234));
        history.recordConsentHash(CONSENT_A, HASH_2, CID_2);

        assertEq(history.getConsentHashCount(CONSENT_A), 2);

        ConsentHashHistory.ConsentHashEntry[] memory entries = history.getConsentHashHistory(CONSENT_A);
        assertEq(entries.length, 2);
        assertEq(entries[0].hashValue, HASH_1);
        assertEq(entries[0].cid, CID_1);
        assertEq(entries[0].recordedBy, address(0x1234));
        assertEq(entries[1].hashValue, HASH_2);
        assertEq(entries[1].cid, CID_2);
        assertEq(entries[1].recordedBy, address(0x1234));
    }

    function test_RecordConsentHash_KeepsConsentHistoriesSeparate() public {
        vm.prank(address(0xBEEF));
        history.recordConsentHash(CONSENT_A, HASH_1, CID_1);

        vm.prank(address(0xCAFE));
        history.recordConsentHash(CONSENT_B, HASH_3, CID_3);

        ConsentHashHistory.ConsentHashEntry[] memory entriesA = history.getConsentHashHistory(CONSENT_A);
        ConsentHashHistory.ConsentHashEntry[] memory entriesB = history.getConsentHashHistory(CONSENT_B);

        assertEq(entriesA.length, 1);
        assertEq(entriesA[0].hashValue, HASH_1);
        assertEq(entriesA[0].cid, CID_1);
        assertEq(entriesA[0].recordedBy, address(0xBEEF));

        assertEq(entriesB.length, 1);
        assertEq(entriesB[0].hashValue, HASH_3);
        assertEq(entriesB[0].cid, CID_3);
        assertEq(entriesB[0].recordedBy, address(0xCAFE));
    }

    function test_RecordConsentHash_EmptyHistoryReturnsZeroCount() public view {
        assertEq(history.getConsentHashCount(CONSENT_A), 0);
        assertEq(history.getConsentActionCount(CONSENT_A), 0);
        assertEq(history.getLatestConsentHash(CONSENT_A), bytes32(0));
        assertEq(history.getLatestConsentCid(CONSENT_A), "");
        ConsentHashHistory.ConsentHashEntry[] memory entries = history.getConsentHashHistory(CONSENT_A);
        assertEq(entries.length, 0);
    }

    function test_RecordConsentHash_PreservesOrder() public {
        vm.prank(address(0x1111));
        history.recordConsentHash(CONSENT_A, HASH_1, CID_1);

        vm.warp(block.timestamp + 1);

        vm.prank(address(0x2222));
        history.recordConsentHash(CONSENT_A, HASH_2, CID_2);

        ConsentHashHistory.ConsentHashEntry[] memory entries = history.getConsentHashHistory(CONSENT_A);
        assertEq(entries[0].hashValue, HASH_1);
        assertEq(entries[1].hashValue, HASH_2);
        assertEq(entries[0].cid, CID_1);
        assertEq(entries[1].cid, CID_2);
        assertEq(entries[0].recordedAt + 1, entries[1].recordedAt);
    }

    function test_GrantAndRevokeConsent_UpdatesStatusAndHistory() public {
        vm.prank(address(0xA11CE));
        vm.expectEmit(true, true, true, true);
        emit ConsentHashHistory.ConsentGranted(CONSENT_A, HASH_1, CID_1, address(0xA11CE), block.timestamp);
        history.grantConsent(CONSENT_A, HASH_1, CID_1);

        assertEq(uint256(history.getConsentStatus(CONSENT_A)), uint256(ConsentHashHistory.ConsentStatus.GRANTED));

        vm.warp(block.timestamp + 1);

        vm.prank(address(0xB0B));
        vm.expectEmit(true, true, true, true);
        emit ConsentHashHistory.ConsentRevoked(CONSENT_A, HASH_2, CID_2, address(0xB0B), block.timestamp);
        history.revokeConsent(CONSENT_A, HASH_2, CID_2);

        assertEq(uint256(history.getConsentStatus(CONSENT_A)), uint256(ConsentHashHistory.ConsentStatus.REVOKED));

        ConsentHashHistory.ConsentHashEntry[] memory hashes = history.getConsentHashHistory(CONSENT_A);
        assertEq(hashes.length, 2);
        assertEq(hashes[0].hashValue, HASH_1);
        assertEq(hashes[1].hashValue, HASH_2);
        assertEq(hashes[0].cid, CID_1);
        assertEq(hashes[1].cid, CID_2);

        ConsentHashHistory.ConsentActionEntry[] memory actions = history.getConsentActionHistory(CONSENT_A);
        assertEq(actions.length, 2);
        assertEq(uint256(actions[0].status), uint256(ConsentHashHistory.ConsentStatus.GRANTED));
        assertEq(uint256(actions[1].status), uint256(ConsentHashHistory.ConsentStatus.REVOKED));
        assertEq(actions[0].cid, CID_1);
        assertEq(actions[1].cid, CID_2);
        assertEq(history.getConsentActionCount(CONSENT_A), 2);
        assertEq(history.getLatestConsentHash(CONSENT_A), HASH_2);
        assertEq(history.getLatestConsentCid(CONSENT_A), CID_2);
    }

    function test_RevokeWithoutGrant_Reverts() public {
        vm.expectRevert(ConsentHashHistory.ConsentNotGranted.selector);
        history.revokeConsent(CONSENT_B, HASH_4, CID_4);
    }

    function test_GrantConsent_AllowsOverwriteAndPreservesHistory() public {
        history.grantConsent(CONSENT_A, HASH_1, CID_1);

        vm.warp(block.timestamp + 1);

        history.grantConsent(CONSENT_A, HASH_2, CID_2);

        assertEq(uint256(history.getConsentStatus(CONSENT_A)), uint256(ConsentHashHistory.ConsentStatus.GRANTED));
        assertEq(history.getLatestConsentHash(CONSENT_A), HASH_2);
        assertEq(history.getLatestConsentCid(CONSENT_A), CID_2);

        ConsentHashHistory.ConsentHashEntry[] memory hashes = history.getConsentHashHistory(CONSENT_A);
        assertEq(hashes.length, 2);
        assertEq(hashes[0].hashValue, HASH_1);
        assertEq(hashes[0].cid, CID_1);
        assertEq(hashes[1].hashValue, HASH_2);
        assertEq(hashes[1].cid, CID_2);

        ConsentHashHistory.ConsentActionEntry[] memory actions = history.getConsentActionHistory(CONSENT_A);
        assertEq(actions.length, 2);
        assertEq(uint256(actions[0].status), uint256(ConsentHashHistory.ConsentStatus.GRANTED));
        assertEq(uint256(actions[1].status), uint256(ConsentHashHistory.ConsentStatus.GRANTED));
        assertEq(actions[1].consentHash, HASH_2);
        assertEq(actions[1].cid, CID_2);
    }

    function test_RecordConsentHash_RejectsZeroValues() public {
        vm.expectRevert(ConsentHashHistory.InvalidConsentId.selector);
        history.recordConsentHash(bytes32(0), HASH_1, CID_1);

        vm.expectRevert(ConsentHashHistory.InvalidConsentHash.selector);
        history.recordConsentHash(CONSENT_A, bytes32(0), CID_1);

        vm.expectRevert(ConsentHashHistory.InvalidConsentCid.selector);
        history.recordConsentHash(CONSENT_A, HASH_1, "");
    }

    function test_GrantAndRevokeConsent_RejectZeroValues() public {
        vm.expectRevert(ConsentHashHistory.InvalidConsentId.selector);
        history.grantConsent(bytes32(0), HASH_1, CID_1);

        vm.expectRevert(ConsentHashHistory.InvalidConsentHash.selector);
        history.revokeConsent(CONSENT_A, bytes32(0), CID_1);

        vm.expectRevert(ConsentHashHistory.InvalidConsentCid.selector);
        history.grantConsent(CONSENT_A, HASH_1, "");
    }
}
