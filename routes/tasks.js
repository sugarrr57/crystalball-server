/**
 * 任务看板 API 路由
 *
 * 对应前端 TaskBoard 组件的数据操作
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/TaskBoard');

// 所有路由都需要认证
router.use(auth);

/**
 * GET /api/tasks
 * 获取当前用户的所有任务
 */
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.userId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: tasks,
        });
    } catch (error) {
        console.error('获取任务失败:', error);
        res.status(500).json({
            success: false,
            message: '获取任务失败：' + error.message
        });
    }
});

/**
 * POST /api/tasks
 * 创建新任务
 */
router.post('/', async (req, res) => {
    try {
        const { title, description, priority, status, assignee, deadline, source } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: '任务标题不能为空'
            });
        }

        const task = new Task({
            userId: req.userId,
            title,
            description: description || '',
            priority: priority || 'MEDIUM',
            status: status || 'TODO',
            assignee: assignee || [],
            deadline: deadline ? new Date(deadline) : null,
            source: source || '水晶球',
        });

        await task.save();

        res.status(201).json({
            success: true,
            data: task,
        });
    } catch (error) {
        console.error('创建任务失败:', error);
        res.status(500).json({
            success: false,
            message: '创建任务失败：' + error.message
        });
    }
});

/**
 * PUT /api/tasks/:id
 * 更新任务
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: '任务不存在'
            });
        }

        res.json({
            success: true,
            data: task,
        });
    } catch (error) {
        console.error('更新任务失败:', error);
        res.status(500).json({
            success: false,
            message: '更新任务失败：' + error.message
        });
    }
});

/**
 * DELETE /api/tasks/:id
 * 删除任务
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findOneAndDelete({
            _id: id,
            userId: req.userId,
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: '任务不存在'
            });
        }

        res.json({
            success: true,
            message: '删除成功',
        });
    } catch (error) {
        console.error('删除任务失败:', error);
        res.status(500).json({
            success: false,
            message: '删除任务失败：' + error.message
        });
    }
});

/**
 * POST /api/tasks/batch-save
 * 批量保存任务
 */
router.post('/batch-save', async (req, res) => {
    try {
        const { tasks } = req.body;

        if (!Array.isArray(tasks)) {
            return res.status(400).json({
                success: false,
                message: '数据格式错误'
            });
        }

        const savedTasks = await Promise.all(
            tasks.map(async (task) => {
                const { _id, ...taskData } = task;

                if (_id) {
                    return await Task.findOneAndUpdate(
                        { _id, userId: req.userId },
                        { ...taskData, updatedAt: new Date() },
                        { new: true }
                    );
                } else {
                    const newTask = new Task({
                        userId: req.userId,
                        ...taskData,
                    });
                    await newTask.save();
                    return newTask;
                }
            })
        );

        res.json({
            success: true,
            data: savedTasks,
        });
    } catch (error) {
        console.error('批量保存任务失败:', error);
        res.status(500).json({
            success: false,
            message: '批量保存失败：' + error.message
        });
    }
});

module.exports = router;
