import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
    userOps,
    campaignOps,
    analyticsOps,
    contactOps,
    conversationOps
} from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname)));

// Serve HTML files
app.get('/:page.html', (req, res) => {
    res.sendFile(join(__dirname, req.params.page + '.html'));
});
app.use(express.urlencoded({ extended: true }));


// User Routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userId = await userOps.createUser(username, email, password);
        res.json({ success: true, userId });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message.includes('UNIQUE constraint') ? 
                'Email already exists' : 'Registration failed'
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userOps.validateUser(email, password);
        if (user) {
            res.json({ 
                success: true, 
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(400).json({ success: false, error: 'Login failed' });
    }
});

// Campaign Routes
app.post('/api/campaign', async (req, res) => {
    try {
        const { userId, campaignData } = req.body;
        const campaignId = await campaignOps.saveCampaignData(userId, campaignData);
        res.json({ success: true, campaignId });
    } catch (error) {
        res.status(400).json({ success: false, error: 'Failed to save campaign data' });
    }
});

app.get('/api/campaign/:userId', async (req, res) => {
    try {
        const campaignData = await campaignOps.getCampaignData(req.params.userId);
        res.json({ success: true, campaignData });
    } catch (error) {
        res.status(400).json({ success: false, error: 'Failed to fetch campaign data' });
    }
});

// Analytics Routes
app.post('/api/analytics', async (req, res) => {
    try {
        const { campaignId, data } = req.body;
        const analyticsId = await analyticsOps.updateAnalytics(campaignId, data);
        res.json({ success: true, analyticsId });
    } catch (error) {
        res.status(400).json({ success: false, error: 'Failed to update analytics' });
    }
});

app.get('/api/analytics/:campaignId', async (req, res) => {
    try {
        const analytics = await analyticsOps.getAnalytics(req.params.campaignId);
        res.json({ success: true, analytics });
    } catch (error) {
        res.status(400).json({ success: false, error: 'Failed to fetch analytics' });
    }
});

// Contact Routes
app.post('/api/contacts', async (req, res) => {
    try {
        const { campaignId, contacts } = req.body;
        await contactOps.addContacts(campaignId, contacts);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, error: 'Failed to add contacts' });
    }
});

app.get('/api/contacts/:campaignId', async (req, res) => {
    try {
        const contacts = await contactOps.getContacts(req.params.campaignId);
        res.json({ success: true, contacts });
    } catch (error) {
        res.status(400).json({ success: false, error: 'Failed to fetch contacts' });
    }
});

// Conversation Routes
app.post('/api/conversation', async (req, res) => {
    try {
        const { contactId, message, sender } = req.body;
        const messageId = await conversationOps.addMessage(contactId, message, sender);
        res.json({ success: true, messageId });
    } catch (error) {
        res.status(400).json({ success: false, error: 'Failed to add message' });
    }
});

app.get('/api/conversation/:contactId', async (req, res) => {
    try {
        const messages = await conversationOps.getConversation(req.params.contactId);
        res.json({ success: true, messages });
    } catch (error) {
        res.status(400).json({ success: false, error: 'Failed to fetch conversation' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
