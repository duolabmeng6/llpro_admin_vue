import { CourseModel } from '../models/course.js';
import { ChapterModel, updateCourseIds } from '../models/chapter.js';
import { LessonModel, updateChapterIds } from '../models/lesson.js';

// 初始化关联ID
const initializeIds = () => {
  // 获取所有课程ID
  const courses = CourseModel.getAll();
  const courseIds = courses.map(course => course.id);
  
  // 更新章节中的课程ID
  updateCourseIds(courseIds);
  
  // 获取所有章节ID
  const chapters = ChapterModel.getAll();
  const chapterIds = chapters.map(chapter => chapter.id);
  
  // 更新小节中的章节ID
  updateChapterIds(chapterIds);
};

// 在模块加载时初始化关联ID
initializeIds();

// 课程控制器
const CourseController = {
  // 获取所有课程
  getAllCourses: (req, res) => {
    try {
      const courses = CourseModel.getAll();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 获取单个课程
  getCourseById: (req, res) => {
    try {
      const { id } = req.params;
      const course = CourseModel.getById(id);
      
      if (!course) {
        return res.status(404).json({ message: '课程不存在' });
      }
      
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 创建课程
  createCourse: (req, res) => {
    try {
      const courseData = req.body;
      const newCourse = CourseModel.create(courseData);
      res.status(201).json(newCourse);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 更新课程
  updateCourse: (req, res) => {
    try {
      const { id } = req.params;
      const courseData = req.body;
      const updatedCourse = CourseModel.update(id, courseData);
      
      if (!updatedCourse) {
        return res.status(404).json({ message: '课程不存在' });
      }
      
      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 删除课程
  deleteCourse: (req, res) => {
    try {
      const { id } = req.params;
      const result = CourseModel.delete(id);
      
      if (!result) {
        return res.status(404).json({ message: '课程不存在' });
      }
      
      res.json({ message: '课程删除成功' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 获取课程的所有章节
  getCourseChapters: (req, res) => {
    try {
      const { id } = req.params;
      const course = CourseModel.getById(id);
      
      if (!course) {
        return res.status(404).json({ message: '课程不存在' });
      }
      
      const chapters = ChapterModel.getByCourseId(id);
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 获取课程的完整结构（包括章节和小节）
  getCourseStructure: (req, res) => {
    try {
      const { id } = req.params;
      const course = CourseModel.getById(id);
      
      if (!course) {
        return res.status(404).json({ message: '课程不存在' });
      }
      
      // 获取课程的所有章节
      const chapters = ChapterModel.getByCourseId(id);
      
      // 获取每个章节的小节
      const chaptersWithLessons = chapters.map(chapter => {
        const lessons = LessonModel.getByChapterId(chapter.id);
        return {
          ...chapter,
          lessons
        };
      });
      
      // 构建完整的课程结构
      const courseStructure = {
        ...course,
        chapters: chaptersWithLessons
      };
      
      res.json(courseStructure);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export default CourseController; 