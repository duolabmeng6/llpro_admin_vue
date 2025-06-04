import prisma from '../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';

// Chapter模型 - 使用Prisma
const ChapterModel = {
  // 获取所有章节
  getAll: async () => {
    try {
      return await prisma.chapter.findMany({
        orderBy: { order: 'asc' }
      });
    } catch (error) {
      console.error('获取所有章节失败:', error);
      throw error;
    }
  },

  // 获取单个章节
  getById: async (id) => {
    try {
      return await prisma.chapter.findUnique({
        where: { id },
        include: {
          lessons: {
            orderBy: { order: 'asc' }
          }
        }
      });
    } catch (error) {
      console.error(`获取章节(ID: ${id})失败:`, error);
      throw error;
    }
  },

  // 获取课程的所有章节
  getByCourseId: async (courseId) => {
    try {
      return await prisma.chapter.findMany({
        where: { courseId },
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' }
          }
        }
      });
    } catch (error) {
      console.error(`获取课程(ID: ${courseId})的章节失败:`, error);
      throw error;
    }
  },

  // 创建章节
  create: async (chapterData) => {
    try {
      // 获取当前课程最大的order值
      const maxOrderChapter = await prisma.chapter.findFirst({
        where: { courseId: chapterData.courseId },
        orderBy: { order: 'desc' }
      });
      
      const order = maxOrderChapter ? maxOrderChapter.order + 1 : 1;
      
      return await prisma.chapter.create({
        data: {
          ...chapterData,
          order: chapterData.order || order
        }
      });
    } catch (error) {
      console.error('创建章节失败:', error);
      throw error;
    }
  },

  // 更新章节
  update: async (id, chapterData) => {
    try {
      return await prisma.chapter.update({
        where: { id },
        data: chapterData
      });
    } catch (error) {
      console.error(`更新章节(ID: ${id})失败:`, error);
      throw error;
    }
  },

  // 删除章节
  delete: async (id) => {
    try {
      await prisma.chapter.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error(`删除章节(ID: ${id})失败:`, error);
      return false;
    }
  },

  // 重新排序章节
  reorder: async (reorderData) => {
    try {
      console.log('章节排序 - 接收到的数据:', reorderData);
      
      const updatedChapters = [];
      
      // 使用事务处理批量更新
      await prisma.$transaction(async (tx) => {
        for (const item of reorderData) {
          const updatedChapter = await tx.chapter.update({
            where: { id: item.id },
            data: { order: item.order }
          });
          
          updatedChapters.push(updatedChapter);
        }
      });
      
      return updatedChapters;
    } catch (error) {
      console.error('重新排序章节失败:', error);
      throw error;
    }
  }
};

export { ChapterModel }; 