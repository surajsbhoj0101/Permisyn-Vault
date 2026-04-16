// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract ConsentHashHistory {
    enum ConsentStatus {
        NONE,
        GRANTED,
        REVOKED
    }

    struct ConsentHashEntry {
        bytes32 hashValue;
        string cid;
        address recordedBy;
        uint256 recordedAt;
    }

    struct ConsentActionEntry {
        ConsentStatus status;
        bytes32 consentHash;
        string cid;
        address actedBy;
        uint256 actedAt;
    }

    error InvalidConsentId();
    error InvalidConsentHash();
    error InvalidConsentCid();
    error ConsentNotGranted();

    mapping(bytes32 => ConsentHashEntry[]) private histories;
    mapping(bytes32 => ConsentStatus) private consentStatuses;
    mapping(bytes32 => ConsentActionEntry[]) private actions;
    mapping(bytes32 => bytes32) private latestConsentHashes;
    mapping(bytes32 => string) private latestConsentCids;

    event ConsentHashRecorded(
        bytes32 indexed consentId,
        bytes32 indexed consentHash,
        string cid,
        address indexed recordedBy,
        uint256 recordedAt
    );

    event ConsentGranted(
        bytes32 indexed consentId,
        bytes32 indexed consentHash,
        string cid,
        address indexed grantedBy,
        uint256 grantedAt
    );

    event ConsentRevoked(
        bytes32 indexed consentId,
        bytes32 indexed consentHash,
        string cid,
        address indexed revokedBy,
        uint256 revokedAt
    );

    function recordConsentHash(
        bytes32 consentId,
        bytes32 consentHash,
        string calldata cid
    ) external {
        _validateInput(consentId, consentHash, cid);
        _appendHash(consentId, consentHash, cid);
    }

    /// @notice Grant consent for a given consentId and consentHash
    /// @param consentId The unique identifier for the consent
    /// @param consentHash The hash representing the consent
    function grantConsent(
        bytes32 consentId,
        bytes32 consentHash,
        string calldata cid
    ) external {
        _validateInput(consentId, consentHash, cid);

        consentStatuses[consentId] = ConsentStatus.GRANTED;
        _appendHash(consentId, consentHash, cid);
        _recordAction(consentId, ConsentStatus.GRANTED, consentHash, cid);

        emit ConsentGranted(consentId, consentHash, cid, msg.sender, block.timestamp);
    }

    /// @notice Revoke consent for a given consentId and consentHash
    /// @param consentId The unique identifier for the consent
    /// @param consentHash The hash representing the consent
    function revokeConsent(
        bytes32 consentId,
        bytes32 consentHash,
        string calldata cid
    ) external {
        _validateInput(consentId, consentHash, cid);

        if (consentStatuses[consentId] != ConsentStatus.GRANTED) {
            revert ConsentNotGranted();
        }

        consentStatuses[consentId] = ConsentStatus.REVOKED;
        _appendHash(consentId, consentHash, cid);
        _recordAction(consentId, ConsentStatus.REVOKED, consentHash, cid);

        emit ConsentRevoked(consentId, consentHash, cid, msg.sender, block.timestamp);
    }

    /// @notice Internal function to append a consent hash to history
    /// @param consentId The unique identifier for the consent
    /// @param consentHash The hash representing the consent
    function _appendHash(
        bytes32 consentId,
        bytes32 consentHash,
        string calldata cid
    ) internal {
        ConsentHashEntry memory entry = ConsentHashEntry({
            hashValue: consentHash,
            cid: cid,
            recordedBy: msg.sender,
            recordedAt: block.timestamp
        });

        histories[consentId].push(entry);
        latestConsentHashes[consentId] = consentHash;
        latestConsentCids[consentId] = cid;
        emit ConsentHashRecorded(consentId, consentHash, cid, msg.sender, block.timestamp);
    }

    function _recordAction(
        bytes32 consentId,
        ConsentStatus status,
        bytes32 consentHash,
        string calldata cid
    ) internal {
        actions[consentId].push(
            ConsentActionEntry({
                status: status,
                consentHash: consentHash,
                cid: cid,
                actedBy: msg.sender,
                actedAt: block.timestamp
            })
        );
    }

    function _validateInput(
        bytes32 consentId,
        bytes32 consentHash,
        string calldata cid
    ) internal pure {
        if (consentId == bytes32(0)) {
            revert InvalidConsentId();
        }

        if (consentHash == bytes32(0)) {
            revert InvalidConsentHash();
        }

        if (bytes(cid).length == 0) {
            revert InvalidConsentCid();
        }
    }

    /// @notice Get the current consent status for a given consentId
    /// @param consentId The unique identifier for the consent
    /// @return The current ConsentStatus
    function getConsentStatus(bytes32 consentId) external view returns (ConsentStatus) {
        return consentStatuses[consentId];
    }

    /// @notice Get the number of consent hashes recorded for a consentId
    /// @param consentId The unique identifier for the consent
    /// @return The number of consent hashes
    function getConsentHashCount(bytes32 consentId) external view returns (uint256) {
        return histories[consentId].length;
    }

    /// @notice Get the latest consent hash recorded for a consentId
    /// @param consentId The unique identifier for the consent
    /// @return The most recently recorded consent hash, or bytes32(0) if none exists
    function getLatestConsentHash(bytes32 consentId) external view returns (bytes32) {
        return latestConsentHashes[consentId];
    }

    /// @notice Get the latest CID recorded for a consentId
    /// @param consentId The unique identifier for the consent
    /// @return The most recently recorded CID, or an empty string if none exists
    function getLatestConsentCid(bytes32 consentId) external view returns (string memory) {
        return latestConsentCids[consentId];
    }

    /// @notice Get the full consent hash history for a consentId
    /// @param consentId The unique identifier for the consent
    /// @return Array of ConsentHashEntry
    function getConsentHashHistory(bytes32 consentId)
        external
        view
        returns (ConsentHashEntry[] memory)
    {
        return histories[consentId];
    }

    /// @notice Get the full consent action history for a consentId
    /// @param consentId The unique identifier for the consent
    /// @return Array of ConsentActionEntry
    function getConsentActionHistory(bytes32 consentId)
        external
        view
        returns (ConsentActionEntry[] memory)
    {
        return actions[consentId];
    }

    /// @notice Get the number of consent status actions recorded for a consentId
    /// @param consentId The unique identifier for the consent
    /// @return The number of grant/revoke actions
    function getConsentActionCount(bytes32 consentId) external view returns (uint256) {
        return actions[consentId].length;
    }
}
