import csv
import io
from typing import List, Any
from backend.app.models.models import BudgetItem, Event

def sanitize_csv_cell(val: Any) -> str:
    """
    Sanitize CSV cell content to protect against spreadsheet formula injection (CWE-1236).
    If a string starts with =, +, -, @, \\t, or \\r, prepend an apostrophe (').
    """
    if val is None:
        return ""
    text = str(val)
    if text and text[0] in ("=", "+", "-", "@", "\t", "\r"):
        text = "'" + text
    return text

def generate_budget_csv(event: Event, items: List[BudgetItem]) -> str:
    """
    Generates a secure, sanitized CSV string containing the event budget and cost breakdown.
    """
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

    # Header metadata
    writer.writerow([sanitize_csv_cell("EventSaathi AI - Budget Report")])
    writer.writerow([sanitize_csv_cell("Event Name:"), sanitize_csv_cell(event.name)])
    writer.writerow([sanitize_csv_cell("Event Type:"), sanitize_csv_cell(event.event_type.capitalize())])
    writer.writerow([sanitize_csv_cell("Location:"), sanitize_csv_cell(event.city)])
    writer.writerow([sanitize_csv_cell("Total Budget:"), sanitize_csv_cell(f"{event.currency} {event.total_budget:,.2f}")])
    writer.writerow([])  # blank row

    # Table headers
    headers = [
        "Category",
        "Expense Item",
        f"Estimated Amount ({event.currency})",
        f"Actual Amount ({event.currency})",
        "Variance / Balance",
        "Payment Status",
        "Notes & Quotation Details"
    ]
    writer.writerow([sanitize_csv_cell(h) for h in headers])

    total_estimated = 0.0
    total_actual = 0.0

    for item in items:
        est = round(float(item.estimated_amount or 0.0), 2)
        act = round(float(item.actual_amount or 0.0), 2)
        variance = round(est - act, 2)
        total_estimated += est
        total_actual += act

        writer.writerow([
            sanitize_csv_cell(item.category),
            sanitize_csv_cell(item.item_name),
            sanitize_csv_cell(f"{est:.2f}"),
            sanitize_csv_cell(f"{act:.2f}"),
            sanitize_csv_cell(f"{variance:+.2f}"),
            sanitize_csv_cell("Paid" if item.is_paid else "Pending"),
            sanitize_csv_cell(item.notes or "")
        ])

    writer.writerow([])  # blank row

    # Summary Totals
    total_estimated = round(total_estimated, 2)
    total_actual = round(total_actual, 2)
    remaining = round(float(event.total_budget) - total_actual, 2)
    is_over = remaining < 0

    writer.writerow([
        sanitize_csv_cell("TOTALS:"),
        "",
        sanitize_csv_cell(f"{total_estimated:.2f}"),
        sanitize_csv_cell(f"{total_actual:.2f}"),
        "",
        "",
        ""
    ])
    writer.writerow([
        sanitize_csv_cell("Overall Budget Status:"),
        sanitize_csv_cell("OVER BUDGET" if is_over else "WITHIN BUDGET"),
        sanitize_csv_cell("Remaining Balance:"),
        sanitize_csv_cell(f"{event.currency} {remaining:,.2f}"),
        "",
        "",
        ""
    ])

    return output.getvalue()
