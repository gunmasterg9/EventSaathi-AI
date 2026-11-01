from unittest.mock import AsyncMock, patch
import httpx
import pytest
from backend.app.config import settings
from backend.app.services.ai_service import ai_planner
from backend.app.services.fallback_engine import generate_fallback_plan


@pytest.mark.asyncio
async def test_ollama_request_and_validated_response(monkeypatch):
    monkeypatch.setattr(settings, 'AI_PROVIDER', 'ollama')
    content = generate_fallback_plan(event_type='birthday', name='Local test', city='Ahmedabad', guest_count=20, total_budget=10000).model_dump_json()
    response = httpx.Response(200, json={'message': {'content': content}})
    with patch('httpx.AsyncClient.post', new_callable=AsyncMock, return_value=response) as post:
        plan = await ai_planner.generate_plan(event_type='birthday', name='Local test', city='Ahmedabad', guest_count=20, total_budget=10000)
    assert plan.plan_source == 'ollama_ai'
    body = post.call_args.kwargs['json']
    assert body['stream'] is False and body['format']['type'] == 'object'
    assert 'Local test' in body['messages'][1]['content']
    assert post.call_args.args[0].endswith('/api/chat')


@pytest.mark.asyncio
@pytest.mark.parametrize('response', [httpx.Response(404), httpx.Response(200, json={'message': {'content': 'invalid JSON'}})])
async def test_ollama_failure_is_identified_as_fallback(monkeypatch, response):
    monkeypatch.setattr(settings, 'AI_PROVIDER', 'ollama')
    with patch('httpx.AsyncClient.post', new_callable=AsyncMock, return_value=response):
        plan = await ai_planner.generate_plan(event_type='birthday', name='Local test', city='Ahmedabad', guest_count=20, total_budget=10000)
    assert plan.plan_source == 'rules_fallback'
