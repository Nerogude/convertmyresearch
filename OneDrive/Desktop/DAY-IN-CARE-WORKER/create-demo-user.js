// Simple script to create a demo user via API
const API_BASE = 'https://care-worker-training.onrender.com/api';

async function createDemoUser() {
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'demo@sunshinecare.co.uk',
                password: 'password123',
                firstName: 'Demo',
                lastName: 'Manager',
                orgCode: 'SUNSHINE',
                role: 'manager'
            })
        });

        const data = await response.json();
        console.log('Demo user creation result:', data);

        if (response.ok) {
            console.log('✅ Demo user created successfully!');
            console.log('Email: demo@sunshinecare.co.uk');
            console.log('Password: password123');
        } else {
            console.log('❌ Failed to create demo user:', data.error);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

// Run the function
createDemoUser();