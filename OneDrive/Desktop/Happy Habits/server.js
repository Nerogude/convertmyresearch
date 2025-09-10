const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const Database = require('./database');

const app = express();
const db = new Database();

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'happy-habits-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

function requireChildAuth(req, res, next) {
    if (req.session.childId) {
        next();
    } else {
        res.redirect('/child-login.html');
    }
}

// Routes

// Home page
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/parent-dashboard.html');
    } else if (req.session.childId) {
        res.redirect('/child-dashboard.html');
    } else {
        res.redirect('/login.html');
    }
});

// Parent Authentication
app.post('/api/register', (req, res) => {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    db.createUser(email, password, name, function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Email already exists' });
            }
            return res.status(500).json({ error: 'Server error' });
        }
        
        req.session.userId = this.lastID;
        res.json({ success: true });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    db.getUserByEmail(email, (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        
        req.session.userId = user.id;
        req.session.userName = user.name;
        res.json({ success: true });
    });
});

// Child Authentication (simple name selection)
app.post('/api/child-login', (req, res) => {
    const { childId } = req.body;
    
    db.getChild(childId, (err, child) => {
        if (err || !child) {
            return res.status(400).json({ error: 'Invalid child selection' });
        }
        
        req.session.childId = child.id;
        req.session.childName = child.name;
        res.json({ success: true });
    });
});

app.get('/api/children-list', (req, res) => {
    // Get all children for child login (no auth required for this endpoint)
    db.db.all('SELECT id, name, age, avatar FROM children ORDER BY name', (err, children) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(children);
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Children management
app.post('/api/children', requireAuth, (req, res) => {
    const { name, age, avatar } = req.body;
    
    db.createChild(req.session.userId, name, age, avatar, function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to create child' });
        }
        res.json({ success: true, childId: this.lastID });
    });
});

app.get('/api/children', requireAuth, (req, res) => {
    db.getChildrenByParent(req.session.userId, (err, children) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(children);
    });
});

app.put('/api/children/:id/avatar', requireAuth, (req, res) => {
    const { avatar } = req.body;
    const childId = req.params.id;
    
    db.updateChildAvatar(childId, avatar, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update avatar' });
        }
        res.json({ success: true });
    });
});

// Task management
app.post('/api/tasks', requireAuth, (req, res) => {
    const { childId, title, type, pointsValue, frequency } = req.body;
    
    db.createTask(req.session.userId, childId, title, type, pointsValue, frequency, function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to create task' });
        }
        res.json({ success: true, taskId: this.lastID });
    });
});

app.get('/api/tasks', requireAuth, (req, res) => {
    const filter = req.query.filter || 'active'; // active, study, chore, all, daily, weekly, one-time, due-today, archived
    console.log('API call to /api/tasks with filter:', filter);
    
    switch(filter) {
        case 'active':
            db.getActiveTasksByParent(req.session.userId, (err, tasks) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }
                console.log('Active tasks:', tasks.length);
                res.json(tasks);
            });
            break;
        case 'study':
            db.getTasksByTypeAndParent(req.session.userId, 'Study', (err, tasks) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }
                console.log('Study tasks:', tasks.length);
                res.json(tasks);
            });
            break;
        case 'chore':
            db.getTasksByTypeAndParent(req.session.userId, 'Chore', (err, tasks) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }
                console.log('Chore tasks:', tasks.length);
                res.json(tasks);
            });
            break;
        case 'daily':
            db.getTasksByFrequencyAndParent(req.session.userId, 'daily', (err, tasks) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }
                console.log('Daily tasks:', tasks.length);
                res.json(tasks);
            });
            break;
        case 'weekly':
            db.getTasksByFrequencyAndParent(req.session.userId, 'weekly', (err, tasks) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }
                console.log('Weekly tasks:', tasks.length);
                res.json(tasks);
            });
            break;
        case 'one-time':
            db.getTasksByFrequencyAndParent(req.session.userId, 'one-time', (err, tasks) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }
                console.log('One-time tasks:', tasks.length);
                res.json(tasks);
            });
            break;
        case 'due-today':
            db.getTasksDueToday(req.session.userId, (err, tasks) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }
                console.log('Tasks due today:', tasks.length);
                res.json(tasks);
            });
            break;
        case 'archived':
            db.getArchivedTasksByParent(req.session.userId, (err, tasks) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }
                console.log('Archived tasks:', tasks.length);
                res.json(tasks);
            });
            break;
        default:
            db.getTasksByParent(req.session.userId, (err, tasks) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }
                console.log('All tasks:', tasks.length);
                res.json(tasks);
            });
    }
});

app.get('/api/tasks-with-completions', requireAuth, (req, res) => {
    db.getTasksWithCompletions(req.session.userId, (err, tasks) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(tasks);
    });
});

app.get('/api/todays-completions', requireAuth, (req, res) => {
    const filter = req.query.filter || 'all'; // pending, approved, rejected, all
    console.log('API call to /api/todays-completions with filter:', filter);
    
    switch(filter) {
        case 'pending':
            db.getTodaysPendingCompletions(req.session.userId, (err, completions) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }
                console.log('Today\'s pending completions:', completions.length);
                res.json(completions);
            });
            break;
        case 'approved':
            db.getTodaysApprovedCompletions(req.session.userId, (err, completions) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }
                console.log('Today\'s approved completions:', completions.length);
                res.json(completions);
            });
            break;
        case 'rejected':
            db.getTodaysRejectedCompletions(req.session.userId, (err, completions) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }
                console.log('Today\'s rejected completions:', completions.length);
                res.json(completions);
            });
            break;
        default:
            db.getTodaysCompletions(req.session.userId, (err, completions) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }
                console.log('Today\'s all completions:', completions.length);
                res.json(completions);
            });
    }
});

app.put('/api/tasks/:id', requireAuth, (req, res) => {
    const { title, type, pointsValue, frequency } = req.body;
    const taskId = req.params.id;
    
    db.updateTask(taskId, title, type, pointsValue, frequency, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update task' });
        }
        res.json({ success: true });
    });
});

app.delete('/api/tasks/:id', requireAuth, (req, res) => {
    const taskId = req.params.id;
    
    db.deleteTask(taskId, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete task' });
        }
        res.json({ success: true });
    });
});

// Archive a task
app.put('/api/tasks/:id/archive', requireAuth, (req, res) => {
    const taskId = req.params.id;
    
    db.archiveTask(taskId, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to archive task' });
        }
        res.json({ success: true });
    });
});

// Unarchive a task
app.put('/api/tasks/:id/unarchive', requireAuth, (req, res) => {
    const taskId = req.params.id;
    
    db.unarchiveTask(taskId, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to unarchive task' });
        }
        res.json({ success: true });
    });
});

app.get('/api/tasks/:id', requireAuth, (req, res) => {
    const taskId = req.params.id;
    
    db.getTask(taskId, (err, task) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(task);
    });
});

// Child tasks
app.get('/api/child-tasks', requireChildAuth, (req, res) => {
    db.getTodaysTasks(req.session.childId, (err, tasks) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(tasks);
    });
});

app.get('/api/child-info', requireChildAuth, (req, res) => {
    db.getChild(req.session.childId, (err, child) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(child);
    });
});

// Task completion
app.post('/api/complete-task', requireChildAuth, upload.single('photo'), (req, res) => {
    const { taskId } = req.body;
    const photoPath = req.file ? req.file.filename : null;
    
    db.createCompletion(taskId, req.session.childId, photoPath, function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to complete task' });
        }
        res.json({ success: true });
    });
});

// Parent approval
app.get('/api/pending-completions', requireAuth, (req, res) => {
    db.getPendingCompletions(req.session.userId, (err, completions) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(completions);
    });
});

app.post('/api/approve-completion', requireAuth, (req, res) => {
    const { completionId, action, comment } = req.body; // action: 'approve' or 'reject'
    
    console.log('Approval request:', { completionId, action, comment }); // Debug log
    
    if (!completionId || !action) {
        console.error('Missing required fields:', { completionId, action });
        return res.status(400).json({ error: 'Missing completionId or action' });
    }
    
    db.updateCompletionStatus(completionId, action === 'approve' ? 'approved' : 'rejected', comment, (err) => {
        if (err) {
            console.error('Database error in updateCompletionStatus:', err);
            return res.status(500).json({ error: 'Server error: ' + err.message });
        }
        
        if (action === 'approve') {
            // Get completion details to award points
            db.db.get(`
                SELECT comp.child_id, t.points_value, c.balance
                FROM completions comp
                JOIN tasks t ON comp.task_id = t.id
                JOIN children c ON comp.child_id = c.id
                WHERE comp.id = ?
            `, [completionId], (err, result) => {
                if (err) {
                    console.error('Error getting completion details:', err);
                    return res.status(500).json({ error: 'Error getting completion details: ' + err.message });
                }
                
                if (result) {
                    const newBalance = result.balance + result.points_value;
                    db.updateChildBalance(result.child_id, newBalance, (err) => {
                        if (err) {
                            console.error('Error updating balance:', err);
                            return res.status(500).json({ error: 'Error updating balance: ' + err.message });
                        }
                        console.log('Balance updated successfully');
                        res.json({ success: true });
                    });
                } else {
                    console.log('No completion result found');
                    res.json({ success: true });
                }
            });
        } else {
            res.json({ success: true });
        }
    });
});

app.get('/api/all-completions', requireAuth, (req, res) => {
    const filter = req.query.filter || 'all'; // pending, recent, all
    console.log('API call to /api/all-completions with filter:', filter);
    
    switch(filter) {
        case 'pending':
            db.getPendingCompletions(req.session.userId, (err, completions) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }
                console.log('Pending completions returned:', completions.length, 'items');
                console.log('Status values:', completions.map(c => c.status));
                res.json(completions);
            });
            break;
        case 'recent':
            db.getRecentCompletions(req.session.userId, (err, completions) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }
                res.json(completions);
            });
            break;
        default:
            db.getAllCompletions(req.session.userId, (err, completions) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }
                console.log('All completions returned:', completions.length, 'items');
                console.log('All status values:', completions.map(c => `${c.id}:${c.status}`));
                res.json(completions);
            });
    }
});

// New endpoint for approval statistics
app.get('/api/approval-stats', requireAuth, (req, res) => {
    db.getApprovalStats(req.session.userId, (err, stats) => {
        if (err) {
            console.error('Error getting approval stats:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        
        // Ensure we have valid stats object
        const safeStats = {
            total_tasks: stats?.total_tasks || 0,
            approved_count: stats?.approved_count || 0,
            pending_count: stats?.pending_count || 0,
            rejected_count: stats?.rejected_count || 0
        };
        
        console.log('Sending approval stats:', safeStats);
        res.json(safeStats);
    });
});

// User profile endpoints
app.post('/api/upload-family-photo', requireAuth, upload.single('familyPhoto'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    db.updateUserFamilyPhoto(req.session.userId, req.file.filename, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update family photo' });
        }
        res.json({ success: true, filename: req.file.filename });
    });
});

app.post('/api/update-tagline', requireAuth, (req, res) => {
    const { tagline } = req.body;
    
    db.updateUserTagline(req.session.userId, tagline, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update tagline' });
        }
        res.json({ success: true });
    });
});

app.get('/api/user-profile', requireAuth, (req, res) => {
    db.getUserById(req.session.userId, (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        // Don't send password
        delete user.password;
        res.json(user);
    });
});

// Stats endpoints
app.get('/api/weekly-stats', requireAuth, (req, res) => {
    db.getWeeklyStats(req.session.userId, (err, stats) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(stats[0] || { total_tasks: 0, study_tasks: 0, chore_tasks: 0 });
    });
});

app.get('/api/pending-count', requireAuth, (req, res) => {
    db.getPendingCount(req.session.userId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json({ count: result.pending_count });
    });
});

// ==================== REWARD MARKETPLACE API ====================

// Reward Categories
app.get('/api/reward-categories', requireAuth, (req, res) => {
    db.getRewardCategories((err, categories) => {
        if (err) {
            console.error('Error getting reward categories:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(categories);
    });
});

// Rewards Management (Parent)
app.post('/api/rewards', requireAuth, (req, res) => {
    const { categoryId, name, description, cost, type, stockQuantity, icon } = req.body;
    
    if (!categoryId || !name || !cost) {
        return res.status(400).json({ error: 'Category, name, and cost are required' });
    }
    
    db.createReward(
        req.session.userId, 
        categoryId, 
        name, 
        description || '', 
        cost, 
        type || 'approval', 
        stockQuantity || -1, 
        icon || '🎁',
        function(err) {
            if (err) {
                console.error('Error creating reward:', err);
                return res.status(500).json({ error: 'Failed to create reward' });
            }
            res.json({ success: true, rewardId: this.lastID });
        }
    );
});

app.get('/api/rewards', requireAuth, (req, res) => {
    db.getRewardsByParent(req.session.userId, (err, rewards) => {
        if (err) {
            console.error('Error getting rewards:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(rewards);
    });
});

app.get('/api/rewards/:id', requireAuth, (req, res) => {
    const rewardId = req.params.id;
    
    db.getReward(rewardId, (err, reward) => {
        if (err) {
            console.error('Error getting reward:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        if (!reward) {
            return res.status(404).json({ error: 'Reward not found' });
        }
        res.json(reward);
    });
});

app.put('/api/rewards/:id', requireAuth, (req, res) => {
    const rewardId = req.params.id;
    const { name, description, cost, type, stockQuantity, icon } = req.body;
    
    db.updateReward(
        rewardId, 
        name, 
        description || '', 
        cost, 
        type || 'approval', 
        stockQuantity || -1, 
        icon || '🎁',
        (err) => {
            if (err) {
                console.error('Error updating reward:', err);
                return res.status(500).json({ error: 'Failed to update reward' });
            }
            res.json({ success: true });
        }
    );
});

app.delete('/api/rewards/:id', requireAuth, (req, res) => {
    const rewardId = req.params.id;
    
    db.deleteReward(rewardId, (err) => {
        if (err) {
            console.error('Error deleting reward:', err);
            return res.status(500).json({ error: 'Failed to delete reward' });
        }
        res.json({ success: true });
    });
});

// Store (Child View)
app.get('/api/store', requireChildAuth, (req, res) => {
    // Get the parent ID from the child
    db.getChild(req.session.childId, (err, child) => {
        if (err || !child) {
            return res.status(500).json({ error: 'Error getting child info' });
        }
        
        db.getAvailableRewards(child.parent_id, (err, rewards) => {
            if (err) {
                console.error('Error getting available rewards:', err);
                return res.status(500).json({ error: 'Server error' });
            }
            res.json(rewards);
        });
    });
});

// Wishlist API
app.get('/api/wishlist', requireChildAuth, (req, res) => {
    db.getWishlist(req.session.childId, (err, wishlist) => {
        if (err) {
            console.error('Error getting wishlist:', err);
            return res.status(500).json({ error: 'Failed to load wishlist' });
        }
        res.json(wishlist);
    });
});

app.post('/api/wishlist/add', requireChildAuth, (req, res) => {
    const { rewardId } = req.body;
    
    if (!rewardId) {
        return res.status(400).json({ error: 'Reward ID is required' });
    }
    
    db.addToWishlist(req.session.childId, rewardId, (err) => {
        if (err) {
            console.error('Error adding to wishlist:', err);
            return res.status(500).json({ error: 'Failed to add to wishlist' });
        }
        res.json({ success: true });
    });
});

app.post('/api/wishlist/remove', requireChildAuth, (req, res) => {
    const { rewardId } = req.body;
    
    if (!rewardId) {
        return res.status(400).json({ error: 'Reward ID is required' });
    }
    
    db.removeFromWishlist(req.session.childId, rewardId, (err) => {
        if (err) {
            console.error('Error removing from wishlist:', err);
            return res.status(500).json({ error: 'Failed to remove from wishlist' });
        }
        res.json({ success: true });
    });
});

// Purchase Processing
app.post('/api/purchase', requireChildAuth, (req, res) => {
    const { rewardId } = req.body;
    
    if (!rewardId) {
        return res.status(400).json({ error: 'Reward ID is required' });
    }
    
    db.processPurchase(req.session.childId, rewardId, (err) => {
        if (err) {
            console.error('Error processing purchase:', err);
            if (err.message === 'Insufficient funds') {
                return res.status(400).json({ error: 'Not enough coins!' });
            } else if (err.message === 'Item out of stock') {
                return res.status(400).json({ error: 'Item is out of stock!' });
            }
            return res.status(500).json({ error: 'Purchase failed' });
        }
        res.json({ success: true, message: 'Purchase successful!' });
    });
});

// Child Purchase History
app.get('/api/my-purchases', requireChildAuth, (req, res) => {
    db.getPurchasesByChild(req.session.childId, (err, purchases) => {
        if (err) {
            console.error('Error getting purchases:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(purchases);
    });
});

// Parent Purchase Management
app.get('/api/pending-purchases', requireAuth, (req, res) => {
    db.getPendingPurchases(req.session.userId, (err, purchases) => {
        if (err) {
            console.error('Error getting pending purchases:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(purchases);
    });
});

app.post('/api/approve-purchase', requireAuth, (req, res) => {
    const { purchaseId, action, notes } = req.body; // action: 'approve', 'reject', 'complete'
    
    if (!purchaseId || !action) {
        return res.status(400).json({ error: 'Purchase ID and action are required' });
    }
    
    let status;
    switch(action) {
        case 'approve':
            status = 'approved';
            break;
        case 'reject':
            status = 'rejected';
            break;
        case 'complete':
            status = 'completed';
            break;
        default:
            return res.status(400).json({ error: 'Invalid action' });
    }
    
    db.updatePurchaseStatus(purchaseId, status, notes || '', (err) => {
        if (err) {
            console.error('Error updating purchase status:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        res.json({ success: true });
    });
});

// Progress Tracking API Endpoints
app.get('/api/child-progress', requireChildAuth, (req, res) => {
    const childId = req.session.childId;
    
    // Get completion data for the last 30 days
    db.getChildProgressData(childId, (err, data) => {
        if (err) {
            console.error('Error getting progress data:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(data);
    });
});

app.get('/api/child-weekly-stats', requireChildAuth, (req, res) => {
    const childId = req.session.childId;
    
    // Get weekly completion stats for the last 4 weeks
    db.getChildWeeklyStats(childId, (err, stats) => {
        if (err) {
            console.error('Error getting weekly stats:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(stats);
    });
});

app.get('/api/child-streak-calendar', requireChildAuth, (req, res) => {
    const childId = req.session.childId;
    
    // Get daily completion status for calendar view (last 60 days)
    db.getChildStreakCalendar(childId, (err, calendar) => {
        if (err) {
            console.error('Error getting streak calendar:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(calendar);
    });
});

// Bills Management API Endpoints

// Parent Bills Management
app.post('/api/bills', requireAuth, (req, res) => {
    console.log('Bills API called with data:', req.body);
    console.log('Session userId:', req.session.userId);
    
    const { childId, name, description, amount, frequency, icon } = req.body;
    
    if (!childId || !name || !amount || !frequency) {
        console.error('Missing required fields:', { childId, name, amount, frequency });
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    console.log('Attempting to create bill with:', {
        parentId: req.session.userId,
        childId,
        name,
        description,
        amount: parseInt(amount),
        frequency,
        icon
    });
    
    db.createBill(
        req.session.userId,
        childId,
        name,
        description || '',
        parseInt(amount),
        frequency,
        icon || '🏠',
        function(err) {
            if (err) {
                console.error('Error creating bill:', err);
                console.error('Error details:', err.message);
                console.error('Error stack:', err.stack);
                return res.status(500).json({ error: 'Failed to create bill: ' + err.message });
            }
            console.log('Bill created successfully with ID:', this.lastID);
            console.log('Bill details - Parent:', req.session.userId, 'Child:', childId, 'Name:', name, 'Amount:', amount);
            res.json({ success: true, billId: this.lastID });
        }
    );
});

app.get('/api/bills', requireAuth, (req, res) => {
    db.getBillsByParent(req.session.userId, (err, bills) => {
        if (err) {
            console.error('Error getting bills:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(bills);
    });
});

app.put('/api/bills/:id', requireAuth, (req, res) => {
    const billId = req.params.id;
    const { name, description, amount, frequency, icon, isActive } = req.body;
    
    db.updateBill(
        billId,
        name,
        description || '',
        parseInt(amount),
        frequency,
        icon || '🏠',
        isActive !== undefined ? isActive : 1,
        (err) => {
            if (err) {
                console.error('Error updating bill:', err);
                return res.status(500).json({ error: 'Failed to update bill' });
            }
            res.json({ success: true });
        }
    );
});

app.delete('/api/bills/:id', requireAuth, (req, res) => {
    const billId = req.params.id;
    
    db.deleteBill(billId, (err) => {
        if (err) {
            console.error('Error deleting bill:', err);
            return res.status(500).json({ error: 'Failed to delete bill' });
        }
        res.json({ success: true });
    });
});

// Child Bills View
app.get('/api/child-bills', requireChildAuth, (req, res) => {
    console.log('Child bills request for child ID:', req.session.childId); // Debug logging
    
    db.getBillsByChild(req.session.childId, (err, bills) => {
        if (err) {
            console.error('Error getting child bills:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        
        console.log('Found', bills.length, 'bills for child', req.session.childId); // Debug logging
        res.json(bills);
    });
});

app.post('/api/pay-bill', requireChildAuth, (req, res) => {
    const { billId } = req.body;
    
    if (!billId) {
        return res.status(400).json({ error: 'Bill ID required' });
    }
    
    // Get bill details first
    db.getBillsByChild(req.session.childId, (err, bills) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        
        const bill = bills.find(b => b.id === parseInt(billId));
        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }
        
        db.processBillPayment(billId, req.session.childId, bill.amount, (err) => {
            if (err) {
                if (err.message === 'Insufficient funds') {
                    return res.status(400).json({ error: 'Not enough coins to pay this bill!' });
                }
                console.error('Error processing bill payment:', err);
                return res.status(500).json({ error: 'Failed to process payment' });
            }
            res.json({ success: true, message: 'Bill paid successfully!' });
        });
    });
});

app.get('/api/child-bill-payments', requireChildAuth, (req, res) => {
    db.getChildBillPayments(req.session.childId, (err, payments) => {
        if (err) {
            console.error('Error getting bill payments:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(payments);
    });
});

// Process overdue bills (can be called by cron job)
app.post('/api/process-overdue-bills', requireAuth, (req, res) => {
    db.getOverdueBills((err, overdueBills) => {
        if (err) {
            console.error('Error getting overdue bills:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        
        let processed = 0;
        let failed = 0;
        
        if (overdueBills.length === 0) {
            return res.json({ success: true, processed: 0, failed: 0, message: 'No overdue bills' });
        }
        
        // Process each overdue bill
        overdueBills.forEach((bill, index) => {
            db.processBillPayment(bill.id, bill.child_id, bill.amount, (err) => {
                if (err) {
                    failed++;
                } else {
                    processed++;
                }
                
                // If this is the last bill, send response
                if (index === overdueBills.length - 1) {
                    res.json({ 
                        success: true, 
                        processed, 
                        failed, 
                        message: `Processed ${processed} bills, ${failed} failed due to insufficient funds`
                    });
                }
            });
        });
    });
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`Happy Habits app running on port ${PORT}`);
});