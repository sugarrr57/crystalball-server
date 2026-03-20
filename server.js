/**
 * 魔法水晶球 - Node.js 后端服务器
 *
 * 启动步骤：
 * 1. 确保 MongoDB 已安装并运行（本地端口 27017）
 * 2. 运行：npm start
 * 3. 服务器将在 http://localhost:5000 启动
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 强制设置 JWT 配置默认值（解决 Railway 环境变量读取问题）
process.env.JWT_SECRET = process.env.JWT_SECRET || 'crystalball-secret-key-change-in-production';
process.env.JWT_EXPIRE = '7d'; // 直接使用固定值

const app = express();

// 中间件配置
app.use(cors({
    origin: '*', // 允许所有来源访问
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true }));

// MongoDB 连接配置 - 异步非阻塞
let dbConnected = false;
let dbConnecting = false;

const connectDB = async () => {
    if (dbConnected || dbConnecting) return;
    dbConnecting = true;

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 3000,
            socketTimeoutMS: 5000,
        });
        dbConnected = true;
        console.log('✅ MongoDB 连接成功');
    } catch (err) {
        console.error('⚠️ MongoDB 连接失败:', err.message);
        // 不抛出错误，让应用可以继续运行
    } finally {
        dbConnecting = false;
    }
};

// 立即开始连接（非阻塞）
connectDB();

app.get('/', (req, res) => {
    res.send({
        status: 'ok',
        message: '后端服务运行成功！',
        author: 'sugarrr'
    });
});

// 导入路由
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const taskRoutes = require('./routes/tasks');
// 后续添加其他模块的路由...

// 注册路由
app.use('/api/auth', authRoutes);      // 认证相关：/api/auth/login, /api/auth/register
app.use('/api/notes', notesRoutes);    // 快捷备忘：/api/notes
app.use('/api/tasks', taskRoutes);     // 任务看板：/api/tasks

// 全局错误处理
app.use((err, req, res, next) => {
    console.error('错误:', err);
    res.status(500).json({
        message: err.message || '服务器内部错误'
    });
});

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'CrystalBall Server',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        database: dbConnected ? 'connected' : 'disconnected'
    });
});

// 404 错误处理
app.use((req, res) => {
    res.status(404).json({ message: '接口不存在' });
});

// 导出 app（Vercel/云平台使用）
module.exports = app;

// 在任何环境下都启动服务器（包括 Railway 等云平台）
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`╔═══════════════════════════════════════════╗
║   🎉 魔法水晶球服务器启动成功！           ║
║                                           ║
║   🌐 访问地址：http://localhost:${PORT}       ║
║   📊 API 文档：http://localhost:${PORT}/api/health ║
║   💾 数据库：MongoDB                      ║
╚═══════════════════════════════════════════╝
  `);
});

