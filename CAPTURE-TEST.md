# Agent-Capture Canary — PASS

The agent-capture hook (`.claude/hooks/capture.mjs`, wired in `.claude/settings.json`
to `UserPromptSubmit` and `Stop`) was validated with a canary prompt across **two
independent Claude Code sessions** before any build code was written.

Canary prompt (verbatim): `CAPTURE TEST — 8x assignment, hash1004`

## Results

| Session | Log file | PROMPT captured | RESPONSE captured | Notes |
|---|---|---|---|---|
| `666a18aa` | `.agent-logs/2026-09-08_17-24-29_666a18aa-….md` | ✅ verbatim | ✅ | Hook installed mid-session; first RESPONSE has no paired PROMPT (expected — the in-flight turn predates the hook). `nextNum()` handles it. |
| `d77ac8b3` | `.agent-logs/2026-09-08_17-33-01_d77ac8b3-….md` | ✅ verbatim, `num=1` | ✅ verbatim, `num=1` (paired) | Clean session from first prompt. PROMPT/RESPONSE pair correctly under one exchange number. |

## Checks performed

- Canary prompt text written verbatim to `.agent-logs/` on `UserPromptSubmit`.
- Final assistant response (text only — thinking/tool-use turns skipped) appended on `Stop`.
- PROMPT and its RESPONSE share one `num=` (exchange numbering, per commit `e856b00`).
- Frontmatter counters (`total_exchanges`, `first_prompt_time`, `last_prompt_time`) updated mechanically; prior entries untouched.
- `.agent-logs/.hook-debug.log` — absent / empty: no throws, no non-zero exits.
- Hook wiring present in `.claude/settings.json` for both hook events.

## Gate

✅ Two-session canary passed. `.agent-logs/` capture is trusted. Build code may begin.
