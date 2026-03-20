/**
 * 认证相关 API 路由
 *
 * 包含：注册、登录、获取当前用户信息
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // 验证必填字段
        if (!username || !password) {
            return res.status(400).json({
                message: '用户名和密码不能为空'
            });
        }

        // 检查用户名是否已存在
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                message: '用户名已被使用'
            });
        }

        // 密码加密
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 创建用户
        const user = new User({
            username,
            password: hashedPassword,
            email,
        });

        await user.save();

        // 生成 token
        const jwtSecret = process.env.JWT_SECRET || 'crystalball-secret-key-change-in-production';
        const jwtExpire = process.env.JWT_EXPIRE || '7d';

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            jwtSecret,
            { expiresIn: jwtExpire }
        );

        res.status(201).json({
            message: '注册成功',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({
            message: '注册失败：' + error.message
        });
    }
});

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 验证必填字段
        if (!username || !password) {
            return res.status(400).json({
                message: '用户名和密码不能为空'
            });
        }

        // 查找用户
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                message: '用户名或密码错误'
            });
        }

        // 验证密码
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: '用户名或密码错误'
            });
        }

        // 更新最后登录时间
        user.lastLoginAt = new Date();
        await user.save();

        // 生成 token
        const jwtSecret = process.env.JWT_SECRET || 'crystalball-secret-key-change-in-production';
        const jwtExpire = process.env.JWT_EXPIRE || '7d';

        // 确保 jwtExpire 是有效的字符串
        const expireValue = jwtExpire ? String(jwtExpire) : '7d';

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            jwtSecret,
            { expiresIn: expireValue }
        );

        res.json({
            message: '登录成功',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({
            message: '登录失败：' + error.message
        });
    }
});

/**
 * GET /api/auth/me
 * 获取当前登录用户信息
 */
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');

        if (!user) {
            return res.status(404).json({
                message: '用户不存在'
            });
        }

        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt,
            },
        });
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({
            message: '获取用户信息失败'
        });
    }
});

module.exports = router;
