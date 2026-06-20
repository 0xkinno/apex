"""
APEX Skill — Core Strategy Engine
"""

import os, sys, json, time, hashlib, logging, argparse
from dotenv import load_dotenv
load_dotenv()
from dataclasses import dataclass, asdict
from typing import Optional
from cmc_client import CMCDataLayer

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s")
log = logging.getLogger("apex.skill")

LEDGER_PATH = os.getenv("APEX_LEDGER", "ledger.jsonl")

REGIME_BULL   = 0
REGIME_BEAR   = 1
REGIME_CHOPPY = 2
REGIME_CRISIS = 3

REGIME_NAMES = {
    REGIME_BULL:   "TRENDING_BULL",
    REGIME_BEAR:   "TRENDING_BEAR",
    REGIME_CHOPPY: "CHOPPY_RANGE",
    REGIME_CRISIS: "CRISIS",
}

REGIME_WIN_RATES = {
    REGIME_BULL:   0.62,
    REGIME_BEAR:   0.58,
    REGIME_CHOPPY: 0.48,
    REGIME_CRISIS: 0.35,
}

REGIME_PAYOFF = {
    REGIME_BULL:   1.8,
    REGIME_BEAR:   1.6,
    REGIME_CHOPPY: 1.1,
    REGIME_CRISIS: 0.9,
}

DIRECTION_ABSTAIN = 0
DIRECTION_LONG    = 1
DIRECTION_SHORT   = 2
DIRECTION_NAMES   = {0: "ABSTAIN", 1: "LONG", 2: "SHORT"}


def derive_regime(md: dict) -> tuple:
    fg       = md["fear_greed"]
    btc_dom  = md["btc_dominance"]
    mcap_chg = md["mcap_change_24h"]
    tokens   = md["tokens"]

    fg_score    = (fg - 50) / 50.0
    dom_signal  = -1.0 if btc_dom > 55 else (1.0 if btc_dom < 42 else 0.0)
    mcap_signal = 1.0 if mcap_chg > 2 else (-1.0 if mcap_chg < -2 else 0.0)

    if tokens:
        changes   = [t["change_24h"] for t in tokens.values()]
        positive  = sum(1 for c in changes if c > 0)
        coherence = (positive / len(changes) - 0.5) * 2.0
    else:
        coherence = 0.0

    composite = (
        fg_score    * 0.35 +
        dom_signal  * 0.25 +
        mcap_signal * 0.25 +
        coherence   * 0.15
    )

    if fg < 15 or composite < -0.65:
        regime = REGIME_CRISIS
    elif composite > 0.35:
        regime = REGIME_BULL
    elif composite < -0.20:
        regime = REGIME_BEAR
    else:
        regime = REGIME_CHOPPY

    evidence = {
        "fear_greed_score": round(fg_score, 3),
        "btc_dom_signal":   round(dom_signal, 3),
        "mcap_signal":      round(mcap_signal, 3),
        "coherence":        round(coherence, 3),
        "composite":        round(composite, 3),
    }
    return regime, evidence


def kelly_fraction(regime: int, confidence: float = None) -> float:
    p      = confidence or REGIME_WIN_RATES[regime]
    b      = REGIME_PAYOFF[regime]
    q      = 1.0 - p
    f_star = (p * b - q) / b
    return round(max(0.0, min(0.25, f_star * 0.5)), 4)


def rotation_matrix(tokens: dict, regime: int) -> list:
    scored = []
    for sym, data in tokens.items():
        if data["price"] == 0:
            continue
        mom = (data["change_1h"] * 0.2 +
               data["change_24h"] * 0.5 +
               data["change_7d"]  * 0.3)
        mom_norm  = max(-1, min(1, mom / 10.0))
        vol_ratio = (data["volume_24h"] / data["market_cap"]
                     if data["market_cap"] > 0 else 0)
        liq_norm  = min(1.0, vol_ratio * 10)
        sent_norm = max(-1, min(1, data["change_24h"] / 15.0))
        regime_bonus = 0.0
        if regime == REGIME_BULL and mom > 0:
            regime_bonus = 0.15
        elif regime == REGIME_BEAR and mom < 0:
            regime_bonus = 0.10
        score = (mom_norm * 0.45 + liq_norm * 0.25 +
                 sent_norm * 0.20 + regime_bonus)
        scored.append({
            "symbol":     sym,
            "score":      round(score, 4),
            "momentum":   round(mom_norm, 3),
            "liquidity":  round(liq_norm, 3),
            "sentiment":  round(sent_norm, 3),
            "change_24h": data["change_24h"],
            "price":      data["price"],
        })
    return sorted(scored, key=lambda x: x["score"], reverse=True)


def score_conviction(md: dict, regime: int, rotation: list) -> tuple:
    signals = []
    fg = md["fear_greed"]
    signals.append({"name": "Fear&Greed", "vote": "LONG" if fg > 65 else "SHORT" if fg < 35 else "NEUTRAL", "weight": 0.20, "value": fg})
    btc = md["btc_dominance"]
    signals.append({"name": "BTC_Dom", "vote": "LONG" if btc < 42 else "SHORT" if btc > 55 else "NEUTRAL", "weight": 0.20, "value": btc})
    mc = md["mcap_change_24h"]
    signals.append({"name": "MCap_Trend", "vote": "LONG" if mc > 2.5 else "SHORT" if mc < -2.5 else "NEUTRAL", "weight": 0.20, "value": mc})
    if rotation:
        top = rotation[0]
        signals.append({"name": "Rotation", "vote": "LONG" if top["score"] > 0.3 else "SHORT" if top["score"] < -0.1 else "NEUTRAL", "weight": 0.25, "value": top["score"]})
    tr_ratio = (md["trending_bullish"] / md["trending_total"] if md["trending_total"] > 0 else 0.5)
    signals.append({"name": "Trending", "vote": "LONG" if tr_ratio > 0.65 else "SHORT" if tr_ratio < 0.35 else "NEUTRAL", "weight": 0.15, "value": tr_ratio})

    long_w  = sum(s["weight"] for s in signals if s["vote"] == "LONG")
    short_w = sum(s["weight"] for s in signals if s["vote"] == "SHORT")
    THRESHOLD = 0.45
    if long_w >= THRESHOLD and long_w > short_w:
        return DIRECTION_LONG,    round(long_w, 4),  signals
    elif short_w >= THRESHOLD and short_w > long_w:
        return DIRECTION_SHORT,   round(short_w, 4), signals
    else:
        return DIRECTION_ABSTAIN, 0.5,               signals


class APEXSkill:

    def __init__(self):
        self.data_layer = CMCDataLayer()
        self._signal_id = self._load_last_id()

    def _load_last_id(self) -> int:
        try:
            with open(LEDGER_PATH) as f:
                lines = f.readlines()
                if lines:
                    return json.loads(lines[-1]).get("signal_id", 0) + 1
        except:
            pass
        return 0

    def run_cycle(self):
        log.info("=== APEX CYCLE START ===")
        md = self.data_layer.get_market_data()
        log.info(f"Data via {md['transport']} | F&G={md['fear_greed']} | BTC.D={md['btc_dominance']:.1f}%")

        regime, evidence = derive_regime(md)
        log.info(f"Regime: {REGIME_NAMES[regime]}")

        if regime == REGIME_CRISIS:
            direction, confidence, conv_signals, rotation = DIRECTION_ABSTAIN, 0.5, [], []
        else:
            rotation = rotation_matrix(md["tokens"], regime)
            direction, confidence, conv_signals = score_conviction(md, regime, rotation)

        kelly = kelly_fraction(regime, confidence) if direction != DIRECTION_ABSTAIN else 0.0

        # Build the exact dict that will be saved AND hashed — same object
        entry = {
            "signal_id":       self._signal_id,
            "timestamp":       md["timestamp"],
            "regime":          regime,
            "regime_name":     REGIME_NAMES[regime],
            "direction":       direction,
            "direction_name":  DIRECTION_NAMES[direction],
            "confidence":      confidence,
            "kelly_fraction":  kelly,
            "top_token":       rotation[0]["symbol"] if rotation else "N/A",
            "top_token_score": rotation[0]["score"]  if rotation else 0.0,
            "rotation":        rotation[:5],
            "signals":         conv_signals,
            "regime_evidence": evidence,
            "transport":       md["transport"],
        }

        # Hash the exact JSON string that will be saved
        json_to_hash   = json.dumps(entry, sort_keys=True)
        commit_hash    = "0x" + hashlib.sha3_256(json_to_hash.encode()).hexdigest()
        entry["commit_hash"] = commit_hash

        # Save to ledger
        with open(LEDGER_PATH, "a") as f:
            f.write(json.dumps(entry, sort_keys=True) + "\n")

        # Write to BSC Testnet
        try:
            from dotenv import load_dotenv
            load_dotenv()
            from attestation import ApexAttestationClient
            attester = ApexAttestationClient()
            if attester.ready:
                hash_bytes = bytes.fromhex(entry["commit_hash"].replace("0x",""))
                conf_bps = int(entry["confidence"] * 10000)
                kelly_bps = int(entry["kelly_fraction"] * 10000)
                tx = attester.contract.functions.commitSignal(
                    hash_bytes,
                    entry["direction"],
                    entry["regime"],
                    conf_bps,
                    kelly_bps
                ).build_transaction({
                    "from": attester.account.address,
                    "nonce": attester.w3.eth.get_transaction_count(attester.account.address),
                    "gas": 200000,
                    "gasPrice": attester.w3.to_wei("5","gwei"),
                    "chainId": 97,
                })
                signed = attester.account.sign_transaction(tx)
                tx_hash = attester.w3.eth.send_raw_transaction(signed.raw_transaction)
                receipt = attester.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
                log.info(f"ON-CHAIN COMMIT: {tx_hash.hex()} block={receipt.blockNumber}")
            else:
                log.warning("Attester not ready — skipping on-chain commit")
        except Exception as e:
            log.error(f"On-chain commit failed: {e}")
        self._signal_id += 1

        log.info(f"Signal #{entry['signal_id']}: {entry['direction_name']} | "
                 f"conf={entry['confidence']:.1%} | kelly={entry['kelly_fraction']:.1%} | "
                 f"top={entry['top_token']} | hash={commit_hash[:18]}...")
        log.info("=== APEX CYCLE END ===\n")

        self.print_signal(entry)
        return entry

    def print_signal(self, entry: dict):
        print("\n" + "=" * 62)
        print(f"  APEX SIGNAL #{entry['signal_id']}")
        print("=" * 62)
        print(f"  Regime:     {entry['regime_name']}")
        print(f"  Direction:  {entry['direction_name']}")
        print(f"  Confidence: {entry['confidence']:.1%}")
        print(f"  Kelly Size: {entry['kelly_fraction']:.1%} of portfolio")
        print(f"  Top Token:  {entry['top_token']} (score={entry['top_token_score']:.3f})")
        print(f"  Transport:  {entry['transport']}")
        print(f"  Commit:     {entry['commit_hash']}")
        print("-" * 62)
        print("  Rotation Ranking:")
        for i, r in enumerate(entry['rotation'][:5], 1):
            print(f"    {i}. {r['symbol']:8s}  score={r['score']:+.3f}  24h={r['change_24h']:+.1f}%")
        print("-" * 62)
        print("  Signal Breakdown:")
        for s in entry['signals']:
            print(f"    {s['name']:12s} -> {s['vote']:7s}  weight={s['weight']:.0%}")
        print("=" * 62 + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="APEX Strategy Skill")
    parser.add_argument("--list-tools", action="store_true")
    parser.add_argument("--cycles",   type=int, default=1)
    parser.add_argument("--interval", type=int, default=300)
    args = parser.parse_args()

    if args.list_tools:
        dl    = CMCDataLayer()
        tools = dl.list_mcp_tools()
        print("\nAvailable CMC MCP Tools:")
        for t in tools:
            name = t.get("name", "?") if isinstance(t, dict) else str(t)
            print(f"  {name}")
        sys.exit(0)

    skill = APEXSkill()
    for i in range(args.cycles):
        skill.run_cycle()
        if i < args.cycles - 1:
            log.info(f"Next cycle in {args.interval}s...")
            time.sleep(args.interval)
