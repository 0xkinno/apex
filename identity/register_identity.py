"""
APEX ERC-8004 Agent Identity Registration
──────────────────────────────────────────
Registers APEX as an on-chain agent via BNB Agent SDK.
Gas-free on BSC Testnet via MegaFuel paymaster.
Targets: Best Use of BNB AI Agent SDK special prize ($2,000).

Setup:
  pip install bnbagent eth-account python-dotenv
  python3 register_identity.py --gen-wallet   # generate throwaway EOA
  # add PRIVATE_KEY to .env
  python3 register_identity.py                 # register (gas-free)
"""

import os, sys, json, argparse, logging
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../skill/.env"))
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("apex.identity")

PRIVATE_KEY  = os.getenv("PRIVATE_KEY", "")
SKILL_URL    = os.getenv("APEX_SKILL_URL", "https://apex-skill.vercel.app")

AGENT_METADATA = {
    "name":        "APEX",
    "version":     "1.0.0",
    "description": (
        "Adaptive Portfolio EXposure Skill — regime-gated, Kelly-optimal "
        "multi-factor trading signal generator for CMC AI Agent Hub. "
        "Every signal committed on-chain before outcome is known."
    ),
    "skill_url":   SKILL_URL,
    "repo":        "https://github.com/your-handle/apex-skill",
    "features": [
        "regime_detection",
        "kelly_sizing",
        "rotation_matrix",
        "on_chain_attestation",
        "x402_payments",
        "cmc_mcp_integration",
    ],
    "hackathon": "BNB Hack 2026",
    "track":     "Track 2 — Strategy Skills",
}


def gen_wallet():
    try:
        from eth_account import Account
    except ImportError:
        print("Run: pip install eth-account")
        sys.exit(1)

    acct = Account.create()
    print("\n⚠  THROWAWAY WALLET — for identity registration only, never fund it")
    print(f"   Address:     {acct.address}")
    print(f"   Private key: {acct.key.hex()}")
    print("\n   Add to apex/skill/.env:")
    print(f"   PRIVATE_KEY={acct.key.hex()}\n")
    return acct


def register():
    if not PRIVATE_KEY:
        print("No PRIVATE_KEY found in .env — generating one now:\n")
        gen_wallet()
        print("Set PRIVATE_KEY in apex/skill/.env and run again.")
        sys.exit(0)

    try:
        from bnbagent import AgentRegistry
        from eth_account import Account
    except ImportError:
        print("Run: pip install bnbagent eth-account python-dotenv")
        sys.exit(1)

    account = Account.from_key(PRIVATE_KEY)
    print(f"\nRegistering APEX agent from: {account.address}")
    print("Network: BSC Testnet (gas-free via MegaFuel paymaster)\n")

    try:
        registry = AgentRegistry(
            network       = "testnet",
            account       = account,
            use_paymaster = True,
        )

        result = registry.register(
            name        = "APEX",
            version     = "1.0.0",
            description = AGENT_METADATA["description"],
            metadata    = json.dumps(AGENT_METADATA),
        )

        agent_id = result.get("agentId", "?")
        tx_hash  = result.get("txHash", "?")

        print("✓ APEX Agent Registered Successfully!")
        print(f"  Agent ID:  {agent_id}")
        print(f"  Tx Hash:   {tx_hash}")
        print(f"  Explorer:  https://testnet.bscscan.com/tx/{tx_hash}")
        print(f"\n  Add to apex/skill/.env:")
        print(f"  APEX_AGENT_ID={agent_id}")

        return result

    except Exception as e:
        log.error(f"Registration failed: {e}")
        print(f"\nError: {e}")
        print("Docs: https://github.com/bnb-chain/bnbagent-sdk")
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--gen-wallet", action="store_true",
                        help="Generate a throwaway EOA only")
    args = parser.parse_args()

    if args.gen_wallet:
        gen_wallet()
    else:
        register()
