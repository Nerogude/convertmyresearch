# 🌟 Happy Habits - Family Task Tracker

A kid-friendly web application that helps parents motivate their children (ages 7-16) by tracking chores and study tasks. Children earn points/coins when tasks are completed and approved by parents.

## ✨ Features

### For Parents:
- **Account Management**: Simple email/password registration and login
- **Child Profiles**: Create and manage multiple children profiles with ages and balances
- **Task Creation**: Create tasks with:
  - Title (e.g., "Clean your room", "Do math homework")
  - Type (Chore or Study)
  - Points/coins value
  - Assign to specific child
  - Frequency (one-time, daily, or weekly)
- **Approval System**: Review completed tasks and approve/reject them
- **Balance Tracking**: Monitor each child's coin balance
- **Overview Dashboard**: See all children's progress at a glance

### For Children:
- **Simple Login**: Select their name from a visual grid
- **Today's Tasks**: View all assigned tasks for the day
- **Task Completion**: Mark tasks as done with optional photo proof
- **Progress Tracking**: See their coin balance and streak counter
- **Kid-Friendly Interface**: Colorful, engaging design with emojis and animations

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Application**:
   ```bash
   npm start
   ```

3. **Open Your Browser**:
   Navigate to `http://localhost:3000`

## 📱 How to Use

### Getting Started (Parents):

1. **Create Account**: 
   - Visit the app and click "Create Account"
   - Enter your name, email, and password
   - You'll be automatically logged in

2. **Add Your Children**:
   - Go to "My Children" tab
   - Click "Add Child"
   - Enter their name and age

3. **Create Tasks**:
   - Go to "Tasks" tab
   - Click "Create Task"
   - Fill in task details (title, type, points, frequency)
   - Assign to a child

4. **Review Completions**:
   - Go to "Approvals" tab
   - See tasks completed by children
   - Approve ✅ or reject ❌ based on quality

### For Children:

1. **Login**:
   - Click "Child Login" on the main page
   - Select your name from the colorful grid
   - Click "Let's Go! 🚀"

2. **Complete Tasks**:
   - See your tasks for today
   - Click "Mark Done!" when finished
   - Optionally add a photo as proof
   - Wait for parent approval

3. **Track Progress**:
   - Watch your coins grow! 🪙
   - Build your streak by completing all daily tasks

## 🛠️ Technical Details

### Built With:
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Frontend**: HTML, CSS, JavaScript
- **Authentication**: bcrypt for password hashing, express-session for sessions
- **File Upload**: Multer for photo uploads

### Project Structure:
```
happy-habits/
├── server.js              # Main server file
├── database.js           # Database setup and queries
├── package.json          # Dependencies and scripts
├── public/               # Static files
│   ├── css/
│   │   └── style.css     # All styling
│   ├── js/
│   │   ├── parent-dashboard.js
│   │   └── child-dashboard.js
│   ├── uploads/          # Photo uploads
│   ├── login.html        # Parent login
│   ├── register.html     # Parent registration
│   ├── child-login.html  # Child login
│   ├── parent-dashboard.html
│   └── child-dashboard.html
└── happy_habits.db       # SQLite database (created automatically)
```

### Database Schema:
- **users**: Parent accounts (id, email, password, name)
- **children**: Child profiles (id, parent_id, name, age, balance, streak_count)
- **tasks**: Task definitions (id, parent_id, child_id, title, type, points_value, frequency)
- **completions**: Task completions (id, task_id, child_id, status, photo_path, completion_date)

## 🎯 Key Workflows

### Task Creation → Completion → Approval:
1. Parent creates task assigned to child
2. Child sees task in their dashboard
3. Child marks task as done (with optional photo)
4. Parent reviews in approval dashboard
5. Parent approves → coins added to child's balance
6. Parent rejects → no coins, child can try again

### Streak Counting:
- Children build streaks by completing ALL assigned tasks for consecutive days
- Streak resets if they miss any task on a day
- Visible in child dashboard for motivation

## 🔐 Security Features
- Password hashing with bcrypt
- Session-based authentication
- SQL injection prevention with parameterized queries
- File upload restrictions for images only

## 🎨 Design Philosophy
- **Kid-Friendly**: Bright colors, large buttons, emojis, and encouraging messages
- **Parent-Focused**: Clean, organized dashboard for easy management
- **Mobile-Responsive**: Works on phones, tablets, and computers
- **Accessibility**: Clear labels, good contrast, keyboard navigation

## 🚀 Future Enhancements
- Reward redemption system
- Push notifications for task reminders
- Weekly/monthly reports
- Achievement badges
- Multi-family support
- Mobile app versions

## 💡 Usage Tips
- Start with simple, achievable tasks
- Use appropriate point values (1-10 for small tasks, 10-50 for bigger ones)
- Take advantage of photo proof for accountability
- Celebrate streaks and achievements
- Regular family check-ins about progress

## 🤝 Support
If you encounter any issues or have questions:
1. Check the browser console for error messages
2. Restart the server: `Ctrl+C` then `npm start`
3. Make sure port 3000 is available

---

**Happy Habit Building! 🌟**

Made with ❤️ for families who want to build positive habits together.