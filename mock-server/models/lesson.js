import prisma from '../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';

// Lesson模型 - 使用Prisma
const LessonModel = {
  // 获取所有小节
  getAll: async () => {
    try {
      return await prisma.lesson.findMany({
        orderBy: [
          { chapterId: 'asc' },
          { order: 'asc' }
        ]
      });
    } catch (error) {
      console.error('获取所有小节失败:', error);
      throw error;
    }
  },

  // 获取单个小节
  getById: async (id) => {
    try {
      return await prisma.lesson.findUnique({
        where: { id }
      });
    } catch (error) {
      console.error(`获取小节(ID: ${id})失败:`, error);
      throw error;
    }
  },

  // 获取章节的所有小节
  getByChapterId: async (chapterId) => {
    try {
      return await prisma.lesson.findMany({
        where: { chapterId },
        orderBy: { order: 'asc' }
      });
    } catch (error) {
      console.error(`获取章节(ID: ${chapterId})的小节失败:`, error);
      throw error;
    }
  },

  // 创建小节
  create: async (lessonData) => {
    try {
      // 获取当前章节最大的order值
      const maxOrderLesson = await prisma.lesson.findFirst({
        where: { chapterId: lessonData.chapterId },
        orderBy: { order: 'desc' }
      });
      
      // 使用100作为步长
      const order = maxOrderLesson ? maxOrderLesson.order + 100 : 100;
      
      return await prisma.lesson.create({
        data: {
          ...lessonData,
          order: lessonData.order || order
        }
      });
    } catch (error) {
      console.error('创建小节失败:', error);
      throw error;
    }
  },

  // 更新小节
  update: async (id, lessonData) => {
    try {
      console.log(`尝试更新小节(ID: ${id})，数据:`, JSON.stringify(lessonData, null, 2));
      
      // 首先检查小节是否存在
      const existingLesson = await prisma.lesson.findUnique({
        where: { id }
      });
      
      if (!existingLesson) {
        console.error(`更新失败：找不到ID为 ${id} 的小节`);
        return null;
      }
      
      console.log(`找到小节(ID: ${id})，当前数据:`, JSON.stringify(existingLesson, null, 2));
      
      // 执行更新操作
      const updatedLesson = await prisma.lesson.update({
        where: { id },
        data: lessonData
      });
      
      console.log(`小节(ID: ${id})更新成功，更新后数据:`, JSON.stringify(updatedLesson, null, 2));
      
      return updatedLesson;
    } catch (error) {
      console.error(`更新小节(ID: ${id})失败:`, error);
      console.error('错误详情:', error.message);
      if (error.code) {
        console.error('错误代码:', error.code);
      }
      if (error.meta) {
        console.error('错误元数据:', error.meta);
      }
      throw error;
    }
  },

  // 删除小节
  delete: async (id) => {
    try {
      await prisma.lesson.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error(`删除小节(ID: ${id})失败:`, error);
      return false;
    }
  },

  // 重新排序小节
  reorder: async (reorderData) => {
    try {
      console.log('小节排序 - 接收到的数据:', reorderData);
      
      const updatedLessons = [];
      
      // 使用事务处理批量更新
      await prisma.$transaction(async (tx) => {
        for (const item of reorderData) {
          const updatedLesson = await tx.lesson.update({
            where: { id: item.id },
            data: { order: item.order }
          });
          
          updatedLessons.push(updatedLesson);
        }
      });
      
      return updatedLessons;
    } catch (error) {
      console.error('重新排序小节失败:', error);
      throw error;
    }
  }
};

export { LessonModel }; 