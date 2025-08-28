let currentTaskId = null;
let tasks = [];
let childInfo = {};
let storeRewards = [];
let myPurchases = [];

// Avatar mapping
const avatarEmojis = {
    'child-1': '👶',
    'child-2': '👧',
    'child-3': '👦',
    'child-4': '🧒',
    'child-5': '👨\u200d🎓',
    'child-6': '👩\u200d🎓',
    'child-7': '🏃\u200d♂️',
    'child-8': '🏃\u200d♀️',
    'child-9': '🎨',
    'child-10': '🎮',
    'child-11': '🎵',
    'child-12': '⚽'
};

// Initialize dashboard
window.addEventListener('load', () => {
    loadChildInfo();
    loadTasks();
    loadStoreRewards();
});

// Load child information
async function loadChildInfo() {
    try {
        const response = await fetch('/api/child-info');
        childInfo = await response.json();
        
        document.getElementById('child-name').textContent = `Hey ${childInfo.name}! 👋`;
        document.getElementById('welcome-message').textContent = `Welcome back, ${childInfo.name}!`;
        document.getElementById('balance').textContent = childInfo.balance;
        document.getElementById('streak').textContent = childInfo.streak_count;
        
        // Update avatar in header if needed
        const avatarElement = document.querySelector('.child-dashboard-avatar');
        if (avatarElement) {
            avatarElement.textContent = avatarEmojis[childInfo.avatar] || '👶';
        }
        
    } catch (error) {
        console.error('Error loading child info:', error);
    }
}

// Load today's tasks
async function loadTasks() {
    try {
        const response = await fetch('/api/child-tasks');
        tasks = await response.json();
        renderTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
        document.getElementById('tasks-content').innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p>Oops! We couldn't load your tasks. Try refreshing the page.</p>
                <button class="btn btn-primary" onclick="loadTasks()">Try Again</button>
            </div>
        `;
    }
}

function renderTasks() {
    const container = document.getElementById('tasks-content');
    const completedContainer = document.getElementById('completed-content');
    const completedSection = document.getElementById('completed-section');
    
    // Separate pending and completed tasks
    const pendingTasks = tasks.filter(task => !task.completion_status);
    const completedTasks = tasks.filter(task => task.completion_status);
    
    // Render pending tasks
    if (pendingTasks.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 60px; margin-bottom: 20px;">🎊</div>
                <h3>All Done for Today!</h3>
                <p style="color: #636e72; margin: 15px 0;">
                    You've completed all your tasks! Great job! 🌟
                </p>
                <p style="color: #636e72;">
                    Check back tomorrow for new tasks or ask your parent to add more.
                </p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="task-list">
                ${pendingTasks.map(task => `
                    <div class="task-item checklist-style">
                        <div class="task-checkbox" onclick="completeTask(${task.id}, '${task.title}')">
                            ✅
                        </div>
                        <div class="task-info">
                            <h4>${task.title}</h4>
                            <div class="task-meta">
                                <span class="task-type ${task.type.toLowerCase()}">${task.type}</span>
                                <span class="coins-reward">🪙 ${task.points_value} coins</span>
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="btn btn-success" onclick="completeTask(${task.id}, '${task.title}')">
                                ✅ Done!
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Render completed tasks
    if (completedTasks.length > 0) {
        completedSection.style.display = 'block';
        completedContainer.innerHTML = `
            <div class="task-list">
                ${completedTasks.map(task => `
                    <div class="task-item" style="opacity: 0.7;">
                        <div class="task-info">
                            <h4>${task.title}</h4>
                            <div class="task-meta">
                                <span class="task-type ${task.type.toLowerCase()}">${task.type}</span>
                                <span>Worth ${task.points_value} coins! 🪙</span>
                            </div>
                        </div>
                        <div class="task-actions">
                            <span class="status-${task.completion_status}">
                                ${getStatusText(task.completion_status)}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        completedSection.style.display = 'none';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'pending': return '⏳ Waiting for Parent';
        case 'approved': return '✅ Approved!';
        case 'rejected': return '❌ Try Again';
        default: return '';
    }
}

// Task completion
function completeTask(taskId, taskTitle) {
    currentTaskId = taskId;
    document.getElementById('photo-modal').classList.add('show');
}

// Photo form submission
document.getElementById('photo-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('taskId', currentTaskId);
    
    const photoFile = document.getElementById('task-photo').files[0];
    if (photoFile) {
        formData.append('photo', photoFile);
    }
    
    await submitCompletion(formData);
});

function submitWithoutPhoto() {
    const formData = new FormData();
    formData.append('taskId', currentTaskId);
    submitCompletion(formData);
}

async function submitCompletion(formData) {
    try {
        const response = await fetch('/api/complete-task', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            closePhotoModal();
            showCelebration();
            loadTasks(); // Refresh tasks
        } else {
            alert('Oops! Something went wrong: ' + data.error);
        }
    } catch (error) {
        alert('Oops! Something went wrong. Please try again.');
    }
}

// Modal functions
function closePhotoModal() {
    document.getElementById('photo-modal').classList.remove('show');
    document.getElementById('photo-form').reset();
    currentTaskId = null;
}

function showCelebration() {
    const messages = [
        "Amazing work! Your parent will be so proud! 🌟",
        "You're crushing it today! Keep it up! 💪",
        "Fantastic job! You're building great habits! 🎯",
        "Wow! You're on fire today! 🔥",
        "Super job! You're becoming a habit hero! 🦸",
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    document.getElementById('celebration-message').textContent = randomMessage;
    document.getElementById('celebration-modal').classList.add('show');
}

function closeCelebrationModal() {
    document.getElementById('celebration-modal').classList.remove('show');
}

// Store Functions
async function loadStoreRewards() {
    try {
        const response = await fetch('/api/store');
        storeRewards = await response.json();
        renderStoreRewards();
    } catch (error) {
        console.error('Error loading store rewards:', error);
        document.getElementById('store-content').innerHTML = `
            <div style="text-align: center; padding: 40px; color: white;">
                <p>Oops! We couldn't load the store. Try refreshing!</p>
                <button class="btn" style="background: rgba(255, 255, 255, 0.2);" onclick="loadStoreRewards()">Try Again</button>
            </div>
        `;
    }
}

function renderStoreRewards() {
    const container = document.getElementById('store-content');
    
    if (storeRewards.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: white;">
                <div style="font-size: 48px; margin-bottom: 20px;">🏪</div>
                <h3>Store is Empty!</h3>
                <p>Ask your parent to add some awesome rewards!</p>
            </div>
        `;
        return;
    }
    
    // Group rewards by category
    const rewardsByCategory = {};
    storeRewards.forEach(reward => {
        if (!rewardsByCategory[reward.category_name]) {
            rewardsByCategory[reward.category_name] = [];
        }
        rewardsByCategory[reward.category_name].push(reward);
    });
    
    container.innerHTML = `
        <div class="store-grid">
            ${Object.entries(rewardsByCategory).map(([categoryName, categoryRewards]) => `
                <div class="store-category">
                    <h3 style="color: white; margin-bottom: 15px; display: flex; align-items: center;">
                        <span style="margin-right: 10px;">${categoryRewards[0]?.category_icon || '🎁'}</span>
                        ${categoryName}
                    </h3>
                    <div class="reward-store-grid">
                        ${categoryRewards.map(reward => {
                            const canAfford = childInfo.balance >= reward.cost;
                            const inStock = reward.stock_remaining > 0 || reward.stock_remaining === -1;
                            const canBuy = canAfford && inStock && reward.is_active;
                            
                            return `
                                <div class="store-reward-item ${!canBuy ? 'unavailable' : ''}" style="background: rgba(255, 255, 255, 0.1); color: white;">
                                    <div class="reward-icon-big">${reward.icon}</div>
                                    <h4>${reward.name}</h4>
                                    ${reward.description ? `<p style="opacity: 0.8; font-size: 13px;">${reward.description}</p>` : ''}
                                    <div class="reward-price">🪙 ${reward.cost}</div>
                                    <div class="reward-type-badge">
                                        ${reward.type === 'instant' ? '⚡ Instant' : 
                                          reward.type === 'scheduled' ? '📅 Scheduled' : 
                                          '✋ Parent Approval'}
                                    </div>
                                    ${reward.stock_quantity !== -1 ? 
                                        `<div class="stock-info">Stock: ${reward.stock_remaining}</div>` : ''}
                                    
                                    ${canBuy ? `
                                        <button class="btn btn-success store-buy-btn" onclick="purchaseReward(${reward.id})" style="background: #00b894;">
                                            🛒 Buy Now
                                        </button>
                                    ` : `
                                        <button class="btn btn-secondary store-buy-btn" disabled>
                                            ${!canAfford ? '💰 Need More Coins' : 
                                              !inStock ? '📦 Out of Stock' : 
                                              '❌ Unavailable'}
                                        </button>
                                    `}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function purchaseReward(rewardId) {
    const reward = storeRewards.find(r => r.id === rewardId);
    if (!reward) return;
    
    if (childInfo.balance < reward.cost) {
        alert('You need more coins to buy this reward! Keep completing tasks! 💪');
        return;
    }
    
    if (!confirm(`Buy "${reward.name}" for 🪙 ${reward.cost} coins?`)) {
        return;
    }
    
    try {
        const response = await fetch('/api/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rewardId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update balance immediately
            childInfo.balance -= reward.cost;
            document.getElementById('balance').textContent = childInfo.balance;
            
            // Show success message
            if (reward.type === 'instant') {
                showPurchaseSuccess(`🎉 You got "${reward.name}"! Enjoy it right away!`);
            } else {
                showPurchaseSuccess(`🛒 Purchase request sent! Your parent will review "${reward.name}" soon.`);
            }
            
            // Refresh store and purchases
            loadStoreRewards();
            loadChildInfo(); // Refresh to get accurate balance
        } else {
            alert('Purchase failed: ' + data.error);
            loadChildInfo(); // Refresh balance in case it changed
        }
    } catch (error) {
        alert('Something went wrong with your purchase. Please try again!');
        loadChildInfo(); // Refresh balance
    }
}

async function loadMyPurchases() {
    try {
        const response = await fetch('/api/my-purchases');
        myPurchases = await response.json();
        renderMyPurchases();
    } catch (error) {
        console.error('Error loading purchases:', error);
        document.getElementById('purchases-content').innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p>Oops! Couldn't load your purchases. Try again!</p>
            </div>
        `;
    }
}

function renderMyPurchases() {
    const container = document.getElementById('purchases-content');
    
    if (myPurchases.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">📦</div>
                <h3>No Purchases Yet!</h3>
                <p>When you buy rewards, they'll appear here!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="purchase-history">
            ${myPurchases.map(purchase => `
                <div class="purchase-item status-${purchase.status}">
                    <div class="purchase-info">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div class="reward-icon-medium">${purchase.reward_icon}</div>
                            <div>
                                <h4>${purchase.reward_name}</h4>
                                <div style="opacity: 0.7; font-size: 14px;">
                                    Cost: 🪙 ${purchase.cost} coins • 
                                    ${new Date(purchase.created_at).toLocaleDateString()}
                                </div>
                                ${purchase.reward_description ? `<p style="margin-top: 5px; font-size: 13px; opacity: 0.8;">${purchase.reward_description}</p>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="purchase-status status-${purchase.status}">
                        ${purchase.status === 'pending' ? '⏳ Waiting for Parent' :
                          purchase.status === 'approved' ? '✅ Approved! Enjoy!' :
                          '❌ Not This Time'}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function showMyPurchases() {
    loadMyPurchases();
    document.getElementById('store-content').style.display = 'none';
    document.getElementById('purchases-section').style.display = 'block';
}

function hidePurchases() {
    document.getElementById('purchases-section').style.display = 'none';
    document.getElementById('store-content').style.display = 'block';
}

function refreshStore() {
    loadStoreRewards();
    loadChildInfo();
}

function showPurchaseSuccess(message) {
    // Reuse the celebration modal with custom message
    document.getElementById('celebration-message').textContent = message;
    document.getElementById('celebration-modal').classList.add('show');
}

// Refresh functions
function refreshTasks() {
    loadTasks();
    loadChildInfo();
}

// Logout function
async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/child-login.html';
    } catch (error) {
        window.location.href = '/child-login.html';
    }
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// Add some fun animations
function addSparkles() {
    // This could be enhanced with more animations
    const sparkles = ['✨', '🌟', '⭐', '💫'];
    const randomSparkle = sparkles[Math.floor(Math.random() * sparkles.length)];
    
    const sparkleElement = document.createElement('div');
    sparkleElement.textContent = randomSparkle;
    sparkleElement.style.position = 'fixed';
    sparkleElement.style.fontSize = '24px';
    sparkleElement.style.pointerEvents = 'none';
    sparkleElement.style.zIndex = '9999';
    sparkleElement.style.left = Math.random() * window.innerWidth + 'px';
    sparkleElement.style.top = Math.random() * window.innerHeight + 'px';
    sparkleElement.style.animation = 'sparkle 2s ease-out forwards';
    
    document.body.appendChild(sparkleElement);
    
    setTimeout(() => {
        sparkleElement.remove();
    }, 2000);
}

// Add CSS for sparkle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkle {
        0% {
            opacity: 1;
            transform: scale(0) rotate(0deg);
        }
        50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
        }
        100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
        }
    }
`;
document.head.appendChild(style);