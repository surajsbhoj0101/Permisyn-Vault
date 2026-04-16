// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract ConsentHashHistory {
    enum ConsentStatus {
        NONE,
        GRANTED,
        REVOKED
    }

    struct ConsentHashEntry {
        bytes32 hashValue;
        address recordedBy;
        uint256 recordedAt;
    }

    struct ConsentActionEntry {
        ConsentStatus status;
        bytes32 hashValue;
        address actedBy;
        uint256 actedAt;
    }

    mapping(bytes32 => ConsentHashEntry[]) private histories;
    mapping(bytes32 => ConsentStatus) private consentStatuses;
    mapping(bytes32 => ConsentActionEntry[]) private actions;

    event ConsentHashRecorded(
        bytes32 indexed consentId,
        bytes32 indexed hashValue,
        address indexed recordedBy,
        uint256 recordedAt
    );

    event ConsentGranted(
        bytes32 indexed consentId,
        bytes32 indexed hashValue,
        address indexed grantedBy,
        uint256 grantedAt
    );

    event ConsentRevoked(
        bytes32 indexed consentId,
        bytes32 indexed hashValue,
        address indexed revokedBy,
        uint256 revokedAt
    );

    function recordConsentHash(bytes32 consentId, bytes32 hashValue) external {
        _appendHash(consentId, hashValue);
    }

    function grantConsent(bytes32 consentId, bytes32 hashValue) external {
        consentStatuses[consentId] = ConsentStatus.GRANTED;
        _appendHash(consentId, hashValue);
        actions[consentId].push(
            ConsentActionEntry({
                status: ConsentStatus.GRANTED,
                hashValue: hashValue,
                actedBy: msg.sender,
                actedAt: block.timestamp
            })
        );

        emit ConsentGranted(consentId, hashValue, msg.sender, block.timestamp);
    }

    function revokeConsent(bytes32 consentId, bytes32 hashValue) external {
        require(
            consentStatuses[consentId] == ConsentStatus.GRANTED,
            "Consent must be granted before revoke"
        );

        consentStatuses[consentId] = ConsentStatus.REVOKED;
        _appendHash(consentId, hashValue);
        actions[consentId].push(
            ConsentActionEntry({
                status: ConsentStatus.REVOKED,
                hashValue: hashValue,
                actedBy: msg.sender,
                actedAt: block.timestamp
            })
        );

        emit ConsentRevoked(consentId, hashValue, msg.sender, block.timestamp);
    }

    function _appendHash(bytes32 consentId, bytes32 hashValue) internal {
        ConsentHashEntry memory entry = ConsentHashEntry({
            hashValue: hashValue,
            recordedBy: msg.sender,
            recordedAt: block.timestamp
        });

        histories[consentId].push(entry);
        emit ConsentHashRecorded(consentId, hashValue, msg.sender, block.timestamp);
    }

    function getConsentStatus(bytes32 consentId) external view returns (ConsentStatus) {
        return consentStatuses[consentId];
    }

    function getConsentHashCount(bytes32 consentId) external view returns (uint256) {
        return histories[consentId].length;
    }

    function getConsentHashHistory(bytes32 consentId)
        external
        view
        returns (ConsentHashEntry[] memory)
    {
        return histories[consentId];
    }

    function getConsentActionHistory(bytes32 consentId)
        external
        view
        returns (ConsentActionEntry[] memory)
    {
        return actions[consentId];
    }
}
