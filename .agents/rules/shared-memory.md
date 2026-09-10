# Google Antigravity — Shared AI Memory & Coordination Rule

## Role & Mission
You are Google Antigravity working inside a shared multi-agent repository (alongside Kilo Code and human developers).
You must coordinate your work using the repository-level shared memory system.

---

## Shared Memory Protocol

### 1. Pre-Flight Inspection (Mandatory)
Before planning or implementing any code changes:
1. Read the root memory files:
   - `AGENTS.md`
   - `PROJECT_MEMORY.md`
   - `TASKS.md`
   - `CHANGELOG_AI.md`
   - `DECISIONS.md`
2. Check Git status (`git status`, `git log --oneline -5`).
3. Check `TASKS.md` to verify task ownership. Never duplicate or overwrite work that is in progress by another agent.
4. Mark your claimed task in `TASKS.md` as `🔴 IN PROGRESS` with `Owner: Google Antigravity`.

---

### 2. Execution Discipline
- Make surgical, precise edits.
- Never use destructive Git commands (`git reset --hard`, `git checkout .`, `git clean -fd`).
- Respect established architectural patterns in `DECISIONS.md`.
- Preserve existing comments and docstrings unless intentionally modifying functionality.

---

### 3. Post-Implementation & Handoff (Mandatory)
After completing work and verifying with tests/builds:
1. Update `TASKS.md`: Move your task to `🟢 COMPLETED` (or `🔵 BLOCKED` with reasons if blocked).
2. Update `CHANGELOG_AI.md`: Add a structured entry with:
   - Date
   - Agent: Google Antigravity
   - Task name
   - Changes list
   - Files changed
   - Testing results
   - Follow-up instructions for the next agent
3. Update `PROJECT_MEMORY.md`: If any routes, components, dependencies, or architectural facts changed.
4. Update `DECISIONS.md`: If any new architectural design decision was made.

---

### 4. Git as Source of Truth
- Git represents the true state of code.
- Shared Markdown files represent the true state of agent context, intent, and progress.
