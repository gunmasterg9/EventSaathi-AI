def test_create_event_success(client):
    payload = {
        "name": "Pooja & Rahul Sangeet & Wedding",
        "event_type": "wedding",
        "date": "2026-12-25",
        "city": "Ahmedabad",
        "venue_status": "not_booked",
        "guest_count": 150,
        "total_budget": 250000.0,
        "currency": "INR",
        "language": "gu",
        "theme_preference": "Royal Gujarati Traditional",
        "dietary_requirements": "Strictly Jain & Pure Vegetarian",
        "indoor_outdoor": "both",
        "additional_notes": "Include Garba night arrangements"
    }
    response = client.post("/api/events", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == payload["name"]
    assert data["city"] == "Ahmedabad"
    assert data["guest_count"] == 150
    assert data["total_budget"] == 250000.0
    assert data["currency"] == "INR"
    assert data["language"] == "gu"
    assert "id" in data
    assert data["total_tasks"] == 0
    assert data["budget_remaining"] == 250000.0

def test_create_event_validation_failure(client):
    # Invalid: guest_count must be >= 1, total_budget >= 0, name required
    invalid_payload = {
        "name": "A",  # min length is 2
        "guest_count": 0,
        "total_budget": -500.0
    }
    response = client.post("/api/events", json=invalid_payload)
    assert response.status_code == 422

def test_get_event_not_found(client):
    response = client.get("/api/events/non-existent-uuid")
    assert response.status_code == 404

def test_list_events(client):
    # Create two events
    client.post("/api/events", json={"name": "Event 1", "city": "Surat", "guest_count": 50, "total_budget": 50000})
    client.post("/api/events", json={"name": "Event 2", "city": "Vadodara", "guest_count": 100, "total_budget": 100000})

    response = client.get("/api/events")
    assert response.status_code == 200
    events = response.json()
    assert len(events) >= 2
    assert events[0]["name"] in ["Event 1", "Event 2"]

def test_update_event(client):
    create_res = client.post("/api/events", json={"name": "Initial Name", "city": "Ahmedabad", "total_budget": 50000})
    event_id = create_res.json()["id"]

    patch_res = client.patch(f"/api/events/{event_id}", json={"name": "Updated Name", "total_budget": 65000})
    assert patch_res.status_code == 200
    updated_data = patch_res.json()
    assert updated_data["name"] == "Updated Name"
    assert updated_data["total_budget"] == 65000.0

def test_delete_event(client):
    create_res = client.post("/api/events", json={"name": "To Delete", "city": "Rajkot", "total_budget": 20000})
    event_id = create_res.json()["id"]

    del_res = client.delete(f"/api/events/{event_id}")
    assert del_res.status_code == 204

    get_res = client.get(f"/api/events/{event_id}")
    assert get_res.status_code == 404
