# Weight Loss Management Table

A personal web app for tracking weekly weight, setting goals, and viewing progress over time.

## Features

- **User accounts** — sign up and log in with session-based auth
- **Weekly entries** — log date, weight, and an optional comment
- **Progress stats** — weeks tracked, average loss, total lost, remaining to goal, and goal %
- **Goals** — set a target weight and see how close you are
- **Search** — find entries by date or weight
- **Dark mode** — toggle light/dark theme
- **Celebration** — fireworks + song when you lose weight since the last entry

## Tech stack

- **Frontend:** HTML, CSS, vanilla JavaScript
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (via Knex)
- **Auth:** express-session

## Prerequisites

- Node.js
- PostgreSQL

## Setup

1. **Clone and install**

```bash
git clone <repo-url>
cd diet
npm install
```

2. **Create a `.env` file** in the project root:

```env
PORT=3000
SESSION_SECRET=your-secret-here
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
```

3. **Database tables**

The app expects these tables (adjust types to match your schema if needed):

- `users` — `id`, `first_name`, `middle_name`, `last_name`, `user_name`, `password`
- `form_entry` — `id`, `date`, `weight`, `comment`, `user_id`
- `goal_table` — `user_id`, `goal`

4. **Run the server**

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

Open `http://localhost:3000` (or whatever `PORT` you set).

## Project structure

```
diet/
├── server.js                 # Express app entry
├── routes/
│   ├── auto.js               # Auth (log in / sign up / log out)
│   ├── table.js              # Weight entries CRUD + search
│   └── goal.js               # Goal get / update
├── services/
│   ├── db.js                 # Knex / Postgres connection
│   ├── auto.js
│   ├── table.js
│   └── goal.js
└── project-files/            # Static frontend
    ├── index.html            # Login / sign up
    ├── table.html            # Main tracker
    ├── table.js
    ├── log-in.js
    └── css/                  # Styles (light + dark)
```

## Scripts

| Command     | Description              |
|-------------|--------------------------|
| `npm start` | Start the server         |
| `npm run dev` | Start with nodemon     |
