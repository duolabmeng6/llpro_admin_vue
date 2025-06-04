import { ChapterModel } from '../models/chapter.js';
import { LessonModel } from '../models/lesson.js';

// 章节控制器
export const getAllChapters = async (req, res) => {
  try {
    const chapters = await ChapterModel.getAll();
    res.json(chapters);
  } catch (error) {
    console.error('获取所有章节失败:', error);
    res.status(500).json({ message: error.message });
  }
};

// 获取单个章节
export const getChapterById = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await ChapterModel.getById(id);
    
    if (!chapter) {
      return res.status(404).json({ message: '章节不存在' });
    }
    
    res.json(chapter);
  } catch (error) {
    console.error(`获取章节(ID: ${req.params.id})失败:`, error);
    res.status(500).json({ message: error.message });
  }
};

// 创建章节
export const createChapter = async (req, res) => {
  try {
    const chapterData = req.body;
    const newChapter = await ChapterModel.create(chapterData);
    res.status(201).json(newChapter);
  } catch (error) {
    console.error('创建章节失败:', error);
    res.status(500).json({ message: error.message });
  }
};

// 更新章节
export const updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const chapterData = req.body;
    const updatedChapter = await ChapterModel.update(id, chapterData);
    
    if (!updatedChapter) {
      return res.status(404).json({ message: '章节不存在' });
    }
    
    res.json(updatedChapter);
  } catch (error) {
    console.error(`更新章节(ID: ${req.params.id})失败:`, error);
    res.status(500).json({ message: error.message });
  }
};

// 删除章节
export const deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ChapterModel.delete(id);
    
    if (!result) {
      return res.status(404).json({ message: '章节不存在' });
    }
    
    res.json({ message: '章节删除成功' });
  } catch (error) {
    console.error(`删除章节(ID: ${req.params.id})失败:`, error);
    res.status(500).json({ message: error.message });
  }
};

// 获取章节的所有小节
export const getChapterLessons = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await ChapterModel.getById(id);
    
    if (!chapter) {
      return res.status(404).json({ message: '章节不存在' });
    }
    
    const lessons = await LessonModel.getByChapterId(id);
    res.json(lessons);
  } catch (error) {
    console.error(`获取章节小节(章节ID: ${req.params.id})失败:`, error);
    res.status(500).json({ message: error.message });
  }
};

// 重新排序章节
export const reorderChapters = async (req, res) => {
  try {
    const reorderData = req.body;
    
    if (!Array.isArray(reorderData)) {
      return res.status(400).json({ message: '无效的排序数据格式' });
    }
    
    const updatedChapters = await ChapterModel.reorder(reorderData);
    res.json(updatedChapters);
  } catch (error) {
    console.error('重新排序章节失败:', error);
    res.status(500).json({ message: error.message });
  }
}; 