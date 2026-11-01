import pytest


def event(client, name='Guest test'):
    return client.post('/api/events', json={'name': name, 'guest_count': 3}).json()['id']


def test_guest_workflow_counts_people_and_exports(client):
    eid = event(client)
    base = f'/api/events/{eid}/guests'
    first = client.post(base, json={'name': ' Shah family ', 'party_size': 4, 'rsvp_status': 'confirmed', 'dietary_requirements': 'Jain'})
    assert first.status_code == 201
    guest = first.json()
    assert guest['name'] == 'Shah family'
    client.post(base, json={'name': 'Pending family', 'party_size': 2})
    client.post(base, json={'name': 'Declined', 'party_size': 1, 'rsvp_status': 'declined'})
    summary = client.get(base).json()
    assert (summary['invited_people'], summary['confirmed_people'], summary['pending_people'], summary['declined_people']) == (7, 4, 2, 1)
    assert summary['confirmed_people'] > summary['planned_capacity']
    assert client.patch(f"{base}/{guest['id']}", json={'rsvp_status': 'declined', 'phone': None}).status_code == 200
    assert client.get(base).json()['confirmed_people'] == 0
    assert client.post(f'/api/events/{eid}/generate-plan').status_code == 200
    assert len(client.get(base).json()['guests']) == 3
    backup = client.get(f'/api/events/{eid}/export-json').json()
    assert len(backup['guests']) == 3
    assert client.delete(f"{base}/{guest['id']}").status_code == 204
    assert len(client.get(base).json()['guests']) == 2


def test_guest_event_boundaries_and_cascade(client, db_session):
    from backend.app.models.models import Guest
    first, second = event(client), event(client, 'Second event')
    guest = client.post(f'/api/events/{first}/guests', json={'name': 'Guest'}).json()
    for method in (client.patch, client.delete):
        kwargs = {'json': {'name': 'Wrong event'}} if method == client.patch else {}
        assert method(f"/api/events/{second}/guests/{guest['id']}", **kwargs).status_code == 403
    assert client.get('/api/events/missing/guests').status_code == 404
    assert client.delete(f'/api/events/{first}').status_code == 204
    assert db_session.get(Guest, guest['id']) is None


@pytest.mark.parametrize('payload', [{'name': ' '}, {'name': 'Guest', 'party_size': 0}, {'name': 'Guest', 'rsvp_status': 'unknown'}])
def test_guest_validation(client, payload):
    eid = event(client)
    base = f'/api/events/{eid}/guests'
    assert client.post(base, json=payload).status_code == 422
    guest = client.post(base, json={'name': 'Valid'}).json()
    assert client.patch(f"{base}/{guest['id']}", json={'name': None}).status_code == 422


def test_guest_csv_sanitizes_formulas(client):
    eid = event(client)
    base = f'/api/events/{eid}/guests'
    client.post(base, json={'name': '=1+1', 'phone': '+919999999999', 'notes': '@SUM(1)'})
    response = client.get(f'{base}/export-csv')
    assert response.status_code == 200
    assert "'=1+1" in response.text and "'+919999999999" in response.text and "'@SUM(1)" in response.text
