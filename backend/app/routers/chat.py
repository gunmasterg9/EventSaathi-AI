import json
from typing import Literal
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import Field, model_validator
from backend.app.config import settings
from backend.app.schemas.common import InputModel
from backend.app.schemas.events import EventCreate

router = APIRouter(prefix="/api/chat", tags=["AI chat planner"])


class ChatMessage(InputModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=3000)


class ChatRequest(InputModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=20)
    language: Literal["en", "hi", "gu"] = "en"

    @model_validator(mode="after")
    def last_message_is_user(self):
        if self.messages[-1].role != "user":
            raise ValueError("The last message must be from the user")
        return self


class EventDraft(InputModel):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    event_type: Literal["wedding", "birthday", "community", "other"] | None = None
    city: str | None = Field(default=None, min_length=1, max_length=100)
    date: str | None = Field(default=None, max_length=150)
    guest_count: int | None = Field(default=None, ge=1, le=100000)
    total_budget: float | None = Field(default=None, ge=0)
    theme_preference: str | None = Field(default=None, max_length=200)
    dietary_requirements: str | None = Field(default=None, max_length=300)
    additional_notes: str | None = Field(default=None, max_length=2000)
    indoor_outdoor: Literal["indoor", "outdoor", "both", "flexible"] | None = None


class ChatOutput(InputModel):
    reply: str = Field(min_length=1, max_length=6000)
    draft: EventDraft


class ChatResponse(ChatOutput):
    source: Literal["gemini_ai"]
    model: str
    missing_fields: list[str]
    event_input: EventCreate | None


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Discuss and extract an event brief using Google Gemini. Never writes or deletes event data."""
    if not settings.has_ai_credentials:
        raise HTTPException(503, "Chat needs a configured Gemini key. You can still use the event form and fallback planner.")
    language = {"en": "English", "hi": "Hindi", "gu": "Gujarati"}[request.language]
    instruction = (
        f"You are EventSaathi's AI event-planning assistant. Reply strictly in {language}.\n\n"
        "CORE RESPONSIBILITIES:\n"
        "1. LANGUAGE: Your conversational `reply` MUST be strictly in {language}. If English is requested, do not use Gujarati or Hindi words.\n"
        "2. ACCUMULATE AND RETAIN CONTEXT: The `draft` object MUST be cumulative across the ENTIRE conversation history. "
        "When the user answers follow-up questions (such as giving the birthday person's name, event date, venue preference, or party timings), "
        "you MUST PRESERVE all previously recognized details (such as `city`, `guest_count`, `total_budget`, `event_type`) in `draft`. "
        "NEVER reset already known fields to null unless the user explicitly requested to remove or change them.\n"
        "3. PROACTIVE FOLLOW-UPS: If core details are missing, ask concise, friendly follow-up questions. For birthdays and celebrations, always prompt for:\n"
        "   - The celebrant / event name (if not yet provided)\n"
        "   - Event date (if not yet provided)\n"
        "   - Venue preference (e.g. indoor banquet hall, outdoor lawn/terrace, or home setup)\n"
        "   - Preferred party timings (e.g. 4:00 PM to 7:30 PM)\n"
        "4. FIELD EXTRACTION RULES:\n"
        "   - Only extract values provided or approved by the user. Do not invent an imaginary name, city, budget, or headcount.\n"
        "   - Map venue preference to `indoor_outdoor` ('indoor', 'outdoor', 'both', or 'flexible').\n"
        "   - Map party timing and date to `date` and/or `additional_notes`.\n"
        "   - If all required fields (name, event_type, city, guest_count, total_budget) are present, state clearly that the plan details are ready for review.\n"
        "5. OUTPUT FORMAT: Return strictly a single JSON object with `reply` and `draft` matching this schema:\n"
        + json.dumps(ChatOutput.model_json_schema())
    )
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent"
        body = {
            "systemInstruction": {"parts": [{"text": instruction}]},
            "contents": [
                {"role": "user" if message.role == "user" else "model", "parts": [{"text": message.content}]}
                for message in request.messages
            ],
            "generationConfig": {"responseMimeType": "application/json", "temperature": 0.3}
        }
        headers = {"x-goog-api-key": settings.GEMINI_API_KEY}
        async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
            result = await client.post(url, json=body, headers=headers)
        if result.status_code != 200:
            raise HTTPException(502, "Unable to get a valid response from the Gemini AI service.")
        payload = result.json()
        candidates = payload.get("candidates", [])
        if not candidates:
            raise ValueError("No candidates returned by Gemini")
        content = candidates[0]["content"]["parts"][0]["text"]
        output = ChatOutput.model_validate_json(content)
        required = ["name", "event_type", "city", "guest_count", "total_budget"]
        missing = [field for field in required if getattr(output.draft, field) is None]
        event_input = EventCreate(**output.draft.model_dump(exclude_none=True), language=request.language) if not missing else None
        return ChatResponse(
            **output.model_dump(),
            source="gemini_ai",
            model=settings.GEMINI_MODEL,
            missing_fields=missing,
            event_input=event_input
        )
    except httpx.TimeoutException:
        raise HTTPException(504, "The AI took too long. Try again or use the event form.")
    except Exception:
        raise HTTPException(502, "Unable to get a valid response from the Gemini AI service.")
