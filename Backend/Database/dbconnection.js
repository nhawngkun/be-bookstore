// Database/dbconnection.js
import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Đảm bảo đọc file config.env từ đường dẫn đúng
dotenv.config({ path: "./Config/config.env" });

// Thử nhiều cách kết nối khác nhau để tìm ra cách hoạt động
const attemptConnections = async () => {
  const connections = [
    // Kết nối 1: Sử dụng config.env (Ưu tiên)
    {
      uri: process.env.NEO4J_URI,
      user: process.env.NEO4J_USER,
      password: process.env.NEO4J_PASSWORD,
      description: "Using config.env"
    },
    // Kết nối 2: Localhost 7690 (mặc định cho ứng dụng này)
    {
      uri: "bolt://localhost:7690",
      user: "neo4j",
      password: "thang044",
      description: "Default port 7690"
    },
    // Kết nối 3: Localhost 7687 (cổng Neo4j mặc định)
    {
      uri: "bolt://localhost:7687",
      user: "neo4j",
      password: "thang044", 
      description: "Default Neo4j port 7687"
    }
  ];

  let driver = null;
  let successConfig = null;

  console.log("Attempting to connect to Neo4j...");
  
  for (const config of connections) {
    try {
      console.log(`Trying connection: ${config.description}`);
      console.log(`URI: ${config.uri}, User: ${config.user}`);
      
      const tempDriver = neo4j.driver(
        config.uri,
        neo4j.auth.basic(config.user, config.password)
      );
      
      // Kiểm tra kết nối
      await tempDriver.verifyConnectivity();
      
      // Nếu thành công, lưu lại driver và config
      driver = tempDriver;
      successConfig = config;
      console.log(`✅ Successfully connected to Neo4j using: ${config.description}`);
      break;
    } catch (error) {
      console.log(`❌ Connection failed: ${config.description}`);
      console.log(`   Error: ${error.message}`);
    }
  }

  if (!driver) {
    console.error("❌ Failed to connect to Neo4j with all configurations!");
    console.error("Please ensure Neo4j is running and accessible.");
    // Return a dummy driver that will throw clear errors if used
    return {
      session: () => {
        throw new Error("Neo4j connection failed. Please check your database connection.");
      },
      close: () => {}
    };
  }

  // Lưu lại cấu hình thành công để sử dụng sau này
  console.log(`Neo4j connected at: ${successConfig.uri}`);
  return driver;
};

// Khởi tạo driver Neo4j
const driver = await attemptConnections();

export default driver;
