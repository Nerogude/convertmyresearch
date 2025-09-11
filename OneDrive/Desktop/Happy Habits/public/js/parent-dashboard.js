let children = [];
let tasks = [];
let completions = [];
let taskCompletions = [];
let userProfile = {};
let selectedAvatar = 'child-1';
let editingTaskId = null;
let rewards = [];
let categories = [];
let purchases = [];
let editingRewardId = null;
let bills = [];
let editingBillId = null;
let currentApprovalFilter = 'pending'; // pending, recent, all
let currentCompletionFilter = 'pending'; // pending, approved, rejected, all
let currentTaskFilter = 'due-today'; // due-today, active, study, chore, all
let approvalStats = {};
let subscriptionStatus = {};

// Quick comment suggestions
const quickComments = [
    'Well done! 🎉',
    'Great job! 🎆',
    'Keep it up! 💪',
    'Fantastic work! ⭐',
    'So proud of you! ❤️',
    'Amazing effort! 🏆',
    'You\'re crushing it! 🚀',
    'Keep going! 🔥',
    'Excellent! 🌟',
    'Outstanding! 🌈'
];

// Avatar mapping
const avatarEmojis = {
    'child-1': '👶',
    'child-2': '👧',
    'child-3': '👦',
    'child-4': '🧒',
    'child-5': '👨‍🎓',
    'child-6': '👩‍🎓',
    'child-7': '🏃‍♂️',
    'child-8': '🏃‍♀️',
    'child-9': '🎨',
    'child-10': '🎮',
    'child-11': '🎵',
    'child-12': '⚽'
};

// Initialize dashboard
window.addEventListener('load', () => {
    loadUserProfile();
    loadChildren();
    loadTaskFilter();
    loadCompletionFilter();
    loadCompletions();
    loadWeeklyStats();
    loadPendingCount();
    setupAvatarSelection();
    setupFamilyPhotoUpload();
    setupEmojiPicker();
    loadBills();
    loadSubscriptionStatus();
    loadAnalytics();
});

// Tab management
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').style.display = 'block';
    
    // Add active class to the correct nav tab
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        if (tab.textContent.trim().toLowerCase().includes(tabName) || 
            (tabName === 'tasks' && tab.textContent.trim() === 'Tasks') ||
            (tabName === 'children' && tab.textContent.trim() === 'My Children') ||
            (tabName === 'overview' && tab.textContent.trim() === 'Overview') ||
            (tabName === 'rewards' && tab.textContent.trim().includes('Rewards')) ||
            (tabName === 'bills' && tab.textContent.trim().includes('Bills')) ||
            (tabName === 'approvals' && tab.textContent.trim() === 'Approvals')) {
            tab.classList.add('active');
        }
    });
    
    // Load data for specific tabs
    if (tabName === 'approvals') {
        // Initialize the approval filter on first visit
        loadApprovalFilter();
        loadApprovalStats();
    } else if (tabName === 'tasks') {
        loadTaskFilter();
        loadCompletionFilter();
    } else if (tabName === 'rewards') {
        loadRewards();
        loadPurchases();
    } else if (tabName === 'bills') {
        loadBills();
    }
}

// Progressive Disclosure Functions
function toggleAdvancedFilters() {
    const advancedFilters = document.getElementById('advanced-filters');
    const moreFiltersBtn = document.getElementById('more-filters-btn');
    
    if (advancedFilters.style.display === 'none') {
        advancedFilters.style.display = 'block';
        moreFiltersBtn.textContent = '⚙️ Hide Filters';
        moreFiltersBtn.style.background = '#e17055';
        moreFiltersBtn.style.color = 'white';
    } else {
        advancedFilters.style.display = 'none';
        moreFiltersBtn.textContent = '⚙️ More Filters';
        moreFiltersBtn.style.background = '#f8f9fa';
        moreFiltersBtn.style.color = 'inherit';
    }
}

function checkBillsVisibility() {
    const billsTab = document.getElementById('bills-tab');
    // Show Bills tab if user has any bills or is premium
    if (bills.length > 0 || (subscriptionStatus && subscriptionStatus.isPremium)) {
        billsTab.style.display = 'block';
    } else {
        billsTab.style.display = 'none';
    }
}

// Load functions
async function loadUserProfile() {
    try {
        const response = await fetch('/api/user-profile');
        userProfile = await response.json();
        updateFamilyPhotoAndTagline();
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

async function loadChildren() {
    try {
        const response = await fetch('/api/children');
        children = await response.json();
        renderChildren();
        updateTaskChildOptions();
        loadOverview();
    } catch (error) {
        console.error('Error loading children:', error);
    }
}

async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        tasks = await response.json();
        renderTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function loadCompletions() {
    try {
        const response = await fetch('/api/pending-completions');
        completions = await response.json();
        renderCompletions();
    } catch (error) {
        console.error('Error loading completions:', error);
    }
}

async function loadAllCompletions() {
    try {
        const response = await fetch('/api/all-completions');
        const allCompletions = await response.json();
        renderAllCompletions(allCompletions);
    } catch (error) {
        console.error('Error loading all completions:', error);
    }
}

// New filtered completion loading
async function loadFilteredCompletions() {
    try {
        const response = await fetch(`/api/all-completions?filter=${currentApprovalFilter}`);
        
        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const completions = await response.json();
        console.log(`Rendering ${completions.length} completions for filter: ${currentApprovalFilter}`);
        console.log('Completion statuses:', completions.map(c => `${c.task_title}: ${c.status}`));
        renderFilteredCompletions(completions);
    } catch (error) {
        console.error('Error loading filtered completions:', error);
    }
}

async function loadApprovalStats() {
    try {
        const response = await fetch('/api/approval-stats');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        
        try {
            approvalStats = JSON.parse(text);
            renderApprovalStats();
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Response text:', text);
            // Use default stats if parsing fails
            approvalStats = {
                total_tasks: 0,
                approved_count: 0,
                pending_count: 0,
                rejected_count: 0
            };
            renderApprovalStats();
        }
    } catch (error) {
        console.error('Error loading approval stats:', error);
        // Use default stats on error
        approvalStats = {
            total_tasks: 0,
            approved_count: 0,
            pending_count: 0,
            rejected_count: 0
        };
        renderApprovalStats();
    }
}

function renderApprovalStats() {
    document.getElementById('stats-approved').textContent = approvalStats.approved_count || 0;
    document.getElementById('stats-pending').textContent = approvalStats.pending_count || 0;
    document.getElementById('stats-total').textContent = approvalStats.total_tasks || 0;
}

function setApprovalFilter(filter) {
    currentApprovalFilter = filter;
    
    // Update active button - check if elements exist first
    const filterButtons = document.querySelectorAll('.filter-btn');
    const targetButton = document.getElementById(`filter-${filter}`);
    
    if (filterButtons.length > 0 && targetButton) {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        targetButton.classList.add('active');
    }
    
    // Save preference
    localStorage.setItem('approval_filter_preference', filter);
    
    // Reload completions with new filter
    loadFilteredCompletions();
}

// Make sure function is globally accessible
window.setApprovalFilter = setApprovalFilter;

// Task Management Filter Functions
function setTaskFilter(filter) {
    console.log('setTaskFilter called with:', filter); // Debug log
    currentTaskFilter = filter;
    
    // Update active button - check both type and frequency filter containers
    const allFilterButtons = document.querySelectorAll('.task-filters .filter-btn, .task-frequency-filters .filter-btn');
    const targetButton = document.getElementById(`task-filter-${filter}`);
    
    console.log('Found buttons:', allFilterButtons.length, 'Target button:', targetButton); // Debug log
    
    if (allFilterButtons.length > 0) {
        allFilterButtons.forEach(btn => btn.classList.remove('active'));
        if (targetButton) {
            targetButton.classList.add('active');
            console.log('Set active class on button:', targetButton.id); // Debug log
        }
    }
    
    // Save preference
    localStorage.setItem('task_filter_preference', filter);
    
    // Reload tasks with new filter
    loadFilteredTasks();
}

async function loadFilteredTasks() {
    try {
        console.log('loadFilteredTasks called with filter:', currentTaskFilter); // Debug log
        const response = await fetch(`/api/tasks?filter=${currentTaskFilter}`);
        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tasks = await response.json();
        console.log('Received tasks:', tasks.length, 'tasks'); // Debug log
        renderFilteredTasks(tasks);
    } catch (error) {
        console.error('Error loading filtered tasks:', error);
    }
}

function renderFilteredTasks(filteredTasks) {
    const container = document.getElementById('tasks-content');
    
    // Add filter indicator
    const filterIndicator = getTaskFilterIndicatorHTML(filteredTasks.length);
    
    if (filteredTasks.length === 0) {
        let emptyMessage = '';
        switch(currentTaskFilter) {
            case 'active':
                emptyMessage = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
                        <h3>No active tasks</h3>
                        <p>Create your first task to get started!</p>
                    </div>
                `;
                break;
            case 'study':
                emptyMessage = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">📚</div>
                        <h3>No study tasks</h3>
                        <p>Create some study tasks to help kids learn!</p>
                    </div>
                `;
                break;
            case 'chore':
                emptyMessage = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">🧹</div>
                        <h3>No chore tasks</h3>
                        <p>Create some chore tasks to teach responsibility!</p>
                    </div>
                `;
                break;
            default:
                emptyMessage = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">📋</div>
                        <h3>No tasks found</h3>
                        <p>Click "Create Task" to add tasks for your kids!</p>
                    </div>
                `;
        }
        container.innerHTML = filterIndicator + emptyMessage;
        return;
    }
    
    container.innerHTML = filterIndicator + `
        <div class="task-list">
            ${filteredTasks.map(task => {
                const isArchived = task.archived === 1;
                const taskStatus = getTaskStatusInfo(task);
                
                return `
                <div class="task-item ${isArchived ? 'archived-task' : ''}">
                    <div class="task-info">
                        <h4>${task.title} ${taskStatus.icon}</h4>
                        <div class="task-meta">
                            <span class="task-type ${task.type.toLowerCase()}">${task.type}</span>
                            <span>For: ${task.child_name}</span>
                            <span class="frequency-badge frequency-${task.frequency}">
                                ${getFrequencyIcon(task.frequency)} ${task.frequency}
                            </span>
                            ${taskStatus.text ? `<span class="task-status">${taskStatus.text}</span>` : ''}
                        </div>
                    </div>
                    <div class="task-actions-extended">
                        <span class="points">🪙 ${task.points_value}</span>
                        ${!isArchived ? `
                            <button class="btn btn-secondary task-edit-btn" onclick="editTask(${task.id})">
                                ✏️ Edit
                            </button>
                            <button class="btn btn-warning task-archive-btn" onclick="archiveTask(${task.id})">
                                📦 Archive
                            </button>
                            <button class="btn btn-danger task-delete-btn" onclick="deleteTask(${task.id})">
                                🗑️ Delete
                            </button>
                        ` : `
                            <button class="btn btn-success task-unarchive-btn" onclick="unarchiveTask(${task.id})">
                                📤 Unarchive
                            </button>
                            <button class="btn btn-danger task-delete-btn" onclick="deleteTask(${task.id})">
                                🗑️ Delete
                            </button>
                        `}
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
}

// Helper functions for enhanced task display
function getFrequencyIcon(frequency) {
    const icons = {
        'daily': '📅',
        'weekly': '📆', 
        'one-time': '🎯'
    };
    return icons[frequency] || '📋';
}

function getTaskStatusInfo(task) {
    // This would need to be enhanced with completion data
    // For now, return basic status based on frequency
    const today = new Date().toDateString().toLowerCase().slice(0, 3);
    
    if (task.frequency === 'daily') {
        return { icon: '🔄', text: 'Daily task' };
    } else if (task.frequency === 'weekly') {
        return { icon: '📆', text: 'Weekly task' };
    } else if (task.frequency === 'one-time') {
        return { icon: '⏳', text: 'One-time task' };
    }
    
    return { icon: '', text: '' };
}

function getTaskFilterIndicatorHTML(count) {
    const filterLabels = {
        'active': '📋 Active Tasks',
        'study': '📚 Study Tasks',
        'chore': '🧹 Chore Tasks',
        'all': '📋 All Tasks',
        'daily': '📅 Daily Tasks',
        'weekly': '📆 Weekly Tasks',
        'one-time': '🎯 One-Time Tasks',
        'due-today': '⚡ Due Today',
        'archived': '📦 Archived Tasks'
    };
    
    return `
        <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-weight: bold;">Active Filter:</span>
                <span style="background: #6c5ce7; color: white; padding: 4px 12px; border-radius: 15px; font-size: 14px;">
                    ${filterLabels[currentTaskFilter] || currentTaskFilter}
                </span>
            </div>
            <div style="color: #636e72; font-size: 14px;">
                <strong>${count}</strong> task${count !== 1 ? 's' : ''} found
            </div>
        </div>
    `;
}

// Today's Completions Filter Functions
function setCompletionFilter(filter) {
    currentCompletionFilter = filter;
    
    // Update active button
    const filterButtons = document.querySelectorAll('.completion-filters .filter-btn');
    const targetButton = document.getElementById(`completion-filter-${filter}`);
    
    if (filterButtons.length > 0 && targetButton) {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        targetButton.classList.add('active');
    }
    
    // Save preference
    localStorage.setItem('completion_filter_preference', filter);
    
    // Reload completions with new filter
    loadFilteredTaskCompletions();
}

async function loadFilteredTaskCompletions() {
    try {
        const response = await fetch(`/api/todays-completions?filter=${currentCompletionFilter}`);
        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const completions = await response.json();
        renderFilteredTaskCompletions(completions);
    } catch (error) {
        console.error('Error loading filtered task completions:', error);
    }
}

function renderFilteredTaskCompletions(completions) {
    const container = document.getElementById('task-completions-content');
    
    // Add filter indicator
    const filterIndicator = getCompletionFilterIndicatorHTML(completions.length);
    
    if (completions.length === 0) {
        let emptyMessage = '';
        switch(currentCompletionFilter) {
            case 'pending':
                emptyMessage = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
                        <h3>No pending tasks today!</h3>
                        <p>All task completions have been reviewed!</p>
                    </div>
                `;
                break;
            case 'approved':
                emptyMessage = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
                        <h3>No approved tasks today</h3>
                        <p>Approved tasks will appear here.</p>
                    </div>
                `;
                break;
            case 'rejected':
                emptyMessage = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                        <h3>No rejected tasks today</h3>
                        <p>Great! No tasks were rejected today.</p>
                    </div>
                `;
                break;
            default:
                emptyMessage = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">📋</div>
                        <h3>No completions today</h3>
                        <p>When kids complete tasks today, they'll appear here!</p>
                    </div>
                `;
        }
        container.innerHTML = filterIndicator + emptyMessage;
        return;
    }
    
    container.innerHTML = filterIndicator + `
        <div class="task-list">
            ${completions.map(completion => `
                <div class="task-completion-item completion-${completion.status || 'pending'}">
                    <div class="task-info">
                        <h4>
                            ${completion.title}
                            <span class="completion-status-badge ${completion.status || 'pending'}">
                                ${getStatusDisplay(completion.status || 'pending')}
                            </span>
                        </h4>
                        <div class="task-meta">
                            <span class="task-type ${completion.type.toLowerCase()}">${completion.type}</span>
                            <span>By: ${completion.child_name}</span>
                            <span>Worth: 🪙 ${completion.points_value} coins</span>
                            ${completion.photo_path ? '<span>📸 Photo proof submitted</span>' : ''}
                            <span>Completed: ${new Date(completion.created_at).toLocaleString()}</span>
                        </div>
                        ${completion.comment ? `
                            <div style="margin-top: 10px; padding: 8px; background: rgba(108, 92, 231, 0.1); border-radius: 8px; font-style: italic;">
                                💬 "${completion.comment}"
                            </div>
                        ` : ''}
                    </div>
                    
                    ${completion.status === 'pending' ? `
                        <div class="approval-actions-section">
                            <div class="quick-comment-buttons">
                                ${quickComments.slice(0, 5).map(comment => `
                                    <button class="quick-comment-btn" onclick="setQuickComment(${completion.id}, '${comment}')">
                                        ${comment}
                                    </button>
                                `).join('')}
                            </div>
                            <textarea class="comment-input" id="task-comment-${completion.id}" 
                                     placeholder="Add your comment (optional)..." rows="2"></textarea>
                            <div style="display: flex; gap: 10px;">
                                <button class="btn btn-success" onclick="approveTaskCompletion(${completion.id}, 'approve')" style="flex: 1;">
                                    ✅ Approve
                                </button>
                                <button class="btn btn-danger" onclick="approveTaskCompletion(${completion.id}, 'reject')" style="flex: 1;">
                                    ❌ Reject
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function getCompletionFilterIndicatorHTML(count) {
    const filterLabels = {
        'pending': '🟡 Pending Only',
        'approved': '✅ Approved Today',
        'rejected': '❌ Rejected Today',
        'all': '📋 All Today'
    };
    
    return `
        <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-weight: bold;">Active Filter:</span>
                <span style="background: #6c5ce7; color: white; padding: 4px 12px; border-radius: 15px; font-size: 14px;">
                    ${filterLabels[currentCompletionFilter]}
                </span>
            </div>
            <div style="color: #636e72; font-size: 14px;">
                <strong>${count}</strong> completion${count !== 1 ? 's' : ''} found
            </div>
        </div>
    `;
}

// Task search functionality
function searchTasks() {
    const searchTerm = document.getElementById('task-search').value.toLowerCase();
    const taskItems = document.querySelectorAll('#tasks-content .task-item');
    
    taskItems.forEach(item => {
        const title = item.querySelector('.task-info h3')?.textContent.toLowerCase() || '';
        const childName = item.querySelector('.task-meta')?.textContent.toLowerCase() || '';
        
        if (title.includes(searchTerm) || childName.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// Archive task functionality
async function archiveTask(taskId) {
    if (!confirm('Archive this task? It will be moved to archived tasks.')) return;
    
    try {
        const response = await fetch(`/api/tasks/${taskId}/archive`, {
            method: 'PUT'
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadFilteredTasks(); // Refresh the current view
        } else {
            alert('Error archiving task');
        }
    } catch (error) {
        console.error('Error archiving task:', error);
        alert('Error archiving task');
    }
}

// Unarchive task functionality
async function unarchiveTask(taskId) {
    if (!confirm('Unarchive this task? It will become active again.')) return;
    
    try {
        const response = await fetch(`/api/tasks/${taskId}/unarchive`, {
            method: 'PUT'
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadFilteredTasks(); // Refresh the current view
        } else {
            alert('Error unarchiving task');
        }
    } catch (error) {
        console.error('Error unarchiving task:', error);
        alert('Error unarchiving task');
    }
}

// Auto-archive completed one-time tasks
async function autoArchiveCompletedOneTimeTasks() {
    try {
        const response = await fetch('/api/tasks?filter=one-time');
        const oneTimeTasks = await response.json();
        
        for (const task of oneTimeTasks) {
            // Check if task has approved completions
            const completionsResponse = await fetch(`/api/tasks/${task.id}/completions`);
            const completions = await completionsResponse.json();
            
            const hasApprovedCompletion = completions.some(comp => comp.status === 'approved');
            
            if (hasApprovedCompletion) {
                // Auto-archive this completed one-time task
                await fetch(`/api/tasks/${task.id}/archive`, { method: 'PUT' });
            }
        }
    } catch (error) {
        console.error('Error auto-archiving tasks:', error);
    }
}

// Make global functions accessible
window.setTaskFilter = setTaskFilter;
window.setCompletionFilter = setCompletionFilter;
window.searchTasks = searchTasks;
window.archiveTask = archiveTask;
window.unarchiveTask = unarchiveTask;

function loadApprovalFilter() {
    // Load saved preference or default to 'pending'
    const savedFilter = localStorage.getItem('approval_filter_preference') || 'pending';
    setApprovalFilter(savedFilter);
}

function loadTaskFilter() {
    // Load saved preference or default to 'active'
    const savedFilter = localStorage.getItem('task_filter_preference') || 'active';
    currentTaskFilter = savedFilter;
    
    // Only update UI if buttons are available
    const filterButtons = document.querySelectorAll('.task-filters .filter-btn');
    const targetButton = document.getElementById(`task-filter-${savedFilter}`);
    
    if (filterButtons.length > 0 && targetButton) {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        targetButton.classList.add('active');
    }
    
    // Load the filtered data
    loadFilteredTasks();
}

function loadCompletionFilter() {
    // Load saved preference or default to 'pending'
    const savedFilter = localStorage.getItem('completion_filter_preference') || 'pending';
    currentCompletionFilter = savedFilter;
    
    // Only update UI if buttons are available
    const filterButtons = document.querySelectorAll('.completion-filters .filter-btn');
    const targetButton = document.getElementById(`completion-filter-${savedFilter}`);
    
    if (filterButtons.length > 0 && targetButton) {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        targetButton.classList.add('active');
    }
    
    // Load the filtered data
    loadFilteredTaskCompletions();
}

function renderFilteredCompletions(completions) {
    const container = document.getElementById('approvals-content');
    
    // Add filter status indicator at the top
    const filterIndicator = getFilterIndicatorHTML(completions.length);
    
    if (completions.length === 0) {
        let emptyMessage = '';
        switch(currentApprovalFilter) {
            case 'pending':
                emptyMessage = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
                        <h3>All caught up!</h3>
                        <p>No pending task approvals. Great job staying on top of things!</p>
                    </div>
                `;
                break;
            case 'recent':
                emptyMessage = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">📅</div>
                        <h3>No recent activity</h3>
                        <p>No task completions in the last 7 days.</p>
                    </div>
                `;
                break;
            default:
                emptyMessage = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">📋</div>
                        <h3>No task completions yet</h3>
                        <p>Once kids start completing tasks, they'll appear here!</p>
                    </div>
                `;
        }
        container.innerHTML = filterIndicator + emptyMessage;
        return;
    }
    
    container.innerHTML = filterIndicator + `
        <div class="task-list">
            ${completions.map(completion => `
                <div class="completion-item status-${completion.status}">
                    <div class="task-info">
                        <h4>
                            <span class="status-indicator"></span>
                            ${completion.task_title}
                        </h4>
                        <div class="task-meta">
                            <span class="task-type ${completion.type.toLowerCase()}">${completion.type}</span>
                            <span>By: ${completion.child_name}</span>
                            <span>Completed: ${new Date(completion.created_at).toLocaleDateString()}</span>
                            ${completion.photo_path ? '<span>📸 Photo attached</span>' : ''}
                            ${completion.comment ? `<span>💬 "${completion.comment}"</span>` : ''}
                        </div>
                    </div>
                    <div class="task-actions">
                        <span class="points">🪙 ${completion.points_value}</span>
                        ${completion.status === 'pending' ? `
                            <div style="display: flex; gap: 10px;">
                                <button class="btn btn-success" onclick="quickApprove(${completion.id}, 'approve')">
                                    ✅ Approve
                                </button>
                                <button class="btn btn-danger" onclick="quickApprove(${completion.id}, 'reject')">
                                    ❌ Reject
                                </button>
                            </div>
                        ` : `
                            <span class="status-${completion.status}">
                                ${completion.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                            </span>
                        `}
                    </div>
                    ${completion.status === 'pending' ? `
                        <div class="comment-section" style="margin-top: 15px;">
                            <div class="quick-comment-buttons">
                                ${quickComments.slice(0, 5).map(comment => `
                                    <button class="quick-comment-btn" onclick="setApprovalQuickComment(${completion.id}, '${comment}')">
                                        ${comment}
                                    </button>
                                `).join('')}
                            </div>
                            <textarea class="comment-input" id="comment-${completion.id}" 
                                     placeholder="Add your comment (optional)..." rows="2"></textarea>
                            <div style="display: flex; gap: 10px; margin-top: 10px;">
                                <button class="btn btn-success" onclick="approveWithComment(${completion.id}, 'approve')" style="flex: 1;">
                                    ✅ Approve with Comment
                                </button>
                                <button class="btn btn-danger" onclick="approveWithComment(${completion.id}, 'reject')" style="flex: 1;">
                                    ❌ Reject with Comment
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function getFilterIndicatorHTML(count) {
    const filterLabels = {
        'pending': '🟡 Pending Only',
        'recent': '📅 Recent (7 days)', 
        'all': '📋 All History'
    };
    
    return `
        <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-weight: bold;">Active Filter:</span>
                <span style="background: #6c5ce7; color: white; padding: 4px 12px; border-radius: 15px; font-size: 14px;">
                    ${filterLabels[currentApprovalFilter]}
                </span>
            </div>
            <div style="color: #636e72; font-size: 14px;">
                <strong>${count}</strong> task${count !== 1 ? 's' : ''} found
            </div>
        </div>
    `;
}

async function loadWeeklyStats() {
    try {
        const response = await fetch('/api/weekly-stats');
        const stats = await response.json();
        
        document.getElementById('weekly-total').textContent = stats.total_tasks || 0;
        document.getElementById('weekly-study').textContent = stats.study_tasks || 0;
        document.getElementById('weekly-chores').textContent = stats.chore_tasks || 0;
    } catch (error) {
        console.error('Error loading weekly stats:', error);
    }
}

async function loadPendingCount() {
    try {
        const response = await fetch('/api/pending-count');
        const result = await response.json();
        document.getElementById('pending-count').textContent = result.count || 0;
    } catch (error) {
        console.error('Error loading pending count:', error);
    }
}

async function loadTasksWithCompletions() {
    try {
        const response = await fetch('/api/todays-completions');
        taskCompletions = await response.json();
        renderTaskCompletions();
    } catch (error) {
        console.error('Error loading task completions:', error);
    }
}

function refreshTasksWithCompletions() {
    loadFilteredTaskCompletions();
    loadPendingCount();
    loadChildren(); // Refresh to update balances
}

function updateFamilyPhotoAndTagline() {
    const familyPhoto = document.getElementById('family-photo');
    const familyPhotoPlaceholder = document.getElementById('family-photo-placeholder');
    const familyTagline = document.getElementById('family-tagline');
    
    if (userProfile.family_photo && userProfile.family_photo !== 'default-family.jpg') {
        familyPhoto.src = '/uploads/' + userProfile.family_photo;
        familyPhoto.style.display = 'block';
        familyPhotoPlaceholder.style.display = 'none';
    } else {
        familyPhoto.style.display = 'none';
        familyPhotoPlaceholder.style.display = 'flex';
    }
    
    if (userProfile.tagline) {
        familyTagline.textContent = userProfile.tagline;
    }
}

function loadOverview() {
    const overviewContent = document.getElementById('overview-content');
    
    if (children.length === 0) {
        overviewContent.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h3>Welcome to Happy Habits!</h3>
                <p style="margin: 20px 0;">Get started by adding your first child.</p>
                <button class="btn btn-primary" onclick="showAddChildModal();">Add Your First Child</button>
            </div>
        `;
        return;
    }
    
    overviewContent.innerHTML = `
        <div class="children-grid">
            ${children.map(child => `
                <div class="child-card">
                    <div class="child-avatar">${avatarEmojis[child.avatar] || '👶'}</div>
                    <div class="child-name">${child.name}</div>
                    <div class="child-stats">
                        <div class="stat">
                            <div class="stat-number">${child.balance}</div>
                            <div class="stat-label">COINS</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">${child.streak_count}</div>
                            <div class="stat-label">STREAK</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">${child.age}</div>
                            <div class="stat-label">AGE</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Render functions
function renderChildren() {
    const container = document.getElementById('children-content');
    
    if (children.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p>No children added yet. Click "Add Child" to get started!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="children-grid">
            ${children.map(child => `
                <div class="child-card">
                    <div class="child-avatar">${avatarEmojis[child.avatar] || '👶'}</div>
                    <div class="child-name">${child.name}</div>
                    <div class="child-stats">
                        <div class="stat">
                            <div class="stat-number">${child.balance}</div>
                            <div class="stat-label">COINS</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">${child.streak_count}</div>
                            <div class="stat-label">STREAK</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">${child.age}</div>
                            <div class="stat-label">AGE</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderTasks() {
    const container = document.getElementById('tasks-content');
    
    if (tasks.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p>No tasks created yet. Click "Create Task" to add your first task!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="task-list">
            ${tasks.map(task => `
                <div class="task-item">
                    <div class="task-info">
                        <h4>${task.title}</h4>
                        <div class="task-meta">
                            <span class="task-type ${task.type.toLowerCase()}">${task.type}</span>
                            <span>For: ${task.child_name}</span>
                            <span>Frequency: ${task.frequency}</span>
                        </div>
                    </div>
                    <div class="task-actions-extended">
                        <span class="points">🪙 ${task.points_value}</span>
                        <button class="btn btn-secondary task-edit-btn" onclick="editTask(${task.id})">
                            ✏️ Edit
                        </button>
                        <button class="btn btn-danger task-delete-btn" onclick="deleteTask(${task.id})">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderCompletions() {
    const container = document.getElementById('approvals-content');
    
    if (completions.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p>No pending approvals! All caught up! 🎉</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="task-list">
            ${completions.map(completion => `
                <div class="completion-item status-${completion.status}">
                    <div class="task-info">
                        <h4>
                            <span class="status-indicator"></span>
                            ${completion.task_title}
                        </h4>
                        <div class="task-meta">
                            <span class="task-type ${completion.type.toLowerCase()}">${completion.type}</span>
                            <span>By: ${completion.child_name}</span>
                            <span>Completed: ${new Date(completion.created_at).toLocaleDateString()}</span>
                            ${completion.photo_path ? '<span>📸 Photo attached</span>' : ''}
                        </div>
                    </div>
                    <div class="task-actions">
                        <span class="points">🪙 ${completion.points_value}</span>
                        <div class="quick-actions">
                            <button class="btn btn-success" onclick="quickApprove(${completion.id}, 'approve')">
                                ✅ Quick Approve
                            </button>
                            <button class="btn btn-danger" onclick="quickApprove(${completion.id}, 'reject')">
                                ❌ Quick Reject
                            </button>
                        </div>
                    </div>
                    <div class="comment-section">
                        <div class="quick-comment-buttons">
                            ${quickComments.slice(0, 5).map(comment => `
                                <button class="quick-comment-btn" onclick="setApprovalQuickComment(${completion.id}, '${comment}')">
                                    ${comment}
                                </button>
                            `).join('')}
                        </div>
                        <textarea class="comment-input" id="comment-${completion.id}" 
                                 placeholder="Add your comment (optional)..." rows="2"></textarea>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn btn-success" onclick="approveWithComment(${completion.id}, 'approve')" style="flex: 1;">
                                ✅ Approve
                            </button>
                            <button class="btn btn-danger" onclick="approveWithComment(${completion.id}, 'reject')" style="flex: 1;">
                                ❌ Reject
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderAllCompletions(allCompletions) {
    const container = document.getElementById('approvals-content');
    
    if (allCompletions.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p>No task completions yet!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="task-list">
            ${allCompletions.map(completion => `
                <div class="completion-item status-${completion.status}">
                    <div class="task-info">
                        <h4>
                            <span class="status-indicator"></span>
                            ${completion.task_title}
                        </h4>
                        <div class="task-meta">
                            <span class="task-type ${completion.type.toLowerCase()}">${completion.type}</span>
                            <span>By: ${completion.child_name}</span>
                            <span>Completed: ${new Date(completion.created_at).toLocaleDateString()}</span>
                            ${completion.photo_path ? '<span>📸 Photo attached</span>' : ''}
                            ${completion.comment ? `<span>💬 "${completion.comment}"</span>` : ''}
                        </div>
                    </div>
                    <div class="task-actions">
                        <span class="points">🪙 ${completion.points_value}</span>
                        <span class="status-${completion.status}">
                            ${completion.status === 'pending' ? '🟡 Pending' : 
                              completion.status === 'approved' ? '✅ Approved' : 
                              '❌ Rejected'}
                        </span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderTaskCompletions() {
    const container = document.getElementById('task-completions-content');
    
    // taskCompletions now contains only today's completions from the new API
    if (taskCompletions.length === 0) {
        container.innerHTML = `
            <div class="no-completions">
                <div style="font-size: 48px; margin-bottom: 15px;">📋</div>
                <h3>No task completions today</h3>
                <p>When kids complete tasks, they'll appear here for your review!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="task-list">
            ${taskCompletions.map(completion => `
                <div class="task-completion-item completion-${completion.status || 'pending'}">
                    <div class="task-info">
                        <h4>
                            ${completion.title}
                            <span class="completion-status-badge ${completion.status || 'pending'}">
                                ${getStatusDisplay(completion.status || 'pending')}
                            </span>
                        </h4>
                        <div class="task-meta">
                            <span class="task-type ${completion.type.toLowerCase()}">${completion.type}</span>
                            <span>By: ${completion.child_name}</span>
                            <span>Worth: 🪙 ${completion.points_value} coins</span>
                            ${completion.photo_path ? '<span>📸 Photo proof submitted</span>' : ''}
                            <span>Completed: ${new Date(completion.created_at).toLocaleString()}</span>
                        </div>
                        ${completion.comment ? `
                            <div style="margin-top: 10px; padding: 8px; background: rgba(108, 92, 231, 0.1); border-radius: 8px; font-style: italic;">
                                💬 "${completion.comment}"
                            </div>
                        ` : ''}
                    </div>
                    
                    ${completion.status === 'pending' ? `
                        <div class="approval-actions-section">
                            <div class="quick-comment-buttons">
                                ${quickComments.slice(0, 5).map(comment => `
                                    <button class="quick-comment-btn" onclick="setQuickComment(${completion.id}, '${comment}')">
                                        ${comment}
                                    </button>
                                `).join('')}
                            </div>
                            <textarea class="comment-input" id="task-comment-${completion.id}" 
                                     placeholder="Add your comment (optional)..." rows="2"></textarea>
                            <div style="display: flex; gap: 10px;">
                                <button class="btn btn-success" onclick="approveTaskCompletion(${completion.id}, 'approve')" style="flex: 1;">
                                    ✅ Approve
                                </button>
                                <button class="btn btn-danger" onclick="approveTaskCompletion(${completion.id}, 'reject')" style="flex: 1;">
                                    ❌ Reject
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function getStatusDisplay(status) {
    switch(status) {
        case 'pending': return '🟡 Pending';
        case 'approved': return '✅ Approved';
        case 'rejected': return '❌ Rejected';
        default: return '🟡 Pending';
    }
}

function setQuickComment(completionId, comment) {
    const textarea = document.getElementById(`task-comment-${completionId}`);
    if (textarea) {
        textarea.value = comment;
        textarea.focus();
    }
}

function setApprovalQuickComment(completionId, comment) {
    const textarea = document.getElementById(`comment-${completionId}`);
    if (textarea) {
        textarea.value = comment;
        textarea.focus();
    }
}

// Modal functions
function showAddChildModal() {
    selectedAvatar = 'child-1';
    updateAvatarSelection();
    document.getElementById('add-child-modal').classList.add('show');
}

function showAddTaskModal() {
    if (children.length === 0) {
        alert('Please add at least one child before creating tasks.');
        return;
    }
    document.getElementById('add-task-modal').classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function updateTaskChildOptions() {
    const select = document.getElementById('task-child');
    select.innerHTML = '<option value="">Select a child...</option>';
    
    children.forEach(child => {
        const option = document.createElement('option');
        option.value = child.id;
        option.textContent = child.name;
        select.appendChild(option);
    });
}

// Avatar selection
function setupAvatarSelection() {
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.addEventListener('click', () => {
            selectedAvatar = option.dataset.avatar;
            updateAvatarSelection();
        });
    });
}

function updateAvatarSelection() {
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.toggle('selected', option.dataset.avatar === selectedAvatar);
    });
}

// Family photo upload
function setupFamilyPhotoUpload() {
    const input = document.getElementById('family-photo-input');
    input.addEventListener('change', uploadFamilyPhoto);
}

function triggerFamilyPhotoUpload() {
    document.getElementById('family-photo-input').click();
}

async function uploadFamilyPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('familyPhoto', file);
    
    try {
        const response = await fetch('/api/upload-family-photo', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (result.success) {
            userProfile.family_photo = result.filename;
            updateFamilyPhotoAndTagline();
        } else {
            alert('Error uploading photo: ' + result.error);
        }
    } catch (error) {
        alert('Error uploading photo. Please try again.');
    }
}

// Tagline editing
function editTagline() {
    document.getElementById('tagline-input').value = userProfile.tagline || '';
    document.getElementById('tagline-edit-modal').classList.add('show');
}

// Task editing
async function editTask(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`);
        const task = await response.json();
        
        document.getElementById('edit-task-title').value = task.title;
        document.getElementById('edit-task-type').value = task.type;
        document.getElementById('edit-task-points').value = task.points_value;
        document.getElementById('edit-task-frequency').value = task.frequency;
        
        editingTaskId = taskId;
        document.getElementById('edit-task-modal').classList.add('show');
    } catch (error) {
        alert('Error loading task details');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
            loadTasks();
        } else {
            alert('Error deleting task: ' + result.error);
        }
    } catch (error) {
        alert('Error deleting task. Please try again.');
    }
}

// Quick approval functions
async function quickApprove(completionId, action) {
    await approveCompletion(completionId, action, '');
}

async function approveWithComment(completionId, action) {
    const comment = document.getElementById(`comment-${completionId}`).value;
    await approveCompletion(completionId, action, comment);
}

async function approveCompletion(completionId, action, comment) {
    try {
        console.log('Approving completion:', { completionId, action, comment }); // Debug log
        
        const response = await fetch('/api/approve-completion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completionId, action, comment })
        });
        
        console.log('Response status:', response.status); // Debug log
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            alert('Server Error: ' + errorText);
            return;
        }
        
        const data = await response.json();
        console.log('Response data:', data); // Debug log
        
        if (data.success) {
            loadCompletions();
            loadFilteredCompletions(); // Use new filtered function
            loadApprovalStats(); // Update stats
            loadTasksWithCompletions();
            loadChildren(); // Refresh children to update balances
            loadOverview();
            loadPendingCount();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Approval error:', error);
        alert('Something went wrong: ' + error.message);
    }
}

// Task completion approval from Tasks tab
async function approveTaskCompletion(completionId, action) {
    const commentElement = document.getElementById(`task-comment-${completionId}`);
    const comment = commentElement ? commentElement.value : '';
    await approveCompletion(completionId, action, comment);
}

// Form submissions
document.getElementById('add-child-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('child-name').value;
    const age = document.getElementById('child-age').value;
    
    try {
        const response = await fetch('/api/children', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, age, avatar: selectedAvatar })
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeModal('add-child-modal');
            document.getElementById('add-child-form').reset();
            selectedAvatar = 'child-1';
            updateAvatarSelection();
            loadChildren();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Something went wrong. Please try again.');
    }
});

document.getElementById('add-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const childId = document.getElementById('task-child').value;
    const title = document.getElementById('task-title').value;
    const type = document.getElementById('task-type').value;
    const pointsValue = document.getElementById('task-points').value;
    const frequency = document.getElementById('task-frequency').value;
    
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ childId, title, type, pointsValue, frequency })
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeModal('add-task-modal');
            document.getElementById('add-task-form').reset();
            loadTasks();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Something went wrong. Please try again.');
    }
});

document.getElementById('edit-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('edit-task-title').value;
    const type = document.getElementById('edit-task-type').value;
    const pointsValue = document.getElementById('edit-task-points').value;
    const frequency = document.getElementById('edit-task-frequency').value;
    
    try {
        const response = await fetch(`/api/tasks/${editingTaskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, type, pointsValue, frequency })
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeModal('edit-task-modal');
            document.getElementById('edit-task-form').reset();
            editingTaskId = null;
            loadTasks();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Something went wrong. Please try again.');
    }
});

document.getElementById('tagline-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const tagline = document.getElementById('tagline-input').value;
    
    try {
        const response = await fetch('/api/update-tagline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tagline })
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeModal('tagline-edit-modal');
            userProfile.tagline = tagline;
            updateFamilyPhotoAndTagline();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Something went wrong. Please try again.');
    }
});

document.getElementById('add-reward-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const categoryId = document.getElementById('reward-category').value;
    const name = document.getElementById('reward-name').value;
    const description = document.getElementById('reward-description').value;
    const cost = document.getElementById('reward-cost').value;
    const type = document.getElementById('reward-type').value;
    const stockQuantity = document.getElementById('reward-stock').value;
    const icon = document.getElementById('reward-icon').value;
    
    try {
        const url = editingRewardId ? `/api/rewards/${editingRewardId}` : '/api/rewards';
        const method = editingRewardId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                categoryId, 
                name, 
                description, 
                cost: parseInt(cost), 
                type, 
                stockQuantity: parseInt(stockQuantity), 
                icon 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeModal('add-reward-modal');
            document.getElementById('add-reward-form').reset();
            editingRewardId = null;
            loadRewards();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Something went wrong. Please try again.');
    }
});

// Reward Management Functions
async function loadRewards() {
    try {
        const [rewardsResponse, categoriesResponse] = await Promise.all([
            fetch('/api/rewards'),
            fetch('/api/reward-categories')
        ]);
        
        rewards = await rewardsResponse.json();
        categories = await categoriesResponse.json();
        
        renderRewards();
        updateRewardCategoryOptions();
    } catch (error) {
        console.error('Error loading rewards:', error);
    }
}

async function loadPurchases() {
    try {
        const response = await fetch('/api/purchase-approvals');
        purchases = await response.json();
        renderPurchases();
    } catch (error) {
        console.error('Error loading purchases:', error);
    }
}

function refreshStore() {
    loadRewards();
}

function refreshPurchases() {
    loadPurchases();
}

function renderRewards() {
    const container = document.getElementById('rewards-content');
    
    if (rewards.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: white;">
                <div style="font-size: 48px; margin-bottom: 20px;">🏪</div>
                <h3>No rewards created yet!</h3>
                <p>Click "Add Reward" to create your first reward for the kids to purchase.</p>
            </div>
        `;
        return;
    }
    
    // Group rewards by category
    const rewardsByCategory = {};
    rewards.forEach(reward => {
        if (!rewardsByCategory[reward.category_name]) {
            rewardsByCategory[reward.category_name] = [];
        }
        rewardsByCategory[reward.category_name].push(reward);
    });
    
    container.innerHTML = `
        <div class="rewards-management">
            ${Object.entries(rewardsByCategory).map(([categoryName, categoryRewards]) => `
                <div class="reward-category-section">
                    <h3 style="color: white; margin-bottom: 15px; display: flex; align-items: center;">
                        <span style="margin-right: 10px;">${categoryRewards[0]?.category_icon || '🎁'}</span>
                        ${categoryName}
                    </h3>
                    <div class="reward-grid">
                        ${categoryRewards.map(reward => `
                            <div class="reward-item ${!reward.is_active ? 'inactive' : ''}" style="background: rgba(255, 255, 255, 0.1); color: white;">
                                <div class="reward-header">
                                    <span class="reward-icon">${reward.icon}</span>
                                    <div class="reward-actions">
                                        <button class="btn-small" style="background: rgba(255, 255, 255, 0.2);" onclick="editReward(${reward.id})">✏️</button>
                                        <button class="btn-small" style="background: rgba(255, 0, 0, 0.3);" onclick="deleteReward(${reward.id})">🗑️</button>
                                    </div>
                                </div>
                                <h4>${reward.name}</h4>
                                ${reward.description ? `<p style="opacity: 0.8; font-size: 14px;">${reward.description}</p>` : ''}
                                <div class="reward-details">
                                    <div style="font-weight: bold;">🪙 ${reward.cost} coins</div>
                                    <div style="font-size: 12px; opacity: 0.7;">
                                        ${reward.type === 'instant' ? '⚡ Instant' : 
                                          reward.type === 'scheduled' ? '📅 Scheduled' : 
                                          '✋ Needs Approval'}
                                    </div>
                                    ${reward.stock_quantity !== -1 ? 
                                        `<div style="font-size: 12px;">Stock: ${reward.stock_remaining}/${reward.stock_quantity}</div>` : 
                                        '<div style="font-size: 12px;">Unlimited</div>'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderPurchases() {
    const container = document.getElementById('purchase-approvals-content');
    
    if (purchases.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">📦</div>
                <h3>No purchase requests!</h3>
                <p>When kids buy rewards that need approval, they'll appear here.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="purchase-list">
            ${purchases.map(purchase => `
                <div class="purchase-item status-${purchase.status}">
                    <div class="purchase-info">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div class="reward-icon-large">${purchase.reward_icon}</div>
                            <div>
                                <h4>${purchase.reward_name}</h4>
                                <div style="opacity: 0.7; font-size: 14px;">
                                    Purchased by: <strong>${purchase.child_name}</strong> • 
                                    Cost: <strong>🪙 ${purchase.cost} coins</strong> • 
                                    ${new Date(purchase.created_at).toLocaleDateString()}
                                </div>
                                ${purchase.reward_description ? `<p style="margin-top: 5px; font-size: 14px; opacity: 0.8;">${purchase.reward_description}</p>` : ''}
                            </div>
                        </div>
                    </div>
                    
                    ${purchase.status === 'pending' ? `
                        <div class="purchase-actions">
                            <button class="btn btn-success" onclick="approvePurchase(${purchase.id}, 'approve')">
                                ✅ Approve
                            </button>
                            <button class="btn btn-danger" onclick="approvePurchase(${purchase.id}, 'reject')">
                                ❌ Reject & Refund
                            </button>
                        </div>
                    ` : `
                        <div class="purchase-status status-${purchase.status}">
                            ${purchase.status === 'approved' ? '✅ Approved' : '❌ Rejected & Refunded'}
                        </div>
                    `}
                </div>
            `).join('')}
        </div>
    `;
}

async function showAddRewardModal() {
    editingRewardId = null;
    document.getElementById('reward-modal-title').textContent = 'Add New Reward';
    document.getElementById('add-reward-form').reset();
    
    // Ensure categories are loaded before showing the modal
    if (!categories || categories.length === 0) {
        try {
            const categoriesResponse = await fetch('/api/reward-categories');
            categories = await categoriesResponse.json();
        } catch (error) {
            console.error('Error loading categories:', error);
            alert('Error loading reward categories. Please try again.');
            return;
        }
    }
    
    updateRewardCategoryOptions();
    
    // Reset emoji picker to default
    const iconInput = document.getElementById('reward-icon');
    const iconPreview = document.getElementById('icon-preview');
    iconInput.value = '🎁';
    iconPreview.textContent = '🎁';
    updateEmojiSelection('🎁');
    
    document.getElementById('add-reward-modal').classList.add('show');
}

async function editReward(rewardId) {
    try {
        const response = await fetch(`/api/rewards/${rewardId}`);
        const reward = await response.json();
        
        editingRewardId = rewardId;
        document.getElementById('reward-modal-title').textContent = 'Edit Reward';
        
        document.getElementById('reward-category').value = reward.category_id;
        document.getElementById('reward-name').value = reward.name;
        document.getElementById('reward-description').value = reward.description || '';
        document.getElementById('reward-cost').value = reward.cost;
        document.getElementById('reward-type').value = reward.type;
        document.getElementById('reward-stock').value = reward.stock_quantity;
        document.getElementById('reward-icon').value = reward.icon;
        
        // Update emoji picker for editing
        const iconPreview = document.getElementById('icon-preview');
        iconPreview.textContent = reward.icon;
        updateEmojiSelection(reward.icon);
        
        document.getElementById('add-reward-modal').classList.add('show');
    } catch (error) {
        alert('Error loading reward details');
    }
}

async function deleteReward(rewardId) {
    if (!confirm('Are you sure you want to delete this reward?')) return;
    
    try {
        const response = await fetch(`/api/rewards/${rewardId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
            loadRewards();
        } else {
            alert('Error deleting reward: ' + result.error);
        }
    } catch (error) {
        alert('Error deleting reward. Please try again.');
    }
}

async function approvePurchase(purchaseId, action) {
    try {
        const response = await fetch('/api/approve-purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ purchaseId, action })
        });
        
        const result = await response.json();
        if (result.success) {
            loadPurchases();
            loadChildren(); // Refresh to update balances if refunded
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        alert('Error processing purchase approval. Please try again.');
    }
}

function updateRewardCategoryOptions() {
    const select = document.getElementById('reward-category');
    select.innerHTML = '<option value="">Select category...</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = `${category.icon} ${category.name}`;
        select.appendChild(option);
    });
    
    // Add event listener for category change
    select.addEventListener('change', handleCategoryChange);
}

function handleCategoryChange(e) {
    const categoryId = e.target.value;
    if (categoryId) {
        const selectedCategory = categories.find(cat => cat.id == categoryId);
        if (selectedCategory) {
            // Auto-populate icon field with category icon
            const iconInput = document.getElementById('reward-icon');
            const iconPreview = document.getElementById('icon-preview');
            
            iconInput.value = selectedCategory.icon;
            iconPreview.textContent = selectedCategory.icon;
            
            // Update selected emoji in picker
            updateEmojiSelection(selectedCategory.icon);
        }
    }
}

// Emoji picker data organized by categories
const emojiCategories = {
    'Screen & Tech': ['📱', '💻', '🖥️', '📺', '🎮', '📟', '💾', '🔌'],
    'Food & Treats': ['🍭', '🍪', '🧁', '🍰', '🍫', '🍕', '🍔', '🍟', '🍿', '🥤', '🍦', '🍓'],
    'Activities & Fun': ['🎡', '🎢', '🎠', '🎪', '🎨', '🎭', '🎪', '⚽', '🏀', '🎾', '🏊', '🚲'],
    'Entertainment': ['🎬', '🎵', '🎶', '🎤', '🎸', '🎹', '🎮', '🎯', '🎲', '🃏', '📚', '📖'],
    'Rewards & Gifts': ['🎁', '🏆', '🥇', '🎖️', '👑', '💎', '⭐', '🌟', '✨', '💫', '🎉', '🎊'],
    'Time & Freedom': ['🌙', '🕐', '⏰', '⏳', '🔓', '🆓', '🏃', '🚶', '🛌', '😴', '🧘', '🕊️'],
    'Special Items': ['👕', '👔', '👗', '👟', '🎒', '📦', '🧸', '🪀', '🎈', '🧩', '🎲', '🪁']
};

function setupEmojiPicker() {
    const emojiPicker = document.getElementById('emoji-picker');
    const iconInput = document.getElementById('reward-icon');
    const iconPreview = document.getElementById('icon-preview');
    
    // Create emoji picker grid
    let pickerHTML = '';
    
    Object.entries(emojiCategories).forEach(([categoryName, emojis]) => {
        pickerHTML += `
            <div class="emoji-category">
                <div class="emoji-category-title">${categoryName}</div>
                <div class="emoji-grid">
                    ${emojis.map(emoji => `
                        <div class="emoji-option" data-emoji="${emoji}">
                            ${emoji}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    emojiPicker.innerHTML = pickerHTML;
    
    // Add click handlers for emoji selection
    emojiPicker.addEventListener('click', (e) => {
        if (e.target.classList.contains('emoji-option')) {
            const selectedEmoji = e.target.dataset.emoji;
            
            // Update input and preview
            iconInput.value = selectedEmoji;
            iconPreview.textContent = selectedEmoji;
            
            // Update visual selection
            updateEmojiSelection(selectedEmoji);
        }
    });
    
    // Set default selection
    updateEmojiSelection('🎁');
}

function updateEmojiSelection(selectedEmoji) {
    // Remove previous selection
    document.querySelectorAll('.emoji-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to current emoji
    const selectedOption = document.querySelector(`.emoji-option[data-emoji="${selectedEmoji}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
}

// Logout function
async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/login.html';
    } catch (error) {
        window.location.href = '/login.html';
    }
}

// Bills Management Functions
async function loadBills() {
    try {
        const response = await fetch('/api/bills');
        bills = await response.json();
        renderBills();
        checkBillsVisibility();
    } catch (error) {
        console.error('Error loading bills:', error);
        document.getElementById('bills-list').innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p>Unable to load bills. Please try refreshing.</p>
            </div>
        `;
        checkBillsVisibility();
    }
}

function renderBills() {
    const container = document.getElementById('bills-list');
    
    if (bills.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">💳</div>
                <h3>No Bills Created Yet</h3>
                <p>Create bills to teach your children financial responsibility!</p>
                <button class="btn btn-primary" onclick="showCreateBillModal()">+ Create First Bill</button>
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
                
                return `
                    <div class="bill-item ${isOverdue ? 'overdue' : ''}" style="background: #f8f9fa; margin-bottom: 15px; padding: 20px; border-radius: 10px; border-left: 5px solid ${isOverdue ? '#e74c3c' : '#6c5ce7'};">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="font-size: 32px;">${bill.icon}</div>
                                <div>
                                    <h4 style="margin-bottom: 5px;">${bill.name}</h4>
                                    <div style="color: #636e72; margin-bottom: 5px;">
                                        <strong>${bill.child_name}</strong> • ${bill.amount} coins
                                    </div>
                                    ${bill.description ? `<p style="opacity: 0.7; font-size: 14px; margin-bottom: 5px;">${bill.description}</p>` : ''}
                                    <div style="display: flex; gap: 15px; font-size: 13px; color: #636e72;">
                                        <span>📅 Next due: ${dueDate.toLocaleDateString()}</span>
                                        <span>🔄 ${bill.frequency}</span>
                                    </div>
                                    ${isOverdue ? `<div style="color: #e74c3c; font-weight: bold; margin-top: 5px;">⚠️ OVERDUE!</div>` : ''}
                                </div>
                            </div>
                            <div style="display: flex; gap: 10px;">
                                <button class="btn btn-secondary" onclick="editBill(${bill.id})">✏️ Edit</button>
                                <button class="btn btn-danger" onclick="deleteBill(${bill.id})">🗑️ Delete</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function showCreateBillModal() {
    // Populate children dropdown
    const childSelect = document.getElementById('bill-child');
    childSelect.innerHTML = '<option value="">Select a child...</option>' + 
        children.map(child => `<option value="${child.id}">${child.name}</option>`).join('');
    
    // Reset form
    document.getElementById('create-bill-form').reset();
    document.getElementById('bill-icon').value = '🏠';
    
    // Show modal
    document.getElementById('create-bill-modal').classList.add('show');
    
    // Setup emoji picker for bills
    setupBillEmojiPicker();
}

function closeCreateBillModal() {
    document.getElementById('create-bill-modal').classList.remove('show');
    editingBillId = null;
}

function setupBillEmojiPicker() {
    document.querySelectorAll('#create-bill-modal .emoji-option').forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            document.querySelectorAll('#create-bill-modal .emoji-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            option.classList.add('selected');
            
            // Update hidden input
            document.getElementById('bill-icon').value = option.dataset.icon;
        });
    });
}

// Create Bill Form Handler
document.getElementById('create-bill-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        childId: parseInt(document.getElementById('bill-child').value),
        name: document.getElementById('bill-name').value,
        description: document.getElementById('bill-description').value,
        amount: parseInt(document.getElementById('bill-amount').value),
        frequency: document.getElementById('bill-frequency').value,
        icon: document.getElementById('bill-icon').value
    };
    
    try {
        const url = editingBillId ? `/api/bills/${editingBillId}` : '/api/bills';
        const method = editingBillId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeCreateBillModal();
            loadBills();
            
            // Show success message
            alert(editingBillId ? 'Bill updated successfully!' : 'Bill created successfully!');
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Something went wrong. Please try again.');
    }
});

function editBill(billId) {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;
    
    editingBillId = billId;
    
    // Populate form with bill data
    document.getElementById('bill-child').value = bill.child_id;
    document.getElementById('bill-name').value = bill.name;
    document.getElementById('bill-description').value = bill.description || '';
    document.getElementById('bill-amount').value = bill.amount;
    document.getElementById('bill-frequency').value = bill.frequency;
    document.getElementById('bill-icon').value = bill.icon;
    
    // Update emoji selection
    document.querySelectorAll('#create-bill-modal .emoji-option').forEach(option => {
        if (option.dataset.icon === bill.icon) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
    
    // Show modal
    showCreateBillModal();
}

async function deleteBill(billId) {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;
    
    if (!confirm(`Are you sure you want to delete the "${bill.name}" bill?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/bills/${billId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadBills();
            alert('Bill deleted successfully!');
        } else {
            alert('Error deleting bill: ' + data.error);
        }
    } catch (error) {
        alert('Something went wrong. Please try again.');
    }
}

// Subscription Management
async function loadSubscriptionStatus() {
    try {
        const response = await fetch('/api/subscription-status');
        subscriptionStatus = await response.json();
        
        // Update UI with subscription info
        updateSubscriptionUI();
    } catch (error) {
        console.error('Error loading subscription status:', error);
        // Assume free user if error
        subscriptionStatus = { isPremium: false };
        updateSubscriptionUI();
    }
}

function updateSubscriptionUI() {
    
    // Add upgrade button to header if not premium
    if (!subscriptionStatus.isPremium) {
        const userInfo = document.querySelector('.user-info');
        if (userInfo && !document.getElementById('upgrade-btn')) {
            const upgradeBtn = document.createElement('a');
            upgradeBtn.id = 'upgrade-btn';
            upgradeBtn.href = '/upgrade.html';
            upgradeBtn.className = 'btn btn-primary';
            upgradeBtn.style.background = 'linear-gradient(135deg, #fdcb6e, #e17055)';
            upgradeBtn.innerHTML = '⭐ Upgrade';
            userInfo.appendChild(upgradeBtn);
        }
        
        // Make premium tabs visible but locked with teaser
        makePremiumTabsTeaser();
        
        // Show usage warnings if close to limits
        showUsageWarnings();
    }
}

function makePremiumTabsTeaser() {
    // Wait a bit for DOM to be ready
    setTimeout(() => {
        // Add premium badge to Bills tab
        const billsTab = document.querySelector('[onclick="showTab(\'bills\')"]');
    
    if (billsTab && !billsTab.querySelector('.premium-badge')) {
        // Add premium badge
        const badge = document.createElement('span');
        badge.className = 'premium-badge';
        badge.innerHTML = '⭐';
        badge.style.cssText = `
            background: #fdcb6e;
            color: #2d3436;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 8px;
            margin-left: 5px;
            font-weight: bold;
        `;
        billsTab.appendChild(badge);
        
        // Replace click handler with premium prompt
        billsTab.setAttribute('onclick', 'showPremiumPrompt("Bills & Allowance Management")');
        billsTab.style.opacity = '0.7';
    }
    
    // Add premium teaser to photo upload
    const photoPlaceholder = document.getElementById('family-photo-placeholder');
    const familyPhoto = document.getElementById('family-photo');
    
    if (photoPlaceholder) {
        // Replace photo upload with premium prompt
        photoPlaceholder.setAttribute('onclick', 'showPremiumPrompt("Family Photo Uploads")');
        photoPlaceholder.style.cssText += '; opacity: 0.7; cursor: pointer; position: relative;';
        
        // Add premium badge to photo area
        if (!photoPlaceholder.querySelector('.photo-premium-badge')) {
            const photoBadge = document.createElement('div');
            photoBadge.className = 'photo-premium-badge';
            photoBadge.innerHTML = '⭐ PREMIUM';
            photoBadge.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                background: #fdcb6e;
                color: #2d3436;
                font-size: 8px;
                padding: 2px 5px;
                border-radius: 8px;
                font-weight: bold;
            `;
            photoPlaceholder.style.position = 'relative';
            photoPlaceholder.appendChild(photoBadge);
        }
    }
    
    if (familyPhoto) {
        familyPhoto.setAttribute('onclick', 'showPremiumPrompt("Family Photo Uploads")');
        familyPhoto.style.opacity = '0.7';
    }
    }, 100); // End setTimeout
}

function showUsageWarnings() {
    const { usage, limits } = subscriptionStatus;
    
    // Show warnings for resources at 80% of limit
    Object.keys(usage).forEach(resource => {
        const current = usage[resource];
        const limit = limits[resource];
        
        if (current >= limit * 0.8) {
            const container = document.getElementById(`${resource}-content`) || document.querySelector('.container');
            if (container && !container.querySelector(`.${resource}-warning`)) {
                const warning = document.createElement('div');
                warning.className = `${resource}-warning`;
                warning.style.cssText = `
                    background: linear-gradient(135deg, #fdcb6e, #e17055);
                    color: white;
                    padding: 15px;
                    border-radius: 10px;
                    margin-bottom: 15px;
                    text-align: center;
                `;
                
                if (current >= limit) {
                    warning.innerHTML = `
                        <strong>⚠️ Free Plan Limit Reached</strong><br>
                        You've reached the limit of ${limit} ${resource}. 
                        <a href="/upgrade.html" style="color: white; text-decoration: underline;">Upgrade to Premium</a> for unlimited access!
                    `;
                } else {
                    warning.innerHTML = `
                        <strong>📊 Approaching Limit</strong><br>
                        You're using ${current}/${limit} ${resource}. 
                        <a href="/upgrade.html" style="color: white; text-decoration: underline;">Upgrade to Premium</a> for unlimited access!
                    `;
                }
                
                container.prepend(warning);
            }
        }
    });
}

function handleUpgradeResponse(response) {
    if (response.status === 402 && response.upgrade) {
        // Show upgrade prompt
        if (confirm(response.message + '\n\nWould you like to upgrade now?')) {
            window.location.href = '/upgrade.html';
        }
        return true; // Indicates upgrade prompt was shown
    }
    return false; // No upgrade needed
}

function showPremiumPrompt(featureName) {
    const message = `🌟 ${featureName} is a Premium Feature!\n\nThis powerful feature is available with our Premium plan:\n• Unlimited children, tasks & rewards\n• Advanced bills & allowance management\n• Photo uploads & priority support\n• Only $9.99/month\n\nWould you like to upgrade now?`;
    
    if (confirm(message)) {
        window.location.href = '/upgrade.html';
    }
}

// Override existing functions to handle upgrade prompts
const originalCreateChild = window.createChild || function() {};
const originalCreateTask = window.createTask || function() {};
const originalCreateReward = window.createReward || function() {};

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// ==================== ANALYTICS FUNCTIONS ====================

async function loadAnalytics() {
    try {
        const response = await fetch('/api/signup-stats');
        const stats = await response.json();
        renderAnalytics(stats);
    } catch (error) {
        console.error('Error loading analytics:', error);
        document.getElementById('analytics-content').innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p>Unable to load analytics data</p>
            </div>
        `;
    }
}

function renderAnalytics(stats) {
    const container = document.getElementById('analytics-content');
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 20px; margin-bottom: 20px;">
            <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold;">${stats.total_users}</div>
                <div style="opacity: 0.9; font-size: 14px;">Total Users</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold;">${stats.signups_today}</div>
                <div style="opacity: 0.9; font-size: 14px;">Today</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold;">${stats.signups_week}</div>
                <div style="opacity: 0.9; font-size: 14px;">This Week</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold;">${stats.signups_month}</div>
                <div style="opacity: 0.9; font-size: 14px;">This Month</div>
            </div>
        </div>
        <div style="text-align: center; opacity: 0.8; font-size: 12px;">
            🎉 Great job sharing your app with friends! ${stats.signups_week > 0 ? 'You got ' + stats.signups_week + ' new signups this week!' : 'Keep spreading the word!'}
        </div>
    `;
}

async function refreshAnalytics() {
    document.getElementById('analytics-content').innerHTML = '<div class="loading">Refreshing...</div>';
    await loadAnalytics();
}