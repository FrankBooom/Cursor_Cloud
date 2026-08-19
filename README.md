# Cursor_Cloud

A small full-stack **Task Board** used to demonstrate a working Cursor Cloud Agent
development environment end to end.

## Stack

- **Backend:** Node.js + [Express](https://expressjs.com/) REST API (in-memory store)
- **Frontend:** static HTML/CSS/vanilla JS served by Express
- **Tests:** Node's built-in test runner (`node --test`) + [supertest](https://github.com/ladjs/supertest)
- **Lint:** [ESLint](https://eslint.org/) flat config

## Getting started

```bash
npm ci        # install dependencies
npm run dev   # start with auto-reload on http://localhost:3000
npm start     # start without watch
```

Open http://localhost:3000 and add, complete, or delete tasks.

## Commands

| Command        | Description                                  |
| -------------- | -------------------------------------------- |
| `npm run dev`  | Start the server with auto-reload.           |
| `npm start`    | Start the server.                            |
| `npm test`     | Run the API test suite.                      |
| `npm run lint` | Lint the codebase with ESLint.               |

## API

| Method   | Path              | Description            |
| -------- | ----------------- | ---------------------- |
| `GET`    | `/api/health`     | Health check.          |
| `GET`    | `/api/tasks`      | List all tasks.        |
| `POST`   | `/api/tasks`      | Create a task.         |
| `PATCH`  | `/api/tasks/:id`  | Update / toggle a task.|
| `DELETE` | `/api/tasks/:id`  | Delete a task.         |

## Cloud Agent environment

The environment is defined in [`.cursor/environment.json`](.cursor/environment.json):
it installs dependencies with `npm ci`, exposes port `3000`, and runs the dev server
in a persistent `dev-server` terminal.
