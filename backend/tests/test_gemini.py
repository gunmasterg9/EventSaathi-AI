from unittest.mock import AsyncMock, patch
import httpx
import pytest
from backend.app.config import settings
from backend.app.services.ai_service import ai_planner
from backend.app.services.fallback_engine import generate_fallback_plan


@pytest.mark.asyncio
async def test_gemini_request_and_validated_response(monkeypatch):
    monkeypatch.setattr(settings, 'GEMINI_API_KEY', 'test_key_abc123')
    content = generate_fallback_plan(
        event_type='birthday',
        name='Local test',
        city='Ahmedabad',
        guest_count=20,
        total_budget=10000
    ).model_dump_json()
    response = httpx.Response(200, json={
        'candidates': [
            {'content': {'parts': [{'text': content}]}}
        ]
    })
    with patch('httpx.AsyncClient.post', new_callable=AsyncMock, return_value=response) as post:
        plan = await ai_planner.generate_plan(
            event_type='birthday',
            name='Local test',
            city='Ahmedabad',
            guest_count=20,
            total_budget=10000
        )
    assert plan.plan_source == 'gemini_ai'
    assert plan.fallback_reason is None
    body = post.call_args.kwargs['json']
    assert 'Local test' in body['contents'][0]['parts'][0]['text']
    assert 'generativelanguage.googleapis.com' in post.call_args.args[0]


@pytest.mark.asyncio
@pytest.mark.parametrize('response', [
    httpx.Response(404),
    httpx.Response(200, json={'candidates': [{'content': {'parts': [{'text': 'invalid JSON'}]}}]})
])
async def test_gemini_failure_is_identified_as_fallback(monkeypatch, response):
    monkeypatch.setattr(settings, 'GEMINI_API_KEY', 'test_key_abc123')
    with patch('httpx.AsyncClient.post', new_callable=AsyncMock, return_value=response):
        plan = await ai_planner.generate_plan(
            event_type='birthday',
            name='Local test',
            city='Ahmedabad',
            guest_count=20,
            total_budget=10000
        )
    assert plan.plan_source == 'rules_fallback'
    assert plan.fallback_reason is not None
