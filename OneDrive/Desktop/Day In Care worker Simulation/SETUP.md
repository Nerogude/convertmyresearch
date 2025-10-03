# Quick Setup Guide

## Prerequisites Checklist

Before you begin, make sure you have:
- ✅ Node.js installed (v14+) - Download from [nodejs.org](https://nodejs.org)
- ✅ PostgreSQL installed (v12+) - Download from [postgresql.org](https://www.postgresql.org/download/)
- ✅ Git installed
- ✅ A code editor (VS Code recommended)

## Step-by-Step Setup (First Time)

### 1. Database Setup

**Option A: Using psql command line**
```bash
# Create database
createdb dayincare

# Or if createdb isn't in your PATH:
psql -U postgres
CREATE DATABASE dayincare;
\q
```

**Option B: Using pgAdmin**
1. Open pgAdmin
2. Right-click "Databases" → Create → Database
3. Name it "dayincare"

### 2. Update Database Connection

Edit `.env` file in the root directory and update with YOUR PostgreSQL credentials:

```env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/dayincare
```

Common usernames:
- Windows: `postgres`
- Mac/Linux: Your system username or `postgres`

### 3. Install Dependencies

```bash
# Backend dependencies (from root folder)
npm install

# Frontend dependencies
cd client
npm install
cd ..
```

### 4. Seed the Scenario Data (CRITICAL!)

This populates the database with the two complete scenarios:

```bash
# Make sure PostgreSQL is running first!
node server/database/seed-scenarios.js
```

You should see:
```
✓ Database schema initialized successfully
✓ Demo organization created
✓ Scenarios seeded
✓ Scenario content seeded successfully
```

### 5. Start the Application

**Option A: Two separate terminals (recommended for development)**

Terminal 1 - Backend:
```bash
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm start
```

**Option B: Production build**
```bash
npm run build
npm start
```

### 6. Access the Application

Open your browser to: `http://localhost:3000`

## First Login

### Creating Your Organization

1. Click "Register here" on the login page
2. Fill in:
   - Organization Name: Your care home/organization name
   - Organization Code: A unique code (e.g., "SUNRISE2024")
   - Your name and email
   - Password (min 6 characters)
3. Click "Create Organization Account"

This creates an **admin** account with full access.

### Demo Account (if using seeded data)

If you want to test with a demo account:
- Organization Code: `DEMO2024`
- You'll need to create a user account first (see next section)

## Creating Additional Users

### As Admin/Manager:

1. Log in
2. Go to Dashboard
3. Click "Add User"
4. Select role:
   - **Learner**: Can access training scenarios
   - **Manager**: Can view team performance + learner access
5. Fill in user details
6. User can now log in with that email/password

## Testing the Scenarios

### As a Learner:

1. Dashboard → "Start Training"
2. Click "Start Visit" on any scenario
3. **Click "View Care Plan"** before making decisions (important!)
4. Read the scenario carefully
5. Make your choice
6. Read the feedback (appears for 3 seconds)
7. Continue through the scenario
8. Review your End of Shift Report

### Available Scenarios:

1. **The Sundowning Wanderer**
   - Tests dementia care, validation, and de-escalation
   - Multiple paths: best practice, valid alternatives, and learning opportunities
   - ~15 minutes

2. **The Fall in the Bathroom**
   - Tests first aid, DRSABCD protocol, and professional judgment
   - Emphasizes "assess before acting"
   - ~12 minutes

## Troubleshooting

### "Database connection failed"
1. Is PostgreSQL running?
   - Windows: Check Services for "postgresql"
   - Mac: `brew services list`
   - Linux: `sudo systemctl status postgresql`
2. Check your DATABASE_URL in `.env`
3. Try connecting with psql: `psql -U postgres -d dayincare`

### "No scenarios found"
You forgot to seed! Run:
```bash
node server/database/seed-scenarios.js
```

### Port already in use
```bash
# Backend (port 5000)
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill

# Frontend (port 3000)
# Just choose Y when prompted to use a different port
```

### React app won't connect to API
1. Check backend is running on http://localhost:5000
2. Check `client/.env` has:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```
3. Restart the React dev server after changing .env

### Tailwind styles not working
```bash
cd client
npm install tailwindcss postcss autoprefixer
```

## Database Commands (Useful)

### View data
```sql
# Connect to database
psql -U postgres -d dayincare

# Check scenarios
SELECT id, title FROM scenarios;

# Check users
SELECT email, role FROM users;

# Check if scenarios have content
SELECT COUNT(*) FROM scenario_nodes;
SELECT COUNT(*) FROM scenario_choices;

# Exit
\q
```

### Reset everything
```bash
# WARNING: This deletes all data!
psql -U postgres -d dayincare
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
\q

# Then re-seed:
npm start  # This will recreate schema
# Stop server (Ctrl+C)
node server/database/seed-scenarios.js
```

## Next Steps

1. ✅ Complete both scenarios yourself to understand the flow
2. ✅ Create a manager account to test the analytics
3. ✅ Create a learner account to test the full learner experience
4. ✅ Review the team performance dashboard
5. 🚀 Deploy to production (see README.md)

## Production Deployment

See `README.md` for:
- Deploying to Render
- Setting up production PostgreSQL
- Environment variable configuration
- Building for production

## Need Help?

1. Check `README.md` for detailed documentation
2. Review the code comments in the files
3. Check the browser console for error messages
4. Check the server logs in the terminal
5. Open an issue on GitHub

---

**Quick Reference:**

- Backend URL: `http://localhost:5000`
- Frontend URL: `http://localhost:3000`
- Database: `postgresql://localhost:5432/dayincare`
- Demo Org Code: `DEMO2024`

**File Locations:**
- Backend: `server/server.js`
- Database: `server/database/`
- Frontend: `client/src/`
- Scenarios: `server/database/seed-scenarios.js`
