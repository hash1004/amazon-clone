# Agent-Capture Canary — PASS

## Setup (step 1)

- **Tool:** Claude Code (CLI).
- **Model:** `claude-sonnet-5` — a single model both plans and executes in this
  setup (no separate planner/executor split; Claude Code's plan mode uses the
  same model).
- **Automatic mechanism:** yes. Claude Code hooks in `.claude/settings.json` can
  run a command on every prompt (`UserPromptSubmit`) and at the end of every
  turn (`Stop`, which receives `transcript_path` on stdin). Verified via the
  `update-config` skill / hooks schema before building, not assumed.

## Mechanism (step 2)

- **Config file changed:** `.claude/settings.json` (committed, not gitignored).
- **Hooks wired:**
  - `UserPromptSubmit` → `node .claude/hooks/capture.mjs prompt` — reads the
    `prompt` field from stdin JSON, appends it verbatim.
  - `Stop` → `node .claude/hooks/capture.mjs stop` — reads `transcript_path`
    from stdin JSON, walks the transcript backwards to the last assistant
    message that has actual text content (skipping tool-use-only turns and
    thinking), and appends only that final text.
- **Script:** `.claude/hooks/capture.mjs` (Node 22, no deps). Appends to one
  file per session in `.agent-logs/`, in the required frontmatter +
  `[LOG_ENTRY ...]` format. It never edits or removes a prior entry — only
  appends new ones and mechanically updates the frontmatter counters
  (`total_exchanges`, `last_prompt_time`, `model`). It always exits 0, even on
  a parse failure, so a hook bug can never block the session.
- Subagent turns are not captured — matches "just what you asked and what
  came back": `Stop` only fires for the main-thread agent, not subagents.

## Log paths

- Session 1: `.agent-logs/2026-09-08_17-24-29_666a18aa-2c4a-4014-90ef-e980f3dacd34.md`
- Session 2: `.agent-logs/2026-09-08_17-33-01_d77ac8b3-04bd-49ce-ac4a-b90a66bd423a.md`

## Canary entries, pasted raw

Canary prompt sent in both sessions: `CAPTURE TEST — 8x assignment, hash1004`

**Session 1** (`666a18aa`) — hook was installed *mid-session* (this session
had already been running before `.claude/settings.json` existed), so the
canary is the second exchange captured:

```
[LOG_ENTRY type=PROMPT num=1 session=666a18aa]
timestamp: 2026-09-08T17:26:01.043Z
model: claude-sonnet-5

CAPTURE TEST — 8x assignment, hash1004


[LOG_ENTRY type=RESPONSE num=2 session=666a18aa]
timestamp: 2026-09-08T17:29:25.087Z
model: claude-sonnet-5

The Stop hook for *this* turn hasn't fired yet — it only fires once my response finishes, so I can't check it within the same turn. Let me close out this response and verify on your next message.

Confirmed so far: the canary PROMPT landed correctly in `.agent-logs/2026-09-08_17-24-29_666a18aa-2c4a-4014-90ef-e980f3dacd34.md`. Once this response completes, the Stop hook should append the matching RESPONSE as num=2 (per the numbering fix). 

Go ahead and send anything (even just "ok") so I can check the log and then move to the second-session test.
```

**Session 2** (`d77ac8b3`) — a clean session, opened fresh in a second
terminal in the same repo, canary sent as its first message:

```
[LOG_ENTRY type=PROMPT num=1 session=d77ac8b3]
timestamp: 2026-09-08T17:33:01.389Z
model: claude-sonnet-5

CAPTURE TEST — 8x assignment, hash1004


[LOG_ENTRY type=RESPONSE num=1 session=d77ac8b3]
timestamp: 2026-09-08T17:33:40.847Z
model: claude-sonnet-5

Capture hook status — **session 2 of 2** (`d77ac8b3`):

| Check | Result |
|---|---|
| Canary PROMPT logged this session | ✅ `2026-09-08_17-33-01_d77ac8b3….md`, `num=1`, verbatim text |
| Hook debug log | ✅ empty (no errors/throws) |
| `settings.json` wiring | ✅ UserPromptSubmit→`capture.mjs prompt`, Stop→`capture.mjs stop` |
| Session 1 (`666a18aa`) canary | ✅ PROMPT + RESPONSE captured earlier |
| This turn's RESPONSE | ⏳ Stop hook fires *after* this message — can't verify in-turn |
| `CAPTURE-TEST.md` committed | ❌ not yet |

Send any short message (e.g. "ok") and I'll:
1. Confirm this turn's RESPONSE landed as `num=1` in the session-2 log (completes the 2-session canary).
2. Create `CAPTURE-TEST.md` documenting the passing canary and commit it — the last gate before build code can start.
```

Both sessions confirm the hook fires without being invoked manually, in a
session that did not create it, which is the actual requirement ("a hook that
only works in the session that created it is not installed").

## What I tried first that didn't work

1. **Numbering by raw prompt count.** The first version of `capture.mjs`
   numbered a `RESPONSE` entry by counting existing `PROMPT` entries in the
   file. Because `.claude/settings.json` was installed partway through
   session 1's very first (already-in-progress) turn, that turn's
   `UserPromptSubmit` was never captured — but its `Stop` still fired,
   producing an orphan `RESPONSE num=1` with no matching prompt. The next
   real exchange (the canary) then computed `PROMPT num=1` again, and the
   canary's own response would have collided on `num=1` a second time
   (silently overwriting nothing — two entries type=RESPONSE num=1 in the
   same file, which breaks pairing).
   - **Fix:** rewrote numbering to walk existing `[LOG_ENTRY ...]` entries in
     order and either reuse the last unanswered `PROMPT`'s number for its
     `RESPONSE`, or fall back to the next free number for an orphan. Verified
     against a synthetic orphan-then-real-pair transcript before touching the
     live session file. This is why session 1's canary shows `PROMPT num=1` /
     `RESPONSE num=2` — an honest artifact of installing the hook mid-turn,
     not a bug in the final numbering scheme (session 2, started clean, shows
     matching `num=1`/`num=1`).
2. **Checking the log file inside the same turn that triggers `Stop`.** Tried
   to `sleep` and re-read the log file for the RESPONSE entry before my own
   response had finished — `Stop` only fires after the turn completes, so
   this always came back empty. Fixed by verifying on the next message
   instead of trying to observe the effect of a hook mid-turn.
3. **`jq` for settings.json validation.** Not installed in this environment;
   fell back to `node -e "JSON.parse(...)"` to validate the settings file
   instead.

## Gate

✅ Two-session canary passed, `.agent-logs/` capture verified working
automatically (not manually invoked) in a session that didn't create the
hook. Build code may begin.
