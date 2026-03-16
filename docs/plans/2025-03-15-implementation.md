# Stop The Rot - Implementation Plan

## Phase 1: Foundation
1. Initialize project structure (package.json, tsconfig, folders)
2. Set up SQLite database with schema
3. Create database connection and query functions

## Phase 2: Core API
4. Express server setup with CORS
5. Kids endpoints (get balance)
6. Chores endpoints (create, list, complete)
7. Screen Time endpoints (purchase, enable/disable, active check)

## Phase 3: Frontend
8. Parent dashboard HTML/CSS/JS
9. Kid view HTML/CSS/JS
10. Serve static files from Express

## Phase 4: Integration
11. iOS Shortcuts documentation
12. Testing with ngrok
13. Deploy and verify

## File Structure

```
stop-the-rot/
├── src/
│   ├── index.ts          # Express server entry point
│   ├── db/
│   │   ├── schema.ts     # Database setup
│   │   └── queries.ts    # Database operations
│   ├── api/
│   │   ├── kids.ts       # Kids endpoints
│   │   ├── chores.ts     # Chores endpoints
│   │   └── screen-time.ts # Screen time endpoints
│   └── public/
│       ├── index.html    # Parent dashboard
│       ├── kid.html      # Kid view
│       ├── styles.css
│       └── app.js
├── docs/plans/
└── package.json, tsconfig.json, etc.
```
