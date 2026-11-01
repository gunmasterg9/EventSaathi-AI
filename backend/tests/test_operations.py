import pytest
from backend.app.models.models import EventFeedback, Task


def make_event(client):
    return client.post('/api/events', json={'name': 'Operations test'}).json()['id']


@pytest.mark.parametrize('bundle', ['hospitality', 'travel', 'registration', 'hybrid', 'coordination'])
def test_checklist_adds_editable_tasks_without_duplicates(client, bundle):
    eid = make_event(client)
    url = f'/api/events/{eid}/service-checklists'
    assert client.post(url, json={'bundle': bundle}).json()['added'] == 3
    tasks = client.get(f'/api/events/{eid}/tasks').json()['tasks']
    assert len(tasks) == 3
    client.patch(f"/api/events/{eid}/tasks/{tasks[0]['id']}", json={'status': 'completed'})
    assert client.post(url, json={'bundle': bundle}).json()['added'] == 0
    assert client.get(f'/api/events/{eid}/tasks').json()['completed_tasks'] == 1
    assert client.post(url, json={'bundle': 'unknown'}).status_code == 422


def test_feedback_ratings_backup_boundaries_and_cascade(client, db_session):
    eid, other = make_event(client), make_event(client)
    base = f'/api/events/{eid}'
    assert client.get(base+'/feedback').json()['average_rating'] is None
    first = client.post(base+'/feedback', json={'author': ' Client ', 'rating': 5, 'comment': 'Helpful coordination'}).json()
    second = client.post(base+'/feedback', json={'author': 'Guest', 'rating': 2, 'comment': 'Improve check-in'}).json()
    summary = client.get(base+'/feedback').json()
    assert summary['total'] == 2 and summary['average_rating'] == 3.5
    assert first['author'] == 'Client'
    assert client.delete(f"/api/events/{other}/feedback/{first['id']}").status_code == 403
    assert len(client.get(base+'/export-json').json()['feedback']) == 2
    assert client.delete(f"{base}/feedback/{second['id']}").status_code == 204
    assert client.get(base+'/feedback').json()['average_rating'] == 5
    assert client.delete(base).status_code == 204
    assert db_session.get(EventFeedback, first['id']) is None


@pytest.mark.parametrize('payload', [
    {'author': ' ', 'rating': 5, 'comment': 'Text'},
    {'author': 'Guest', 'rating': 0, 'comment': 'Text'},
    {'author': 'Guest', 'rating': 6, 'comment': 'Text'},
    {'author': 'Guest', 'rating': 5, 'comment': ' '},
])
def test_invalid_feedback(client, payload):
    eid = make_event(client)
    assert client.post(f'/api/events/{eid}/feedback', json=payload).status_code == 422
    assert client.get('/api/events/missing/feedback').status_code == 404
