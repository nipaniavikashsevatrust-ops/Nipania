# AGENTS.md — Shared AI Coding Agent Coordination Guide

> **Notice to all AI Coding Agents (Kilo Code, Google Antigravity, and others):**
> This repository is developed collaboratively by multiple AI agents and human developers.
> To prevent conflicts, loss of context, redundant work, and regression bugs, **ALL AI AGENTS MUST STRICTLY ADHERE TO THIS SHARED MEMORY SYSTEM.**

---

## 1. Core Principles

1. **Shared Repository Awareness**: You are not the only AI agent working here. Another agent (such as Kilo Code or Google Antigravity) may have just made changes or will continue after you.
2. **Git is the Code Source of Truth**: Always inspect `git status` and recent commits before touching any code.
3. **Markdown is the Context Source of Truth**: Always read the shared memory files before planning or making changes.
4. **Never Overwrite Blindly**: Respect changes made by other agents. Never use destructive git commands (`git reset --hard`, `git checkout .`, `git clean -fd`) unless explicitly instructed by the user.
5. **No Hallucinated Memory**: Never invent technologies, patterns, or statuses in memory files. If unknown, record `Unknown — needs verification.`
6. **Preserve Existing Functionality**: Avoid unnecessary refactoring or restructuring of working components.
7. **Leave Clean Handoffs**: Always update the shared memory files upon completing or pausing your task so the next agent can seamlessly take over.

---

## 2. The Mandatory AI Agent Lifecycle

Every agent must follow this execution cycle for every non-trivial task:

```text
┌─────────────────────────────────────────────────────────┐
│ 1. READ SHARED MEMORY                                  │
│    • AGENTS.md (Instructions)                           │
│    • PROJECT_MEMORY.md (Architecture & Current State)   │
│    • TASKS.md (Active & Queued Tasks)                   │
│    • CHANGELOG_AI.md (Recent Agent Changes)             │
│    • DECISIONS.md (Architectural Decisions)             │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│ 2. INSPECT REPOSITORY & GIT STATUS                      │
│    • Run: git status                                    │
│    • Run: git log --oneline -5                          │
│    • Inspect relevant target source files               │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│ 3. CHECK TASK OWNERSHIP & CLAIM WORK                    │
│    • Check TASKS.md for conflicts                       │
│    • Move target task to "🔴 IN PROGRESS"               │
│    • Set yourself as Owner (e.g., "Kilo Code" /         │
│      "Google Antigravity")                              │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│ 4. IMPLEMENT WITH CARE                                  │
│    • Make surgical, focused changes                     │
│    • Adhere to DECISIONS.md architecture                │
│    • Maintain comments, types, and error handling       │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│ 5. TEST & VERIFY                                        │
│    • Run build/typecheck: npm run build / npx tsc       │
│    • Run automated tests or linting if configured       │
│    • Verify runtime behavior                            │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│ 6. UPDATE SHARED MEMORY (MANDATORY HANDOFF)             │
│    • Update TASKS.md (move to 🟢 COMPLETED or 🔵 BLOCKED)│
│    • Append entry to CHANGELOG_AI.md                    │
│    • Update PROJECT_MEMORY.md if state/arch changed     │
│    • Append to DECISIONS.md if new architecture chosen  │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Shared Memory Files Overview

| File | Purpose | When to Read | When to Update |
|---|---|---|---|
| **[AGENTS.md](file:///d:/Nextjs/Nipania%20Trust/AGENTS.md)** | Common agent guidelines & workflows | Start of session | When coordination rules change |
| **[PROJECT_MEMORY.md](file:///d:/Nextjs/Nipania%20Trust/PROJECT_MEMORY.md)** | Technical stack, architecture, data models, routes, current status | Before coding | Whenever project structure or state changes |
| **[TASKS.md](file:///d:/Nextjs/Nipania%20Trust/TASKS.md)** | Shared queue of active, upcoming, blocked, and completed tasks | Before starting work | When claiming, pausing, blocking, or completing a task |
| **[CHANGELOG_AI.md](file:///d:/Nextjs/Nipania%20Trust/CHANGELOG_AI.md)** | Audit trail of all agent modifications, files touched, and notes | Before touching existing features | Immediately after completing a code change |
| **[DECISIONS.md](file:///d:/Nextjs/Nipania%20Trust/DECISIONS.md)** | Architectural Decision Records (ADRs) | Before architectural changes | When establishing new architectural patterns |

---

## 4. Agent Handoff Protocol

When an agent (e.g. **Kilo Code**) finishes or pauses a task, the next agent (e.g. **Google Antigravity**) should be able to continue without access to the previous chat history.

### The Handoff Checklist:
1. **Status**: Is the task in [TASKS.md](file:///d:/Nextjs/Nipania%20Trust/TASKS.md) updated with current progress and blocker details (if any)?
2. **Changelog**: Is an entry added to [CHANGELOG_AI.md](file:///d:/Nextjs/Nipania%20Trust/CHANGELOG_AI.md) with exact files changed, testing done, and follow-up tasks?
3. **Decisions**: If any design decisions were made, are they recorded in [DECISIONS.md](file:///d:/Nextjs/Nipania%20Trust/DECISIONS.md)?
4. **Project Memory**: If new dependencies, models, or routes were added, is [PROJECT_MEMORY.md](file:///d:/Nextjs/Nipania%20Trust/PROJECT_MEMORY.md) updated?

---

## 5. Conflict Prevention & Safety Rules

- **Check Active Tasks**: Never work on a task marked `🔴 IN PROGRESS` by another agent without verifying why it is in progress or checking with the user.
- **Inspect Git Diffs**: Use `git status` and `git diff` to understand uncommitted changes before modifying files.
- **Merge Safely**: If an existing file contains recent edits from another agent, understand their rationale (via [CHANGELOG_AI.md](file:///d:/Nextjs/Nipania%20Trust/CHANGELOG_AI.md)) and build incrementally on top of it.
- **No Destructive Overwrites**: Do not delete existing utility functions, API routes, or UI components unless specifically required by the task and approved by architectural decisions.
- **Do Not Push Broken Code**: Verify compilation with `npm run build` or `npx tsc --noEmit` before marking tasks as completed.
