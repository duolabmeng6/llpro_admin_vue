import express from 'express';
import * as LessonController from '../controllers/lessonController.js';

const router = express.Router();

// 小节路由
// GET /api/lessons - 获取所有小节
router.get('/', LessonController.getAllLessons);

// PUT /api/lessons/reorder - 重新排序小节
router.put('/reorder', LessonController.reorderLessons);

// GET /api/lessons/:id - 获取单个小节
router.get('/:id', LessonController.getLessonById);

// PUT /api/lessons/:id - 更新小节
router.put('/:id', LessonController.updateLesson);

// DELETE /api/lessons/:id - 删除小节
router.delete('/:id', LessonController.deleteLesson);

export default router; 