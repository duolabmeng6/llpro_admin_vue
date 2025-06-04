import express from 'express';
import * as ChapterController from '../controllers/chapterController.js';
import * as LessonController from '../controllers/lessonController.js';

const router = express.Router();

// 章节路由
// GET /api/chapters - 获取所有章节
router.get('/', ChapterController.getAllChapters);

// POST /api/chapters - 创建章节
router.post('/', ChapterController.createChapter);

// PUT /api/chapters/reorder - 重新排序章节
router.put('/reorder', ChapterController.reorderChapters);

// GET /api/chapters/:id - 获取单个章节
router.get('/:id', ChapterController.getChapterById);

// PUT /api/chapters/:id - 更新章节
router.put('/:id', ChapterController.updateChapter);

// DELETE /api/chapters/:id - 删除章节
router.delete('/:id', ChapterController.deleteChapter);

// GET /api/chapters/:id/lessons - 获取章节的所有小节
router.get('/:id/lessons', ChapterController.getChapterLessons);

// POST /api/chapters/:id/lessons - 创建小节
router.post('/:id/lessons', (req, res) => {
  // 将章节ID添加到小节数据中
  const lessonData = {
    ...req.body,
    chapterId: req.params.id
  };
  
  req.body = lessonData;
  LessonController.createLesson(req, res);
});

export default router; 