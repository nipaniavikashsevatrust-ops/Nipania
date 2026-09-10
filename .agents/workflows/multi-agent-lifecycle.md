# Multi-Agent Workflow: Step-by-Step Lifecycle

```mermaid
flowchart TD
    A[Start Task] --> B[Read AGENTS.md, PROJECT_MEMORY.md, TASKS.md, CHANGELOG_AI.md, DECISIONS.md]
    B --> C[Inspect Git Status & Recent Diffs]
    C --> D{Is Task Owned / In Progress?}
    D -- Yes --> E[Coordinate / Do not overwrite]
    D -- No --> F[Claim Task in TASKS.md as IN PROGRESS]
    F --> G[Implement Changes Surgically]
    G --> H[Run Build & Typechecks]
    H --> I{Tests Pass?}
    I -- No --> G
    I -- Yes --> J[Update TASKS.md to COMPLETED]
    J --> K[Append Entry to CHANGELOG_AI.md]
    K --> L[Update PROJECT_MEMORY.md & DECISIONS.md if needed]
    L --> M[Clean Handoff Ready for Next Agent]
```

## Detailed Steps

### Step 1: Ingestion of State
Before running any code generation or planning:
- Open `AGENTS.md` and review active constraints.
- Open `PROJECT_MEMORY.md` to ensure mental model aligns with the actual repo.
- Open `TASKS.md` to understand what other agents (Kilo Code / Antigravity) are doing.
- Open `CHANGELOG_AI.md` to see recent modifications.
- Open `DECISIONS.md` to align with ADRs.

### Step 2: Workspace & Git Verification
- Run `git status` to see unstaged changes.
- Check target files directly before proposing replacements.

### Step 3: Task Locking
- Update `TASKS.md` by moving the task under `🔴 IN PROGRESS` with your Agent name.

### Step 4: Implementation
- Implement the minimal, robust change set required.
- Do not refactor unrelated modules.

### Step 5: Verification
- Execute `npm run build` or `npx tsc --noEmit` to verify type and build integrity.

### Step 6: Memory Synchronization (Handoff)
- Update `TASKS.md` -> `🟢 COMPLETED`.
- Record detailed entry in `CHANGELOG_AI.md`.
- Synchronize `PROJECT_MEMORY.md` and `DECISIONS.md`.
