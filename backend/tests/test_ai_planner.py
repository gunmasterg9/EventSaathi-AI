import pytest
from unittest.mock import patch, AsyncMock
from backend.app.services.fallback_engine import generate_fallback_plan
from backend.app.services.ai_service import ai_planner

def test_fallback_engine_multilingual_exact_budget():
    # 1. English
    plan_en = generate_fallback_plan(
        event_type="wedding",
        name="Aarav & Meera Wedding",
        city="Ahmedabad",
        guest_count=100,
        total_budget=150000.0,
        currency="INR",
        language="en"
    )
    assert plan_en.plan_source == "rules_fallback"
    assert len(plan_en.budget.items) > 0
    assert len(plan_en.timeline) >= 4
    assert len(plan_en.vendors) >= 3
    # Check exact sum
    total_est = sum(i.estimated_amount for i in plan_en.budget.items)
    assert round(total_est, 2) == 150000.0

    # 2. Hindi
    plan_hi = generate_fallback_plan(
        event_type="birthday",
        name="रोहन का जन्मदिन",
        city="अहमदाबाद",
        guest_count=50,
        total_budget=50000.0,
        currency="INR",
        language="hi"
    )
    assert "उत्सव" in plan_hi.event_summary or "जन्मदिन" in plan_hi.event_summary
    total_hi = sum(i.estimated_amount for i in plan_hi.budget.items)
    assert round(total_hi, 2) == 50000.0

    # 3. Gujarati
    plan_gu = generate_fallback_plan(
        event_type="community",
        name="નવરાત્રી રાસોત્સવ",
        city="અમદાવાદ",
        guest_count=200,
        total_budget=100000.0,
        currency="INR",
        language="gu"
    )
    assert "રૂપરેખા" in plan_gu.event_summary or "બજેટ" in plan_gu.event_summary
    total_gu = sum(i.estimated_amount for i in plan_gu.budget.items)
    assert round(total_gu, 2) == 100000.0

def test_api_generate_plan_endpoint(client):
    ev_res = client.post("/api/events", json={
        "name": "Ahmedabad Cultural Night",
        "event_type": "community",
        "city": "Ahmedabad",
        "guest_count": 80,
        "total_budget": 60000.0,
        "language": "en"
    })
    event_id = ev_res.json()["id"]

    # Trigger plan generation
    gen_res = client.post(f"/api/events/{event_id}/generate-plan")
    assert gen_res.status_code == 200
    data = gen_res.json()

    assert data["plan_source"] in ["rules_fallback", "gemini_ai"]
    assert data["event_summary"] is not None
    assert len(data["guest_experience_ideas"]) > 0
    assert len(data["prep_steps"]) > 0

    # Verify that database records for budget, tasks, and vendors were populated
    b_res = client.get(f"/api/events/{event_id}/budget")
    assert len(b_res.json()["items"]) > 0
    assert b_res.json()["total_budget"] == 60000.0

    t_res = client.get(f"/api/events/{event_id}/tasks")
    assert len(t_res.json()["tasks"]) > 0

    v_res = client.get(f"/api/events/{event_id}/vendors")
    assert len(v_res.json()["vendors"]) > 0

@pytest.mark.asyncio
async def test_ai_planner_service_fallback_on_api_error():
    # Simulate API failure and verify graceful fallback
    with patch.object(ai_planner, "is_configured", return_value=True):
        with patch("httpx.AsyncClient.post", side_effect=Exception("Connection timed out")):
            result = await ai_planner.generate_plan(
                event_type="wedding",
                name="Fallback Test Wedding",
                city="Surat",
                guest_count=100,
                total_budget=100000.0,
                language="en"
            )
            assert result.plan_source == "rules_fallback"
            assert "fallback" in (result.fallback_reason or "").lower()
            assert len(result.budget.items) > 0
