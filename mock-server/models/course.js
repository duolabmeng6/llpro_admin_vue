import prisma from '../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';

// Course模型 - 使用Prisma
const CourseModel = {
  // 获取所有课程（支持分页）
  getAll: async (options = {}) => {
    try {
      // 默认分页参数
      const page = Number(options.page) || 1;
      const limit = Number(options.limit) || 10;
      
      // 计算分页跳过的记录数
      const skip = (page - 1) * limit;
      
      // 查询条件
      const where = {};
      if (options.status) {
        where.status = options.status;
      }
      if (options.search) {
        where.OR = [
          { title: { contains: options.search } },
          { description: { contains: options.search } },
          { content: { contains: options.search } }
        ];
      }
      
      // 执行查询
      const [courses, total] = await Promise.all([
        prisma.course.findMany({
          where,
          skip,
          take: limit,
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.course.count({ where })
      ]);
      
      return {
        courses,
        total
      };
    } catch (error) {
      console.error('获取课程列表失败:', error);
      throw error;
    }
  },

  // 获取单个课程
  getById: async (id) => {
    try {
      return await prisma.course.findUnique({
        where: { id },
        include: {
          chapters: {
            orderBy: { order: 'asc' },
            include: {
              lessons: {
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error(`获取课程(ID: ${id})失败:`, error);
      throw error;
    }
  },

  // 创建课程
  create: async (courseData) => {
    try {
      const { title, description, content, price, pricingType, status, cover } = courseData;
      
      return await prisma.course.create({
        data: {
          title,
          description,
          content,
          price: price !== undefined ? Number(price) : null,
          pricingType: pricingType || 'free',
          status: status || 'draft',
          cover
        }
      });
    } catch (error) {
      console.error('创建课程失败:', error);
      throw error;
    }
  },

  // 更新课程
  update: async (id, courseData) => {
    try {
      console.log(`尝试更新课程(ID: ${id})，原始数据:`, JSON.stringify(courseData, null, 2));
      
      // 过滤掉关系字段
      const { chapters, ...courseDataWithoutRelations } = courseData;
      
      console.log(`过滤关系字段后的数据:`, JSON.stringify(courseDataWithoutRelations, null, 2));
      
      if (courseDataWithoutRelations.price !== undefined) {
        courseDataWithoutRelations.price = Number(courseDataWithoutRelations.price);
      }
      
      const updatedCourse = await prisma.course.update({
        where: { id },
        data: courseDataWithoutRelations
      });
      
      console.log(`课程更新成功(ID: ${id})，更新后数据:`, JSON.stringify(updatedCourse, null, 2));
      
      return updatedCourse;
    } catch (error) {
      console.error(`更新课程(ID: ${id})失败:`, error);
      console.error('错误详情:', error.message);
      if (error.code) {
        console.error('错误代码:', error.code);
      }
      throw error;
    }
  },

  // 删除课程
  delete: async (id) => {
    try {
      await prisma.course.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error(`删除课程(ID: ${id})失败:`, error);
      return false;
    }
  }
};

export { CourseModel }; 