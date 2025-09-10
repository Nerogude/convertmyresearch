let currentTaskId = null;
let tasks = [];
let childInfo = {};
let storeRewards = [];
let myPurchases = [];
let wishlistItems = [];
let currentStoreTab = 'store'; // 'store' or 'wishlist'

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
    loadBills();
    loadWeeklyProgress();
    loadStreakCalendar();
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
    
    // Update today's progress
    updateTodayProgress();
    
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
    
    // Add completion animation to task item
    const taskItems = document.querySelectorAll('.task-item');
    taskItems.forEach(item => {
        const button = item.querySelector(`button[onclick*="${taskId}"]`);
        if (button) {
            item.classList.add('task-completed');
            // Trigger sparkles
            addSparkles(item);
        }
    });
    
    document.getElementById('photo-modal').classList.add('show');
}

// Photo form submission
document.getElementById('photo-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = '📤 Uploading...';
    submitButton.disabled = true;
    submitButton.classList.add('loading-pulse');
    
    const formData = new FormData();
    formData.append('taskId', currentTaskId);
    
    const photoFile = document.getElementById('task-photo').files[0];
    if (photoFile) {
        formData.append('photo', photoFile);
    }
    
    try {
        await submitCompletion(formData);
    } finally {
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        submitButton.classList.remove('loading-pulse');
    }
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
            // Show coin earning animation if task has points
            const task = tasks.find(t => t.id == formData.get('taskId'));
            if (task && task.points_value > 0) {
                showCoinEarning(task.points_value);
            }
            
            closePhotoModal();
            showCelebration();
            loadTasks(); // Refresh tasks
            loadChildInfo(); // Refresh balance
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
    
    // Play success sound
    playSuccessSound();
    
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
                                    
                                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                                        ${canBuy ? `
                                            <button class="btn btn-success store-buy-btn" onclick="purchaseReward(${reward.id})" style="background: #00b894; flex: 1;">
                                                🛒 Buy Now
                                            </button>
                                        ` : `
                                            <button class="btn btn-secondary store-buy-btn" disabled style="flex: 1;">
                                                ${!canAfford ? '💰 Need More Coins' : 
                                                  !inStock ? '📦 Out of Stock' : 
                                                  '❌ Unavailable'}
                                            </button>
                                        `}
                                        <button class="btn" onclick="addToWishlist(${reward.id})" style="background: #fdcb6e; padding: 10px;" title="Add to wishlist">
                                            ⭐
                                        </button>
                                    </div>
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
        showPurchaseError('You need more coins to buy this reward! Keep completing tasks! 💪');
        return;
    }
    
    // Show purchase confirmation modal
    showPurchaseModal(reward);
}

function showPurchaseModal(reward) {
    const modal = document.getElementById('purchase-modal');
    const detailsContainer = document.getElementById('purchase-details');
    const newBalance = childInfo.balance - reward.cost;
    
    detailsContainer.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 64px; margin-bottom: 15px;">${reward.icon}</div>
            <h3 style="margin-bottom: 10px;">${reward.name}</h3>
            ${reward.description ? `<p style="opacity: 0.8; margin-bottom: 15px;">${reward.description}</p>` : ''}
            
            <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 15px; margin: 20px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Cost:</span>
                    <span>🪙 ${reward.cost}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Current Balance:</span>
                    <span>🪙 ${childInfo.balance}</span>
                </div>
                <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px; margin-top: 10px;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold;">
                        <span>After Purchase:</span>
                        <span>🪙 ${newBalance}</span>
                    </div>
                </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 10px; margin: 15px 0;">
                <div style="font-size: 14px; opacity: 0.9;">
                    ${reward.type === 'instant' ? '⚡ You\'ll get this reward immediately!' : 
                      reward.type === 'scheduled' ? '📅 Your parent will schedule when you get this reward' : 
                      '👍 Your parent will review and approve this purchase'}
                </div>
            </div>
        </div>
    `;
    
    // Set up confirm button
    document.getElementById('confirm-purchase-btn').onclick = () => confirmPurchase(reward.id);
    
    modal.classList.add('show');
}

function closePurchaseModal() {
    document.getElementById('purchase-modal').classList.remove('show');
}

async function confirmPurchase(rewardId) {
    const reward = storeRewards.find(r => r.id === rewardId);
    if (!reward) return;
    
    closePurchaseModal();
    
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
            
            // Show animated success message
            if (reward.type === 'instant') {
                showEnhancedCelebration(`🎉 You got "${reward.name}"! Enjoy it right away!`, reward.icon);
            } else {
                showEnhancedCelebration(`🛒 Purchase successful! Your parent will review "${reward.name}" soon.`, reward.icon);
            }
            
            // Refresh store and purchases
            loadStoreRewards();
            loadMyPurchases();
            
            // Remove from wishlist if it was there
            if (currentStoreTab === 'wishlist') {
                removeFromWishlist(rewardId);
            }
        } else {
            showPurchaseError(data.error || 'Purchase failed');
        }
    } catch (error) {
        console.error('Error processing purchase:', error);
        showPurchaseError('Something went wrong! Please try again.');
    }
}

function showPurchaseError(message) {
    // Show error in celebration modal with different styling
    document.getElementById('celebration-message').textContent = message;
    const modal = document.getElementById('celebration-modal');
    const content = modal.querySelector('.modal-content');
    content.style.background = 'linear-gradient(135deg, #e17055, #d63031)';
    modal.classList.add('show');
    
    // Add shake animation
    content.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        content.style.animation = '';
    }, 500);
}

function showEnhancedCelebration(message, icon) {
    const modal = document.getElementById('celebration-modal');
    const content = modal.querySelector('.modal-content');
    const iconElement = content.querySelector('div');
    const messageElement = document.getElementById('celebration-message');
    
    // Reset to success styling
    content.style.background = 'linear-gradient(135deg, #fdcb6e, #e17055)';
    
    // Update content
    messageElement.textContent = message;
    iconElement.innerHTML = `${icon || '🎉'}`;
    
    // Add purchase celebration animation
    content.style.animation = 'purchasePop 0.8s ease-out';
    
    modal.classList.add('show');
    
    setTimeout(() => {
        content.style.animation = '';
    }, 800);
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

// Wishlist functionality
function showStoreTab() {
    currentStoreTab = 'store';
    document.getElementById('store-tab-btn').className = 'btn active-store-tab';
    document.getElementById('store-tab-btn').style.background = 'rgba(255, 255, 255, 0.3)';
    document.getElementById('store-tab-btn').style.border = '2px solid rgba(255, 255, 255, 0.4)';
    
    document.getElementById('wishlist-tab-btn').className = 'btn';
    document.getElementById('wishlist-tab-btn').style.background = 'rgba(255, 255, 255, 0.2)';
    document.getElementById('wishlist-tab-btn').style.border = '2px solid rgba(255, 255, 255, 0.3)';
    
    document.getElementById('store-content').style.display = 'block';
    document.getElementById('wishlist-content').style.display = 'none';
}

function showWishlistTab() {
    currentStoreTab = 'wishlist';
    document.getElementById('wishlist-tab-btn').className = 'btn active-store-tab';
    document.getElementById('wishlist-tab-btn').style.background = 'rgba(255, 255, 255, 0.3)';
    document.getElementById('wishlist-tab-btn').style.border = '2px solid rgba(255, 255, 255, 0.4)';
    
    document.getElementById('store-tab-btn').className = 'btn';
    document.getElementById('store-tab-btn').style.background = 'rgba(255, 255, 255, 0.2)';
    document.getElementById('store-tab-btn').style.border = '2px solid rgba(255, 255, 255, 0.3)';
    
    document.getElementById('store-content').style.display = 'none';
    document.getElementById('wishlist-content').style.display = 'block';
    
    loadWishlist();
}

async function loadWishlist() {
    try {
        const response = await fetch('/api/wishlist');
        if (!response.ok) throw new Error('Failed to fetch wishlist');
        
        wishlistItems = await response.json();
        renderWishlist();
    } catch (error) {
        console.error('Error loading wishlist:', error);
        document.getElementById('wishlist-content').innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">😔</div>
                <h3>Couldn't load your wishlist</h3>
                <p>Something went wrong loading your saved rewards</p>
                <button class="btn" style="background: rgba(255, 255, 255, 0.2);" onclick="loadWishlist()">Try Again</button>
            </div>
        `;
    }
}

function renderWishlist() {
    const wishlistContainer = document.getElementById('wishlist-content');
    
    if (wishlistItems.length === 0) {
        wishlistContainer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">⭐</div>
                <h3>Your wishlist is empty!</h3>
                <p>Add rewards you want to save for later by clicking the ⭐ button on any item in the store!</p>
                <button class="btn" style="background: rgba(255, 255, 255, 0.3); margin-top: 20px;" onclick="showStoreTab()">Browse Store</button>
            </div>
        `;
        return;
    }

    // Group by category like store
    const rewardsByCategory = {};
    wishlistItems.forEach(item => {
        if (!rewardsByCategory[item.category_name]) {
            rewardsByCategory[item.category_name] = [];
        }
        rewardsByCategory[item.category_name].push(item);
    });

    wishlistContainer.innerHTML = `
        <div style="padding: 20px;">
            <div style="margin-bottom: 20px; text-align: center;">
                <h3>⭐ Your Wishlist (${wishlistItems.length} items)</h3>
                <p style="opacity: 0.8;">Save up coins for these awesome rewards!</p>
            </div>
            
            ${Object.entries(rewardsByCategory).map(([categoryName, categoryRewards]) => `
                <div class="reward-category" style="margin-bottom: 30px;">
                    <h4 style="display: flex; align-items: center; margin-bottom: 15px;">
                        <span style="margin-right: 10px;">${categoryRewards[0]?.category_icon || '🎁'}</span>
                        ${categoryName}
                    </h4>
                    <div class="reward-store-grid">
                        ${categoryRewards.map(reward => {
                            const canAfford = childInfo.balance >= reward.cost;
                            const inStock = reward.stock_remaining > 0 || reward.stock_remaining === -1;
                            const canBuy = canAfford && inStock && reward.is_active;
                            const progress = Math.min((childInfo.balance / reward.cost) * 100, 100);
                            
                            return `
                                <div class="store-reward-item ${!canBuy ? 'unavailable' : ''}" style="background: rgba(255, 255, 255, 0.1); color: white; position: relative;">
                                    <div class="reward-icon-big">${reward.icon}</div>
                                    <h4>${reward.name}</h4>
                                    ${reward.description ? `<p style="opacity: 0.8; font-size: 13px;">${reward.description}</p>` : ''}
                                    <div class="reward-price">🪙 ${reward.cost}</div>
                                    
                                    <!-- Savings Progress Bar -->
                                    <div style="margin: 10px 0;">
                                        <div style="background: rgba(255,255,255,0.2); border-radius: 10px; height: 6px; overflow: hidden;">
                                            <div style="background: ${canAfford ? '#00b894' : '#fdcb6e'}; width: ${progress}%; height: 100%; transition: width 0.3s;"></div>
                                        </div>
                                        <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">
                                            ${canAfford ? '✅ Ready to buy!' : `Need 🪙 ${reward.cost - childInfo.balance} more`}
                                        </div>
                                    </div>
                                    
                                    <div class="reward-type-badge">
                                        ${reward.type === 'instant' ? '⚡ Instant' : 
                                          reward.type === 'scheduled' ? '📅 Scheduled' : 
                                          '👍 Parent Approval'}
                                    </div>
                                    ${reward.stock_quantity !== -1 ? 
                                        `<div class="stock-info">Stock: ${reward.stock_remaining}</div>` : ''}
                                    
                                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                                        ${canBuy ? `
                                            <button class="btn btn-success store-buy-btn" onclick="purchaseReward(${reward.reward_id})" style="background: #00b894; flex: 1;">
                                                🛒 Buy Now
                                            </button>
                                        ` : `
                                            <button class="btn btn-secondary store-buy-btn" disabled style="flex: 1;">
                                                ${!canAfford ? '💰 Need More Coins' : 
                                                  !inStock ? '📦 Out of Stock' : 
                                                  '❌ Unavailable'}
                                            </button>
                                        `}
                                        <button class="btn" onclick="removeFromWishlist(${reward.reward_id})" style="background: #e17055; padding: 10px;">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function addToWishlist(rewardId) {
    try {
        const response = await fetch('/api/wishlist/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rewardId })
        });
        
        if (response.ok) {
            showPurchaseSuccess('⭐ Added to wishlist!');
            // Update the store display to show it's been added
            renderStoreRewards();
        } else {
            alert('Failed to add to wishlist');
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        alert('Something went wrong!');
    }
}

async function removeFromWishlist(rewardId) {
    if (!confirm('Remove this item from your wishlist?')) return;
    
    try {
        const response = await fetch('/api/wishlist/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rewardId })
        });
        
        if (response.ok) {
            // Remove from local array and re-render
            wishlistItems = wishlistItems.filter(item => item.reward_id !== rewardId);
            renderWishlist();
            showPurchaseSuccess('🗑️ Removed from wishlist!');
        } else {
            alert('Failed to remove from wishlist');
        }
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        alert('Something went wrong!');
    }
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

// Enhanced animation functions
function addSparkles(targetElement = document.body) {
    const sparkles = ['✨', '🌟', '⭐', '💫', '🎉'];
    
    // Create multiple sparkles
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const randomSparkle = sparkles[Math.floor(Math.random() * sparkles.length)];
            const sparkleElement = document.createElement('div');
            sparkleElement.textContent = randomSparkle;
            sparkleElement.classList.add('sparkle');
            sparkleElement.style.fontSize = Math.random() * 10 + 20 + 'px';
            
            if (targetElement === document.body) {
                sparkleElement.style.left = Math.random() * window.innerWidth + 'px';
                sparkleElement.style.top = Math.random() * window.innerHeight + 'px';
            } else {
                const rect = targetElement.getBoundingClientRect();
                sparkleElement.style.left = rect.left + Math.random() * rect.width + 'px';
                sparkleElement.style.top = rect.top + Math.random() * rect.height + 'px';
            }
            
            document.body.appendChild(sparkleElement);
            
            setTimeout(() => {
                sparkleElement.remove();
            }, 2000);
        }, i * 200);
    }
}

function showCoinEarning(points) {
    const balanceElement = document.getElementById('balance');
    const rect = balanceElement.getBoundingClientRect();
    
    // Play coin earning sound
    playCoinSound();
    
    // Create floating coin animation
    const coinElement = document.createElement('div');
    coinElement.textContent = `+${points} 🪙`;
    coinElement.classList.add('coin-float');
    coinElement.style.left = rect.left + 'px';
    coinElement.style.top = rect.top + 'px';
    coinElement.style.color = '#f39c12';
    coinElement.style.fontWeight = 'bold';
    
    document.body.appendChild(coinElement);
    
    // Remove after animation
    setTimeout(() => {
        coinElement.remove();
    }, 2000);
    
    // Add sparkles around the balance
    addSparkles(balanceElement);
}

// Enhanced button feedback
function enhanceButtonFeedback() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Sound effects using Web Audio API
function createAudioContext() {
    try {
        return new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
        return null;
    }
}

let audioContext = null;

function playCoinSound() {
    // Create audio context on first use (required by browsers)
    if (!audioContext) {
        audioContext = createAudioContext();
        if (!audioContext) return; // Browser doesn't support Web Audio
    }
    
    // Resume context if suspended (required by browsers)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // Create oscillator for coin sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Coin sound: rising frequency with quick decay
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    // Play sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playSuccessSound() {
    if (!audioContext) {
        audioContext = createAudioContext();
        if (!audioContext) return;
    }
    
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // Success sound: cheerful ascending notes
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, index) => {
        setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        }, index * 100);
    });
}

// Progress Visualization Functions
let progressData = [];
let streakCalendarData = [];

async function loadWeeklyProgress() {
    try {
        const response = await fetch('/api/child-progress');
        progressData = await response.json();
        renderWeeklyChart();
        updateTodayProgress();
    } catch (error) {
        console.error('Error loading weekly progress:', error);
        document.getElementById('weekly-chart').innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p>Unable to load progress data. Please try refreshing.</p>
            </div>
        `;
    }
}

async function loadStreakCalendar() {
    try {
        const response = await fetch('/api/child-streak-calendar');
        streakCalendarData = await response.json();
        renderStreakCalendar();
    } catch (error) {
        console.error('Error loading streak calendar:', error);
        document.getElementById('calendar-container').innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p>Unable to load calendar data. Please try refreshing.</p>
            </div>
        `;
    }
}

function renderWeeklyChart() {
    const container = document.getElementById('weekly-chart');
    const maxTasks = Math.max(...progressData.map(d => d.completed_tasks), 1);
    
    const chartBars = progressData.map(day => {
        const height = (day.completed_tasks / maxTasks) * 100;
        const date = new Date(day.date);
        const dayLabel = date.getDate();
        
        return `
            <div class="chart-bar" style="height: ${height}%">
                <div class="chart-bar-value">${day.completed_tasks} tasks</div>
                <div class="chart-bar-label">${dayLabel}</div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        <div class="bar-chart">${chartBars}</div>
    `;
    
    // Calculate and show summary stats
    const totalTasks = progressData.reduce((sum, day) => sum + day.completed_tasks, 0);
    const totalCoins = progressData.reduce((sum, day) => sum + day.coins_earned, 0);
    const activeDays = progressData.filter(day => day.completed_tasks > 0).length;
    const avgTasksPerDay = totalTasks / 30;
    
    document.getElementById('weekly-stats').innerHTML = `
        <div class="stat-summary-item">
            <div class="stat-summary-number">${totalTasks}</div>
            <div class="stat-summary-label">Total Tasks</div>
        </div>
        <div class="stat-summary-item">
            <div class="stat-summary-number">${totalCoins}</div>
            <div class="stat-summary-label">Coins Earned</div>
        </div>
        <div class="stat-summary-item">
            <div class="stat-summary-number">${activeDays}</div>
            <div class="stat-summary-label">Active Days</div>
        </div>
        <div class="stat-summary-item">
            <div class="stat-summary-number">${avgTasksPerDay.toFixed(1)}</div>
            <div class="stat-summary-label">Avg Per Day</div>
        </div>
    `;
}

function renderStreakCalendar() {
    const container = document.getElementById('calendar-container');
    const today = new Date().toISOString().split('T')[0];
    
    const calendarDays = streakCalendarData.map(day => {
        let className = 'calendar-day no-tasks';
        if (day.completed_tasks > 0) {
            className = day.streak_day ? 'calendar-day full-complete' : 'calendar-day partial-complete';
        }
        if (day.date === today) {
            className += ' today';
        }
        
        const date = new Date(day.date);
        const dayNum = date.getDate();
        
        return `
            <div class="${className}" title="${day.date}: ${day.completed_tasks} tasks completed">
                ${dayNum}
            </div>
        `;
    }).join('');
    
    container.innerHTML = calendarDays;
}

function updateTodayProgress() {
    const today = new Date().toISOString().split('T')[0];
    const todayData = progressData.find(day => day.date === today);
    
    if (todayData && tasks.length > 0) {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completion_status).length;
        const percentage = Math.round((completedTasks / totalTasks) * 100);
        
        document.getElementById('today-progress-fill').style.width = percentage + '%';
        document.getElementById('today-percentage').textContent = percentage + '%';
    }
}

function showWeeklyChart() {
    document.getElementById('weekly-progress').style.display = 'block';
    document.getElementById('streak-calendar').style.display = 'none';
}

function showStreakCalendar() {
    document.getElementById('weekly-progress').style.display = 'none';
    document.getElementById('streak-calendar').style.display = 'block';
}

// Bills Management Functions
let bills = [];
let billPayments = [];

async function loadBills() {
    try {
        const response = await fetch('/api/child-bills');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        bills = await response.json();
        console.log('Loaded bills:', bills); // Debug logging
        renderBills();
    } catch (error) {
        console.error('Error loading bills:', error);
        document.getElementById('bills-content').innerHTML = `
            <div style="text-align: center; padding: 40px; color: white;">
                <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                <h3>Unable to load bills</h3>
                <p>Error: ${error.message}</p>
                <button class="btn" style="background: rgba(255, 255, 255, 0.2); margin-top: 20px;" onclick="loadBills()">🔄 Try Again</button>
            </div>
        `;
    }
}

function renderBills() {
    const container = document.getElementById('bills-content');
    console.log('Rendering bills:', bills.length, 'bills found'); // Debug logging
    
    if (bills.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: white;">
                <div style="font-size: 48px; margin-bottom: 20px;">💳</div>
                <h3>No Bills Yet!</h3>
                <p>Your parents haven't set up any bills for you.</p>
                <p style="font-size: 12px; opacity: 0.6; margin-top: 20px;">Debug: ${bills.length} bills loaded</p>
            </div>
        `;
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    container.innerHTML = `
        <div class="bills-grid">
            ${bills.map(bill => {
                const dueDate = new Date(bill.next_due_date);
                const isOverdue = bill.next_due_date <= today;
                const canAfford = childInfo.balance >= bill.amount;
                
                return `
                    <div class="bill-item ${isOverdue ? 'overdue' : ''}" style="background: rgba(255, 255, 255, 0.1); color: white; margin-bottom: 15px; padding: 20px; border-radius: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="font-size: 32px;">${bill.icon}</div>
                                <div>
                                    <h4 style="color: white; margin-bottom: 5px;">${bill.name}</h4>
                                    ${bill.description ? `<p style="opacity: 0.8; font-size: 14px; margin-bottom: 5px;">${bill.description}</p>` : ''}
                                    <div style="display: flex; gap: 15px; font-size: 13px;">
                                        <span>💰 ${bill.amount} coins</span>
                                        <span>📅 Due: ${dueDate.toLocaleDateString()}</span>
                                        <span>🔄 ${bill.frequency}</span>
                                    </div>
                                    ${isOverdue ? `<div style="color: #ffeb3b; font-weight: bold; margin-top: 5px;">⚠️ OVERDUE!</div>` : ''}
                                </div>
                            </div>
                            <div>
                                ${canAfford ? `
                                    <button class="btn" style="background: #00b894; color: white;" onclick="payBill(${bill.id})">
                                        💳 Pay Now
                                    </button>
                                ` : `
                                    <button class="btn" style="background: #636e72; color: white;" disabled>
                                        💰 Need More Coins
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

async function payBill(billId) {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;
    
    if (!confirm(`Pay "${bill.name}" for ${bill.amount} coins?`)) {
        return;
    }
    
    try {
        const response = await fetch('/api/pay-bill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ billId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Play coin spending sound (negative version)
            playBillPaymentSound();
            
            // Show payment success
            showBillPaymentSuccess(`💳 "${bill.name}" paid successfully!`);
            
            // Refresh data
            loadBills();
            loadChildInfo(); // Refresh balance
        } else {
            alert('Payment failed: ' + data.error);
        }
    } catch (error) {
        alert('Something went wrong with your payment. Please try again!');
    }
}

async function loadBillHistory() {
    try {
        const response = await fetch('/api/child-bill-payments');
        billPayments = await response.json();
        renderBillHistory();
    } catch (error) {
        console.error('Error loading bill history:', error);
        document.getElementById('bill-history-content').innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p>Unable to load payment history. Please try refreshing.</p>
            </div>
        `;
    }
}

function renderBillHistory() {
    const container = document.getElementById('bill-history-content');
    
    if (billPayments.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">📋</div>
                <h3>No Payments Yet!</h3>
                <p>Your bill payment history will appear here once you start paying bills.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="payment-history">
            ${billPayments.map(payment => `
                <div class="payment-item" style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="font-size: 24px;">${payment.bill_icon}</div>
                            <div>
                                <h4 style="margin-bottom: 5px;">${payment.bill_name}</h4>
                                <div style="font-size: 13px; color: #636e72;">
                                    ${new Date(payment.payment_date).toLocaleDateString()} • ${payment.amount} coins
                                </div>
                            </div>
                        </div>
                        <div style="color: #00b894; font-weight: bold;">
                            ✅ Paid
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function showBillHistory() {
    loadBillHistory();
    document.getElementById('bills-content').style.display = 'none';
    document.getElementById('bill-history-section').style.display = 'block';
}

function hideBillHistory() {
    document.getElementById('bill-history-section').style.display = 'none';
    document.getElementById('bills-content').style.display = 'block';
}

function refreshBills() {
    loadBills();
    loadChildInfo();
}

function showBillPaymentSuccess(message) {
    // Reuse the celebration modal with custom message
    document.getElementById('celebration-message').textContent = message;
    document.getElementById('celebration-modal').classList.add('show');
}

function playBillPaymentSound() {
    if (!audioContext) {
        audioContext = createAudioContext();
        if (!audioContext) return;
    }
    
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // Bill payment sound: descending tone (spending money)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Descending frequency for bill payment
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

// Initialize enhanced feedback on page load
window.addEventListener('load', enhanceButtonFeedback);