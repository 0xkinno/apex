"""
APEX CMC Client
───────────────
Transport priority:
  1. CMC MCP endpoint  (primary — x402 per-request payment)
  2. CMC REST API      (fallback — set USE_REST=1 or after 3 MCP failures)
"""

import os, json, time, hashlib, logging, requests
from typing import Optional

log = logging.getLogger("apex.cmc")

CMC_API_KEY      = os.getenv("CMC_API_KEY", "")
CMC_MCP_ENDPOINT = os.getenv("CMC_MCP_ENDPOINT", "https://pro-api.coinmarketcap.com/mcp")
CMC_REST_BASE    = "https://pro-api.coinmarketcap.com/v1"
USE_REST         = os.getenv("USE_REST", "0") == "1"
X402_ENABLED     = os.getenv("X402_ENABLED", "0") == "1"
X402_WALLET_KEY  = os.getenv("X402_WALLET_KEY", "")
X402_MAX_AMOUNT  = int(os.getenv("X402_MAX_AMOUNT", "100"))

CORE_TOKENS = ["BNB", "ETH", "BTC", "CAKE", "AAVE", "LINK", "UNI", "INJ", "PENDLE"]


class X402Payer:
    """Handles HTTP 402 Payment Required — x402 micropayment protocol."""

    def __init__(self, wallet_key, max_amount):
        self.wallet_key    = wallet_key
        self.max_amount    = max_amount
        self.payment_count = 0
        self.total_paid    = 0

    def handle_402(self, response, original_request):
        if not self.wallet_key:
            log.warning("x402: no wallet key configured — skipping payment")
            return None
        try:
            info   = response.json()
            amount = info.get("amount", 1)
            if amount > self.max_amount:
                log.warning(f"x402: {amount} exceeds max {self.max_amount} — declining")
                return None

            payment = self._sign(
                amount,
                info.get("recipient", ""),
                info.get("nonce", str(int(time.time())))
            )
            headers = {**original_request.get("headers", {}), "X-Payment": payment}
            r = requests.get(
                original_request["url"],
                headers=headers,
                params=original_request.get("params", {}),
                timeout=15
            )
            self.payment_count += 1
            self.total_paid    += amount
            log.info(f"x402: paid {amount} microUSDC (payment #{self.payment_count})")
            return r.json() if r.ok else None
        except Exception as e:
            log.error(f"x402 error: {e}")
            return None

    def _sign(self, amount, recipient, nonce):
        payload = f"{amount}:{recipient}:{nonce}"
        sig     = hashlib.sha256(f"{self.wallet_key}:{payload}".encode()).hexdigest()
        return json.dumps({
            "amount": amount, "recipient": recipient,
            "nonce": nonce, "signature": sig, "protocol": "x402/1.0"
        })

    @property
    def stats(self):
        return {
            "payments_made":    self.payment_count,
            "total_micro_usdc": self.total_paid,
            "x402_enabled":     X402_ENABLED
        }


class CMCMCPClient:
    """CMC AI Agent Hub — MCP transport with x402 support."""

    TOOLS = {
        "fear_greed": "fear_and_greed_index",
        "quotes":     "cryptocurrency_quotes_latest",
        "trending":   "trending_latest",
        "global":     "global_metrics_quotes_latest",
    }

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "X-CMC_PRO_API_KEY": CMC_API_KEY,
            "Content-Type":      "application/json",
        })
        self.payer = X402Payer(X402_WALLET_KEY, X402_MAX_AMOUNT) if X402_ENABLED else None

    def call_tool(self, tool, args):
        url = f"{CMC_MCP_ENDPOINT}/tools/{tool}"
        req = {"url": url, "headers": dict(self.session.headers), "params": args}
        try:
            r = self.session.post(url, json={"arguments": args}, timeout=15)
            if r.status_code == 402 and self.payer:
                return self.payer.handle_402(r, req)
            if r.ok:
                d = r.json()
                if "content" in d:
                    for b in d["content"]:
                        if b.get("type") == "text":
                            return json.loads(b["text"])
                return d
        except Exception as e:
            log.error(f"MCP {tool}: {e}")
        return None

    def list_tools(self):
        try:
            r = self.session.get(f"{CMC_MCP_ENDPOINT}/tools", timeout=10)
            return r.json().get("tools", []) if r.ok else []
        except Exception as e:
            log.error(f"list_tools: {e}")
            return []


class CMCRESTClient:
    """CMC REST API — reliable fallback transport."""

    def __init__(self):
        self.s = requests.Session()
        self.s.headers.update({"X-CMC_PRO_API_KEY": CMC_API_KEY})

    def _get(self, path, params=None):
        try:
            r = self.s.get(f"{CMC_REST_BASE}{path}", params=params or {}, timeout=10)
            return r.json().get("data") if r.ok else None
        except Exception as e:
            log.error(f"REST {path}: {e}")
            return None

    def fear_greed(self):     return self._get("/fear-and-greed/latest")
    def global_metrics(self): return self._get("/global-metrics/quotes/latest", {"convert": "USD"})
    def quotes(self, syms):   return self._get("/cryptocurrency/quotes/latest", {"symbol": ",".join(syms), "convert": "USD"})
    def trending(self):       return self._get("/cryptocurrency/trending/latest", {"limit": 10, "convert": "USD"})


class CMCDataLayer:
    """
    Transport-agnostic data layer.
    Always call get_market_data() — routing is handled internally.
    """

    def __init__(self):
        self.mcp      = CMCMCPClient()
        self.rest     = CMCRESTClient()
        self._failures = 0

    def get_market_data(self) -> dict:
        if USE_REST or self._failures >= 3:
            return self._via_rest()
        data = self._via_mcp()
        if data is None:
            self._failures += 1
            log.warning(f"MCP failure #{self._failures} — falling back to REST")
            return self._via_rest()
        self._failures = 0
        return data

    def _via_mcp(self) -> Optional[dict]:
        try:
            fg = self.mcp.call_tool(CMCMCPClient.TOOLS["fear_greed"], {})
            gm = self.mcp.call_tool(CMCMCPClient.TOOLS["global"], {"convert": "USD"})
            q  = self.mcp.call_tool(CMCMCPClient.TOOLS["quotes"],
                                    {"symbol": ",".join(CORE_TOKENS), "convert": "USD"})
            tr = self.mcp.call_tool(CMCMCPClient.TOOLS["trending"], {"limit": 10})
            if not any([fg, gm, q]):
                return None
            return self._normalize(fg, gm, q, tr,
                                   "MCP+x402" if X402_ENABLED else "MCP")
        except Exception as e:
            log.error(f"MCP fetch: {e}")
            return None

    def _via_rest(self) -> dict:
        return self._normalize(
            self.rest.fear_greed(),
            self.rest.global_metrics(),
            self.rest.quotes(CORE_TOKENS),
            self.rest.trending(),
            "REST"
        )

    def _normalize(self, fg, gm, quotes, trending, transport) -> dict:
        fg_val   = int(fg.get("value", 50))                         if fg else 50
        fg_class = fg.get("value_classification", "Neutral")        if fg else "Neutral"

        btc_dom = mcap = mcap_chg = 0.0
        if gm:
            q        = gm.get("quote", {}).get("USD", {})
            btc_dom  = float(gm.get("btc_dominance", 50))
            mcap     = float(q.get("total_market_cap", 0))
            mcap_chg = float(q.get("total_market_cap_yesterday_percentage_change", 0))

        tokens = {}
        if quotes:
            for sym, info in quotes.items():
                q = info.get("quote", {}).get("USD", {}) if isinstance(info, dict) else {}
                tokens[sym] = {
                    "price":      float(q.get("price", 0)),
                    "change_1h":  float(q.get("percent_change_1h", 0)),
                    "change_24h": float(q.get("percent_change_24h", 0)),
                    "change_7d":  float(q.get("percent_change_7d", 0)),
                    "volume_24h": float(q.get("volume_24h", 0)),
                    "market_cap": float(q.get("market_cap", 0)),
                }

        trending_bull = sum(
            1 for t in (trending or [])
            if isinstance(t, dict) and
            float(t.get("quote", {}).get("USD", {}).get("percent_change_24h", 0)) > 0
        )

        return {
            "timestamp":        int(time.time()),
            "transport":        transport,
            "fear_greed":       fg_val,
            "fear_greed_class": fg_class,
            "btc_dominance":    btc_dom,
            "total_mcap_usd":   mcap,
            "mcap_change_24h":  mcap_chg,
            "tokens":           tokens,
            "trending_bullish": trending_bull,
            "trending_total":   len(trending) if trending else 0,
            "x402_stats":       self.mcp.payer.stats if self.mcp.payer else {"x402_enabled": False},
        }

    def list_mcp_tools(self):
        return self.mcp.list_tools()
