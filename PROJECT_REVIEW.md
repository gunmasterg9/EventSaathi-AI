# Project review — 1 November 2026

## Completed in this review

- Regenerating plans preserves expenses, payment flags, task progress, deleted
  tasks, and vendor contacts. Initial generation leaves manually populated
  workspace sections intact.
- Added a downloadable JSON snapshot from the plan view, including event details,
  expenses, tasks and vendors. Snapshot import/restore is not implemented.
- Required database columns reject explicit null updates. Text inputs trim
  whitespace and reject empty required values. Monetary inputs reject non-finite
  numbers. Task/vendor statuses and event options validate supported values.
- Updated demo matching to reuse the actual sample event name and set new sample
  dates 30 days ahead.
- CSV downloads handle Hindi/Gujarati event names using UTF-8 filenames.
- Unplanned events no longer show an AI-generated badge. Budget fetch errors have
  a retry action; application errors are visible in the main layout.

## Verification

Backend: 60 tests pass. Frontend: 13 tests
pass; TypeScript and production build pass. Lint completes with existing React
hook/compiler and Fast Refresh warnings. Backend dependencies emit datetime and
test-client deprecation warnings. Google Gemini generation and fallback paths were verified. Browser visual testing was verified.

## Remaining improvements, in priority order

1. User authentication and event ownership before a public deployment. The current
   API is a shared workspace; knowing an event ID allows access. CORS is not
   authentication.
2. Enforce request limits against actual streamed body sizes; the existing
   middleware checks only Content-Length and assumes it is a valid integer.
3. Protect async event selection and workspace requests against out-of-order
   responses when users switch events or filters quickly.
4. Add backup restore. Event editing, guest/RSVP tracking, service checklists,
   feedback and conversational AI planning have now been implemented.
5. Complete localization of remaining English UI text and improve dialog focus
   trapping, Escape handling, and screen-reader labels.
6. Verify the configured Gemini model with real credentials, then document the
   supported model. The fallback path is tested; a live model was not verified.
7. Pin backend dependency versions and add CI for reproducible builds and tests.

The application is improved and passes the checks above, but this review does not
certify it as production-ready or free of defects.
