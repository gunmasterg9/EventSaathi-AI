from backend.app.services.csv_service import sanitize_csv_cell

def test_csv_formula_injection_sanitization():
    assert sanitize_csv_cell("=1+1") == "'=1+1"
    assert sanitize_csv_cell("+cmd|' /C calc'!A0") == "'+cmd|' /C calc'!A0"
    assert sanitize_csv_cell("-2+3") == "'-2+3"
    assert sanitize_csv_cell("@SUM(A1:A10)") == "'@SUM(A1:A10)"
    assert sanitize_csv_cell("\tTabPrefix") == "'\tTabPrefix"
    assert sanitize_csv_cell("Safe Normal Item") == "Safe Normal Item"
    assert sanitize_csv_cell("") == ""
    assert sanitize_csv_cell(None) == ""

def test_cross_event_protection(client):
    # Create Event A and Event B
    ev_a = client.post("/api/events", json={"name": "Event A", "city": "City A", "total_budget": 50000}).json()
    ev_b = client.post("/api/events", json={"name": "Event B", "city": "City B", "total_budget": 50000}).json()

    event_a_id = ev_a["id"]
    event_b_id = ev_b["id"]

    # Create budget item, task, and vendor in Event A
    b_item = client.post(f"/api/events/{event_a_id}/budget/items", json={
        "category": "Venue",
        "item_name": "Hall A",
        "estimated_amount": 10000
    }).json()

    task_item = client.post(f"/api/events/{event_a_id}/tasks", json={
        "title": "Task A"
    }).json()

    vendor_item = client.post(f"/api/events/{event_a_id}/vendors", json={
        "category": "Catering",
        "name": "Vendor A"
    }).json()

    # Attempt to modify Event A's records through Event B's URL -> must be 403 Forbidden
    b_patch = client.patch(f"/api/events/{event_b_id}/budget/items/{b_item['id']}", json={"estimated_amount": 20000})
    assert b_patch.status_code == 403

    t_patch = client.patch(f"/api/events/{event_b_id}/tasks/{task_item['id']}", json={"status": "completed"})
    assert t_patch.status_code == 403

    v_patch = client.patch(f"/api/events/{event_b_id}/vendors/{vendor_item['id']}", json={"status": "booked"})
    assert v_patch.status_code == 403

    # Attempt to delete Event A's records through Event B's URL -> must be 403 Forbidden
    b_del = client.delete(f"/api/events/{event_b_id}/budget/items/{b_item['id']}")
    assert b_del.status_code == 403

    t_del = client.delete(f"/api/events/{event_b_id}/tasks/{task_item['id']}")
    assert t_del.status_code == 403

    v_del = client.delete(f"/api/events/{event_b_id}/vendors/{vendor_item['id']}")
    assert v_del.status_code == 403

def test_csv_export_endpoint(client):
    ev_res = client.post("/api/events", json={"name": "CSV Test Celebration", "city": "Ahmedabad", "total_budget": 50000})
    event_id = ev_res.json()["id"]

    # Add an item with potentially dangerous formula prefix
    client.post(f"/api/events/{event_id}/budget/items", json={
        "category": "Security Test",
        "item_name": "=cmd|' /C calc'!A0",
        "estimated_amount": 1000.0,
        "notes": "@SUM(1+1)"
    })

    csv_res = client.get(f"/api/events/{event_id}/budget/export-csv")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    text = csv_res.text
    # Verify sanitized prefixes
    assert "'=cmd|" in text
    assert "'@SUM" in text
    assert "TOTALS:" in text
    assert "WITHIN BUDGET" in text

def test_health_check_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "ai_engine" in data
