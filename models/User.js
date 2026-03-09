/**
 * 用户数据模型
 *
 * 用于存储用户账号信息
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, '用户名不能为空'],
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
    },
    email: {
        type: String,
        sparse: true, // 允许为空但唯一
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, '密码不能为空'],
        minlength: 6,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastLoginAt: Date,
}, {
    timestamps: true, // 自动添加 updatedAt 字段
});

// 导出模型
module.exports = mongoose.model('User', userSchema);
