# TaskBranch — Local Run & Test

This small app serves a task/branch dashboard with a lightweight SQLite backend.

Prerequisites
- Node.js 16+ (or compatible LTS)
- npm

Install

```bash
npm install
```

Start the server (from the project root)

```bash
npm start
# or
node server.js
```

Open the UI

- Visit: http://localhost:3000

API endpoints

- `GET /tasks` — list all tasks (JSON)
- `POST /tasks` — create a task (JSON body: `{ taskName, branchName, description, status }`)
- `DELETE /tasks/:id` — delete a task by id
- `PUT /tasks/:id` — update a task by id (JSON body: `{ taskName, branchName, description, status }`)
- `GET /clear-db` — clear all tasks (convenience endpoint)

Quick curl examples

Create a task:

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"taskName":"Example","branchName":"main","description":"demo","status":"Pending"}'
```

List tasks:

```bash
curl http://localhost:3000/tasks
```

Delete a task:

```bash
curl -X DELETE http://localhost:3000/tasks/1
```

Notes & next steps
- The UI was refreshed with a modern look (`public/style.css`, `public/index.html`) and small UX improvements (`public/script.js`).
- Edit, undo-delete, and toast notifications have been added to the UI. Use the **Edit** button on a task card to update it inline. Deleting a task shows an Undo toast for a short time.
