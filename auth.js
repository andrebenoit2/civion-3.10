// API endpoint configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Demo mode flag
const DEMO_MODE = true;

// Function to handle user registration
async function handleRegistration(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Basic validation
    if (!username || !email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    if (DEMO_MODE) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.href = 'login.html';
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        alert('Error creating account. Please try again.');
        console.error('Registration error:', error);
    }
}

// Function to handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Basic validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    if (DEMO_MODE) {
        sessionStorage.setItem('currentUser', JSON.stringify({
            id: 'demo-user',
            username: 'Demo User',
            email: 'demo@example.com',
            loginTime: new Date().toISOString()
        }));
        window.location.href = 'dashboard.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            sessionStorage.setItem('currentUser', JSON.stringify({
                id: data.user.id,
                username: data.user.username,
                email: data.user.email,
                loginTime: new Date().toISOString()
            }));
            window.location.href = 'dashboard.html';
        } else {
            alert(data.error || 'Invalid email or password');
        }
    } catch (error) {
        alert('Error logging in. Please try again.');
        console.error('Login error:', error);
    }
}

// Function to check if user is logged in
function checkAuth() {
    if (DEMO_MODE) {
        // In demo mode, create a mock user session if none exists
        if (!sessionStorage.getItem('currentUser')) {
            sessionStorage.setItem('currentUser', JSON.stringify({
                id: 'demo-user',
                username: 'Demo User',
                email: 'demo@example.com',
                loginTime: new Date().toISOString()
            }));
        }
        return;
    }
    
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
    }
}

// Function to logout
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Function to get current user info
function getCurrentUser() {
    const currentUser = sessionStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
}

// Function to save campaign dashboard data
async function saveDashboardData() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const dashboardData = {
        campaignName: document.getElementById('campaign-name').value,
        campaignRepresentative: document.getElementById('campaign-representative').value,
        campaignScope: document.getElementById('campaign-scope').value,
        campaignGoal: document.getElementById('campaign-goal').value,
        introductoryMessage: document.getElementById('introductory-message').value,
        trainingText: document.getElementById('training-text').value
    };

    if (DEMO_MODE) {
        console.log('Demo Mode: Saving dashboard data', dashboardData);
        return;
    }

    try {
        const campaignResponse = await fetch(`${API_BASE_URL}/campaign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUser.id,
                campaignData: dashboardData
            })
        });
        
        const campaignResult = await campaignResponse.json();
        
        if (campaignResult.success) {
            const analyticsData = {
                progress: calculateProgress(),
                engagementScore: calculateEngagement(),
                totalContacts: getTotalContacts(),
                activeConversations: getActiveConversations(),
                responseRate: calculateResponseRate()
            };
            
            await fetch(`${API_BASE_URL}/analytics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    campaignId: campaignResult.campaignId,
                    data: analyticsData
                })
            });
        }
    } catch (error) {
        console.error('Error saving dashboard data:', error);
        alert('Error saving data. Please try again.');
    }
}

// Function to load campaign dashboard data
async function loadDashboardData() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    if (DEMO_MODE) {
        const demoData = {
            campaign_name: 'Demo Campaign',
            campaign_representative: 'John Demo',
            campaign_scope: 'City-wide',
            campaign_goal: 'Increase voter engagement',
            introductory_message: 'Hello! This is a demo campaign.',
            training_text: 'Demo training text for chatbot customization.'
        };
        
        document.getElementById('campaign-name').value = demoData.campaign_name;
        document.getElementById('campaign-representative').value = demoData.campaign_representative;
        document.getElementById('campaign-scope').value = demoData.campaign_scope;
        document.getElementById('campaign-goal').value = demoData.campaign_goal;
        document.getElementById('introductory-message').value = demoData.introductory_message;
        document.getElementById('training-text').value = demoData.training_text;

        if (document.getElementById('introMessage')) {
            document.getElementById('introMessage').textContent = demoData.introductory_message;
        }

        updateAnalyticsDisplay({
            progress_percentage: 45,
            engagement_score: 8.4,
            total_contacts: 150,
            active_conversations: 45,
            response_rate: 30
        });

        return;
    }

    try {
        const campaignResponse = await fetch(`${API_BASE_URL}/campaign/${currentUser.id}`);
        const campaignResult = await campaignResponse.json();
        
        if (campaignResult.success && campaignResult.campaignData) {
            const campaignData = campaignResult.campaignData;
            
            document.getElementById('campaign-name').value = campaignData.campaign_name || '';
            document.getElementById('campaign-representative').value = campaignData.campaign_representative || '';
            document.getElementById('campaign-scope').value = campaignData.campaign_scope || '';
            document.getElementById('campaign-goal').value = campaignData.campaign_goal || '';
            document.getElementById('introductory-message').value = campaignData.introductory_message || '';
            document.getElementById('training-text').value = campaignData.training_text || '';

            if (campaignData.introductory_message && document.getElementById('introMessage')) {
                document.getElementById('introMessage').textContent = campaignData.introductory_message;
            }

            const analyticsResponse = await fetch(`${API_BASE_URL}/analytics/${campaignData.id}`);
            const analyticsResult = await analyticsResponse.json();
            
            if (analyticsResult.success && analyticsResult.analytics) {
                updateAnalyticsDisplay(analyticsResult.analytics);
            }
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Helper functions for analytics calculations
function calculateProgress() {
    return 45; // Placeholder
}

function calculateEngagement() {
    return 8.4; // Placeholder
}

function getTotalContacts() {
    return 150; // Placeholder
}

function getActiveConversations() {
    return 45; // Placeholder
}

function calculateResponseRate() {
    return 30; // Placeholder
}

function updateAnalyticsDisplay(analytics) {
    console.log('Updating analytics display:', analytics);
}

// Export functions for use in HTML
window.handleRegistration = handleRegistration;
window.handleLogin = handleLogin;
window.checkAuth = checkAuth;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.saveDashboardData = saveDashboardData;
window.loadDashboardData = loadDashboardData;
