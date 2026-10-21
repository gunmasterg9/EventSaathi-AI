def test_budget_crud_and_calculations(client):
    # Create event with 50,000 budget
    ev_res = client.post("/api/events", json={
        "name": "Arjun 30th Birthday",
        "event_type": "birthday",
        "city": "Ahmedabad",
        "total_budget": 50000.0,
        "currency": "INR"
    })
    event_id = ev_res.json()["id"]

    # Add budget items
    item1_res = client.post(f"/api/events/{event_id}/budget/items", json={
        "category": "Catering",
        "item_name": "Buffet Dinner & Cake",
        "estimated_amount": 20000.0,
        "actual_amount": 18500.0,
        "notes": "Includes premium Belgian chocolate cake"
    })
    assert item1_res.status_code == 201
    item1_id = item1_res.json()["id"]

    item2_res = client.post(f"/api/events/{event_id}/budget/items", json={
        "category": "Venue",
        "item_name": "Lawn Space Rental",
        "estimated_amount": 15000.0,
        "actual_amount": 15000.0,
        "is_paid": True
    })
    assert item2_res.status_code == 201

    # Check budget summary
    summary_res = client.get(f"/api/events/{event_id}/budget")
    assert summary_res.status_code == 200
    summary = summary_res.json()

    assert summary["total_budget"] == 50000.0
    assert summary["total_estimated"] == 35000.0
    assert summary["total_actual"] == 33500.0
    assert summary["remaining_budget"] == 16500.0
    assert summary["is_over_budget"] is False
    assert len(summary["categories"]) == 2
    assert len(summary["items"]) == 2

    # Update item 1
    patch_res = client.patch(f"/api/events/{event_id}/budget/items/{item1_id}", json={
        "actual_amount": 22000.0,
        "is_paid": True
    })
    assert patch_res.status_code == 200
    assert patch_res.json()["actual_amount"] == 22000.0
    assert patch_res.json()["is_paid"] is True

    # Delete item 1
    del_res = client.delete(f"/api/events/{event_id}/budget/items/{item1_id}")
    assert del_res.status_code == 204

    # Verify summary after delete
    summary_res2 = client.get(f"/api/events/{event_id}/budget")
    assert len(summary_res2.json()["items"]) == 1

def test_negative_amount_validation(client):
    ev_res = client.post("/api/events", json={
        "name": "Budget Test Event",
        "city": "Mumbai",
        "total_budget": 10000.0
    })
    event_id = ev_res.json()["id"]

    # Negative estimated_amount should fail Pydantic validation (422)
    bad_item = client.post(f"/api/events/{event_id}/budget/items", json={
        "category": "Catering",
        "item_name": "Negative Item",
        "estimated_amount": -100.0
    })
    assert bad_item.status_code == 422

def test_over_budget_detection(client):
    ev_res = client.post("/api/events", json={
        "name": "Strict Budget Party",
        "city": "Ahmedabad",
        "total_budget": 10000.0
    })
    event_id = ev_res.json()["id"]

    # Add item exceeding total budget
    client.post(f"/api/events/{event_id}/budget/items", json={
        "category": "Venue",
        "item_name": "Expensive Hall",
        "estimated_amount": 8000.0,
        "actual_amount": 12500.0
    })

    summary = client.get(f"/api/events/{event_id}/budget").json()
    assert summary["is_over_budget"] is True
    assert summary["remaining_budget"] == -2500.0
    assert summary["over_budget_amount"] == 2500.0
