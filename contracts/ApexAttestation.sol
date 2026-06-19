// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  ApexAttestation
 * @notice On-chain signal commitment registry for the APEX trading Skill.
 *         Every signal is committed as keccak256(signal_json) BEFORE the
 *         outcome is known — making the track record structurally unfakeable.
 *
 * @dev    Deployed on BSC Testnet (Chain ID 97).
 *         Anyone can verify: read commit hash → recompute keccak256 → compare.
 */
contract ApexAttestation {

    // ─── Events ────────────────────────────────────────────────────────────

    event SignalCommitted(
        uint256 indexed signalId,
        bytes32 indexed commitHash,
        uint8   direction,
        uint8   regime,
        uint16  confidenceBps,
        uint32  kellyBps,
        uint64  timestamp
    );

    event SignalResolved(
        uint256 indexed signalId,
        int16   actualReturnBps,
        bool    predictionCorrect
    );

    // ─── Storage ───────────────────────────────────────────────────────────

    struct Signal {
        bytes32 commitHash;
        uint8   direction;
        uint8   regime;
        uint16  confidenceBps;
        uint32  kellyBps;
        uint64  timestamp;
        bool    resolved;
        int16   actualReturnBps;
        bool    predictionCorrect;
    }

    address public immutable operator;
    uint256 public signalCount;

    mapping(uint256 => Signal) public signals;
    mapping(uint8 => uint256)  public regimeSignalCount;
    mapping(uint8 => uint256)  public regimeCorrectCount;

    // ─── Constructor ───────────────────────────────────────────────────────

    constructor() {
        operator = msg.sender;
    }

    modifier onlyOperator() {
        require(msg.sender == operator, "APEX: only operator");
        _;
    }

    // ─── Core ──────────────────────────────────────────────────────────────

    /**
     * @notice Commit a signal BEFORE the outcome is known.
     * @param commitHash    keccak256 of the full signal JSON
     * @param direction     0=ABSTAIN  1=LONG  2=SHORT
     * @param regime        0=BULL  1=BEAR  2=CHOPPY  3=CRISIS
     * @param confidenceBps Signal confidence in basis points (0–10000)
     * @param kellyBps      Kelly-optimal size in basis points
     */
    function commitSignal(
        bytes32 commitHash,
        uint8   direction,
        uint8   regime,
        uint16  confidenceBps,
        uint32  kellyBps
    ) external onlyOperator returns (uint256 signalId) {
        require(direction <= 2,         "APEX: invalid direction");
        require(regime <= 3,            "APEX: invalid regime");
        require(confidenceBps <= 10000, "APEX: confidence overflow");
        require(kellyBps <= 10000,      "APEX: kelly overflow");

        signalId = signalCount++;

        signals[signalId] = Signal({
            commitHash:        commitHash,
            direction:         direction,
            regime:            regime,
            confidenceBps:     confidenceBps,
            kellyBps:          kellyBps,
            timestamp:         uint64(block.timestamp),
            resolved:          false,
            actualReturnBps:   0,
            predictionCorrect: false
        });

        regimeSignalCount[regime]++;

        emit SignalCommitted(
            signalId, commitHash, direction, regime,
            confidenceBps, kellyBps, uint64(block.timestamp)
        );
    }

    /**
     * @notice Resolve a signal with its actual outcome.
     * @param signalId         The signal to resolve
     * @param actualReturnBps  Actual price return in basis points (signed)
     */
    function resolveSignal(uint256 signalId, int16 actualReturnBps)
        external onlyOperator
    {
        Signal storage s = signals[signalId];
        require(!s.resolved,           "APEX: already resolved");
        require(signalId < signalCount, "APEX: unknown signal");

        s.resolved        = true;
        s.actualReturnBps = actualReturnBps;

        bool correct = (s.direction == 0) ||
                       (s.direction == 1 && actualReturnBps > 0) ||
                       (s.direction == 2 && actualReturnBps < 0);

        s.predictionCorrect = correct;
        if (correct) regimeCorrectCount[s.regime]++;

        emit SignalResolved(signalId, actualReturnBps, correct);
    }

    /**
     * @notice Verify a commit. Returns true if JSON hash matches stored hash.
     */
    function verifyCommit(uint256 signalId, bytes calldata jsonBytes)
        external view
        returns (bool valid, bytes32 recomputed)
    {
        recomputed = keccak256(jsonBytes);
        valid = (recomputed == signals[signalId].commitHash);
    }

    // ─── Views ─────────────────────────────────────────────────────────────

    function getSignal(uint256 signalId)
        external view returns (Signal memory)
    {
        return signals[signalId];
    }

    function getRegimeAccuracy(uint8 regime)
        external view
        returns (uint256 total, uint256 correct, uint256 accuracyBps)
    {
        total       = regimeSignalCount[regime];
        correct     = regimeCorrectCount[regime];
        accuracyBps = total > 0 ? (correct * 10000) / total : 0;
    }

    function getLatestSignals(uint256 count)
        external view returns (Signal[] memory result)
    {
        uint256 n    = signalCount;
        uint256 take = count > n ? n : count;
        result       = new Signal[](take);
        for (uint256 i = 0; i < take; i++) {
            result[i] = signals[n - take + i];
        }
    }
}
