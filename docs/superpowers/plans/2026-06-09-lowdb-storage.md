# Lowdb Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `sql.js` SQLite database with `lowdb` JSON-file persistence.

**Architecture:** Keep the existing exported functions in `lib/db.ts` so API routes do not change. Store the server-side app data as `AppData` in `data/chat.json`, using `lowdb/node` for file IO and immediate writes after mutations.

**Tech Stack:** Next.js 16, TypeScript, Vitest, lowdb 7.

---

### Task 1: Add Lowdb Persistence Tests

**Files:**
- Create: `tests/lib/db.test.ts`

- [ ] **Step 1: Write failing tests**

Create tests that dynamically import `lib/db.ts` after switching to a temporary working directory. Verify that saving full data creates `data/chat.json`, loading returns the same app data, deleting a message persists, and missing data returns the default workspace.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/lib/db.test.ts`

Expected: at least one failure because the current implementation writes `data/chat.db` through SQLite instead of `data/chat.json`.

### Task 2: Replace SQLite Implementation

**Files:**
- Modify: `lib/db.ts`

- [ ] **Step 1: Install lowdb**

Run: `npm install lowdb`

- [ ] **Step 2: Implement lowdb data layer**

Replace the `sql.js` imports and SQL table operations with a singleton `Low<AppData>` backed by `JSONFilePreset` or `JSONFile` from `lowdb/node`.

- [ ] **Step 3: Run focused tests**

Run: `npm test tests/lib/db.test.ts`

Expected: all tests in `tests/lib/db.test.ts` pass.

### Task 3: Remove SQLite Configuration and Documentation

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `next.config.ts`
- Modify: `Dockerfile`
- Modify: `README.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Remove SQLite dependencies and WASM config**

Remove `sql.js`, `@types/sql.js`, and unused `@types/better-sqlite3`. Remove `serverExternalPackages: ["sql.js"]` from `next.config.ts`. Remove the Dockerfile copy step for `node_modules/sql.js/dist/`.

- [ ] **Step 2: Update docs**

Change references from SQLite and `data/chat.db` to lowdb JSON storage and `data/chat.json`.

### Task 4: Verify

**Files:**
- Read: all changed files

- [ ] **Step 1: Run tests**

Run: `npm test`

Expected: Vitest exits with status 0.

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: Next.js build exits with status 0.
