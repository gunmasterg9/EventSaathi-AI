import json
import logging
import httpx
from typing import Optional, Dict, Any
from backend.app.config import settings
from backend.app.schemas.ai_plan import AIPlanGenerated
from backend.app.services.fallback_engine import generate_fallback_plan

logger = logging.getLogger("eventsaathi.ai_service")

class AIPlannerService:
    def __init__(self):
        self.model = settings.GEMINI_MODEL
        self.api_key = settings.GEMINI_API_KEY
        self.timeout = settings.AI_TIMEOUT_SECONDS

    def is_configured(self) -> bool:
        return settings.AI_PROVIDER == "ollama" or settings.has_ai_credentials

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
        Generates a comprehensive event plan. If Gemini API credentials are missing,
        time out, or encounter errors, cleanly falls back to the deterministic engine.
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
            f"You are EventSaathi AI, an expert, culturally aware event & celebration planner. "
            f"Generate a personalized, budget-conscious event plan in {language_name}. "
            f"You must strictly output a valid JSON object matching the requested schema. "
            f"Ensure the sum of estimated amounts in the budget items is approximately {total_budget} {currency}. "
            f"Do not include markdown backticks or commentary outside the JSON."
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

Return a single JSON object with EXACTLY this structure:
{{
  "event_summary": "string - comprehensive celebration overview",
  "theme": "string - aesthetic and decor concept",
  "budget": {{
    "currency": "{currency}",
    "total": {total_budget},
    "items": [
      {{
        "category": "string (e.g. Venue, Catering, Decoration, Photography, Entertainment, Miscellaneous)",
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

        using_ollama = settings.AI_PROVIDER == "ollama"
        if using_ollama:
            api_url = settings.OLLAMA_BASE_URL.rstrip('/') + '/api/chat'
            request_body = {
                "model": settings.OLLAMA_MODEL,
                "stream": False,
                "format": AIPlanGenerated.model_json_schema(),
                "messages": [
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_prompt},
                ],
                "options": {"temperature": 0.4, "num_predict": 4096},
            }

        try:
            async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT_SECONDS if using_ollama else self.timeout) as client:
                response = await client.post(
                    api_url,
                    json=request_body,
                    headers={"Content-Type": "application/json"}
                )

            if response.status_code != 200:
                logger.warning(f"AI provider responded with status {response.status_code}. Using fallback.")
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
                    reason=f"AI provider returned status {response.status_code}. Deterministic fallback active."
                )

            data = response.json()
            if using_ollama:
                text_content = data.get("message", {}).get("content", "")
            else:
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
            plan.plan_source = "ollama_ai" if using_ollama else "gemini_ai"
            plan.fallback_reason = None
            return plan

        except Exception as e:
            # Safe logging: do not expose API key or sensitive data
            logger.error(f"Error during AI plan generation: {type(e).__name__}. Falling back to deterministic planner.")
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
                reason=f"AI service temporary issue ({type(e).__name__}). Deterministic fallback active."
            )

ai_planner = AIPlannerService()
