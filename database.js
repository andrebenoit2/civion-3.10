// Database initialization and operations
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create database connection
const db = new sqlite3.Database(join(__dirname, 'civion.db'), (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Campaign data table
        db.run(`CREATE TABLE IF NOT EXISTS campaign_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            campaign_name TEXT,
            campaign_representative TEXT,
            campaign_scope TEXT,
            campaign_goal TEXT,
            introductory_message TEXT,
            training_text TEXT,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // Analytics table
        db.run(`CREATE TABLE IF NOT EXISTS analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            campaign_id INTEGER NOT NULL,
            progress_percentage REAL,
            engagement_score REAL,
            total_contacts INTEGER DEFAULT 0,
            active_conversations INTEGER DEFAULT 0,
            response_rate REAL DEFAULT 0,
            recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (campaign_id) REFERENCES campaign_data (id)
        )`);

        // Contacts table
        db.run(`CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            campaign_id INTEGER NOT NULL,
            name TEXT,
            phone TEXT,
            email TEXT,
            status TEXT DEFAULT 'pending',
            imported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (campaign_id) REFERENCES campaign_data (id)
        )`);

        // Conversations table
        db.run(`CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            sender TEXT NOT NULL,
            sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contact_id) REFERENCES contacts (id)
        )`);
    });
}

// User operations
const userOps = {
    async createUser(username, email, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    },

    async validateUser(email, password) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM users WHERE email = ?',
                [email],
                async (err, user) => {
                    if (err) reject(err);
                    if (!user) resolve(null);
                    const valid = await bcrypt.compare(password, user.password);
                    resolve(valid ? user : null);
                }
            );
        });
    },

    async getUserById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT id, username, email FROM users WHERE id = ?', [id], (err, user) => {
                if (err) reject(err);
                else resolve(user);
            });
        });
    }
};

// Campaign operations
const campaignOps = {
    async saveCampaignData(userId, data) {
        return new Promise((resolve, reject) => {
            db.run(`
                INSERT OR REPLACE INTO campaign_data 
                (user_id, campaign_name, campaign_representative, campaign_scope, 
                campaign_goal, introductory_message, training_text)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                userId,
                data.campaignName,
                data.campaignRepresentative,
                data.campaignScope,
                data.campaignGoal,
                data.introductoryMessage,
                data.trainingText
            ], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    },

    async getCampaignData(userId) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM campaign_data WHERE user_id = ?',
                [userId],
                (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                }
            );
        });
    }
};

// Analytics operations
const analyticsOps = {
    async updateAnalytics(campaignId, data) {
        return new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO analytics 
                (campaign_id, progress_percentage, engagement_score, 
                total_contacts, active_conversations, response_rate)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                campaignId,
                data.progress,
                data.engagementScore,
                data.totalContacts,
                data.activeConversations,
                data.responseRate
            ], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    },

    async getAnalytics(campaignId) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM analytics WHERE campaign_id = ? ORDER BY recorded_at DESC LIMIT 1',
                [campaignId],
                (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                }
            );
        });
    }
};

// Contact operations
const contactOps = {
    async addContacts(campaignId, contacts) {
        const stmt = db.prepare(`
            INSERT INTO contacts (campaign_id, name, phone, email)
            VALUES (?, ?, ?, ?)
        `);

        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');
                contacts.forEach(contact => {
                    stmt.run([campaignId, contact.name, contact.phone, contact.email]);
                });
                stmt.finalize();
                db.run('COMMIT', err => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    },

    async getContacts(campaignId) {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM contacts WHERE campaign_id = ?',
                [campaignId],
                (err, contacts) => {
                    if (err) reject(err);
                    else resolve(contacts);
                }
            );
        });
    }
};

// Conversation operations
const conversationOps = {
    async addMessage(contactId, message, sender) {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO conversations (contact_id, message, sender) VALUES (?, ?, ?)',
                [contactId, message, sender],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    },

    async getConversation(contactId) {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM conversations WHERE contact_id = ? ORDER BY sent_at ASC',
                [contactId],
                (err, messages) => {
                    if (err) reject(err);
                    else resolve(messages);
                }
            );
        });
    }
};

export {
    userOps,
    campaignOps,
    analyticsOps,
    contactOps,
    conversationOps
};
