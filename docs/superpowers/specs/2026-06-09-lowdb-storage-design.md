# Lowdb Storage Design

## Goal

Replace the current `sql.js` SQLite storage with `lowdb` so the app persists server-side data in a lightweight JSON file without WASM loading or SQLite-specific Docker configuration.

## Architecture

The public data-layer API in `lib/db.ts` stays intact: API routes continue to call `getWorkspaces`, `upsertWorkspace`, `deleteWorkspace`, `getMessages`, `upsertMessage`, `deleteMessage`, `getConfig`, `setConfig`, `loadFullData`, and `saveFullData`. The implementation changes from SQL tables to a `lowdb` JSON database stored at `data/chat.json`.

The JSON database stores the same app-level shape used by the client storage:

```json
{
  "workspaces": [],
  "activeWorkspaceId": "",
  "apiConfig": {
    "baseUrl": "https://api.openai.com/v1",
    "apiKey": "",
    "model": "gpt-4o"
  }
}
```

## Data Flow

`getDb()` initializes one singleton `Low<AppData>` instance, creates `data/` if needed, reads `data/chat.json`, and fills missing fields with environment-backed defaults. Mutating helpers update `db.data` in memory and call `db.write()` immediately, matching the old SQLite implementation's write-after-change behavior.

Workspace deletion removes the workspace from `workspaces` and clears `activeWorkspaceId` when it pointed at the removed workspace. Message operations edit the `messages` array inside the matching workspace.

## Error Handling

If no JSON database exists, the data layer starts from default app data. If callers request messages for a missing workspace, the data layer returns an empty array. The implementation keeps JSON parsing and file IO inside lowdb instead of manual parsing.

## Testing

Add focused `lib/db.ts` tests that import the module from a temporary working directory. Tests verify that `saveFullData` writes `data/chat.json`, `loadFullData` round-trips workspaces/messages/config, message deletion persists, and missing data loads the default workspace.
