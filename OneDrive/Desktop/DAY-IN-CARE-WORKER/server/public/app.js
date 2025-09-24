// Main application logic
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
});

// Authentication check
async function checkAuthentication() {
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user.id) {
        // Redirect to login if not authenticated
        window.location.href = '/login.html';
        return;
    }

    try {
        // Verify token is still valid
        const response = await fetch('/api/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Token invalid');
        }

        const userData = await response.json();

        // Update user info in the header
        updateUserInterface(userData.user);

        // Initialize the application
        loadScenarios();
        updateLicenseStatus();
        setupEventListeners();
        setupLogoutHandler();
    } catch (error) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    }
}

// Update user interface with user data
function updateUserInterface(user) {
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        userInfo.innerHTML = `
            <span>${user.firstName} ${user.lastName} (${user.role})</span>
            <button id="logout-btn" style="margin-left: 10px; padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">Logout</button>
        `;
    }

    // Update license status based on user's organization
    if (licenseStatus) {
        licenseStatus.isTrialMode = user.licenseType === 'trial';
        licenseStatus.scenariosUnlocked = user.licenseType === 'trial' ? 2 : 22;
    }
}

// Setup logout handler
function setupLogoutHandler() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const refreshToken = localStorage.getItem('refreshToken');

                // Call logout endpoint
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ refreshToken })
                });
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                // Clear local storage and redirect
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login.html';
            }
        });
    }
}

function setupEventListeners() {
    // Main upgrade button
    const mainUpgradeBtn = document.getElementById('main-upgrade-btn');
    if (mainUpgradeBtn) {
        mainUpgradeBtn.addEventListener('click', showUpgradeModal);
    }

    // Upgrade modal buttons
    const closeUpgradeModal = document.getElementById('close-upgrade-modal');
    const purchaseNowBtn = document.getElementById('purchase-now-btn');

    if (closeUpgradeModal) {
        closeUpgradeModal.addEventListener('click', () => {
            document.getElementById('upgrade-modal').style.display = 'none';
        });
    }

    if (purchaseNowBtn) {
        purchaseNowBtn.addEventListener('click', startPayment);
    }

    // Close modal when clicking outside
    const upgradeModal = document.getElementById('upgrade-modal');
    if (upgradeModal) {
        upgradeModal.addEventListener('click', function(event) {
            if (event.target === upgradeModal) {
                upgradeModal.style.display = 'none';
            }
        });
    }
}

function loadScenarios() {
    const grid = document.getElementById('scenarios-grid');

    trainingScenarios.forEach(scenario => {
        const isAccessible = scenario.isTrial || !licenseStatus.isTrialMode;

        const card = document.createElement('div');
        card.className = `scenario-card ${!isAccessible ? 'locked' : ''}`;

        card.innerHTML = `
            <div class="scenario-badge ${scenario.isTrial ? 'trial-badge' : (isAccessible ? 'trial-badge' : 'locked-badge')}">
                ${scenario.isTrial ? 'TRIAL' : (isAccessible ? 'FULL' : 'LOCKED')}
            </div>
            <h3>${scenario.title}</h3>
            <p>${scenario.description}</p>
            <div style="margin-bottom: 10px;">
                <small><strong>Category:</strong> ${scenario.category}</small><br>
                <small><strong>Duration:</strong> ${scenario.duration}</small><br>
                <small><strong>Difficulty:</strong> ${scenario.difficulty}</small>
            </div>
            <button class="start-btn" data-scenario-id="${scenario.id}" ${!isAccessible ? 'disabled' : ''}>
                ${isAccessible ? 'Start Training' : 'Upgrade to Access'}
            </button>
        `;

        // Add event listener instead of onclick
        const button = card.querySelector('.start-btn');
        if (isAccessible) {
            button.addEventListener('click', () => startScenario(scenario.id));
        } else {
            button.addEventListener('click', showUpgradeModal);
        }

        grid.appendChild(card);
    });
}

function updateLicenseStatus() {
    const statusElement = document.getElementById('license-status');
    if (licenseStatus.isTrialMode) {
        statusElement.textContent = `Trial Mode: ${licenseStatus.scenariosUnlocked} of ${licenseStatus.totalScenarios} scenarios available`;
    } else {
        statusElement.textContent = `Full License: All ${licenseStatus.totalScenarios} scenarios unlocked`;
    }
}

function startScenario(scenarioId) {
    const scenario = trainingScenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    // Check if user has access
    if (licenseStatus.isTrialMode && !scenario.isTrial) {
        showUpgradeModal();
        return;
    }

    // Launch scenario simulation
    launchScenarioSimulation(scenario);
}

function launchScenarioSimulation(scenario) {
    // Create a better simulation modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <span class="close">&times;</span>
            <h2>🏥 ${scenario.title}</h2>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <strong>Scenario:</strong> ${scenario.description}
            </div>
            <div style="display: flex; gap: 20px; margin: 15px 0;">
                <span><strong>Duration:</strong> ${scenario.duration}</span>
                <span><strong>Difficulty:</strong> ${scenario.difficulty}</span>
                <span><strong>Category:</strong> ${scenario.category}</span>
            </div>

            <div id="scenario-content">
                <h3>🎯 Learning Objectives:</h3>
                <ul style="text-align: left;">
                    <li>Understand proper protocols and procedures</li>
                    <li>Practice professional communication techniques</li>
                    <li>Learn risk assessment and safety measures</li>
                    <li>Develop critical thinking skills</li>
                </ul>

                <h3>🚀 Ready to Begin Training?</h3>
                <p>This interactive scenario will guide you through realistic situations you may encounter in your care work.</p>

                <div style="margin-top: 20px;">
                    <button class="begin-training-btn start-btn" style="margin-right: 10px;">
                        Begin Training
                    </button>
                    <button class="close-modal-btn" style="background: #6c757d; color: white; padding: 10px 20px; border: none; border-radius: 5px;">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add event listeners to the modal
    const closeBtn = modal.querySelector('.close');
    const closeModalBtn = modal.querySelector('.close-modal-btn');
    const beginTrainingBtn = modal.querySelector('.begin-training-btn');

    closeBtn.addEventListener('click', () => modal.remove());
    closeModalBtn.addEventListener('click', () => modal.remove());
    beginTrainingBtn.addEventListener('click', () => beginScenarioTraining(scenario.id));

    document.body.appendChild(modal);
}

function beginScenarioTraining(scenarioId) {
    const scenario = trainingScenarios.find(s => s.id === scenarioId);
    const content = document.getElementById('scenario-content');

    // Check if this is a trial scenario with full content
    if (scenario.isTrial && scenarioContent[scenarioId]) {
        startDetailedTraining(scenarioId, scenario);
    } else {
        // Show preview for non-trial scenarios
        showTrainingPreview(scenario);
    }
}

function startDetailedTraining(scenarioId, scenario) {
    const content = document.getElementById('scenario-content');
    const detailedContent = scenarioContent[scenarioId];

    content.innerHTML = `
        <div style="text-align: left;">
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h4>🎯 Scenario Situation:</h4>
                <p><strong>${detailedContent.situation}</strong></p>
            </div>

            <div id="training-steps">
                <div style="text-align: center; margin: 20px 0;">
                    <button class="start-btn" id="begin-steps-btn">
                        Begin Step-by-Step Training
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add event listener for the begin steps button
    setTimeout(() => {
        const beginStepsBtn = document.getElementById('begin-steps-btn');
        if (beginStepsBtn) {
            beginStepsBtn.addEventListener('click', () => beginTrainingSteps(scenarioId));
        }
    }, 100);
}

function beginTrainingSteps(scenarioId) {
    const detailedContent = scenarioContent[scenarioId];
    const content = document.getElementById('training-steps');
    let currentStep = 0;

    function showStep(stepIndex) {
        if (stepIndex >= detailedContent.steps.length) {
            showCompletion(scenarioId);
            return;
        }

        const step = detailedContent.steps[stepIndex];

        content.innerHTML = `
            <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0;">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 15px;">
                    <h3 style="color: #667eea;">Step ${step.step}: ${step.title}</h3>
                    <span style="background: #667eea; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px;">
                        ${stepIndex + 1} of ${detailedContent.steps.length}
                    </span>
                </div>

                <p style="margin-bottom: 15px;"><strong>${step.content}</strong></p>

                ${step.points ? `
                    <ul style="margin: 15px 0;">
                        ${step.points.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                ` : ''}

                ${step.dialogue ? `
                    <div style="margin: 15px 0;">
                        <div style="background: #d4edda; padding: 10px; border-radius: 5px; margin: 10px 0;">
                            <strong>✅ Good approach:</strong> "${step.dialogue.good}"
                        </div>
                        <div style="background: #f8d7da; padding: 10px; border-radius: 5px; margin: 10px 0;">
                            <strong>❌ Avoid saying:</strong> "${step.dialogue.bad}"
                        </div>
                    </div>
                ` : ''}

                ${step.scenarios ? `
                    <div style="margin: 15px 0;">
                        ${step.scenarios.map(s => `
                            <div style="border-left: 3px solid #667eea; padding-left: 15px; margin: 10px 0;">
                                <strong>Client says:</strong> ${s.concern}<br>
                                <strong>Your response:</strong> "${s.response}"
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${step.tips ? `
                    <div style="background: #fff3cd; padding: 10px; border-radius: 5px; margin: 15px 0;">
                        <strong>💡 Tip:</strong> ${step.tips}
                    </div>
                ` : ''}

                ${step.critical ? `
                    <div style="background: #f8d7da; padding: 10px; border-radius: 5px; margin: 15px 0;">
                        <strong>⚠️ Critical:</strong> ${step.critical}
                    </div>
                ` : ''}

                <div style="text-align: center; margin-top: 20px;">
                    ${stepIndex > 0 ? `<button class="prev-step-btn" data-step="${stepIndex - 1}" style="background: #6c757d; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin-right: 10px;">Previous</button>` : ''}
                    <button class="next-step-btn start-btn" data-step="${stepIndex + 1}">
                        ${stepIndex + 1 < detailedContent.steps.length ? 'Next Step' : 'Complete Training'}
                    </button>
                </div>
            </div>
        `;

        // Add event listeners for navigation buttons
        setTimeout(() => {
            const prevBtn = content.querySelector('.prev-step-btn');
            const nextBtn = content.querySelector('.next-step-btn');

            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    const stepNum = parseInt(prevBtn.getAttribute('data-step'));
                    showStep(stepNum);
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    const stepNum = parseInt(nextBtn.getAttribute('data-step'));
                    showStep(stepNum);
                });
            }
        }, 50);
    }

    // Start with first step
    showStep(0);
}

function showCompletion(scenarioId) {
    const detailedContent = scenarioContent[scenarioId];
    const content = document.getElementById('training-steps');

    content.innerHTML = `
        <div style="text-align: center;">
            <div style="background: #d4edda; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3>🎉 Training Complete!</h3>
                <p>You've successfully completed the <strong>${detailedContent.title}</strong> training module.</p>
            </div>

            <div style="text-align: left; background: #e7f3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h4>🎯 Key Learning Points:</h4>
                <ul>
                    ${detailedContent.keyLearning.map(point => `<li>${point}</li>`).join('')}
                </ul>

                <h4 style="margin-top: 20px;">⚠️ Red Flags - Never:</h4>
                <ul style="color: #dc3545;">
                    ${detailedContent.redFlags.map(point => `<li>${point}</li>`).join('')}
                </ul>
            </div>

            <div style="background: #fff3cd; padding: 15px; border-radius: 10px; margin: 20px 0;">
                <p><strong>🎓 Trial Scenario Complete!</strong></p>
                <p>This demonstrates the quality and depth of our training content. Scenario 2 (Bathroom Fall Emergency) is also available in trial mode.</p>
                <p>The full version includes 20 additional scenarios with this same level of detail.</p>
            </div>

            <button class="upgrade-now-btn upgrade-btn" style="margin-right: 10px;">
                Upgrade to Full Version - £299
            </button>
            <button class="close-training-btn" style="background: #6c757d; color: white; padding: 10px 20px; border: none; border-radius: 5px;">
                Close
            </button>
        </div>
    `;

    // Add event listeners
    setTimeout(() => {
        const upgradeBtn = document.querySelector('.upgrade-now-btn');
        const closeBtn = document.querySelector('.close-training-btn');

        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                showUpgradeModal();
                upgradeBtn.closest('.modal').remove();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeBtn.closest('.modal').remove());
        }
    }, 100);

    // Record progress
    console.log(`User completed detailed scenario ${scenarioId}: ${detailedContent.title}`);
}

function showTrainingPreview(scenario) {
    const content = document.getElementById('scenario-content');

    content.innerHTML = `
        <div style="text-align: center;">
            <h3>🔒 Full Training Content</h3>
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h4>${scenario.title}</h4>
                <p>This scenario includes:</p>
                <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
                    <li>📋 Detailed step-by-step guidance</li>
                    <li>💬 Professional communication examples</li>
                    <li>⚠️ Critical safety protocols</li>
                    <li>📝 Documentation requirements</li>
                    <li>🎯 Learning objectives and outcomes</li>
                </ul>
                <p style="margin-top: 15px;"><strong>Available with full license only</strong></p>
            </div>

            <button class="upgrade-now-btn upgrade-btn" style="margin-right: 10px;">
                Upgrade to Access - £299
            </button>
            <button class="close-training-btn" style="background: #6c757d; color: white; padding: 10px 20px; border: none; border-radius: 5px;">
                Close
            </button>
        </div>
    `;

    // Add event listeners
    setTimeout(() => {
        const upgradeBtn = document.querySelector('.upgrade-now-btn');
        const closeBtn = document.querySelector('.close-training-btn');

        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                showUpgradeModal();
                upgradeBtn.closest('.modal').remove();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeBtn.closest('.modal').remove());
        }
    }, 100);
}

function showUpgradeModal() {
    document.getElementById('upgrade-modal').style.display = 'block';
}

function startPayment() {
    // Demo payment simulation
    alert('💰 Payment Demo\n\nThis demonstrates the payment workflow:\n\n• Stripe integration ready\n• Secure payment processing\n• License activation system\n• Email confirmations\n\nCurrent Status: Platform foundation with 22 professional scenarios ready for interactive development.\n\n🚀 Roadmap: Full interactive features in development.');

    // Simulate successful payment for demo
    if (confirm('Simulate successful payment for demo purposes?')) {
        setTimeout(() => {
            licenseStatus.isTrialMode = false;
            licenseStatus.scenariosUnlocked = 22;

            alert('🎉 Demo Payment Successful!\n\nAll 22 scenario frameworks are now accessible!\n\n(In production, this would unlock interactive training modules as they are developed)');

            // Reload the page to show unlocked scenarios
            location.reload();
        }, 1000);
    }
}

// Note: Modal click outside functionality is now handled in setupEventListeners()