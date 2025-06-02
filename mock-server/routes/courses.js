import express from 'express';
import CourseController from '../controllers/courseController.js';
import * as ChapterController from '../controllers/chapterController.js';

const router = express.Router();

// 课程路由
// GET /api/courses - 获取所有课程
router.get('/', CourseController.getAllCourses);

// POST /api/courses - 创建课程
router.post('/', CourseController.createCourse);

// GET /api/courses/:id - 获取单个课程
router.get('/:id', CourseController.getCourseById);

// PUT /api/courses/:id - 更新课程
router.put('/:id', CourseController.updateCourse);

// DELETE /api/courses/:id - 删除课程
router.delete('/:id', CourseController.deleteCourse);

// GET /api/courses/:id/chapters - 获取课程的所有章节
router.get('/:id/chapters', CourseController.getCourseChapters);

// POST /api/courses/:id/chapters - 创建章节
router.post('/:id/chapters', (req, res) => {
  // 将课程ID添加到章节数据中
  const chapterData = {
    ...req.body,
    courseId: req.params.id
  };
  
  req.body = chapterData;
  ChapterController.createChapter(req, res);
});

// GET /api/courses/:id/structure - 获取课程的完整结构（包括章节和小节）
router.get('/:id/structure', CourseController.getCourseStructure);

export default router; 