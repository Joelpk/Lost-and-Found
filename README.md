# Converted Lost & Found (Express + EJS scaffold)

This is a simplified conversion of the original repo into a stack you're familiar with:
- Node/Express (server.js)
- EJS for views (views/)
- Static CSS (public/styles.css)
- Postgres connection scaffold (db.js using `pg`)

## How to run

1. Install dependencies:
```bash
cd converted_lost_and_found
npm install
```

2. Set your database connection string in `.env`:
```
DATABASE_URL=postgres://user:password@host:port/dbname
```
If you don't have Postgres yet, you can run locally or edit `db.js` to use an in-memory array for quick testing.

3. Start the app:
```bash
npm run dev
# or
npm start
```

Open http://localhost:3000

## What I converted
- Frontend React + Vite -> a simple server-rendered EJS UI (views/index.ejs)
- Backend controllers replaced with a minimal API (GET /api/items, POST /api/items)
- DB: replaced Mongoose/MongoDB with Postgres scaffold (db.js). You'll need to run migrations or let the app create the `items` table on start.

If you want, I can now:
- Convert more of the original backend logic (auth, file uploads, images) into this scaffold.
- Replace Postgres with an in-memory store for immediate testing.
- Wire file upload (images) using multer and S3 / Cloud storage.
