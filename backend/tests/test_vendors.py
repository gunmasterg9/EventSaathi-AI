def test_vendor_crud_and_status_tracking(client):
    ev_res = client.post("/api/events", json={
        "name": "Wedding Vendor Showcase",
        "city": "Ahmedabad",
        "total_budget": 300000.0
    })
    event_id = ev_res.json()["id"]

    # Add vendor 1
    v1_res = client.post(f"/api/events/{event_id}/vendors", json={
        "category": "Catering",
        "name": "Shreeji Royal Caterers",
        "contact_person": "Jignesh Patel",
        "phone": "+91 98250 12345",
        "email": "jignesh@shreejicaterers.com",
        "estimated_quote": 95000.0,
        "actual_quote": 90000.0,
        "status": "quoted",
        "selection_criteria": "Specializes in live Gujarati chaat and kathiyawadi feast",
        "notes": "Passed food tasting on Oct 10"
    })
    assert v1_res.status_code == 201
    v1_id = v1_res.json()["id"]

    # Add vendor 2
    v2_res = client.post(f"/api/events/{event_id}/vendors", json={
        "category": "Photography",
        "name": "Drishti Studio",
        "contact_person": "Anjali Shah",
        "estimated_quote": 35000.0,
        "status": "booked"
    })
    assert v2_res.status_code == 201

    # Check vendor list
    v_list = client.get(f"/api/events/{event_id}/vendors").json()
    assert v_list["total_vendors"] == 2
    assert v_list["booked_vendors"] == 1

    # Update vendor 1 to booked
    patch_res = client.patch(f"/api/events/{event_id}/vendors/{v1_id}", json={
        "status": "booked",
        "actual_quote": 88000.0
    })
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "booked"
    assert patch_res.json()["actual_quote"] == 88000.0

    # Filter by category=Catering
    cat_res = client.get(f"/api/events/{event_id}/vendors?category=Catering").json()
    assert len(cat_res["vendors"]) == 1
    assert cat_res["vendors"][0]["name"] == "Shreeji Royal Caterers"

    # Delete vendor 2
    v2_id = v2_res.json()["id"]
    del_res = client.delete(f"/api/events/{event_id}/vendors/{v2_id}")
    assert del_res.status_code == 204

    # Now only 1 vendor remaining
    v_list2 = client.get(f"/api/events/{event_id}/vendors").json()
    assert v_list2["total_vendors"] == 1
