const neo4j = require('neo4j-driver');

class Neo4jConnection {
  constructor() {
    this.driver = null;
    this.session = null;
  }

  // Khởi tạo kết nối
  async connect() {
    try {
      const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
      const username = process.env.NEO4J_USERNAME || 'neo4j';
      const password = process.env.NEO4J_PASSWORD || 'CHbgeuFYkVw9JrhXYsZ34bDxyGzkwP-phI7r-jyjZc';
      const database = process.env.NEO4J_DATABASE || 'neo4j';

      console.log('🔗 Connecting to Neo4j...');
      console.log('URI:', uri);
      console.log('Username:', username);
      console.log('Database:', database);

      // Cấu hình driver dựa trên loại connection
      const isCloud = uri.startsWith('neo4j+s://') || uri.startsWith('neo4j+ssc://');
      
      const config = {
        encrypted: isCloud ? 'ENCRYPTION_ON' : 'ENCRYPTION_OFF',
        trust: isCloud ? 'TRUST_SYSTEM_CA_SIGNED_CERTIFICATES' : 'TRUST_ALL_CERTIFICATES',
        maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
        disableLosslessIntegers: true
      };

      this.driver = neo4j.driver(
        uri,
        neo4j.auth.basic(username, password),
        config
      );

      // Test connection
      await this.driver.verifyConnectivity();
      console.log('✅ Neo4j connected successfully!');
      
      return true;
    } catch (error) {
      console.error('❌ Neo4j connection failed:', error.message);
      throw error;
    }
  }

  // Tạo session
  getSession(database = null) {
    if (!this.driver) {
      throw new Error('Driver not initialized. Call connect() first.');
    }
    
    return this.driver.session({
      database: database || process.env.NEO4J_DATABASE || 'neo4j'
    });
  }

  // Test query
  async testQuery() {
    const session = this.getSession();
    try {
      const result = await session.run('RETURN "Hello Neo4j!" as message');
      const record = result.records[0];
      console.log('Test query result:', record.get('message'));
      return true;
    } catch (error) {
      console.error('Test query failed:', error.message);
      return false;
    } finally {
      await session.close();
    }
  }

  // Đóng kết nối
  async close() {
    if (this.driver) {
      await this.driver.close();
      console.log('Neo4j connection closed');
    }
  }

  // Health check
  async healthCheck() {
    try {
      await this.driver.verifyConnectivity();
      return { status: 'healthy', database: 'connected' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

// Tạo instance global
const neo4jConnection = new Neo4jConnection();

module.exports = neo4jConnection;