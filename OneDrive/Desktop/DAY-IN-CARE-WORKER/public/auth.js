// Authentication JavaScript

// API Base URL
const API_BASE = '/api';

// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
}

// Show success message
function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
}

// Hide messages
function hideMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}

// Set loading state for button
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="loading"></span>Processing...';
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || button.innerHTML.replace('<span class="loading"></span>Processing...', '');
    }
}

// Store authentication tokens
function storeAuth(data) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
}

// Get stored auth token
function getAuthToken() {
    return localStorage.getItem('accessToken');
}

// Get stored user data
function getUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}

// Clear authentication data
function clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
}

// Check if user is authenticated
function isAuthenticated() {
    const token = getAuthToken();
    const user = getUser();
    return !!(token && user);
}

// Make authenticated API request
async function apiRequest(url, options = {}) {
    const token = getAuthToken();

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const response = await fetch(API_BASE + url, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

// Login form handler
if (loginForm) {
    const loginBtn = document.getElementById('login-btn');
    loginBtn.dataset.originalText = loginBtn.innerHTML;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessages();

        const formData = new FormData(loginForm);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        setButtonLoading(loginBtn, true);

        try {
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });

            storeAuth(data);
            showSuccess('Login successful! Redirecting...');

            // Redirect based on role
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);

        } catch (error) {
            showError(error.message);
        } finally {
            setButtonLoading(loginBtn, false);
        }
    });
}

// Register form handler
if (registerForm) {
    const registerBtn = document.getElementById('register-btn');
    registerBtn.dataset.originalText = registerBtn.innerHTML;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessages();

        const formData = new FormData(registerForm);
        const userData = {
            email: formData.get('email'),
            password: formData.get('password'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            orgCode: formData.get('orgCode').toUpperCase(),
            role: formData.get('role')
        };

        // Basic validation
        if (userData.password.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }

        setButtonLoading(registerBtn, true);

        try {
            const data = await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            showSuccess('Registration successful! You can now log in with your credentials.');
            registerForm.reset();

            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            showError(error.message);
        } finally {
            setButtonLoading(registerBtn, false);
        }
    });
}

// Auto-redirect if already logged in (for login/register pages)
if ((loginForm || registerForm) && isAuthenticated()) {
    window.location.href = '/';
}

// Organization code formatting
const orgCodeInput = document.getElementById('orgCode');
if (orgCodeInput) {
    orgCodeInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });
}