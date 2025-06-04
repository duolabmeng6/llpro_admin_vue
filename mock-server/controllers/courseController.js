import { CourseModel } from '../models/course.js';
import { ChapterModel } from '../models/chapter.js';
import { LessonModel } from '../models/lesson.js';

// 课程控制器
const CourseController = {
  // 获取所有课程
  getAllCourses: async (req, res) => {
    try {
      // 获取分页参数
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;
      const search = req.query.search;
      
      // 获取所有课程，带分页
      const { courses, total } = await CourseModel.getAll({ 
        page, 
        limit,
        status,
        search
      });
      
      // 构建分页响应
      res.json({
        data: courses,
        meta: {
          currentPage: page,
          pageSize: limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('获取所有课程失败:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // 获取单个课程
  getCourseById: async (req, res) => {
    try {
      const { id } = req.params;
      const course = await CourseModel.getById(id);
      
      if (!course) {
        return res.status(404).json({ message: '课程不存在' });
      }
      
      res.json(course);
    } catch (error) {
      console.error(`获取课程(ID: ${req.params.id})失败:`, error);
      res.status(500).json({ message: error.message });
    }
  },

  // 创建课程
  createCourse: async (req, res) => {
    try {
      const courseData = req.body;
      const newCourse = await CourseModel.create(courseData);
      res.status(201).json(newCourse);
    } catch (error) {
      console.error('创建课程失败:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // 更新课程
  updateCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const courseData = req.body;
      const updatedCourse = await CourseModel.update(id, courseData);
      
      if (!updatedCourse) {
        return res.status(404).json({ message: '课程不存在' });
      }
      
      res.json(updatedCourse);
    } catch (error) {
      console.error(`更新课程(ID: ${req.params.id})失败:`, error);
      res.status(500).json({ message: error.message });
    }
  },

  // 删除课程
  deleteCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await CourseModel.delete(id);
      
      if (!result) {
        return res.status(404).json({ message: '课程不存在' });
      }
      
      res.json({ message: '课程删除成功' });
    } catch (error) {
      console.error(`删除课程(ID: ${req.params.id})失败:`, error);
      res.status(500).json({ message: error.message });
    }
  },

  // 获取课程的所有章节
  getCourseChapters: async (req, res) => {
    try {
      const { id } = req.params;
      const course = await CourseModel.getById(id);
      
      if (!course) {
        return res.status(404).json({ message: '课程不存在' });
      }
      
      const chapters = await ChapterModel.getByCourseId(id);
      res.json(chapters);
    } catch (error) {
      console.error(`获取课程章节(课程ID: ${req.params.id})失败:`, error);
      res.status(500).json({ message: error.message });
    }
  },

  // 获取课程的完整结构（包括章节和小节）
  getCourseStructure: async (req, res) => {
    try {
      const { id } = req.params;
      const course = await CourseModel.getById(id);
      
      if (!course) {
        return res.status(404).json({ message: '课程不存在' });
      }
      
      // course已经包含了完整的嵌套结构（章节和小节）
      res.json(course);
    } catch (error) {
      console.error(`获取课程结构(课程ID: ${req.params.id})失败:`, error);
      res.status(500).json({ message: error.message });
    }
  }
};

export default CourseController; 