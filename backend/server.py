"""FinFlow AI — FastAPI backend.

Endpoints:
- GET  /api/            -> health
- GET  /api/tips/random -> random Pro Tip of the Day
- POST /api/plan/generate -> AI-generated financial plan (Claude or GPT)
- POST /api/plan/email  -> send plan via email (placeholder — feature disabled)
"""

from __future__ import annotations

import asyncio
import json
import os
import random
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, List, Literal, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field

# Load env BEFORE importing emergentintegrations / reading vars
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from emergentintegrations.llm.chat import LlmChat, UserMessage  # noqa: E402

# ---------- Mongo ----------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]

mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client[DB_NAME]

# ---------- FastAPI ----------
app = FastAPI(title="FinFlow AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Models ----------
class PersonalInfo(BaseModel):
    name: str
    age: int
    city: str
    family_members: int = 0
    risk_appetite: Literal["Low", "Medium", "High"] = "Medium"


class Income(BaseModel):
    monthly_salary: float = 0
    other_income: float = 0
    spouse_income: float = 0


class EMI(BaseModel):
    name: str = ""
    amount: float = 0
    months_left: int = 0


class Expenses(BaseModel):
    daily_expense: float = 0
    monthly_fixed_expense: float = 0
    emis: List[EMI] = Field(default_factory=list)


class AssetsLiabilities(BaseModel):
    savings: float = 0
    mutual_funds: float = 0
    fixed_deposits: float = 0
    stocks: float = 0
    loans: float = 0


class Goal(BaseModel):
    name: str
    target_amount: float
    timeframe_years: float
    priority: Literal["Low", "Medium", "High"] = "Medium"


class PlanRequest(BaseModel):
    personal: PersonalInfo
    income: Income
    expenses: Expenses
    assets: AssetsLiabilities
    goals: List[Goal] = Field(default_factory=list)
    language: Literal["en", "hi"] = "en"
    model_choice: Literal["gpt-5.2"] = "gpt-5.2"


class GoalTimelineItem(BaseModel):
    name: str
    target_amount: float
    timeframe_years: float
    priority: str
    monthly_contribution: float
    months_to_achieve: int
    on_track: bool


class PlanResponse(BaseModel):
    id: str
    total_income: float
    total_expenses: float
    monthly_savings: float
    savings_rate: float
    financial_health_score: int
    health_label: str
    ai_summary: str
    ai_plan_markdown: str
    monthly_action_checklist: List[str]
    goal_timeline: List[GoalTimelineItem]
    pro_tip: str
    model_used: str
    language: str
    created_at: str


class EmailRequest(BaseModel):
    plan_id: str
    email: str


# ---------- Pro tips ----------
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

PRO_TIPS_HI = [
    "खर्च करने से पहले बचाएँ, बाद में नहीं।",
    "6 महीनों के खर्च के बराबर इमरजेंसी फंड रखें।",
    "EMI आपकी आय के 40% से अधिक न हो।",
    "निवेश निरंतर करें, कभी-कभी नहीं।",
    "पहले खुद को भुगतान करें — सैलरी आते ही बचत ऑटो करें।",
    "30 दिन हर रुपया ट्रैक करें; जागरूकता ही आदत बदलती है।",
    "कंपाउंडिंग धैर्य का फल है — जल्दी शुरू करें, टिके रहें।",
    "विविधता रखें: किसी एक स्टॉक में 10% से ज़्यादा न लगाएँ।",
    "बीमा हर साल रिव्यू करें — जीवन बीमा ≈ 10× वार्षिक आय।",
    "क़र्ज़ गुरुत्व की तरह है; पहले महंगे लोन चुकाएँ।",
    "महँगाई चुपचाप बढ़ती है — पैसा उससे तेज़ बढ़ना चाहिए।",
    "लक्ष्य तारीख़ के साथ लिखें; अस्पष्ट लक्ष्य शायद ही पूरे होते हैं।",
]


@app.get("/api/")
async def root() -> dict[str, Any]:
    return {"service": "FinFlow AI", "status": "ok", "time": datetime.now(timezone.utc).isoformat()}


@app.get("/api/tips/random")
async def random_tip(language: str = "en") -> dict[str, str]:
    tips = PRO_TIPS_HI if language == "hi" else PRO_TIPS_EN
    return {"tip": random.choice(tips), "language": language}


# ---------- Helpers ----------
def _compute_metrics(req: PlanRequest) -> dict[str, float]:
    total_income = (
        req.income.monthly_salary + req.income.other_income + req.income.spouse_income
    )
    emi_total = sum(e.amount for e in req.expenses.emis)
    total_expenses = (
        req.expenses.daily_expense * 30
        + req.expenses.monthly_fixed_expense
        + emi_total
    )
    monthly_savings = total_income - total_expenses
    savings_rate = (monthly_savings / total_income * 100) if total_income > 0 else 0.0

    # Health score heuristic (0-100)
    score = 50.0
    score += min(savings_rate, 40)  # up to +40 for savings rate
    emergency_fund_months = (
        (req.assets.savings / total_expenses) if total_expenses > 0 else 0
    )
    score += min(emergency_fund_months * 2.5, 15)  # up to +15
    debt_to_income = (emi_total / total_income) if total_income > 0 else 1
    score -= min(debt_to_income * 50, 25)  # up to -25
    liquid_assets = req.assets.savings + req.assets.mutual_funds + req.assets.fixed_deposits + req.assets.stocks
    net_worth = liquid_assets - req.assets.loans
    if net_worth > 0:
        score += 5
    score = max(0, min(100, round(score)))

    return {
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "monthly_savings": round(monthly_savings, 2),
        "savings_rate": round(savings_rate, 2),
        "financial_health_score": int(score),
    }


def _health_label(score: int) -> str:
    if score >= 80:
        return "Excellent"
    if score >= 65:
        return "Good"
    if score >= 50:
        return "Fair"
    if score >= 35:
        return "Needs Attention"
    return "Critical"


def _build_goal_timeline(req: PlanRequest, monthly_savings: float) -> List[GoalTimelineItem]:
    if not req.goals:
        return []
    # Weighted by priority
    priority_weight = {"High": 3.0, "Medium": 2.0, "Low": 1.0}
    total_weight = sum(priority_weight.get(g.priority, 1.0) for g in req.goals)
    pool = max(monthly_savings, 0) * 0.8  # allocate 80% of savings to goals
    items: List[GoalTimelineItem] = []
    for g in req.goals:
        w = priority_weight.get(g.priority, 1.0)
        alloc = (pool * w / total_weight) if total_weight > 0 else 0
        alloc = max(alloc, 500)  # floor
        months = int(g.target_amount / alloc) if alloc > 0 else 9999
        on_track = months <= int(g.timeframe_years * 12)
        items.append(
            GoalTimelineItem(
                name=g.name,
                target_amount=g.target_amount,
                timeframe_years=g.timeframe_years,
                priority=g.priority,
                monthly_contribution=round(alloc, 2),
                months_to_achieve=months,
                on_track=on_track,
            )
        )
    return items


def _extract_json(text: str) -> Optional[dict[str, Any]]:
    # Strip code fences
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        return json.loads(cleaned)
    except Exception:
        pass
    # Fallback: find first { ... } balanced block
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            return None
    return None


async def _llm_generate(req: PlanRequest, metrics: dict[str, float]) -> dict[str, Any]:
    system = (
        "You are FinFlow AI, a premium Indian financial planning assistant. "
        "Return ONLY a valid JSON object (no markdown fences) with keys: "
        "ai_summary (string, 2-3 sentences), ai_plan_markdown (string, detailed "
        "markdown plan with sections: Overview, Budget Optimization, Debt Strategy, "
        "Investment Strategy, Goals Roadmap, Risks), monthly_action_checklist "
        "(array of 6-8 concise action items starting with an emoji). "
        "All amounts in INR (₹). "
        f"Respond in {'Hindi' if req.language == 'hi' else 'English'}."
    )
    provider, model = ("openai", "gpt-5.2")

    payload = {
        "personal": req.personal.model_dump(),
        "income": req.income.model_dump(),
        "expenses": req.expenses.model_dump(),
        "assets": req.assets.model_dump(),
        "goals": [g.model_dump() for g in req.goals],
        "derived_metrics": metrics,
    }

    prompt = (
        "Generate a personalised financial plan for this user. "
        "Use the derived_metrics for arithmetic consistency. "
        "Be specific, actionable, and concise. Focus on Indian context "
        "(SIP, mutual funds, PPF, ELSS, NPS, FD, gold, real estate).\n\n"
        f"USER DATA:\n{json.dumps(payload, ensure_ascii=False, indent=2)}\n\n"
        "Return JSON only."
    )

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"finflow-{uuid.uuid4()}",
        system_message=system,
    ).with_model(provider, model)

    response = await chat.send_message(UserMessage(text=prompt))
    parsed = _extract_json(response) or {}
    return {
        "ai_summary": parsed.get("ai_summary", ""),
        "ai_plan_markdown": parsed.get("ai_plan_markdown", response),
        "monthly_action_checklist": parsed.get("monthly_action_checklist", []) or [],
    }


def _fallback_plan(req: PlanRequest, metrics: dict[str, float]) -> dict[str, Any]:
    """Simple deterministic plan if LLM fails — ensures app stays functional."""
    is_hi = req.language == "hi"
    if is_hi:
        summary = f"आपकी मासिक बचत लगभग ₹{metrics['monthly_savings']:,.0f} है और फाइनेंशियल स्कोर {metrics['financial_health_score']} है। अपने लक्ष्यों के लिए SIP शुरू करें।"
        plan_md = (
            "## अवलोकन\nबचत अनुशासन और लक्ष्य-आधारित निवेश पर केंद्रित संतुलित दृष्टिकोण।\n\n"
            "## बजट सुधार\nसब्सक्रिप्शन देखें; विवेकाधीन खर्च 30% पर सीमित करें।\n\n"
            "## निवेश रणनीति\n- विविध इक्विटी म्यूचुअल फंड में SIP\n- दीर्घकालिक टैक्स-मुक्त वृद्धि के लिए PPF\n- 6 महीने के खर्च के लिए इमरजेंसी FD"
        )
        checklist = [
            "✅ सैलरी दिन पर SIP ऑटोमेट करें",
            "💰 6× मासिक खर्च का इमरजेंसी फंड बनाएँ",
            "📉 पहले महंगे EMI चुकाएँ",
            "📈 हर तिमाही पोर्टफोलियो रिव्यू करें",
            "🛡️ टर्म इंश्योरेंस = 10× वार्षिक आय लें",
            "🩺 अलग हेल्थ इंश्योरेंस पॉलिसी रखें",
        ]
    else:
        summary = f"Your monthly savings are about ₹{metrics['monthly_savings']:,.0f} with a financial health score of {metrics['financial_health_score']}. Start an SIP aligned with your goals."
        plan_md = (
            "## Overview\nBalanced approach focused on savings discipline and goal-linked investing.\n\n"
            "## Budget Optimization\nReview subscriptions; cap discretionary spend at 30%.\n\n"
            "## Investment Strategy\n- SIP in diversified equity mutual funds\n- PPF for long-term tax-free growth\n- Emergency FD for 6 months of expenses"
        )
        checklist = [
            "✅ Automate monthly SIP on salary day",
            "💰 Build emergency fund = 6× monthly expenses",
            "📉 Reduce high-interest EMIs first",
            "📈 Review portfolio quarterly",
            "🛡️ Buy term life cover = 10× annual income",
            "🩺 Keep a separate health insurance policy",
        ]
    return {"ai_summary": summary, "ai_plan_markdown": plan_md, "monthly_action_checklist": checklist}


@app.post("/api/plan/generate", response_model=PlanResponse)
async def generate_plan(req: PlanRequest) -> PlanResponse:
    metrics = _compute_metrics(req)
    goal_timeline = _build_goal_timeline(req, metrics["monthly_savings"])

    try:
        # Cap LLM call at 45s — edge proxy enforces ~60s; this leaves room for
        # FastAPI serialization + Mongo insert so the response is always flushed.
        ai = await asyncio.wait_for(_llm_generate(req, metrics), timeout=45.0)
        if not ai.get("ai_plan_markdown"):
            ai = _fallback_plan(req, metrics)
    except asyncio.TimeoutError:
        print("[LLM error] timeout — using fallback plan")
        ai = _fallback_plan(req, metrics)
    except Exception as exc:
        print(f"[LLM error] {exc}")
        ai = _fallback_plan(req, metrics)

    tips_pool = PRO_TIPS_HI if req.language == "hi" else PRO_TIPS_EN
    plan_id = str(uuid.uuid4())
    response = PlanResponse(
        id=plan_id,
        total_income=metrics["total_income"],
        total_expenses=metrics["total_expenses"],
        monthly_savings=metrics["monthly_savings"],
        savings_rate=metrics["savings_rate"],
        financial_health_score=metrics["financial_health_score"],
        health_label=_health_label(metrics["financial_health_score"]),
        ai_summary=ai["ai_summary"],
        ai_plan_markdown=ai["ai_plan_markdown"],
        monthly_action_checklist=ai["monthly_action_checklist"],
        goal_timeline=goal_timeline,
        pro_tip=random.choice(tips_pool),
        model_used=req.model_choice,
        language=req.language,
        created_at=datetime.now(timezone.utc).isoformat(),
    )

    # Persist (exclude _id to avoid BSON issues on retrieval)
    try:
        await db.plans.insert_one({**response.model_dump(), "_pk": plan_id})
    except Exception as exc:
        print(f"[mongo insert error] {exc}")

    return response


@app.post("/api/plan/email")
async def email_plan(req: EmailRequest) -> dict[str, Any]:
    # Email feature intentionally disabled — frontend shows a friendly notice.
    return {
        "success": False,
        "queued": False,
        "message": "Email delivery is coming soon. Please use Download My Plan for now.",
    }


@app.on_event("shutdown")
async def _shutdown() -> None:
    mongo_client.close()
