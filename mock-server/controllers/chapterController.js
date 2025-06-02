import { ChapterModel } from '../models/chapter.js';
import { LessonModel } from '../models/lesson.js';

// 章节控制器
export const getAllChapters = (req, res) => {
  try {
    const chapters = ChapterModel.getAll();
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取单个章节
export const getChapterById = (req, res) => {
  try {
    const { id } = req.params;
    const chapter = ChapterModel.getById(id);
    
    if (!chapter) {
      return res.status(404).json({ message: '章节不存在' });
    }
    
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 创建章节
export const createChapter = (req, res) => {
  try {
    const chapterData = req.body;
    const newChapter = ChapterModel.create(chapterData);
    res.status(201).json(newChapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 更新章节
export const updateChapter = (req, res) => {
  try {
    const { id } = req.params;
    const chapterData = req.body;
    const updatedChapter = ChapterModel.update(id, chapterData);
    
    if (!updatedChapter) {
      return res.status(404).json({ message: '章节不存在' });
    }
    
    res.json(updatedChapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 删除章节
export const deleteChapter = (req, res) => {
  try {
    const { id } = req.params;
    const result = ChapterModel.delete(id);
    
    if (!result) {
      return res.status(404).json({ message: '章节不存在' });
    }
    
    res.json({ message: '章节删除成功' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取章节的所有小节
export const getChapterLessons = (req, res) => {
  try {
    const { id } = req.params;
    const chapter = ChapterModel.getById(id);
    
    if (!chapter) {
      return res.status(404).json({ message: '章节不存在' });
    }
    
    const lessons = LessonModel.getByChapterId(id);
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 重新排序章节
export const reorderChapters = (req, res) => {
  try {
    const reorderData = req.body;
    
    if (!Array.isArray(reorderData)) {
      return res.status(400).json({ message: '无效的排序数据格式' });
    }
    
    const updatedChapters = ChapterModel.reorder(reorderData);
    res.json(updatedChapters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 