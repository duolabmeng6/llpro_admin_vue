import { LessonModel } from '../models/lesson.js';

// 小节控制器
// 获取所有小节
export const getAllLessons = (req, res) => {
  try {
    const lessons = LessonModel.getAll();
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取单个小节
export const getLessonById = (req, res) => {
  try {
    const { id } = req.params;
    const lesson = LessonModel.getById(id);
    
    if (!lesson) {
      return res.status(404).json({ message: '小节不存在' });
    }
    
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 创建小节
export const createLesson = (req, res) => {
  try {
    const lessonData = req.body;
    const newLesson = LessonModel.create(lessonData);
    res.status(201).json(newLesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 更新小节
export const updateLesson = (req, res) => {
  try {
    const { id } = req.params;
    const lessonData = req.body;
    const updatedLesson = LessonModel.update(id, lessonData);
    
    if (!updatedLesson) {
      return res.status(404).json({ message: '小节不存在' });
    }
    
    res.json(updatedLesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 删除小节
export const deleteLesson = (req, res) => {
  try {
    const { id } = req.params;
    const result = LessonModel.delete(id);
    
    if (!result) {
      return res.status(404).json({ message: '小节不存在' });
    }
    
    res.json({ message: '小节删除成功' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 重新排序小节
export const reorderLessons = (req, res) => {
  try {
    const reorderData = req.body;
    
    if (!Array.isArray(reorderData)) {
      return res.status(400).json({ message: '无效的排序数据格式' });
    }
    
    const updatedLessons = LessonModel.reorder(reorderData);
    res.json(updatedLessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 