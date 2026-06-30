# InterviewIQ

AI-powered technical interview preparation platform. Upload a resume and job description to get personalized interview questions, model answers, and feedback tailored to your target role.

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React, TypeScript, Vite, Tailwind   |
| Backend  | FastAPI, SQLAlchemy, Alembic        |
| Database | PostgreSQL                          |
| Auth     | JWT                                 |
| AI       | OpenAI API (planned)                |

## Prerequisites

Install these before running the project locally:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)
- [Python 3.11+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)

## Project Structure

```
InterviewIQ/
├── backend/          # FastAPI API
├── frontend/         # React app
├── docker-compose.yml
├── .env.example      # Root env template (database)
└── README.md
```

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/shivaak67/InterviewIQ.git
cd InterviewIQ
```

### 2. Environment variables

**Root** (database + backend):

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

**Frontend** (API URL):

```bash
copy frontend\.env.example frontend\.env
```

On macOS/Linux:

```bash
cp frontend/.env.example frontend/.env
```

### 3. Start PostgreSQL

From the project root:

```bash
docker compose up -d
```

Verify the database is running:

```bash
docker compose ps
```

The `postgres` container should show as running or healthy.

### 4. Start the backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

**Windows (PowerShell):**

```powershell
.venv\Scripts\activate
```

**macOS/Linux:**

```bash
source .venv/bin/activate
```

Install dependencies and run migrations:

```bash
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

The API will be available at:

- http://localhost:8000/health
- http://localhost:8000/docs (interactive API docs)

### 5. Start the frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

The home page should display **API status: ok** when the backend is running.

## Daily Dev Workflow

Run these in separate terminals:

```text
Terminal 1:  docker compose up -d          (project root)
Terminal 2:  uvicorn app.main:app --reload   (backend/, venv active)
Terminal 3:  npm run dev                   (frontend/)
```

## Useful Commands

| Task                    | Command                              |
| ----------------------- | ------------------------------------ |
| Stop database           | `docker compose down`                |
| View database logs      | `docker compose logs postgres`       |
| Create a new migration  | `alembic revision -m "description"`  |
| Apply migrations        | `alembic upgrade head`               |
| Build frontend          | `npm run build` (in `frontend/`)     |

## Environment Variables

### Root `.env`

| Variable            | Description                          |
| ------------------- | ------------------------------------ |
| `POSTGRES_USER`     | PostgreSQL username                  |
| `POSTGRES_PASSWORD` | PostgreSQL password                  |
| `POSTGRES_DB`       | Database name                        |
| `DATABASE_URL`      | SQLAlchemy connection string         |
| `JWT_SECRET_KEY`    | Secret key for signing JWT tokens    |
| `JWT_ALGORITHM`     | JWT algorithm (default: `HS256`)     |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime in minutes  |

### Frontend `.env`

| Variable         | Description              |
| ---------------- | ------------------------ |
| `VITE_API_URL`   | Backend URL (e.g. `http://localhost:8000`) |

## Auth Endpoints

| Method | Endpoint          | Description                    |
| ------ | ----------------- | ------------------------------ |
| POST   | `/auth/register`  | Create a new user account      |
| POST   | `/auth/login`     | Login and receive a JWT token  |
| GET    | `/auth/me`        | Get current user (requires JWT)|

## Troubleshooting

**API status shows "unreachable" on the home page**

- Confirm the backend is running (`uvicorn app.main:app --reload`)
- Confirm `frontend/.env` has `VITE_API_URL=http://localhost:8000`
- Restart the frontend after changing `.env` (`npm run dev`)
- If Vite uses a different port (e.g. 5175), the backend CORS config allows all localhost ports in dev

**`alembic upgrade head` fails**

- Ensure Docker Postgres is running: `docker compose ps`
- Check `DATABASE_URL` in the root `.env`

**Port already in use**

- Stop other dev servers or change the port (e.g. `uvicorn app.main:app --reload --port 8001`)

## License

TBD
