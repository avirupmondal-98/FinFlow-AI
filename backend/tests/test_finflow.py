"""FinFlow AI Backend Test Suite.

Covers:
- Health endpoint (/api/)
- Random tip endpoint (en/hi)
- Plan generation (Claude / GPT / Hindi / metric correctness)
- Plan email (intentionally disabled, returns success=false)
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://98b2fe49-12ad-474e-8ba8-1675e347187c.preview.emergentagent.com").rstrip("/")
TIMEOUT = 120  # plan generation may take 15-60s


PRO_TIPS_EN = [
    "Save before you spend, not after.",
    "Keep 6 months of expenses as an emergency fund.",
    "Avoid EMIs beyond 40% of your income.",
    "Invest consistently, not occasionally.",
    "Pay yourself first — automate savings the day salary arrives.",
    "Track every rupee for 30 days; awareness alone changes habits.",
    "Compounding rewards patience — start early, stay invested.",
    "Diversify: never put more than 10% in a single stock.",
    "Review insurance annually — life cover ≈ 10× your annual income.",
    "Debt has gravity; clear high-interest loans before investing aggressively.",
    "Inflation is silent — your money must grow faster than it.",
    "Write goals down with dates; vague goals rarely get funded.",
]


def _sample_payload(model="claude-sonnet-4-5", language="en"):
    return {
        "personal": {
            "name": "TEST_Aarav",
            "age": 30,
            "city": "Bengaluru",
            "family_members": 3,
            "risk_appetite": "Medium",
        },
        "income": {
            "monthly_salary": 120000,
            "other_income": 10000,
            "spouse_income": 50000,
        },
        "expenses": {
            "daily_expense": 1000,
            "monthly_fixed_expense": 25000,
            "emis": [
                {"name": "Home Loan", "amount": 20000, "months_left": 120},
                {"name": "Car Loan", "amount": 8000, "months_left": 36},
            ],
        },
        "assets": {
            "savings": 200000,
            "mutual_funds": 150000,
            "fixed_deposits": 100000,
            "stocks": 50000,
            "loans": 500000,
        },
        "goals": [
            {
                "name": "Emergency Fund",
                "target_amount": 600000,
                "timeframe_years": 1,
                "priority": "High",
            },
            {
                "name": "Child Education",
                "target_amount": 2500000,
                "timeframe_years": 10,
                "priority": "Medium",
            },
        ],
        "language": language,
        "model_choice": model,
    }


# ---------- Health ----------
class TestHealth:
    def test_root(self):
        r = requests.get(f"{BASE_URL}/api/", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("service") == "FinFlow AI"
        assert data.get("status") == "ok"
        assert "time" in data


# ---------- Tips ----------
class TestTips:
    def test_random_tip_en(self):
        r = requests.get(f"{BASE_URL}/api/tips/random?language=en", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("language") == "en"
        assert isinstance(data.get("tip"), str) and len(data["tip"]) > 0
        assert data["tip"] in PRO_TIPS_EN

    def test_random_tip_hi(self):
        r = requests.get(f"{BASE_URL}/api/tips/random?language=hi", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("language") == "hi"
        # Should contain Devanagari
        assert any("\u0900" <= ch <= "\u097F" for ch in data["tip"])


# ---------- Plan generation ----------
class TestPlanGeneration:
    @pytest.fixture(scope="class")
    def claude_plan(self):
        payload = _sample_payload(model="claude-sonnet-4-5", language="en")
        r = requests.post(f"{BASE_URL}/api/plan/generate", json=payload, timeout=TIMEOUT)
        assert r.status_code == 200, f"Claude plan failed: {r.status_code} {r.text[:500]}"
        return r.json(), payload

    def test_claude_structure(self, claude_plan):
        data, payload = claude_plan
        # Required keys
        for key in [
            "id", "total_income", "total_expenses", "monthly_savings", "savings_rate",
            "financial_health_score", "health_label", "ai_summary", "ai_plan_markdown",
            "monthly_action_checklist", "goal_timeline", "pro_tip", "model_used",
            "language", "created_at",
        ]:
            assert key in data, f"missing key {key}"
        assert data["model_used"] == "claude-sonnet-4-5"
        assert data["language"] == "en"
        assert isinstance(data["ai_summary"], str) and len(data["ai_summary"]) > 0
        assert isinstance(data["ai_plan_markdown"], str) and len(data["ai_plan_markdown"]) > 20
        assert isinstance(data["monthly_action_checklist"], list)
        assert 0 <= data["financial_health_score"] <= 100
        assert data["health_label"] in {"Excellent", "Good", "Fair", "Needs Attention", "Critical"}
        assert isinstance(data["goal_timeline"], list) and len(data["goal_timeline"]) == len(payload["goals"])
        for item in data["goal_timeline"]:
            for k in ["name", "target_amount", "timeframe_years", "priority",
                      "monthly_contribution", "months_to_achieve", "on_track"]:
                assert k in item

    def test_claude_metric_math(self, claude_plan):
        data, payload = claude_plan
        inc = payload["income"]
        exp = payload["expenses"]
        expected_income = inc["monthly_salary"] + inc["other_income"] + inc["spouse_income"]
        expected_expenses = (
            exp["daily_expense"] * 30
            + exp["monthly_fixed_expense"]
            + sum(e["amount"] for e in exp["emis"])
        )
        assert abs(data["total_income"] - expected_income) < 0.5
        assert abs(data["total_expenses"] - expected_expenses) < 0.5
        assert abs(data["monthly_savings"] - (expected_income - expected_expenses)) < 0.5

    def test_gpt_plan(self):
        payload = _sample_payload(model="gpt-5.2", language="en")
        r = requests.post(f"{BASE_URL}/api/plan/generate", json=payload, timeout=TIMEOUT)
        assert r.status_code == 200, f"GPT plan failed: {r.status_code} {r.text[:500]}"
        data = r.json()
        assert data["model_used"] == "gpt-5.2"
        assert isinstance(data["ai_plan_markdown"], str) and len(data["ai_plan_markdown"]) > 20

    def test_hindi_plan(self):
        payload = _sample_payload(model="claude-sonnet-4-5", language="hi")
        r = requests.post(f"{BASE_URL}/api/plan/generate", json=payload, timeout=TIMEOUT)
        assert r.status_code == 200, f"Hindi plan failed: {r.status_code} {r.text[:500]}"
        data = r.json()
        assert data["language"] == "hi"
        # Either summary or markdown should contain Devanagari
        combined = (data.get("ai_summary", "") + data.get("ai_plan_markdown", ""))
        assert any("\u0900" <= ch <= "\u097F" for ch in combined), \
            "Expected Hindi (Devanagari) characters in response"


# ---------- Email (disabled) ----------
class TestEmail:
    def test_email_returns_coming_soon(self):
        r = requests.post(
            f"{BASE_URL}/api/plan/email",
            json={"plan_id": "any-id", "email": "TEST_user@example.com"},
            timeout=15,
        )
        assert r.status_code == 200
        data = r.json()
        assert data.get("success") is False
        assert "coming soon" in data.get("message", "").lower()
