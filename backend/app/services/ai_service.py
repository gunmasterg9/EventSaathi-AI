import json
import logging
import httpx
from typing import Optional, Dict, Any
from backend.app.config import settings
from backend.app.schemas.ai_plan import AIPlanGenerated, AIPlanBudgetItem
from backend.app.services.fallback_engine import generate_fallback_plan

logger = logging.getLogger("eventsaathi.ai_service")

class AIPlannerService:
    def __init__(self):
        self.model = settings.GEMINI_MODEL
        self.api_key = settings.GEMINI_API_KEY
        self.timeout = settings.AI_TIMEOUT_SECONDS

    def is_configured(self) -> bool:
        return settings.has_ai_credentials

    async def generate_plan(
        self,
        event_type: str,
        name: str,
        city: str,
        guest_count: int,
        total_budget: float,
        currency: str = "INR",
        language: str = "en",
        theme_preference: Optional[str] = None,
        dietary_requirements: Optional[str] = None,
        indoor_outdoor: str = "flexible",
        additional_notes: Optional[str] = None,
        event_date: Optional[str] = None,
    ) -> AIPlanGenerated:
        """
        Generates a comprehensive event plan using Google Gemini AI.
        If Gemini API credentials are missing, time out, or encounter errors,
        cleanly falls back to the deterministic localized engine.
        """
        # If API key is not configured, directly use fallback
        if not self.is_configured():
            logger.info("Gemini API key not configured. Proceeding with deterministic fallback engine.")
            return generate_fallback_plan(
                event_type=event_type,
                name=name,
                city=city,
                guest_count=guest_count,
                total_budget=total_budget,
                currency=currency,
                language=language,
                theme_preference=theme_preference or "",
                dietary_requirements=dietary_requirements or "",
                indoor_outdoor=indoor_outdoor,
                additional_notes=additional_notes or "",
                event_date=event_date or "",
                reason="Gemini API key not configured. Generated via deterministic planning engine."
            )

        # Build prompt for Gemini
        language_name = "English"
        if language == "hi":
            language_name = "Hindi (हिंदी)"
        elif language == "gu":
            language_name = "Gujarati (ગુજરાતી)"

        system_instruction = (
            f"You are EventSaathi AI, an expert, culturally aware event and celebration planner. "
            f"Generate a personalized, budget-conscious event plan in {language_name}.\n\n"
            f"CRITICAL REQUIREMENTS:\n"
            f"1. STRICT LANGUAGE ADHERENCE: The entire response MUST be written strictly in {language_name}. "
            f"If {language_name} is English, every field, item_name, reason, idea, step, and schedule note MUST be strictly in English.\n"
            f"2. BUDGET INTEGRITY & CONTINGENCY: The sum of `estimated_amount` across ALL budget items MUST EQUAL EXACTLY {total_budget} {currency} (no more, no less). "
            f"Always include an explicit line item under category 'Contingency' with item_name 'Emergency Contingency Buffer' (e.g. ₹1,000 for a ₹20,000 budget, or ~5-10% of total) so that: sum(items) == {total_budget}.\n"
            f"3. GRANULAR FOOD BREAKDOWN: Provide separate budget items for:\n"
            f"   - Welcome drinks & light snacks\n"
            f"   - Main meal / dinner buffet (explicitly specify per-guest cost in the reason, e.g. '₹300 per head for {guest_count} guests = ₹9,000')\n"
            f"   - Birthday / celebration cake (as a separate line item)\n"
            f"4. GRANULAR DECORATION BREAKDOWN: Provide separate budget items for:\n"
            f"   - Balloon decoration & entrance arch\n"
            f"   - Photo backdrop & stage setup\n"
            f"   - Table setup, centerpieces & ambient lighting\n"
            f"5. SPECIFIC INTERACTIVE GAMES: In ideas, prep_steps, and event_day_schedule, suggest 3 to 4 specific, named interactive games suitable for guests/children (e.g. Musical Chairs, Treasure Hunt, Freeze Dance, Passing the Parcel, Balloon Pop Relay, Trivia Quiz).\n"
            f"6. REALISTIC SCHEDULE & ACCURATE DURATIONS: In event_day_schedule:\n"
            f"   - Calculate schedule durations accurately (e.g. 4:00 PM to 7:30 PM is exactly 3.5 hours, not 4.0 hours).\n"
            f"   - Allocate generous dedicated time: at least 30 to 45 minutes for cake cutting / celebration ceremonies, and at least 45 to 60 minutes for dinner / refreshments.\n"
            f"7. OUTPUT FORMAT: Strictly output a valid JSON object matching the requested schema. Do not include markdown backticks or commentary outside the JSON."
        )

        user_prompt = f"""
Event Details:
- Type: {event_type}
- Name: {name}
- Location: {city}
- Guests: {guest_count}
- Total Budget: {currency} {total_budget}
- Preferred Language: {language_name}
- Theme Preference: {theme_preference or 'None specified'}
- Dietary / Accessibility: {dietary_requirements or 'None specified'}
- Setting: {indoor_outdoor}
- Date / Milestone: {event_date or 'Not specified'}
- Notes: {additional_notes or 'None'}

Remember:
- Granular catering breakdown: drinks & snacks, dinner buffet (e.g. ₹300/head for {guest_count} guests), and celebration cake.
- Granular decoration breakdown: balloon decor, photo backdrop/stage, table setup.
- Suggest 3 to 4 specific interactive games (e.g. Musical Chairs, Treasure Hunt, Freeze Dance, Passing the Parcel).
- Explicit Contingency line item (e.g. ₹1,000 buffer) ensuring sum(items.estimated_amount) == {total_budget} exactly.
- Accurate schedule timing calculations (e.g. 4 PM to 7:30 PM = 3.5 hours) with 30-45m for cake cutting and 45-60m for dinner.
- Entire output in {language_name}.

Return a single JSON object with EXACTLY this structure:
{{
  "event_summary": "string - comprehensive celebration overview",
  "theme": "string - aesthetic and decor concept",
  "budget": {{
    "currency": "{currency}",
    "total": {total_budget},
    "items": [
      {{
        "category": "string (e.g. Catering, Decoration, Photography, Entertainment, Contingency)",
        "item_name": "string",
        "estimated_amount": number,
        "reason": "string - explanation of allocation"
      }}
    ]
  }},
  "timeline": [
    {{
      "title": "string",
      "description": "string",
      "due_date": "string or null",
      "milestone_phase": "string (e.g. 4_weeks_before, 2_weeks_before, 1_week_before, day_before, event_day)",
      "priority": "high | medium | low",
      "status": "pending"
    }}
  ],
  "vendors": [
    {{
      "category": "string (Venue, Catering, Decoration, Photography, Entertainment, etc.)",
      "suggested_title": "string",
      "requirements": ["string criteria 1", "string criteria 2"],
      "status": "not_contacted"
    }}
  ],
  "ideas": ["string idea 1", "string idea 2", "string idea 3"],
  "contingencies": ["string contingency 1", "string contingency 2"],
  "prep_steps": ["string step 1", "string step 2", "string step 3"],
  "event_day_schedule": [
    {{
      "time_slot": "string",
      "activity": "string",
      "notes": "string or null"
    }}
  ]
}}
"""

        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        request_body = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"{system_instruction}\n\n{user_prompt}"}]
                }
            ],
            "generationConfig": {
                "temperature": 0.4,
                "responseMimeType": "application/json"
            }
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    api_url,
                    json=request_body,
                    headers={"Content-Type": "application/json"}
                )

            if response.status_code != 200:
                logger.warning(f"Gemini API responded with status {response.status_code}. Using fallback.")
                return generate_fallback_plan(
                    event_type=event_type,
                    name=name,
                    city=city,
                    guest_count=guest_count,
                    total_budget=total_budget,
                    currency=currency,
                    language=language,
                    theme_preference=theme_preference or "",
                    dietary_requirements=dietary_requirements or "",
                    indoor_outdoor=indoor_outdoor,
                    additional_notes=additional_notes or "",
                    event_date=event_date or "",
                    reason=f"Gemini API returned status {response.status_code}. Deterministic fallback active."
                )

            data = response.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise ValueError("No candidates returned by Gemini")
            text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            if not text_content:
                raise ValueError("Empty response text from Gemini")

            # Clean markdown code blocks if present
            cleaned_text = text_content.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            cleaned_text = cleaned_text.strip()

            parsed_json = json.loads(cleaned_text)

            # Validate against Pydantic schema
            plan = AIPlanGenerated.model_validate(parsed_json)
            plan.plan_source = "gemini_ai"
            plan.fallback_reason = None

            # Enforce exact budget sum integrity
            current_sum = sum(item.estimated_amount for item in plan.budget.items)
            diff = round(total_budget - current_sum, 2)
            if diff != 0.0:
                contingency_item = next(
                    (item for item in plan.budget.items if "contingency" in item.category.lower() or "buffer" in item.item_name.lower() or "અનામત" in item.category or "આકસ્મિક" in item.category or "आकस्मिक" in item.category),
                    None
                )
                if contingency_item:
                    contingency_item.estimated_amount = max(0.0, round(contingency_item.estimated_amount + diff, 2))
                else:
                    plan.budget.items.append(
                        AIPlanBudgetItem(
                            category="Contingency",
                            item_name="Emergency Contingency Buffer",
                            estimated_amount=max(0.0, diff),
                            reason="Contingency reserve ensuring exact budget match"
                        )
                    )

            return plan

        except Exception as e:
            # Safe logging: do not expose API key or sensitive data
            logger.error(f"Error during Gemini plan generation: {type(e).__name__}. Falling back to deterministic planner.")
            return generate_fallback_plan(
                event_type=event_type,
                name=name,
                city=city,
                guest_count=guest_count,
                total_budget=total_budget,
                currency=currency,
                language=language,
                theme_preference=theme_preference or "",
                dietary_requirements=dietary_requirements or "",
                indoor_outdoor=indoor_outdoor,
                additional_notes=additional_notes or "",
                event_date=event_date or "",
                reason=f"Gemini AI temporary issue ({type(e).__name__}). Deterministic fallback active."
            )

ai_planner = AIPlannerService()
