def test_tasks_crud_and_completion_percentage(client):
    ev_res = client.post("/api/events", json={
        "name": "Diwali Community Mela",
        "event_type": "community",
        "city": "Ahmedabad",
        "total_budget": 80000.0
    })
    event_id = ev_res.json()["id"]

    # Add 2 tasks
    t1_res = client.post(f"/api/events/{event_id}/tasks", json={
        "title": "Secure Ground Permission",
        "priority": "high",
        "status": "pending",
        "milestone_phase": "4_weeks_before"
    })
    assert t1_res.status_code == 201
    t1_id = t1_res.json()["id"]

    t2_res = client.post(f"/api/events/{event_id}/tasks", json={
        "title": "Install Stage Lighting",
        "priority": "medium",
        "status": "pending",
        "milestone_phase": "day_before"
    })
    assert t2_res.status_code == 201
    t2_id = t2_res.json()["id"]

    # Initial progress should be 0%
    list_res = client.get(f"/api/events/{event_id}/tasks")
    assert list_res.status_code == 200
    data = list_res.json()
    assert data["total_tasks"] == 2
    assert data["completed_tasks"] == 0
    assert data["completion_percentage"] == 0.0

    # Complete 1 task
    patch_res = client.patch(f"/api/events/{event_id}/tasks/{t1_id}", json={
        "status": "completed"
    })
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "completed"

    # Progress should now be 50.0%
    list_res2 = client.get(f"/api/events/{event_id}/tasks")
    data2 = list_res2.json()
    assert data2["total_tasks"] == 2
    assert data2["completed_tasks"] == 1
    assert data2["completion_percentage"] == 50.0

    # Filter tasks by status=completed
    completed_res = client.get(f"/api/events/{event_id}/tasks?status=completed")
    assert len(completed_res.json()["tasks"]) == 1
    assert completed_res.json()["tasks"][0]["id"] == t1_id

    # Filter by priority=high
    high_res = client.get(f"/api/events/{event_id}/tasks?priority=high")
    assert len(high_res.json()["tasks"]) == 1

    # Delete a task
    del_res = client.delete(f"/api/events/{event_id}/tasks/{t2_id}")
    assert del_res.status_code == 204

    # Now 1 task remaining, which is completed (100%)
    list_res3 = client.get(f"/api/events/{event_id}/tasks")
    assert list_res3.json()["total_tasks"] == 1
    assert list_res3.json()["completion_percentage"] == 100.0
