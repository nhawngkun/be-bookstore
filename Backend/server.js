const express = require('express');
const cors = require('cors');
const neo4jConnection = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8881;

// Middleware
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const healthStatus = await neo4jConnection.healthCheck();
        res.status(healthStatus.status === 'healthy' ? 200 : 500).json({
            ...healthStatus,
            timestamp: new Date().toISOString(),
            server: 'running'
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Test endpoint
app.get('/test', async (req, res) => {
    try {
        const testResult = await neo4jConnection.testQuery();
        res.json({
            success: testResult,
            message: testResult ? 'Neo4j is working!' : 'Neo4j test failed',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Example API endpoint - Create user
app.post('/api/users', async (req, res) => {
    const session = neo4jConnection.getSession();
    try {
        const { name, email } = req.body;

        const query = `
      CREATE (u:User {name: $name, email: $email, createdAt: datetime()})
      RETURN u
    `;

        const result = await session.run(query, { name, email });
        const user = result.records[0].get('u').properties;

        res.status(201).json({ success: true, user });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        await session.close();
    }
});

// Example API endpoint - Get all users
app.get('/api/users', async (req, res) => {
    const session = neo4jConnection.getSession();
    try {
        const query = `MATCH (u:User) RETURN u ORDER BY u.createdAt DESC`;
        const result = await session.run(query);

        const users = result.records.map(record => record.get('u').properties);

        res.json({ success: true, users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        await session.close();
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Backend API is running!',
        endpoints: {
            health: '/health',
            test: '/test',
            users: '/api/users'
        },
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// Start server
async function startServer() {
    try {
        // Kết nối Neo4j trước khi start server
        await neo4jConnection.connect();

        // Test query để đảm bảo hoạt động
        await neo4jConnection.testQuery();

        // Start HTTP server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await neo4jConnection.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down server...');
    await neo4jConnection.close();
    process.exit(0);
});

// Start the application
startServer();