# EventSaathi AI — submission recording guide

Target duration: **3 minutes 45 seconds**. Hard limit: **under 4 minutes**.
This guide follows the submission criteria supplied by the organizer.

## Before recording

- Run `run.bat` and open http://127.0.0.1:5173/.
- Use fictitious names and contact details. Keep credentials and `.env` off screen.
- Configure Gemini privately in the root `.env`, restart the backend, and verify
  a generated event returns `plan_source: gemini_ai`. Credentials being present
  does not prove that a model request succeeded.
- The last verified live run used `rules_fallback` with no configured Gemini key.
  This is an outstanding submission requirement: do not describe fallback output
  as generative AI. Verify the configured model is available to your account.
- Rehearse once with the exact inputs below. Start a fresh event during recording;
  do not substitute saved plans for live input and generation.
- Keep the cursor visible and zoom the browser so entered values are readable.
  Pause briefly on inputs and results. Keep real generation latency visible.

## Recording sequence — 3:45

| Time | Screen and live actions | Suggested narration / caption |
| --- | --- | --- |
| 0:00–0:10 | Landing page; open the planning wizard. | “EventSaathi turns a celebration brief into a multilingual plan, then tracks the real work: money, tasks, vendors and guests.” |
| 0:10–0:40 | On the empty wizard, click Next once to show the required-name error. Then type `Aarav Birthday Demo`, choose birthday, city `Ahmedabad`, 30 guests, budget `10000 INR`, theme `Outdoor space adventure`, dietary need `Vegetarian, Jain options`, and notes `Low-waste decorations and a rain backup`. | “Here is a live validation case. Now I’ll enter a real planning brief.” Pause on the exact budget and preferences. |
| 0:40–1:15 | Submit generation. Open the plan, show the Gemini source badge, generated theme, rain contingency, and schedule. | “These form inputs become the AI prompt. Gemini generates structured planning content, which the backend validates and saves as usable budget, timeline and vendor records.” Point to details responding to the space theme and rain request. |
| 1:15–2:00 | Create another fresh birthday event: `Meera Birthday Demo`, Ahmedabad, 30 guests, `10000 INR`, theme `Indoor Gujarati folk celebration`, notes `Garba activity and reusable decor`. Generate it live. Show its different theme and activities and the Gemini badge. | “Changing the brief changes the result. This second plan responds to an indoor Gujarati celebration instead of the outdoor space theme.” Compare actual generated content; do not claim a difference that is absent. |
| 2:00–2:25 | Budget: edit an expense, type actual amount `12500`, save, and show the over-budget warning for the `10000` target. | “The plan becomes an editable workspace. This overspend is a visible edge case, and the balance updates immediately.” |
| 2:25–2:45 | Timeline: complete one task and show updated progress. Vendors: enter a sample vendor name `Demo Caterer` and set booked. | “Tasks and vendor decisions persist, so the generated plan can be followed through.” |
| 2:45–3:15 | Guests & RSVP: add `Shah family (demo)`, party size `31`, confirmed, dietary need `Jain`. Save and show confirmed people exceeding the planned 30. Briefly show the response filter. | “Headcounts count people, not invitation records. The app flags attendance above capacity and records dietary needs.” |
| 3:15–3:35 | Reload the page to show persistence, open the saved event, show the recorded budget/task/guest data, then download the event backup. Briefly switch interface language to Hindi or Gujarati. | “The work survives a reload, supports regional languages, and can be exported.” |
| 3:35–3:45 | End on the dashboard. | “EventSaathi connects AI planning with practical execution, helping organizers manage a celebration in one place.” |

If generation is slow, shorten secondary vendor/language coverage after rehearsing.
Never accelerate only the AI wait while implying that it happened at normal speed.
Do not let the video reach four minutes; retain a small timing buffer.

## What the GenAI evidence must establish

1. **Input:** readable live planning brief before clicking Generate.
2. **Execution:** actual generation request, followed by a `gemini_ai` result.
3. **Output:** generated theme, ideas or schedule responding to the entered brief.
4. **Dynamic behavior:** a second live brief yields corresponding changes.
5. **Purpose:** AI converts event constraints and cultural preferences into an
   actionable structured plan. Calculations, RSVP counts and validation are
   ordinary application logic, not AI.

The wizard shows the user brief rather than the full server-generated prompt.
If judges require the literal model prompt, show the prompt construction in
`backend/app/services/ai_service.py` briefly, alongside the live inputs and result.
Never show provider request URLs containing credentials.

## Honest product boundaries

- Start at onboarding; login is not implemented and should not be simulated.
- The fallback engine provides continuity but is deterministic, not GenAI proof.
- RSVP is organizer-recorded; public response links and automatic invitations are
  not implemented.
- Generated vendor records are planning suggestions, not verified businesses.
- Local API and automated checks have passed. Browser/device visual QA and a
  successful live Gemini request remain unverified.

## Upload and submit

Upload the finished video to either:

- Google Drive with access set to **Anyone with the link**, or
- YouTube with visibility set to **Unlisted**.

Play the exact submitted link in a private/incognito window while signed out.
It must play without sign-in, permission requests or access approval.

## Final checklist

- [ ] Final duration is under 4:00, preferably 3:45 or less.
- [ ] New data is typed live and readable on screen.
- [ ] Required-name error and successful submission are visible.
- [ ] Over-budget and over-capacity edge cases are visible.
- [ ] Gemini generation succeeds and is identified accurately.
- [ ] Two different live briefs demonstrate dynamic AI output.
- [ ] Budget, task, vendor and guest workflows are shown in order.
- [ ] Persistence and export are demonstrated.
- [ ] Cursor, text, captions and any narration are clear.
- [ ] No credentials or real guest details appear in the video.
- [ ] Public/unlisted video link plays in a signed-out private window.
