const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

class Database {
    constructor() {
        this.db = new sqlite3.Database('happy_habits.db');
        this.init();
    }

    init() {
        this.db.serialize(() => {
            // Users table (parents)
            this.db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    name TEXT NOT NULL,
                    family_photo TEXT DEFAULT 'default-family.jpg',
                    tagline TEXT DEFAULT 'Building great habits together! 🌟',
                    subscription_status TEXT DEFAULT 'free',
                    subscription_end_date TEXT,
                    trial_end_date TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // Add subscription columns to existing users
            this.db.run(`ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free'`, () => {});
            this.db.run(`ALTER TABLE users ADD COLUMN subscription_end_date TEXT`, () => {});
            this.db.run(`ALTER TABLE users ADD COLUMN trial_end_date TEXT`, () => {});

            // Children table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS children (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    parent_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    age INTEGER NOT NULL,
                    avatar TEXT DEFAULT 'default.png',
                    balance INTEGER DEFAULT 0,
                    streak_count INTEGER DEFAULT 0,
                    last_completion_date DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (parent_id) REFERENCES users (id)
                )
            `);

            // Tasks table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    parent_id INTEGER NOT NULL,
                    child_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    type TEXT CHECK(type IN ('Chore', 'Study')) NOT NULL,
                    points_value INTEGER NOT NULL,
                    frequency TEXT CHECK(frequency IN ('one-time', 'daily', 'weekly')) NOT NULL,
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (parent_id) REFERENCES users (id),
                    FOREIGN KEY (child_id) REFERENCES children (id)
                )
            `);

            // Task completions table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS completions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id INTEGER NOT NULL,
                    child_id INTEGER NOT NULL,
                    status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
                    photo_path TEXT,
                    comment TEXT,
                    completion_date DATE DEFAULT (date('now')),
                    reviewed_at DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (task_id) REFERENCES tasks (id),
                    FOREIGN KEY (child_id) REFERENCES children (id)
                )
            `);

            // Reward categories table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS reward_categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    icon TEXT DEFAULT '🎁',
                    color TEXT DEFAULT '#6c5ce7',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Rewards table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS rewards (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    parent_id INTEGER NOT NULL,
                    category_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    description TEXT,
                    cost INTEGER NOT NULL,
                    type TEXT CHECK(type IN ('instant', 'approval', 'scheduled')) DEFAULT 'approval',
                    stock_quantity INTEGER DEFAULT -1,
                    stock_remaining INTEGER DEFAULT -1,
                    is_active BOOLEAN DEFAULT 1,
                    icon TEXT DEFAULT '🎁',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (parent_id) REFERENCES users (id),
                    FOREIGN KEY (category_id) REFERENCES reward_categories (id)
                )
            `);

            // Purchases table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS purchases (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    child_id INTEGER NOT NULL,
                    reward_id INTEGER NOT NULL,
                    cost_paid INTEGER NOT NULL,
                    status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'completed')) DEFAULT 'pending',
                    notes TEXT,
                    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    approved_at DATETIME,
                    completed_at DATETIME,
                    FOREIGN KEY (child_id) REFERENCES children (id),
                    FOREIGN KEY (reward_id) REFERENCES rewards (id)
                )
            `);
            
            // Create bills table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS bills (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    parent_id INTEGER NOT NULL,
                    child_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    description TEXT,
                    amount INTEGER NOT NULL,
                    frequency TEXT DEFAULT 'monthly',
                    icon TEXT DEFAULT '🏠',
                    is_active BOOLEAN DEFAULT 1,
                    next_due_date DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (parent_id) REFERENCES users (id),
                    FOREIGN KEY (child_id) REFERENCES children (id)
                )
            `, (err) => {
                if (err) {
                    console.error('Error creating bills table:', err);
                } else {
                    console.log('Bills table created or already exists');
                }
            });

            // Wishlists table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS wishlists (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    child_id INTEGER NOT NULL,
                    reward_id INTEGER NOT NULL,
                    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (child_id) REFERENCES children (id),
                    FOREIGN KEY (reward_id) REFERENCES rewards (id),
                    UNIQUE(child_id, reward_id)
                )
            `);

            // Create bill_payments table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS bill_payments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    bill_id INTEGER NOT NULL,
                    child_id INTEGER NOT NULL,
                    amount INTEGER NOT NULL,
                    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    status TEXT DEFAULT 'paid',
                    notes TEXT,
                    FOREIGN KEY (bill_id) REFERENCES bills (id),
                    FOREIGN KEY (child_id) REFERENCES children (id)
                )
            `);
            
            // Run migrations to add missing columns
            this.runMigrations();
        });
    }
    
    runMigrations() {
        // Check if comment column exists in completions table
        this.db.all("PRAGMA table_info(completions)", (err, columns) => {
            if (err) {
                console.error('Error getting completions column info:', err);
                return;
            }
            
            const hasCommentColumn = columns.some(col => col.name === 'comment');
            
            if (!hasCommentColumn) {
                console.log('Adding comment column to completions table...');
                this.db.run('ALTER TABLE completions ADD COLUMN comment TEXT', (err) => {
                    if (err) {
                        console.error('Error adding comment column:', err);
                    } else {
                        console.log('Comment column added successfully!');
                    }
                });
            } else {
                console.log('Comment column already exists.');
            }
        });
        
        // Check if archived column exists in tasks table
        this.db.all("PRAGMA table_info(tasks)", (err, columns) => {
            if (err) {
                console.error('Error getting tasks column info:', err);
                return;
            }
            
            const hasArchivedColumn = columns.some(col => col.name === 'archived');
            const hasWeeklyDaysColumn = columns.some(col => col.name === 'weekly_days');
            
            if (!hasArchivedColumn) {
                console.log('Adding archived column to tasks table...');
                this.db.run('ALTER TABLE tasks ADD COLUMN archived BOOLEAN DEFAULT 0', (err) => {
                    if (err) {
                        console.error('Error adding archived column:', err);
                    } else {
                        console.log('Archived column added successfully!');
                    }
                });
            } else {
                console.log('Archived column already exists.');
            }
            
            if (!hasWeeklyDaysColumn) {
                console.log('Adding weekly_days column to tasks table...');
                this.db.run('ALTER TABLE tasks ADD COLUMN weekly_days TEXT', (err) => {
                    if (err) {
                        console.error('Error adding weekly_days column:', err);
                    } else {
                        console.log('Weekly_days column added successfully!');
                    }
                });
            } else {
                console.log('Weekly_days column already exists.');
            }
        });
        
        // Add default reward categories if they don't exist
        this.addDefaultRewardCategories();
    }
    
    addDefaultRewardCategories() {
        const defaultCategories = [
            { name: 'Screen Time', icon: '📱', color: '#74b9ff' },
            { name: 'Treats & Food', icon: '🍭', color: '#fd79a8' },
            { name: 'Activities & Outings', icon: '🎡', color: '#00b894' },
            { name: 'Privileges', icon: '⭐', color: '#fdcb6e' },
            { name: 'Toys & Items', icon: '🧨', color: '#e17055' },
            { name: 'Special Events', icon: '🎉', color: '#a29bfe' }
        ];
        
        this.db.get('SELECT COUNT(*) as count FROM reward_categories', (err, result) => {
            if (err) {
                console.error('Error checking reward categories:', err);
                return;
            }
            
            if (result.count === 0) {
                console.log('Adding default reward categories...');
                defaultCategories.forEach(category => {
                    this.db.run(
                        'INSERT INTO reward_categories (name, icon, color) VALUES (?, ?, ?)',
                        [category.name, category.icon, category.color],
                        (err) => {
                            if (err) {
                                console.error('Error adding category:', category.name, err);
                            }
                        }
                    );
                });
                console.log('Default reward categories added!');
            }
        });
    }

    // User methods
    createUser(email, password, name, callback) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        this.db.run(
            'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
            [email, hashedPassword, name],
            callback
        );
    }

    getUserByEmail(email, callback) {
        this.db.get(
            'SELECT * FROM users WHERE email = ?',
            [email],
            callback
        );
    }

    updateUserFamilyPhoto(userId, photoPath, callback) {
        this.db.run(
            'UPDATE users SET family_photo = ? WHERE id = ?',
            [photoPath, userId],
            callback
        );
    }

    updateUserTagline(userId, tagline, callback) {
        this.db.run(
            'UPDATE users SET tagline = ? WHERE id = ?',
            [tagline, userId],
            callback
        );
    }

    getUserById(userId, callback) {
        this.db.get(
            'SELECT * FROM users WHERE id = ?',
            [userId],
            callback
        );
    }

    // Subscription methods
    updateUserSubscription(userId, status, endDate, callback) {
        this.db.run(
            'UPDATE users SET subscription_status = ?, subscription_end_date = ? WHERE id = ?',
            [status, endDate, userId],
            callback
        );
    }

    getUserWithSubscription(userId, callback) {
        this.db.get(
            'SELECT *, subscription_status, subscription_end_date, trial_end_date FROM users WHERE id = ?',
            [userId],
            (err, user) => {
                if (err || !user) return callback(err, user);
                
                // Check if subscription is active
                const now = new Date().toISOString();
                const isSubscribed = user.subscription_status === 'premium' && 
                                   (!user.subscription_end_date || user.subscription_end_date > now);
                const isTrialActive = user.trial_end_date && user.trial_end_date > now;
                
                user.isPremium = isSubscribed || isTrialActive;
                user.isTrialActive = isTrialActive;
                callback(null, user);
            }
        );
    }

    // Resource counting for limits
    countChildrenByParent(parentId, callback) {
        this.db.get(
            'SELECT COUNT(*) as count FROM children WHERE parent_id = ?',
            [parentId],
            callback
        );
    }

    countTasksByParent(parentId, callback) {
        this.db.get(
            'SELECT COUNT(*) as count FROM tasks WHERE parent_id = ?',
            [parentId],
            callback
        );
    }

    countRewardsByParent(parentId, callback) {
        this.db.get(
            'SELECT COUNT(*) as count FROM rewards WHERE parent_id = ?',
            [parentId],
            callback
        );
    }

    // Children methods
    createChild(parentId, name, age, avatar, callback) {
        this.db.run(
            'INSERT INTO children (parent_id, name, age, avatar) VALUES (?, ?, ?, ?)',
            [parentId, name, age, avatar || 'child-1'],
            callback
        );
    }

    getChildrenByParent(parentId, callback) {
        this.db.all(
            'SELECT * FROM children WHERE parent_id = ? ORDER BY name',
            [parentId],
            callback
        );
    }

    getChild(childId, callback) {
        this.db.get(
            'SELECT * FROM children WHERE id = ?',
            [childId],
            callback
        );
    }

    getChildWithParentVerification(childId, parentId, callback) {
        this.db.get(
            'SELECT * FROM children WHERE id = ? AND parent_id = ?',
            [childId, parentId],
            callback
        );
    }

    updateChildBalance(childId, newBalance, callback) {
        this.db.run(
            'UPDATE children SET balance = ? WHERE id = ?',
            [newBalance, childId],
            callback
        );
    }

    updateChildStreak(childId, streakCount, lastCompletionDate, callback) {
        this.db.run(
            'UPDATE children SET streak_count = ?, last_completion_date = ? WHERE id = ?',
            [streakCount, lastCompletionDate, childId],
            callback
        );
    }

    // Task methods
    createTask(parentId, childId, title, type, pointsValue, frequency, callback) {
        this.db.run(
            'INSERT INTO tasks (parent_id, child_id, title, type, points_value, frequency) VALUES (?, ?, ?, ?, ?, ?)',
            [parentId, childId, title, type, pointsValue, frequency],
            callback
        );
    }

    getTasksByChild(childId, callback) {
        this.db.all(
            'SELECT * FROM tasks WHERE child_id = ? AND is_active = 1 ORDER BY created_at DESC',
            [childId],
            callback
        );
    }

    getTasksByParent(parentId, callback) {
        this.db.all(`
            SELECT t.*, c.name as child_name 
            FROM tasks t 
            JOIN children c ON t.child_id = c.id 
            WHERE t.parent_id = ? AND t.is_active = 1 AND t.archived = 0
            ORDER BY t.created_at DESC
        `, [parentId], callback);
    }

    getTasksWithCompletions(parentId, callback) {
        this.db.all(`
            SELECT 
                t.*,
                c.name as child_name,
                comp.id as completion_id,
                comp.status as completion_status,
                comp.photo_path,
                comp.comment,
                comp.completion_date,
                comp.created_at as completion_created_at
            FROM tasks t 
            JOIN children c ON t.child_id = c.id 
            LEFT JOIN completions comp ON t.id = comp.task_id 
                AND comp.completion_date = date('now')
            WHERE t.parent_id = ? AND t.is_active = 1 
            ORDER BY t.created_at DESC, comp.created_at DESC
        `, [parentId], callback);
    }

    getTodaysCompletions(parentId, callback) {
        this.db.all(`
            SELECT 
                comp.*,
                t.title,
                t.type,
                t.points_value,
                c.name as child_name
            FROM completions comp
            JOIN tasks t ON comp.task_id = t.id
            JOIN children c ON comp.child_id = c.id
            WHERE t.parent_id = ? AND comp.completion_date = date('now')
            ORDER BY comp.created_at DESC
        `, [parentId], callback);
    }

    getTodaysPendingCompletions(parentId, callback) {
        this.db.all(`
            SELECT 
                comp.*,
                t.title,
                t.type,
                t.points_value,
                c.name as child_name
            FROM completions comp
            JOIN tasks t ON comp.task_id = t.id
            JOIN children c ON comp.child_id = c.id
            WHERE t.parent_id = ? AND comp.completion_date = date('now') AND comp.status = 'pending'
            ORDER BY comp.created_at DESC
        `, [parentId], callback);
    }

    getTodaysApprovedCompletions(parentId, callback) {
        this.db.all(`
            SELECT 
                comp.*,
                t.title,
                t.type,
                t.points_value,
                c.name as child_name
            FROM completions comp
            JOIN tasks t ON comp.task_id = t.id
            JOIN children c ON comp.child_id = c.id
            WHERE t.parent_id = ? AND comp.completion_date = date('now') AND comp.status = 'approved'
            ORDER BY comp.created_at DESC
        `, [parentId], callback);
    }

    getTodaysRejectedCompletions(parentId, callback) {
        this.db.all(`
            SELECT 
                comp.*,
                t.title,
                t.type,
                t.points_value,
                c.name as child_name
            FROM completions comp
            JOIN tasks t ON comp.task_id = t.id
            JOIN children c ON comp.child_id = c.id
            WHERE t.parent_id = ? AND comp.completion_date = date('now') AND comp.status = 'rejected'
            ORDER BY comp.created_at DESC
        `, [parentId], callback);
    }

    getActiveTasksByParent(parentId, callback) {
        this.db.all(`
            SELECT t.*, c.name as child_name 
            FROM tasks t 
            JOIN children c ON t.child_id = c.id 
            WHERE t.parent_id = ? AND t.is_active = 1 AND t.archived = 0
            ORDER BY t.created_at DESC
        `, [parentId], callback);
    }

    getTasksByTypeAndParent(parentId, type, callback) {
        this.db.all(`
            SELECT t.*, c.name as child_name 
            FROM tasks t 
            JOIN children c ON t.child_id = c.id 
            WHERE t.parent_id = ? AND t.type = ? AND t.is_active = 1 AND t.archived = 0
            ORDER BY t.created_at DESC
        `, [parentId, type], callback);
    }

    // Frequency-based task queries
    getTasksByFrequencyAndParent(parentId, frequency, callback) {
        this.db.all(`
            SELECT t.*, c.name as child_name 
            FROM tasks t 
            JOIN children c ON t.child_id = c.id 
            WHERE t.parent_id = ? AND t.frequency = ? AND t.is_active = 1 AND t.archived = 0
            ORDER BY t.created_at DESC
        `, [parentId, frequency], callback);
    }

    // Get tasks due today based on frequency
    getTasksDueToday(parentId, callback) {
        const today = new Date();
        const dayName = today.toLocaleLowerCase().slice(0, 3); // mon, tue, wed, etc.
        
        this.db.all(`
            SELECT t.*, c.name as child_name 
            FROM tasks t 
            JOIN children c ON t.child_id = c.id 
            WHERE t.parent_id = ? AND t.is_active = 1 AND t.archived = 0 AND
            (t.frequency = 'daily' OR 
             (t.frequency = 'weekly' AND (t.weekly_days IS NULL OR t.weekly_days LIKE '%' || ? || '%')) OR
             (t.frequency = 'one-time' AND t.id NOT IN (
                 SELECT DISTINCT comp.task_id 
                 FROM completions comp 
                 WHERE comp.status = 'approved'
             )))
            ORDER BY t.frequency, t.created_at DESC
        `, [parentId, dayName], callback);
    }

    // Archive a task
    archiveTask(taskId, callback) {
        this.db.run(
            'UPDATE tasks SET archived = 1 WHERE id = ?',
            [taskId],
            callback
        );
    }

    // Unarchive a task
    unarchiveTask(taskId, callback) {
        this.db.run(
            'UPDATE tasks SET archived = 0 WHERE id = ?',
            [taskId],
            callback
        );
    }

    // Get archived tasks
    getArchivedTasksByParent(parentId, callback) {
        this.db.all(`
            SELECT t.*, c.name as child_name 
            FROM tasks t 
            JOIN children c ON t.child_id = c.id 
            WHERE t.parent_id = ? AND t.archived = 1
            ORDER BY t.created_at DESC
        `, [parentId], callback);
    }

    updateTask(taskId, title, type, pointsValue, frequency, callback) {
        this.db.run(
            'UPDATE tasks SET title = ?, type = ?, points_value = ?, frequency = ? WHERE id = ?',
            [title, type, pointsValue, frequency, taskId],
            callback
        );
    }

    deleteTask(taskId, callback) {
        this.db.run(
            'UPDATE tasks SET is_active = 0 WHERE id = ?',
            [taskId],
            callback
        );
    }

    // Completion methods
    createCompletion(taskId, childId, photoPath, callback) {
        this.db.run(
            'INSERT INTO completions (task_id, child_id, photo_path) VALUES (?, ?, ?)',
            [taskId, childId, photoPath],
            callback
        );
    }

    getPendingCompletions(parentId, callback) {
        this.db.all(`
            SELECT comp.*, t.title as task_title, t.points_value, t.type, c.name as child_name
            FROM completions comp
            JOIN tasks t ON comp.task_id = t.id
            JOIN children c ON comp.child_id = c.id
            WHERE t.parent_id = ? AND comp.status = 'pending'
            ORDER BY comp.created_at DESC
        `, [parentId], callback);
    }

    updateCompletionStatus(completionId, status, comment, callback) {
        this.db.run(
            'UPDATE completions SET status = ?, comment = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, comment, completionId],
            callback
        );
    }

    getAllCompletions(parentId, callback) {
        this.db.all(`
            SELECT comp.*, t.title as task_title, t.points_value, t.type, c.name as child_name
            FROM completions comp
            JOIN tasks t ON comp.task_id = t.id
            JOIN children c ON comp.child_id = c.id
            WHERE t.parent_id = ?
            ORDER BY comp.created_at DESC
        `, [parentId], callback);
    }

    getRecentCompletions(parentId, callback) {
        this.db.all(`
            SELECT comp.*, t.title as task_title, t.points_value, t.type, c.name as child_name
            FROM completions comp
            JOIN tasks t ON comp.task_id = t.id
            JOIN children c ON comp.child_id = c.id
            WHERE t.parent_id = ? 
            AND comp.created_at >= datetime('now', '-7 days')
            ORDER BY comp.created_at DESC
        `, [parentId], callback);
    }

    getApprovalStats(parentId, callback) {
        this.db.get(`
            SELECT 
                COALESCE(COUNT(*), 0) as total_tasks,
                COALESCE(SUM(CASE WHEN comp.status = 'approved' THEN 1 ELSE 0 END), 0) as approved_count,
                COALESCE(SUM(CASE WHEN comp.status = 'pending' THEN 1 ELSE 0 END), 0) as pending_count,
                COALESCE(SUM(CASE WHEN comp.status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected_count
            FROM completions comp
            JOIN tasks t ON comp.task_id = t.id
            WHERE t.parent_id = ? 
            AND comp.created_at >= datetime('now', '-7 days')
        `, [parentId], callback);
    }

    getWeeklyStats(parentId, callback) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weekAgoStr = oneWeekAgo.toISOString().split('T')[0];
        
        this.db.all(`
            SELECT 
                COUNT(*) as total_tasks,
                SUM(CASE WHEN t.type = 'Study' THEN 1 ELSE 0 END) as study_tasks,
                SUM(CASE WHEN t.type = 'Chore' THEN 1 ELSE 0 END) as chore_tasks
            FROM completions comp
            JOIN tasks t ON comp.task_id = t.id
            WHERE t.parent_id = ? AND comp.completion_date >= ?
        `, [parentId, weekAgoStr], callback);
    }

    getPendingCount(parentId, callback) {
        this.db.get(`
            SELECT COUNT(*) as pending_count
            FROM completions comp
            JOIN tasks t ON comp.task_id = t.id
            WHERE t.parent_id = ? AND comp.status = 'pending'
        `, [parentId], callback);
    }

    getTodaysTasks(childId, callback) {
        const today = new Date().toISOString().split('T')[0];
        this.db.all(`
            SELECT t.*, 
                   CASE WHEN comp.id IS NOT NULL THEN comp.status ELSE NULL END as completion_status,
                   comp.id as completion_id
            FROM tasks t
            LEFT JOIN completions comp ON t.id = comp.task_id 
                AND comp.child_id = ? 
                AND comp.completion_date = ?
            WHERE t.child_id = ? AND t.is_active = 1
            ORDER BY t.created_at DESC
        `, [childId, today, childId], callback);
    }

    getTask(taskId, callback) {
        this.db.get(
            'SELECT * FROM tasks WHERE id = ?',
            [taskId],
            callback
        );
    }

    updateChildAvatar(childId, avatar, callback) {
        this.db.run(
            'UPDATE children SET avatar = ? WHERE id = ?',
            [avatar, childId],
            callback
        );
    }

    // Reward Categories methods
    getRewardCategories(callback) {
        this.db.all(
            'SELECT * FROM reward_categories ORDER BY name',
            callback
        );
    }

    // Rewards methods
    createReward(parentId, categoryId, name, description, cost, type, stockQuantity, icon, callback) {
        const stockRemaining = stockQuantity === -1 ? -1 : stockQuantity;
        this.db.run(
            'INSERT INTO rewards (parent_id, category_id, name, description, cost, type, stock_quantity, stock_remaining, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [parentId, categoryId, name, description, cost, type, stockQuantity, stockRemaining, icon],
            callback
        );
    }

    getRewardsByParent(parentId, callback) {
        this.db.all(`
            SELECT r.*, rc.name as category_name, rc.icon as category_icon, rc.color as category_color
            FROM rewards r
            JOIN reward_categories rc ON r.category_id = rc.id
            WHERE r.parent_id = ? AND r.is_active = 1
            ORDER BY rc.name, r.name
        `, [parentId], callback);
    }

    getAvailableRewards(parentId, callback) {
        this.db.all(`
            SELECT r.*, rc.name as category_name, rc.icon as category_icon, rc.color as category_color
            FROM rewards r
            JOIN reward_categories rc ON r.category_id = rc.id
            WHERE r.parent_id = ? AND r.is_active = 1 
            AND (r.stock_remaining > 0 OR r.stock_remaining = -1)
            ORDER BY rc.name, r.name
        `, [parentId], callback);
    }

    updateReward(rewardId, name, description, cost, type, stockQuantity, icon, callback) {
        const stockRemaining = stockQuantity === -1 ? -1 : stockQuantity;
        this.db.run(
            'UPDATE rewards SET name = ?, description = ?, cost = ?, type = ?, stock_quantity = ?, stock_remaining = ?, icon = ? WHERE id = ?',
            [name, description, cost, type, stockQuantity, stockRemaining, icon, rewardId],
            callback
        );
    }

    deleteReward(rewardId, callback) {
        this.db.run(
            'UPDATE rewards SET is_active = 0 WHERE id = ?',
            [rewardId],
            callback
        );
    }

    getReward(rewardId, callback) {
        this.db.get(
            'SELECT r.*, rc.name as category_name FROM rewards r JOIN reward_categories rc ON r.category_id = rc.id WHERE r.id = ?',
            [rewardId],
            callback
        );
    }

    // Purchase methods
    createPurchase(childId, rewardId, costPaid, callback) {
        this.db.run(
            'INSERT INTO purchases (child_id, reward_id, cost_paid) VALUES (?, ?, ?)',
            [childId, rewardId, costPaid],
            callback
        );
    }

    getPurchasesByChild(childId, callback) {
        this.db.all(`
            SELECT p.*, r.name as reward_name, r.description, r.icon as reward_icon,
                   rc.name as category_name, rc.color as category_color
            FROM purchases p
            JOIN rewards r ON p.reward_id = r.id
            JOIN reward_categories rc ON r.category_id = rc.id
            WHERE p.child_id = ?
            ORDER BY p.purchased_at DESC
        `, [childId], callback);
    }

    getPendingPurchases(parentId, callback) {
        this.db.all(`
            SELECT p.*, r.name as reward_name, r.description, r.icon as reward_icon,
                   c.name as child_name, rc.name as category_name
            FROM purchases p
            JOIN rewards r ON p.reward_id = r.id
            JOIN children c ON p.child_id = c.id
            JOIN reward_categories rc ON r.category_id = rc.id
            WHERE r.parent_id = ? AND p.status = 'pending'
            ORDER BY p.purchased_at DESC
        `, [parentId], callback);
    }

    updatePurchaseStatus(purchaseId, status, notes, callback) {
        let updateFields = 'status = ?, notes = ?';
        let values = [status, notes];
        
        if (status === 'approved') {
            updateFields += ', approved_at = CURRENT_TIMESTAMP';
        } else if (status === 'completed') {
            updateFields += ', completed_at = CURRENT_TIMESTAMP';
        }
        
        values.push(purchaseId);
        
        this.db.run(
            `UPDATE purchases SET ${updateFields} WHERE id = ?`,
            values,
            callback
        );
    }

    // Process purchase (deduct coins and reduce stock)
    processPurchase(childId, rewardId, callback) {
        this.db.serialize(() => {
            // Start transaction
            this.db.run('BEGIN TRANSACTION');
            
            // Get child's current balance and reward details
            this.db.get(`
                SELECT c.balance, r.cost, r.stock_remaining
                FROM children c, rewards r
                WHERE c.id = ? AND r.id = ?
            `, [childId, rewardId], (err, result) => {
                if (err) {
                    this.db.run('ROLLBACK');
                    return callback(err);
                }
                
                if (!result) {
                    this.db.run('ROLLBACK');
                    return callback(new Error('Child or reward not found'));
                }
                
                if (result.balance < result.cost) {
                    this.db.run('ROLLBACK');
                    return callback(new Error('Insufficient funds'));
                }
                
                if (result.stock_remaining === 0) {
                    this.db.run('ROLLBACK');
                    return callback(new Error('Item out of stock'));
                }
                
                // Deduct coins from child's balance
                const newBalance = result.balance - result.cost;
                this.db.run(
                    'UPDATE children SET balance = ? WHERE id = ?',
                    [newBalance, childId],
                    (err) => {
                        if (err) {
                            this.db.run('ROLLBACK');
                            return callback(err);
                        }
                        
                        // Reduce stock if not unlimited (-1)
                        if (result.stock_remaining > 0) {
                            this.db.run(
                                'UPDATE rewards SET stock_remaining = stock_remaining - 1 WHERE id = ?',
                                [rewardId],
                                (err) => {
                                    if (err) {
                                        this.db.run('ROLLBACK');
                                        return callback(err);
                                    }
                                    
                                    // Create purchase record
                                    this.createPurchase(childId, rewardId, result.cost, (err) => {
                                        if (err) {
                                            this.db.run('ROLLBACK');
                                            return callback(err);
                                        }
                                        
                                        // Commit transaction
                                        this.db.run('COMMIT', callback);
                                    });
                                }
                            );
                        } else {
                            // Create purchase record for unlimited stock items
                            this.createPurchase(childId, rewardId, result.cost, (err) => {
                                if (err) {
                                    this.db.run('ROLLBACK');
                                    return callback(err);
                                }
                                
                                // Commit transaction
                                this.db.run('COMMIT', callback);
                            });
                        }
                    }
                );
            });
        });
    }

    // Progress tracking methods
    getChildProgressData(childId, callback) {
        const query = `
            SELECT 
                DATE(c.completion_date) as date,
                COUNT(*) as completed_tasks,
                SUM(CASE WHEN c.status = 'approved' THEN t.points_value ELSE 0 END) as coins_earned
            FROM completions c
            JOIN tasks t ON c.task_id = t.id
            WHERE c.child_id = ? 
            AND c.completion_date >= date('now', '-30 days')
            GROUP BY DATE(c.completion_date)
            ORDER BY date ASC
        `;
        
        this.db.all(query, [childId], (err, rows) => {
            if (err) return callback(err);
            
            // Fill in missing days with 0 values
            const result = [];
            const today = new Date();
            for (let i = 29; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                
                const dayData = rows.find(row => row.date === dateStr);
                result.push({
                    date: dateStr,
                    completed_tasks: dayData ? dayData.completed_tasks : 0,
                    coins_earned: dayData ? dayData.coins_earned : 0
                });
            }
            
            callback(null, result);
        });
    }

    getChildWeeklyStats(childId, callback) {
        const query = `
            SELECT 
                strftime('%Y-%W', c.completion_date) as week,
                COUNT(*) as completed_tasks,
                COUNT(DISTINCT DATE(c.completion_date)) as active_days,
                SUM(CASE WHEN c.status = 'approved' THEN t.points_value ELSE 0 END) as coins_earned
            FROM completions c
            JOIN tasks t ON c.task_id = t.id
            WHERE c.child_id = ? 
            AND c.completion_date >= date('now', '-28 days')
            GROUP BY strftime('%Y-%W', c.completion_date)
            ORDER BY week DESC
            LIMIT 4
        `;
        
        this.db.all(query, [childId], callback);
    }

    getChildStreakCalendar(childId, callback) {
        const query = `
            SELECT 
                DATE(c.completion_date) as date,
                COUNT(*) as completed_tasks,
                COUNT(DISTINCT t.id) as total_assigned,
                CASE 
                    WHEN COUNT(*) >= (
                        SELECT COUNT(*) 
                        FROM tasks t2 
                        WHERE t2.child_id = ? 
                        AND DATE(t2.created_at) <= DATE(c.completion_date)
                        AND (t2.frequency = 'daily' OR t2.frequency = 'one-time')
                    ) THEN 1 
                    ELSE 0 
                END as streak_day
            FROM completions c
            JOIN tasks t ON c.task_id = t.id
            WHERE c.child_id = ? 
            AND c.completion_date >= date('now', '-60 days')
            AND c.status = 'approved'
            GROUP BY DATE(c.completion_date)
            ORDER BY date ASC
        `;
        
        this.db.all(query, [childId, childId], (err, rows) => {
            if (err) return callback(err);
            
            // Fill in missing days
            const result = [];
            const today = new Date();
            for (let i = 59; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                
                const dayData = rows.find(row => row.date === dateStr);
                result.push({
                    date: dateStr,
                    completed_tasks: dayData ? dayData.completed_tasks : 0,
                    total_assigned: dayData ? dayData.total_assigned : 0,
                    streak_day: dayData ? dayData.streak_day : 0
                });
            }
            
            callback(null, result);
        });
    }

    // Bills management methods
    createBill(parentId, childId, name, description, amount, frequency, icon, callback) {
        // Calculate next due date based on frequency
        let nextDueDate = new Date();
        if (frequency === 'weekly') {
            nextDueDate.setDate(nextDueDate.getDate() + 7);
        } else if (frequency === 'monthly') {
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        } else if (frequency === 'yearly') {
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
        }

        const query = `
            INSERT INTO bills (parent_id, child_id, name, description, amount, frequency, icon, next_due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        this.db.run(query, [parentId, childId, name, description, amount, frequency, icon, nextDueDate.toISOString().split('T')[0]], callback);
    }

    getBillsByParent(parentId, callback) {
        const query = `
            SELECT b.*, c.name as child_name 
            FROM bills b
            JOIN children c ON b.child_id = c.id
            WHERE b.parent_id = ? AND b.is_active = 1
            ORDER BY b.next_due_date ASC
        `;
        
        this.db.all(query, [parentId], callback);
    }

    getBillsByChild(childId, callback) {
        const query = `
            SELECT * FROM bills 
            WHERE child_id = ? AND is_active = 1
            ORDER BY next_due_date ASC
        `;
        
        this.db.all(query, [childId], callback);
    }

    getOverdueBills(callback) {
        const today = new Date().toISOString().split('T')[0];
        const query = `
            SELECT b.*, c.name as child_name, c.balance 
            FROM bills b
            JOIN children c ON b.child_id = c.id
            WHERE b.is_active = 1 AND b.next_due_date <= ?
            ORDER BY b.next_due_date ASC
        `;
        
        this.db.all(query, [today], callback);
    }

    processBillPayment(billId, childId, amount, callback) {
        this.db.serialize(() => {
            this.db.run('BEGIN TRANSACTION');
            
            // Check child's balance
            this.db.get(
                'SELECT balance FROM children WHERE id = ?',
                [childId],
                (err, child) => {
                    if (err) {
                        this.db.run('ROLLBACK');
                        return callback(err);
                    }
                    
                    if (!child || child.balance < amount) {
                        this.db.run('ROLLBACK');
                        return callback(new Error('Insufficient funds'));
                    }
                    
                    // Deduct amount from child's balance
                    this.db.run(
                        'UPDATE children SET balance = balance - ? WHERE id = ?',
                        [amount, childId],
                        (err) => {
                            if (err) {
                                this.db.run('ROLLBACK');
                                return callback(err);
                            }
                            
                            // Record the payment
                            this.db.run(
                                'INSERT INTO bill_payments (bill_id, child_id, amount, status) VALUES (?, ?, ?, ?)',
                                [billId, childId, amount, 'paid'],
                                (err) => {
                                    if (err) {
                                        this.db.run('ROLLBACK');
                                        return callback(err);
                                    }
                                    
                                    // Update bill's next due date
                                    this.db.get('SELECT frequency FROM bills WHERE id = ?', [billId], (err, bill) => {
                                        if (err) {
                                            this.db.run('ROLLBACK');
                                            return callback(err);
                                        }
                                        
                                        let nextDueDate = new Date();
                                        if (bill.frequency === 'weekly') {
                                            nextDueDate.setDate(nextDueDate.getDate() + 7);
                                        } else if (bill.frequency === 'monthly') {
                                            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                                        } else if (bill.frequency === 'yearly') {
                                            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
                                        }
                                        
                                        this.db.run(
                                            'UPDATE bills SET next_due_date = ? WHERE id = ?',
                                            [nextDueDate.toISOString().split('T')[0], billId],
                                            (err) => {
                                                if (err) {
                                                    this.db.run('ROLLBACK');
                                                    return callback(err);
                                                }
                                                
                                                this.db.run('COMMIT', callback);
                                            }
                                        );
                                    });
                                }
                            );
                        }
                    );
                }
            );
        });
    }

    updateBill(billId, name, description, amount, frequency, icon, isActive, callback) {
        const query = `
            UPDATE bills 
            SET name = ?, description = ?, amount = ?, frequency = ?, icon = ?, is_active = ?
            WHERE id = ?
        `;
        
        this.db.run(query, [name, description, amount, frequency, icon, isActive, billId], callback);
    }

    deleteBill(billId, callback) {
        this.db.run('UPDATE bills SET is_active = 0 WHERE id = ?', [billId], callback);
    }

    getChildBillPayments(childId, callback) {
        const query = `
            SELECT bp.*, b.name as bill_name, b.icon as bill_icon
            FROM bill_payments bp
            JOIN bills b ON bp.bill_id = b.id
            WHERE bp.child_id = ?
            ORDER BY bp.payment_date DESC
            LIMIT 50
        `;
        
        this.db.all(query, [childId], callback);
    }

    // Wishlist methods
    addToWishlist(childId, rewardId, callback) {
        this.db.run(
            'INSERT OR REPLACE INTO wishlists (child_id, reward_id) VALUES (?, ?)',
            [childId, rewardId],
            callback
        );
    }

    removeFromWishlist(childId, rewardId, callback) {
        this.db.run(
            'DELETE FROM wishlists WHERE child_id = ? AND reward_id = ?',
            [childId, rewardId],
            callback
        );
    }

    getWishlist(childId, callback) {
        this.db.all(`
            SELECT w.*, r.name, r.description, r.cost, r.icon, r.type, 
                   r.stock_remaining, r.is_active, rc.name as category_name, rc.icon as category_icon
            FROM wishlists w
            JOIN rewards r ON w.reward_id = r.id
            JOIN reward_categories rc ON r.category_id = rc.id
            WHERE w.child_id = ? AND r.is_active = 1
            ORDER BY w.added_at DESC
        `, [childId], callback);
    }

    isInWishlist(childId, rewardId, callback) {
        this.db.get(
            'SELECT id FROM wishlists WHERE child_id = ? AND reward_id = ?',
            [childId, rewardId],
            (err, row) => {
                callback(err, !!row);
            }
        );
    }

    close() {
        this.db.close();
    }
}

module.exports = Database;