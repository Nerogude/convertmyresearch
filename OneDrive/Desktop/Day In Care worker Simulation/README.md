# A Day in Care - Training Simulation

An interactive, scenario-based training platform for care workers that uses branching narratives and real-time decision-making to develop critical thinking, empathy, and professional judgment.

## 🎯 Features

- **Scenario-Based Learning**: Realistic care scenarios with branching narratives
- **Real-Time Feedback**: Immediate, nuanced feedback on decisions
- **Grey Decision-Making**: Multiple valid approaches acknowledged
- **Game Mechanics**:
  - Client Status meter
  - Wellbeing (stress) meter
  - Care Plan access
  - End of Shift Reports
- **Multi-Role Support**: Learner, Manager, and Admin accounts
- **Organization Management**: Track team progress and performance
- **Two Complete Scenarios**:
  1. The Sundowning Wanderer (Dementia Care & Empathy)
  2. The Fall in the Bathroom (First Aid & Clinical Safety)

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- PostgreSQL
- JWT Authentication
- RESTful API

### Frontend
- React
- Tailwind CSS
- React Router
- Axios

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Nerogude/day-in-care-worker-simulation.git
cd day-in-care-worker-simulation
```

### 2. Set up the backend

```bash
# Install backend dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/dayincare
# JWT_SECRET=your_secret_key_here
# PORT=5000
# NODE_ENV=development
```

### 3. Set up the frontend

```bash
# Navigate to client directory
cd client

# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env if needed (default: http://localhost:5000/api)
```

### 4. Set up the database

```bash
# Create PostgreSQL database
createdb dayincare

# The schema will be initialized automatically when you start the server
```

### 5. Seed scenario content (IMPORTANT)

```bash
# From the root directory
node server/database/seed-scenarios.js
```

## 🎮 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

The application will open at `http://localhost:3000`

## 👥 User Accounts

### Demo Organization
- **Organization Code**: DEMO2024

### Creating Your First Admin Account

1. Go to `http://localhost:3000/register`
2. Fill in organization details
3. This creates an admin account for your organization

### User Roles

- **Learner**: Can access training scenarios
- **Manager**: Can view team performance + all learner features
- **Admin**: Full access including organization management

## 📊 Database Schema

The application uses the following main tables:
- `organizations` - Organization accounts
- `users` - All user accounts with role-based access
- `scenarios` - Training scenarios
- `scenario_nodes` - Branching narrative nodes
- `scenario_choices` - Decision choices with feedback
- `care_plans` - Client care plans for each scenario
- `user_progress` - User progression through scenarios
- `user_decisions` - Decision tracking for analytics

## 🚢 Deployment

### Deploy to Render

1. Push your code to GitHub
2. Connect your repository to Render
3. Render will automatically detect the `render.yaml` configuration
4. Set environment variables in Render dashboard:
   - `JWT_SECRET` (auto-generated)
   - `DATABASE_URL` (auto-populated)
   - `NODE_ENV=production`

### Manual Deployment

1. Set up PostgreSQL database
2. Set environment variables
3. Build frontend: `cd client && npm run build`
4. Start server: `npm start`

## 📁 Project Structure

```
day-in-care-worker-simulation/
├── server/
│   ├── database/
│   │   ├── db.js              # Database connection
│   │   ├── init.js            # Schema initialization
│   │   ├── schema.sql         # Database schema
│   │   └── seed-scenarios.js  # Scenario content seeding
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── scenarios.js       # Scenario routes
│   │   └── analytics.js       # Analytics routes
│   └── server.js              # Express server
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js         # API client
│   │   ├── components/
│   │   │   ├── auth/          # Login, Register
│   │   │   ├── dashboard/     # Dashboard, Team Performance
│   │   │   └── game/          # Game components
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── GameContext.js
│   │   └── App.js
│   └── package.json
├── package.json
├── .env.example
└── README.md
```

## 🎓 Using the Application

### As a Learner

1. Log in with your credentials
2. Navigate to "Start Training" from the dashboard
3. Select a scenario from the Shift Schedule
4. Read the Care Plan before making decisions
5. Make choices based on best practice
6. Review your End of Shift Report

### As a Manager/Admin

1. Log in with manager/admin credentials
2. View "Team Performance" to monitor learners
3. Click "View Details" on any learner for scenario-by-scenario breakdown
4. Create new user accounts from the dashboard

## 🔧 Customization

### Adding New Scenarios

1. Add scenario to database:
   ```sql
   INSERT INTO scenarios (title, description, difficulty, module, estimated_time)
   VALUES (...);
   ```

2. Create scenario nodes and choices (see `seed-scenarios.js` for examples)
3. Add care plan for the scenario

### Modifying Existing Scenarios

Edit `server/database/seed-scenarios.js` and re-run the seed script.

## 🐛 Troubleshooting

### Database connection failed
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Ensure database exists

### Frontend not loading
- Check backend is running on port 5000
- Verify REACT_APP_API_URL in `client/.env`
- Clear browser cache

### Scenarios not appearing
- Run the seed script: `node server/database/seed-scenarios.js`
- Check database has data: `SELECT * FROM scenarios;`

## 📝 License

MIT

## 🤝 Contributing

This is a training platform designed for care organizations. Contributions welcome!

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for care professionals**
