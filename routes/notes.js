/**
 * 快捷备忘 API 路由
 *
 * 对应前端 QuickNotes 组件的数据操作
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const QuickNote = require('../models/QuickNote');

// 所有路由都需要认证
router.use(auth);

/**
 * GET /api/notes
 * 获取当前用户的所有备忘
 */
router.get('/', async (req, res) => {
    try {
        const notes = await QuickNote.find({ userId: req.userId })
            .sort({ createdAt: -1 }); // 按创建时间倒序

        res.json({
            success: true,
            data: notes,
        });
    } catch (error) {
        console.error('获取备忘失败:', error);
        res.status(500).json({
            success: false,
            message: '获取备忘失败：' + error.message
        });
    }
});

/**
 * POST /api/notes
 * 创建新备忘
 */
router.post('/', async (req, res) => {
    try {
        const { content, remark, startAt, endAt, completed } = req.body;

        // 验证必填字段
        if (!content) {
            return res.status(400).json({
                success: false,
                message: '备忘内容不能为空'
            });
        }

        const note = new QuickNote({
            userId: req.userId,
            content,
            remark: remark || '',
            startAt: startAt ? new Date(startAt) : null,
            endAt: endAt ? new Date(endAt) : null,
            completed: completed || false,
        });

        await note.save();

        res.status(201).json({
            success: true,
            data: note,
        });
    } catch (error) {
        console.error('创建备忘失败:', error);
        res.status(500).json({
            success: false,
            message: '创建备忘失败：' + error.message
        });
    }
});

/**
 * PUT /api/notes/:id
 * 更新备忘
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const note = await QuickNote.findOneAndUpdate(
            { _id: id, userId: req.userId }, // 确保只能修改自己的备忘
            updateData,
            { new: true, runValidators: true }
        );

        if (!note) {
            return res.status(404).json({
                success: false,
                message: '备忘不存在'
            });
        }

        res.json({
            success: true,
            data: note,
        });
    } catch (error) {
        console.error('更新备忘失败:', error);
        res.status(500).json({
            success: false,
            message: '更新备忘失败：' + error.message
        });
    }
});

/**
 * DELETE /api/notes/:id
 * 删除备忘
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const note = await QuickNote.findOneAndDelete({
            _id: id,
            userId: req.userId,
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: '备忘不存在'
            });
        }

        res.json({
            success: true,
            message: '删除成功',
        });
    } catch (error) {
        console.error('删除备忘失败:', error);
        res.status(500).json({
            success: false,
            message: '删除备忘失败：' + error.message
        });
    }
});

/**
 * POST /api/notes/batch-save
 * 批量保存备忘（对应前端的批量操作）
 */
router.post('/batch-save', async (req, res) => {
    try {
        const { notes } = req.body;

        if (!Array.isArray(notes)) {
            return res.status(400).json({
                success: false,
                message: '数据格式错误'
            });
        }

        // 使用 Promise.all 并行保存所有备忘
        const savedNotes = await Promise.all(
            notes.map(async (note) => {
                const { _id, ...noteData } = note;

                if (_id) {
                    // 更新已有备忘
                    return await QuickNote.findOneAndUpdate(
                        { _id, userId: req.userId },
                        noteData,
                        { new: true, upsert: true }
                    );
                } else {
                    // 创建新备忘
                    const newNote = new QuickNote({
                        userId: req.userId,
                        ...noteData,
                    });
                    await newNote.save();
                    return newNote;
                }
            })
        );

        res.json({
            success: true,
            data: savedNotes,
        });
    } catch (error) {
        console.error('批量保存失败:', error);
        res.status(500).json({
            success: false,
            message: '批量保存失败：' + error.message
        });
    }
});

module.exports = router;
