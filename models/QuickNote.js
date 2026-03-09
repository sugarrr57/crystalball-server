/**
 * 快捷备忘数据模型
 *
 * 对应前端的 QuickNotes 组件
 */

const mongoose = require('mongoose');

const quickNoteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    remark: {
        type: String,
        default: '',
    },
    startAt: {
        type: Date,
        default: null,
    },
    endAt: {
        type: Date,
        default: null,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// 索引：加速查询
quickNoteSchema.index({ userId: 1, createdAt: -1 });
quickNoteSchema.index({ deletedAt: 1 });

module.exports = mongoose.model('QuickNote', quickNoteSchema);
