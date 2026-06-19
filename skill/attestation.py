"""
APEX On-Chain Attestation
─────────────────────────
Writes signal commit hashes to ApexAttestation.sol on BSC Testnet.
Set DRY_RUN=0 and APEX_CONTRACT + PRIVATE_KEY in .env to enable live writes.
"""

import os, json, logging
from typing import Optional

log = logging.getLogger("apex.attestation")

BSC_TESTNET_RPC  = os.getenv("BSC_RPC", "https://data-seed-prebsc-1-s1.binance.org:8545")
CONTRACT_ADDRESS = os.getenv("APEX_CONTRACT", "")
PRIVATE_KEY      = os.getenv("PRIVATE_KEY", "")
DRY_RUN          = os.getenv("DRY_RUN", "1") == "1"

CONTRACT_ABI = [
    {
        "name": "commitSignal", "type": "function",
        "stateMutability": "nonpayable",
        "inputs": [
            {"name": "commitHash",    "type": "bytes32"},
            {"name": "direction",     "type": "uint8"},
            {"name": "regime",        "type": "uint8"},
            {"name": "confidenceBps", "type": "uint16"},
            {"name": "kellyBps",      "type": "uint32"},
        ],
        "outputs": [{"name": "signalId", "type": "uint256"}],
    },
    {
        "name": "verifyCommit", "type": "function",
        "stateMutability": "view",
        "inputs": [
            {"name": "signalId",  "type": "uint256"},
            {"name": "jsonBytes", "type": "bytes"},
        ],
        "outputs": [
            {"name": "valid",      "type": "bool"},
            {"name": "recomputed", "type": "bytes32"},
        ],
    },
    {
        "name": "signalCount", "type": "function",
        "stateMutability": "view",
        "inputs": [],
        "outputs": [{"name": "", "type": "uint256"}],
    },
    {
        "name": "getLatestSignals", "type": "function",
        "stateMutability": "view",
        "inputs": [{"name": "count", "type": "uint256"}],
        "outputs": [{"name": "", "type": "tuple[]", "components": [
            {"name": "commitHash",        "type": "bytes32"},
            {"name": "direction",         "type": "uint8"},
            {"name": "regime",            "type": "uint8"},
            {"name": "confidenceBps",     "type": "uint16"},
            {"name": "kellyBps",          "type": "uint32"},
            {"name": "timestamp",         "type": "uint64"},
            {"name": "resolved",          "type": "bool"},
            {"name": "actualReturnBps",   "type": "int16"},
            {"name": "predictionCorrect", "type": "bool"},
        ]}],
    },
]


class ApexAttestationClient:

    def __init__(self):
        self.w3       = None
        self.account  = None
        self.contract = None
        self._init()

    def _init(self):
        try:
            from web3 import Web3
            from eth_account import Account
            self.w3 = Web3(Web3.HTTPProvider(BSC_TESTNET_RPC))
            if PRIVATE_KEY:
                self.account = Account.from_key(PRIVATE_KEY)
            if CONTRACT_ADDRESS and self.w3.is_connected():
                self.contract = self.w3.eth.contract(
                    address=Web3.to_checksum_address(CONTRACT_ADDRESS),
                    abi=CONTRACT_ABI
                )
                log.info(f"Contract connected: {CONTRACT_ADDRESS}")
        except ImportError:
            log.warning("web3 not installed — run: pip install web3 eth-account")
        except Exception as e:
            log.error(f"Attestation init: {e}")

    @property
    def ready(self) -> bool:
        return bool(self.contract and self.account and
                    self.w3 and self.w3.is_connected())

    def commit_signal(self, signal) -> Optional[str]:
        if DRY_RUN:
            log.info(f"DRY_RUN: signal #{signal.signal_id} "
                     f"hash={signal.commit_hash[:20]}…")
            return f"DRY_RUN:{signal.commit_hash}"

        if not self.ready:
            log.warning("Not ready — set APEX_CONTRACT + PRIVATE_KEY + DRY_RUN=0")
            return None

        try:
            hash_bytes     = bytes.fromhex(signal.commit_hash.replace("0x", ""))
            confidence_bps = int(signal.confidence * 10000)
            kelly_bps      = int(signal.kelly_fraction * 10000)

            tx = self.contract.functions.commitSignal(
                hash_bytes, signal.direction, signal.regime,
                confidence_bps, kelly_bps
            ).build_transaction({
                "from":     self.account.address,
                "nonce":    self.w3.eth.get_transaction_count(self.account.address),
                "gas":      200000,
                "gasPrice": self.w3.to_wei("5", "gwei"),
                "chainId":  97,
            })

            signed   = self.account.sign_transaction(tx)
            tx_hash  = self.w3.eth.send_raw_transaction(signed.rawTransaction)
            receipt  = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
            tx_hex   = tx_hash.hex()

            log.info(f"Signal #{signal.signal_id} committed: {tx_hex} "
                     f"(block {receipt.blockNumber})")
            return tx_hex

        except Exception as e:
            log.error(f"commitSignal: {e}")
            return None

    def get_signal_count(self) -> int:
        if not self.ready:
            return 0
        try:
            return self.contract.functions.signalCount().call()
        except:
            return 0
