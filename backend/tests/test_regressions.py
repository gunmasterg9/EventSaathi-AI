import pytest


def make_event(client):
    return client.post('/api/events', json={'name': 'Regression event'}).json()['id']


def test_csv_download_supports_regional_event_names(client):
    event_id = client.post('/api/events', json={'name': 'આરવનો જન્મદિવસ'}).json()['id']
    response = client.get(f'/api/events/{event_id}/budget/export-csv')
    assert response.status_code == 200
    assert "filename*=UTF-8''" in response.headers['content-disposition']


def test_export_includes_all_workspace_data(client):
    event_id = make_event(client)
    client.post(f'/api/events/{event_id}/generate-plan')
    response = client.get(f'/api/events/{event_id}/export-json')
    assert response.status_code == 200
    assert 'attachment;' in response.headers['content-disposition']
    data = response.json()
    assert data['schema_version'] == 1
    assert data['event']['id'] == event_id
    assert data['budget_items'] and data['tasks'] and data['vendors']
    assert client.get('/api/events/missing/export-json').status_code == 404


def test_regeneration_preserves_workspace(client):
    event_id = make_event(client)
    base = f'/api/events/{event_id}'
    assert client.post(f'{base}/generate-plan').status_code == 200
    budget = client.get(f'{base}/budget').json()['items'][0]
    task = client.get(f'{base}/tasks').json()['tasks'][0]
    vendor = client.get(f'{base}/vendors').json()['vendors'][0]
    client.patch(f"{base}/budget/items/{budget['id']}", json={'actual_amount': 1234, 'is_paid': True})
    client.patch(f"{base}/tasks/{task['id']}", json={'status': 'completed'})
    client.patch(f"{base}/vendors/{vendor['id']}", json={'phone': '9876543210', 'status': 'booked'})
    before = {resource: client.get(f'{base}/{resource}').json() for resource in ('budget', 'tasks', 'vendors')}
    assert client.post(f'{base}/generate-plan').status_code == 200
    after = {resource: client.get(f'{base}/{resource}').json() for resource in before}
    assert after == before
    # Deleted items should not reappear on refresh either.
    client.delete(f"{base}/tasks/{task['id']}")
    assert client.post(f'{base}/generate-plan').status_code == 200
    assert task['id'] not in [t['id'] for t in client.get(f'{base}/tasks').json()['tasks']]


@pytest.mark.parametrize('field,value', [('name', None), ('city', '  '), ('total_budget', None), ('city', 'x' * 101)])
def test_invalid_event_updates_do_not_corrupt_data(client, field, value):
    event_id = make_event(client)
    assert client.patch(f'/api/events/{event_id}', json={field: value}).status_code == 422
    assert client.get(f'/api/events/{event_id}').status_code == 200


@pytest.mark.parametrize('resource,payload', [
    ('tasks', {'title': '  '}),
    ('tasks', {'title': 'Task', 'status': 'invalid'}),
    ('vendors', {'category': 'Venue', 'name': 'Vendor', 'status': 'invalid'}),
    ('budget/items', {'category': 'Food', 'item_name': '  ', 'estimated_amount': 100}),
])
def test_invalid_workspace_inputs(client, resource, payload):
    event_id = make_event(client)
    assert client.post(f'/api/events/{event_id}/{resource}', json=payload).status_code == 422


@pytest.mark.parametrize('resource,payload,field', [
    ('tasks', {'title': 'Task'}, 'status'),
    ('vendors', {'category': 'Venue', 'name': 'Vendor'}, 'name'),
    ('budget/items', {'category': 'Food', 'item_name': 'Meal', 'estimated_amount': 100}, 'estimated_amount'),
])
def test_workspace_patch_rejects_null_required_columns(client, resource, payload, field):
    event_id = make_event(client)
    base = f'/api/events/{event_id}/{resource}'
    item_id = client.post(base, json=payload).json()['id']
    assert client.patch(f'{base}/{item_id}', json={field: None}).status_code == 422
