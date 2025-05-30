import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import fs from 'fs';

// Đọc file .env
dotenv.config({ path: "./Config/config.env" });

// Kiểm tra kết nối Neo4j với các cấu hình khác nhau
async function checkConnections() {
  // Đọc và hiển thị nội dung file config.env để debug
  try {
    console.log("Current directory:", process.cwd());
    const configPath = "./Config/config.env";
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      console.log("Config file content:");
      console.log(configContent);
    } else {
      console.log("Config file not found at:", configPath);
    }
  } catch (error) {
    console.log("Error reading config file:", error);
  }

  const connections = [
    {
      uri: process.env.NEO4J_URI || "",
      user: process.env.NEO4J_USER || "",
      password: process.env.NEO4J_PASSWORD || "",
      description: "Environment variables"
    },
    {
      uri: "bolt://localhost:7690",
      user: "neo4j",
      password: "thang044",
      description: "Default port 7690"
    },
    {
      uri: "bolt://localhost:7687",
      user: "neo4j",
      password: "thang044", 
      description: "Default Neo4j port 7687"
    }
  ];

  for (const config of connections) {
    if (!config.uri) {
      console.log(`Skipping ${config.description} - No URI provided`);
      continue;
    }
    
    try {
      console.log(`\nTesting connection: ${config.description}`);
      console.log(`URI: ${config.uri}, User: ${config.user}`);
      
      const driver = neo4j.driver(
        config.uri,
        neo4j.auth.basic(config.user, config.password)
      );
      
      console.log("Verifying connectivity...");
      await driver.verifyConnectivity();
      console.log("✅ Connection successful!");
      
      // Kiểm tra nếu có thể truy vấn dữ liệu
      const session = driver.session();
      try {
        const result = await session.run('RETURN 1 as n');
        const value = result.records[0].get('n').toNumber();
        console.log(`Test query result: ${value}`);
        console.log("✅ Database query successful!");
      } catch (queryError) {
        console.error("❌ Database query failed:", queryError.message);
      } finally {
        await session.close();
      }
      
      await driver.close();
    } catch (error) {
      console.error(`❌ Connection failed: ${error.message}`);
    }
  }
}

// Chạy kiểm tra
checkConnections().then(() => {
  console.log("\nConnection tests completed. Please check results above.");
});
