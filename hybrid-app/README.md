# 🌞💨 Hybrid Wind-Solar 1.2kW Charging Station
## Full-Stack Web Application — Setup Guide

**Stack:** Python Flask + MongoDB + Vanilla JS + Tailwind CSS

---

## 📁 Project Structure

```
hybrid-app/
├── run.py               ← Entry point  →  python run.py
├── app.py               ← Flask app factory
├── config.py            ← App configuration
├── extensions.py        ← Flask extensions (mongo, jwt, bcrypt)
├── requirements.txt     ← Python dependencies
├── .env.example         ← Copy to .env and fill in
│
├── routes/
│   ├── auth.py          ← POST /api/auth/register  login  me
│   ├── videos.py        ← GET/POST/DELETE /api/videos/
│   └── contact.py       ← GET/POST /api/contact/
│
├── templates/
│   └── index.html       ← Main frontend page
│
├── static/
│   ├── css/styles.css   ← All custom styles
│   └── js/
│       ├── config.js    ← Project info & AI context
│       ├── api.js       ← All API calls (single source of truth)
│       ├── auth.js      ← Login / Register modal & session
│       ├── chatbot.js   ← Gemini AI assistant
│       ├── videos.js    ← Video gallery & upload
│       ├── contact.js   ← Contact form
│       └── main.js      ← Dark mode, toasts, page init
│
└── uploads/             ← Uploaded video files (auto-created)
```

---

## ⚙️ Installation & Setup

### Step 1 — Install MongoDB
Download and install MongoDB Community Server:
👉 https://www.mongodb.com/try/download/community

Start MongoDB:
```bash
# Windows (as a service, usually auto-starts)
# Mac/Linux:
mongod --dbpath /data/db
```

### Step 2 — Set up Python environment
```bash
cd hybrid-app

# Create virtual environment (recommended)
python -m venv venv

# Activate it:
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3 — Configure environment
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your values:
#   SECRET_KEY    → any random string
#   MONGO_URI     → your MongoDB connection string
#   JWT_SECRET_KEY → any random string
#   ADMIN_CODE    → secret code for admin registration
```

### Step 4 — Run the app
```bash
python run.py
```

Open your browser: **http://localhost:5000** 🎉

---

## 🔐 Authentication

### Register as Admin
1. Click **Login** in the top nav
2. Switch to **Register** tab
3. Fill in your name, email, password
4. Enter the **Admin Code** (default: `ADMIN2026`) in the admin code field
5. Submit — you now have admin access!

### Change the Admin Code
Edit `.env`:
```
ADMIN_CODE=YOUR_SECRET_CODE_HERE
```

### Regular Users
Register **without** entering an admin code — they can view everything but cannot upload or delete videos.

---

## 🗄️ API Endpoints

### Auth
| Method | Endpoint              | Auth     | Description          |
|--------|-----------------------|----------|----------------------|
| POST   | /api/auth/register    | Public   | Create account       |
| POST   | /api/auth/login       | Public   | Login, returns JWT   |
| GET    | /api/auth/me          | JWT      | Get current user     |

### Videos
| Method | Endpoint                    | Auth     | Description            |
|--------|-----------------------------|----------|------------------------|
| GET    | /api/videos/                | Public   | Get all videos         |
| GET    | /api/videos/?category=X     | Public   | Filter by category     |
| POST   | /api/videos/                | Admin    | Upload video (FormData)|
| DELETE | /api/videos/<id>            | Admin    | Delete video           |
| PATCH  | /api/videos/<id>/view       | Public   | Increment view count   |

### Contact
| Method | Endpoint              | Auth     | Description              |
|--------|-----------------------|----------|--------------------------|
| POST   | /api/contact/         | Public   | Send a message           |
| GET    | /api/contact/         | Admin    | View all messages        |
| PATCH  | /api/contact/<id>/read| Admin    | Mark message as read     |

---

## 🤖 AI Assistant Setup

1. Get a FREE Gemini API key: https://aistudio.google.com/app/apikey
2. Click the 🤖 button (bottom right of the page)
3. Paste your key → click **Save**

Or set it permanently in `.env`:
```
GEMINI_API_KEY=AIzaSy...
```

---

## ☁️ Deploy to the Internet (Free Options)

### Option A — Railway (Easiest)
1. Push your project to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Add MongoDB plugin (free tier)
4. Set environment variables in Railway dashboard
5. Done! 🚀

### Option B — Render
1. Push to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo, set `python run.py` as start command
4. Add environment variables
5. Use MongoDB Atlas (free) for the database

### MongoDB Atlas (Free Cloud Database)
1. Sign up at https://cloud.mongodb.com
2. Create a free M0 cluster
3. Get connection string → update `MONGO_URI` in your `.env`

---

*Baliuag University — Hybrid Wind-Solar Capstone Project 2026*
*Team: Marden | Rhey Victor Guillermo | Victor Guillermo*
*Adviser: Ma'am Jennifer Del Amen*
