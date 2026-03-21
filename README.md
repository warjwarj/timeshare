# Timeshare

A web application for managing shared time, events, and availability across organisations.

## Stack

- **Backend** — FastAPI (Python)
- **Frontend** — React (TypeScript)
- **Database** — PostgreSQL

## Getting Started

### Prerequisites

- Docker
- Python 3.x
- Node.js

### Database

Start the PostgreSQL database with Docker:

```bash
docker-compose up -d
```

The database runs on port `5324` with:
- User: `admin`
- Password: `admin`
- Database: `timeshare`

### Backend

```bash
cd backend
./venv/scripts/activate
pip install -r requirements.txt
python main.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```
