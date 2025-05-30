// index.js
import express from 'express';
import { configDotenv } from 'dotenv';
import driver from './Database/dbconnection.js'; // ← dùng đúng tên export
import router from './Router/router.js';
import cors from 'cors';

configDotenv({ path: "./config/config.env" });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true
}));

const port = process.env.PORT || 8881;

app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});

// DÙNG router
app.use('/', router);

// ❌ KHÔNG gọi DbConnect() nữa!
// vì dbconnection.js đã kết nối sẵn rồi khi import
