import httpx

def run_live_demo():
    client = httpx.Client(base_url="http://localhost:8000", timeout=10.0)

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200
    print("[PASS] 1. Backend Health Check: OK", res.json()["status"])

    # 2. Create Celebration (Ahmedabad Birthday, 50 guests, 50000 INR)
    event_payload = {
        "name": "Aarav's 30th Birthday Celebration",
        "event_type": "birthday",
        "date": "2026-11-20",
        "city": "Ahmedabad, Gujarat",
        "venue_status": "shortlisted",
        "guest_count": 50,
        "total_budget": 50000.0,
        "currency": "INR",
        "language": "en",
        "theme_preference": "Bollywood Retro and Festive Elegance",
        "dietary_requirements": "Pure Vegetarian with Jain special counter",
        "indoor_outdoor": "both",
        "additional_notes": "Live acoustic singing and cake cutting ceremony."
    }
    res = client.post("/api/events", json=event_payload)
    assert res.status_code == 201
    event_data = res.json()
    event_id = event_data["id"]
    print(f"[PASS] 2. Created Event '{event_data['name']}' in {event_data['city']} (ID: {event_id})")

    # 3. Generate Plan
    res = client.post(f"/api/events/{event_id}/generate-plan")
    assert res.status_code == 200
    plan_data = res.json()
    print(f"[PASS] 3. Master Plan Generated. Source: {plan_data['plan_source']}")
    print(f"     Summary: {plan_data['event_summary'][:75]}...")

    # 4. Review & Update Budget
    b_res = client.get(f"/api/events/{event_id}/budget")
    assert b_res.status_code == 200
    budget = b_res.json()
    print(f"[PASS] 4. Budget Loaded: {len(budget['items'])} items totaling {budget['currency']} {budget['total_estimated']}")
    assert round(budget["total_estimated"], 2) == 50000.0

    # Update item 1
    item_id = budget["items"][0]["id"]
    patch_b = client.patch(
        f"/api/events/{event_id}/budget/items/{item_id}",
        json={"actual_amount": 12500.0, "is_paid": True}
    )
    assert patch_b.status_code == 200
    print(f"     Updated Expense Item '{budget['items'][0]['item_name']}' with actual spent = {patch_b.json()['actual_amount']}")

    # 5. Timeline & Complete Task
    t_res = client.get(f"/api/events/{event_id}/tasks")
    assert t_res.status_code == 200
    tasks = t_res.json()
    print(f"[PASS] 5. Initial Task Completion: {tasks['completed_tasks']}/{tasks['total_tasks']} ({tasks['completion_percentage']}%)")
    task_id = tasks["tasks"][0]["id"]
    patch_t = client.patch(f"/api/events/{event_id}/tasks/{task_id}", json={"status": "completed"})
    assert patch_t.status_code == 200
    t_res_after = client.get(f"/api/events/{event_id}/tasks").json()
    print(f"     Completed Task '{tasks['tasks'][0]['title']}': now {t_res_after['completed_tasks']}/{t_res_after['total_tasks']} ({t_res_after['completion_percentage']}%)")

    # 6. Vendors
    v_res = client.get(f"/api/events/{event_id}/vendors")
    assert v_res.status_code == 200
    vendors_data = v_res.json()
    print(f"[PASS] 6. Vendor Hub: {vendors_data['total_vendors']} initial roles identified")
    new_v = client.post(f"/api/events/{event_id}/vendors", json={
        "category": "Catering",
        "name": "Ahmedabad Royal Caterers",
        "contact_person": "Hitesh Shah",
        "phone": "+91 98250 99999",
        "estimated_quote": 19000.0,
        "actual_quote": 18500.0,
        "status": "booked",
        "selection_criteria": "Specializes in authentic Gujarati buffet with live chaat counter"
    })
    assert new_v.status_code == 201
    print(f"     Added & Booked Custom Vendor: {new_v.json()['name']} ({new_v.json()['status']})")

    # 7. Export Budget CSV
    csv_res = client.get(f"/api/events/{event_id}/budget/export-csv")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    print(f"[PASS] 7. Budget Exported to CSV: {len(csv_res.text)} bytes")

    # 8. Refresh and Verify Persistence
    ev_get = client.get(f"/api/events/{event_id}").json()
    assert ev_get["name"] == "Aarav's 30th Birthday Celebration"
    assert ev_get["completed_tasks"] >= 1
    assert ev_get["budget_total_actual"] >= 12500.0
    print(f"[PASS] 8. Persistence Verified: Event '{ev_get['name']}' remains saved in SQLite with all task & budget updates intact!")

    print("\n=======================================================")
    print("ALL 8 DEMO WORKFLOW STEPS VERIFIED LIVE WITH 100% SUCCESS!")
    print("=======================================================")

if __name__ == "__main__":
    run_live_demo()
