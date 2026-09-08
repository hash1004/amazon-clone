#!/usr/bin/env node
// Agent-capture hook for the 8x assignment.
// Wired via .claude/settings.json to UserPromptSubmit ("prompt") and Stop ("stop").
// Appends verbatim prompt / final-response-only entries to .agent-logs/.
// Must NEVER throw or exit non-zero — a hook failure must not block the session.

import { readFileSync, mkdirSync, writeFileSync, appendFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LOG_DIR = join(REPO_ROOT, ".agent-logs");
const DEBUG_LOG = join(LOG_DIR, ".hook-debug.log");
const AUTHOR = "hash1004";
const PROJECT = "amazon-clone";
const TOOL = "claude-code";
const FALLBACK_MODEL = "claude-sonnet-5";

function debug(msg) {
  try {
    mkdirSync(LOG_DIR, { recursive: true });
    appendFileSync(DEBUG_LOG, `[${new Date().toISOString()}] ${msg}\n`);
  } catch {
    // swallow - debug logging must never be the thing that breaks the hook
  }
}

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function findSessionLogPath(sessionId) {
  // A session's file is created once (named with its first-prompt timestamp);
  // find it if it already exists rather than guessing the name again.
  try {
    const files = readdirSync(LOG_DIR);
    const match = files.find((f) => f.endsWith(`_${sessionId}.md`));
    if (match) return join(LOG_DIR, match);
  } catch {
    // dir may not exist yet
  }
  return null;
}

function tsStamp(date) {
  // YYYY-MM-DD_HH-MM-SS in UTC, for filenames
  return date.toISOString().replace(/:/g, "-").replace(/\..+/, "").replace("T", "_");
}

// Best-effort: scan the transcript jsonl for the most recent line carrying a model field.
function extractModelFromTranscript(transcriptPath) {
  try {
    const lines = readFileSync(transcriptPath, "utf8").trim().split("\n");
    for (let i = lines.length - 1; i >= 0; i--) {
      if (!lines[i]) continue;
      try {
        const entry = JSON.parse(lines[i]);
        const model = entry?.message?.model;
        if (model) return model;
      } catch {
        // skip malformed line
      }
    }
  } catch {
    // transcript may not exist yet (very first prompt of a session)
  }
  return null;
}

// Find the last assistant message in the transcript whose content contains
// real text (the final response) - skip pure tool_use turns and thinking blocks.
function extractFinalResponse(transcriptPath) {
  try {
    const lines = readFileSync(transcriptPath, "utf8").trim().split("\n");
    for (let i = lines.length - 1; i >= 0; i--) {
      if (!lines[i]) continue;
      let entry;
      try {
        entry = JSON.parse(lines[i]);
      } catch {
        continue;
      }
      if (entry.type !== "assistant") continue;
      const content = entry.message?.content;
      if (!Array.isArray(content)) continue;
      const textBlocks = content.filter((b) => b.type === "text" && b.text);
      if (textBlocks.length === 0) continue; // tool-use-only turn, keep looking
      return {
        text: textBlocks.map((b) => b.text).join("\n\n"),
        model: entry.message?.model || null,
      };
    }
  } catch {
    // no transcript yet
  }
  return null;
}

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { fm: {}, body: content };
  const fm = {};
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { fm, body: content.slice(m[0].length) };
}

function renderFrontmatter(fm) {
  const order = [
    "session_id",
    "date",
    "author",
    "model",
    "tool",
    "project",
    "total_exchanges",
    "first_prompt_time",
    "last_prompt_time",
  ];
  const lines = order.filter((k) => fm[k] !== undefined).map((k) => `${k}: ${fm[k]}`);
  return `---\n${lines.join("\n")}\n---\n`;
}

// Parse existing entries (in order) as {type, num} so num assignment can
// survive edge cases - e.g. a RESPONSE with no matching PROMPT, which
// happens when this hook is installed mid-session and the turn already
// in flight has no captured UserPromptSubmit event to pair with.
function parseEntries(body) {
  const re = /\[LOG_ENTRY type=(PROMPT|RESPONSE) num=(\d+)/g;
  const entries = [];
  let m;
  while ((m = re.exec(body))) entries.push({ type: m[1], num: parseInt(m[2], 10) });
  return entries;
}

function nextNum(entries, type) {
  const maxNum = entries.reduce((mx, e) => Math.max(mx, e.num), 0);
  if (type === "RESPONSE") {
    // Reuse the num of the most recent PROMPT if it doesn't already have a
    // RESPONSE (the normal case: this response answers that prompt).
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].type === "PROMPT") {
        const promptNum = entries[i].num;
        const answered = entries.some((e) => e.type === "RESPONSE" && e.num === promptNum);
        return answered ? maxNum + 1 : promptNum;
      }
    }
  }
  return maxNum + 1;
}

function appendEntry({ sessionId, type, timestamp, model, text }) {
  mkdirSync(LOG_DIR, { recursive: true });
  const shortId = sessionId.slice(0, 8);
  let logPath = findSessionLogPath(sessionId);
  const nowIso = timestamp;

  if (!logPath) {
    // First write for this session - create the file with frontmatter + header.
    const num = 1;
    const entryBlock =
      `\n[LOG_ENTRY type=${type} num=${num} session=${shortId}]\n` +
      `timestamp: ${nowIso}\n` +
      `model: ${model}\n\n` +
      `${text}\n\n`;
    const date = nowIso.slice(0, 10);
    logPath = join(LOG_DIR, `${tsStamp(new Date(nowIso))}_${sessionId}.md`);
    const fm = {
      session_id: sessionId,
      date,
      author: AUTHOR,
      model,
      tool: TOOL,
      project: PROJECT,
      total_exchanges: num,
      first_prompt_time: nowIso,
      last_prompt_time: nowIso,
    };
    const header =
      `\n# Session Log - ${date}\n\n` +
      `Session: \`${shortId}\` | Project: \`${PROJECT}\` | Author: \`${AUTHOR}\`\n\n---\n`;
    writeFileSync(logPath, renderFrontmatter(fm) + header + entryBlock);
    return;
  }

  // File exists: compute this entry's num from what's already there, append,
  // then mechanically update the frontmatter counters (never touch prior entries).
  const content = readFileSync(logPath, "utf8");
  const { fm, body } = parseFrontmatter(content);
  const entries = parseEntries(body);
  const num = nextNum(entries, type);
  const entryBlock =
    `\n[LOG_ENTRY type=${type} num=${num} session=${shortId}]\n` +
    `timestamp: ${nowIso}\n` +
    `model: ${model}\n\n` +
    `${text}\n\n`;
  const newBody = body + entryBlock;
  fm.model = model; // reflect the most recent model, so a switch is visible
  fm.total_exchanges = String(Math.max(num, ...entries.map((e) => e.num), 0));
  if (type === "PROMPT") fm.last_prompt_time = nowIso;
  writeFileSync(logPath, renderFrontmatter(fm) + newBody);
}

function main() {
  const mode = process.argv[2]; // "prompt" or "stop"
  const raw = readStdin();
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    debug(`failed to parse stdin JSON for mode=${mode}: ${raw.slice(0, 200)}`);
    return;
  }

  const sessionId = input.session_id;
  if (!sessionId) {
    debug(`no session_id in stdin for mode=${mode}`);
    return;
  }

  if (mode === "prompt") {
    const prompt = input.prompt;
    if (typeof prompt !== "string" || prompt.length === 0) return;
    const timestamp = new Date().toISOString();
    const model = extractModelFromTranscript(input.transcript_path) || FALLBACK_MODEL;
    appendEntry({
      sessionId,
      type: "PROMPT",
      timestamp,
      model,
      text: prompt,
    });
  } else if (mode === "stop") {
    const result = extractFinalResponse(input.transcript_path);
    if (!result) {
      debug(`no final assistant text found in transcript for session=${sessionId}`);
      return;
    }
    const timestamp = new Date().toISOString();
    const model = result.model || FALLBACK_MODEL;
    appendEntry({
      sessionId,
      type: "RESPONSE",
      timestamp,
      model,
      text: result.text,
    });
  } else {
    debug(`unknown mode: ${mode}`);
  }
}

try {
  main();
} catch (err) {
  debug(`uncaught error: ${err?.stack || err}`);
}
// Always succeed - this hook is passive logging and must never block Claude Code.
process.exit(0);
