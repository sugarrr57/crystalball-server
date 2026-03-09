/**
 * JWT 认证中间件
 *
 * 用于验证用户登录状态
 */

const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: '未授权，请先登录'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 验证 token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 将用户信息附加到请求对象
        req.userId = decoded.userId;
        req.username = decoded.username;

        next(); // 继续处理请求
    } catch (error) {
        return res.status(401).json({
            message: 'Token 无效或已过期'
        });
    }
};
