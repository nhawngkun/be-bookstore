const neo4jConnection = require('./database');
require('dotenv').config();

async function testConnection() {
    console.log('🧪 Testing Neo4j connection...\n');

    try {
        // Test basic connection
        console.log('1. Testing basic connection...');
        await neo4jConnection.connect();

        // Test query execution  
        console.log('2. Testing query execution...');
        await neo4jConnection.testQuery();

        // Test health check
        console.log('3. Testing health check...');
        const health = await neo4jConnection.healthCheck();
        console.log('Health status:', health);

        // Test session creation
        console.log('4. Testing session creation...');
        const session = neo4jConnection.getSession();
        const result = await session.run('RETURN 1 as number');
        console.log('Session test result:', result.records[0].get('number'));
        await session.close();

        console.log('\n✅ All tests passed! Neo4j is ready to use.');

    } catch (error) {
        console.error('\n❌ Connection test failed:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        await neo4jConnection.close();
        process.exit(0);
    }
}

// Run the test
testConnection();