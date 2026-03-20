// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const auth = require('../middleware/auth');
// const bcrypt = require('bcryptjs');
//
// /**
//  * GET /api/users
//  * 获取所有用户列表（需要管理员权限）
//  */
// router.get('/', auth, async (req, res) => {
//     try {
//         const currentUser = await User.findById(req.userId);
//         if (!currentUser || currentUser.role === 'user') {
//             return res.status(403).json({
//                 message: '无权访问，需要管理员权限'
//             });
//         }
//
//         const users = await User.find().select('-password').sort({ createdAt: -1 });
//
//         res.json({
//             users: users.map(user => ({
//                 id: user._id,
//                 username: user.username,
//                 email: user.email,
//                 role: user.role,
//                 createdAt: user.createdAt,
//                 lastLoginAt: user.lastLoginAt,
//             }))
//         });
//     } catch (error) {
//         console.error('获取用户列表错误:', error);
//         res.status(500).json({
//             message: '获取用户列表失败：' + error.message
//         });
//     }
// });
//
// /**
//  * POST /api/users
//  * 新增用户（需要管理员权限）
//  */
// router.post('/', auth, async (req, res) => {
//     try {
//         const currentUser = await User.findById(req.userId);
//         if (!currentUser || currentUser.role === 'user') {
//             return res.status(403).json({
//                 message: '无权访问，需要管理员权限'
//             });
//         }
//
//         const { username, password, email, role } = req.body;
//
//         if (!username || !password) {
//             return res.status(400).json({
//                 message: '用户名和密码不能为空'
//             });
//         }
//
//         if (username.length < 3 || username.length > 30) {
//             return res.status(400).json({
//                 message: '用户名长度需要在 3-30 个字符之间'
//             });
//         }
//
//         if (password.length < 6) {
//             return res.status(400).json({
//                 message: '密码长度至少为 6 位'
//             });
//         }
//
//         if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//             return res.status(400).json({
//                 message: '请输入有效的邮箱地址'
//             });
//         }
//
//         const validRoles = ['user', 'manager', 'admin'];
//         if (role && !validRoles.includes(role)) {
//             return res.status(400).json({
//                 message: '无效的角色类型'
//             });
//         }
//
//         const existingUser = await User.findOne({ username });
//         if (existingUser) {
//             return res.status(400).json({
//                 message: '用户名已被使用'
//             });
//         }
//
//         if (email) {
//             const existingEmail = await User.findOne({ email });
//             if (existingEmail) {
//                 return res.status(400).json({
//                     message: '邮箱已被使用'
//                 });
//             }
//         }
//
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);
//
//         const user = new User({
//             username: username.trim(),
//             password: hashedPassword,
//             email: email ? email.toLowerCase().trim() : null,
//             role: role || 'user',
//         });
//
//         await user.save();
//
//         res.status(201).json({
//             message: '用户创建成功',
//             user: {
//                 id: user._id,
//                 username: user.username,
//                 email: user.email,
//                 role: user.role,
//                 createdAt: user.createdAt,
//             }
//         });
//     } catch (error) {
//         console.error('创建用户错误:', error);
//         res.status(500).json({
//             message: '创建失败：' + error.message
//         });
//     }
// });
//
// /**
//  * GET /api/users/search?keyword=xxx
//  * 搜索用户（需要管理员权限）
//  */
// router.get('/search', auth, async (req, res) => {
//     try {
//         const currentUser = await User.findById(req.userId);
//         if (!currentUser || currentUser.role === 'user') {
//             return res.status(403).json({
//                 message: '无权访问，需要管理员权限'
//             });
//         }
//
//         const keyword = req.query.keyword || '';
//
//         if (!keyword.trim()) {
//             return res.json({ users: [] });
//         }
//
//         const regex = new RegExp(keyword, 'i');
//         const users = await User.find({
//             $or: [
//                 { username: regex },
//                 { email: regex }
//             ]
//         }).select('-password').sort({ createdAt: -1 });
//
//         res.json({
//             users: users.map(user => ({
//                 id: user._id,
//                 username: user.username,
//                 email: user.email,
//                 role: user.role,
//                 createdAt: user.createdAt,
//                 lastLoginAt: user.lastLoginAt,
//             }))
//         });
//     } catch (error) {
//         console.error('搜索用户错误:', error);
//         res.status(500).json({
//             message: '搜索失败：' + error.message
//         });
//     }
// });
//
// /**
//  * PUT /api/users/:id
//  * 更新用户信息（需要管理员权限）
//  */
// router.put('/:id', auth, async (req, res) => {
//     try {
//         const currentUser = await User.findById(req.userId);
//         if (!currentUser || currentUser.role === 'user') {
//             return res.status(403).json({
//                 message: '无权访问，需要管理员权限'
//             });
//         }
//
//         const userId = req.params.id;
//         const { username, email, role } = req.body;
//
//         if (!username || !username.trim()) {
//             return res.status(400).json({
//                 message: '用户名不能为空'
//             });
//         }
//
//         if (username.length < 3 || username.length > 30) {
//             return res.status(400).json({
//                 message: '用户名长度需要在 3-30 个字符之间'
//             });
//         }
//
//         if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//             return res.status(400).json({
//                 message: '请输入有效的邮箱地址'
//             });
//         }
//
//         const validRoles = ['user', 'manager', 'admin'];
//         if (role && !validRoles.includes(role)) {
//             return res.status(400).json({
//                 message: '无效的角色类型'
//             });
//         }
//
//         const existingUser = await User.findOne({
//             username,
//             _id: { $ne: userId }
//         });
//
//         if (existingUser) {
//             return res.status(400).json({
//                 message: '用户名已被使用'
//             });
//         }
//
//         if (email) {
//             const existingEmail = await User.findOne({
//                 email,
//                 _id: { $ne: userId }
//             });
//
//             if (existingEmail) {
//                 return res.status(400).json({
//                     message: '邮箱已被使用'
//                 });
//             }
//         }
//
//         const updateData = {
//             username: username.trim(),
//             email: email ? email.toLowerCase().trim() : null,
//         };
//
//         if (role) {
//             updateData.role = role;
//         }
//
//         const updatedUser = await User.findByIdAndUpdate(
//             userId,
//             updateData,
//             { new: true, runValidators: true }
//         ).select('-password');
//
//         if (!updatedUser) {
//             return res.status(404).json({
//                 message: '用户不存在'
//             });
//         }
//
//         res.json({
//             message: '用户信息已更新',
//             user: {
//                 id: updatedUser._id,
//                 username: updatedUser.username,
//                 email: updatedUser.email,
//                 role: updatedUser.role,
//             }
//         });
//     } catch (error) {
//         console.error('更新用户错误:', error);
//         res.status(500).json({
//             message: '更新失败：' + error.message
//         });
//     }
// });
//
// /**
//  * DELETE /api/users/:id
//  * 删除用户（需要管理员权限）
//  */
// router.delete('/:id', auth, async (req, res) => {
//     try {
//         const currentUser = await User.findById(req.userId);
//         if (!currentUser || currentUser.role === 'user') {
//             return res.status(403).json({
//                 message: '无权访问，需要管理员权限'
//             });
//         }
//
//         const userId = req.params.id;
//
//         if (userId === req.userId) {
//             return res.status(400).json({
//                 message: '不能删除自己的账号'
//             });
//         }
//
//         const deletedUser = await User.findByIdAndDelete(userId);
//
//         if (!deletedUser) {
//             return res.status(404).json({
//                 message: '用户不存在'
//             });
//         }
//
//         res.json({
//             message: '用户已删除',
//             deletedUser: {
//                 id: deletedUser._id,
//                 username: deletedUser.username,
//             }
//         });
//     } catch (error) {
//         console.error('删除用户错误:', error);
//         res.status(500).json({
//             message: '删除失败：' + error.message
//         });
//     }
// });
//
// module.exports = router;
