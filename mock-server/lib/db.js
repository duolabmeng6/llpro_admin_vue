import prisma from './prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SQLite数据库文件路径
const DB_PATH = path.join(__dirname, '..', 'prisma', 'dev.db');

/**
 * 初始化数据库
 * 如果数据库不存在，则创建并填充初始数据
 */
export const initDatabase = async () => {
  try {
    // 检查数据库文件是否存在
    const dbExists = fs.existsSync(DB_PATH);
    
    if (!dbExists) {
      console.log('数据库文件不存在，初始化数据库...');
      await resetDatabase();
    } else {
      console.log('数据库已存在，跳过初始化');
    }
  } catch (error) {
    console.error('初始化数据库失败:', error);
    throw error;
  }
};

/**
 * 重置数据库
 * 删除现有数据库，重新创建并填充初始数据
 */
export const resetDatabase = async () => {
  try {
    console.log('开始重置数据库...');
    
    // 关闭Prisma连接
    await prisma.$disconnect();
    
    // 如果数据库文件存在，则删除
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
      console.log('已删除现有数据库文件');
    }
    
    // 执行Prisma迁移以创建新的数据库结构
    console.log('创建数据库结构...');
    await executeCommand('npx prisma migrate dev --name init --skip-generate');
    
    // 填充初始数据
    console.log('填充初始数据...');
    await seedDatabase();
    
    console.log('数据库重置完成');
    return { success: true, message: '数据库已成功重置' };
  } catch (error) {
    console.error('重置数据库失败:', error);
    return { success: false, message: `重置数据库失败: ${error.message}` };
  }
};

/**
 * 执行命令行命令
 */
const executeCommand = async (command) => {
  const { exec } = await import('child_process');
  
  return new Promise((resolve, reject) => {
    exec(command, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
      if (error) {
        console.error(`执行命令失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        reject(error);
        return;
      }
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
};

/**
 * 填充初始数据
 */
export const seedDatabase = async () => {
  try {
    // 创建用户
    const users = [
      {
        id: uuidv4(),
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin',
        role: 'admin',
        status: 'active'
      },
      {
        id: uuidv4(),
        username: 'user1',
        email: 'user1@example.com',
        password: 'user123',
        role: 'editor',
        status: 'active'
      },
      {
        id: uuidv4(),
        username: 'user2',
        email: 'user2@example.com',
        password: 'user456',
        role: 'viewer',
        status: 'inactive'
      }
    ];
    
    // 批量创建用户
    await prisma.user.createMany({
      data: users
    });
    
    // 创建课程
    const courseTemplates = [
      { title: '前端开发进阶', description: '深入学习现代前端开发技术，包括Vue 3、React和TypeScript', status: 'published', cover: '/uploads/course-cover-1.jpg' },
      { title: '后端开发基础', description: 'Node.js、Express和MongoDB的基础知识', status: 'draft', cover: '/uploads/course-cover-2.jpg' },
      { title: 'JavaScript高级编程', description: '深入JavaScript核心概念、设计模式和高级特性', status: 'published', cover: '/uploads/course-cover-3.jpg' },
      { title: 'Vue.js项目实战', description: '从零构建企业级Vue.js应用', status: 'published', cover: '/uploads/course-cover-4.jpg' },
      { title: 'React Native移动应用开发', description: '使用React Native构建跨平台移动应用', status: 'draft', cover: '/uploads/course-cover-5.jpg' }
    ];
    
    // 创建课程并记录ID
    const courseIds = [];
    for (const template of courseTemplates) {
      const course = await prisma.course.create({
        data: template
      });
      courseIds.push(course.id);
    }
    
    // 为第一个课程创建章节
    const chapters = [
      {
        courseId: courseIds[0],
        title: '第一章：基础知识',
        description: '介绍前端开发的基础知识',
        order: 1
      },
      {
        courseId: courseIds[0],
        title: '第二章：进阶技术',
        description: '深入学习前端进阶技术',
        order: 2
      },
      {
        courseId: courseIds[0],
        title: '第三章：高级技术',
        description: '深入学习前端高级技术',
        order: 3
      }
    ];
    
    // 创建章节并记录ID
    const chapterIds = [];
    for (const chapter of chapters) {
      const result = await prisma.chapter.create({
        data: chapter
      });
      chapterIds.push(result.id);
    }
    
    // 为第一个章节创建小节
    const lessons = [
      {
        chapterId: chapterIds[0],
        title: '1.1 前端开发概述',
        content: '本节介绍前端开发的基本概念和工具链',
        duration: 15,
        type: 'video',
        videoUrl: 'https://example.com/videos/1-1-frontend-overview.mp4',
        order: 100
      },
      {
        chapterId: chapterIds[0],
        title: '1.2 HTML基础',
        content: '学习HTML的基本标签和结构',
        duration: 20,
        type: 'video',
        videoUrl: 'https://example.com/videos/1-2-html-basics.mp4',
        order: 200
      },
      {
        chapterId: chapterIds[0],
        title: '1.3 CSS基础',
        content: '学习CSS的基本标签和结构',
        duration: 20,
        type: 'video',
        videoUrl: 'https://example.com/videos/1-3-css-basics.mp4',
        order: 300
      },
      {
        chapterId: chapterIds[0],
        title: '1.4 JavaScript基础',
        content: '学习JavaScript的基本标签和结构',
        duration: 20,
        type: 'video',
        videoUrl: 'https://example.com/videos/1-4-javascript-basics.mp4',
        order: 400
      }
    ];
    
    // 为第二个章节创建小节
    const chapter2Lessons = [
      {
        chapterId: chapterIds[1],
        title: '2.1 CSS高级选择器',
        content: '学习CSS的高级选择器和伪类',
        duration: 25,
        type: 'video',
        videoUrl: 'https://example.com/videos/2-1-css-advanced-selectors.mp4',
        order: 100
      },
      {
        chapterId: chapterIds[1],
        title: '2.2 CSS布局技术',
        content: '学习Flexbox和Grid等现代CSS布局技术',
        duration: 30,
        type: 'video',
        videoUrl: 'https://example.com/videos/2-2-css-layout.mp4',
        order: 200
      },
      {
        chapterId: chapterIds[1],
        title: '2.3 CSS动画与过渡',
        content: '学习CSS动画、过渡和变换效果',
        duration: 25,
        type: 'video',
        videoUrl: 'https://example.com/videos/2-3-css-animations.mp4',
        order: 300
      }
    ];
    
    // 为第三个章节创建小节
    const chapter3Lessons = [
      {
        chapterId: chapterIds[2],
        title: '3.1 JavaScript进阶',
        content: '深入学习JavaScript的高级特性和ES6+语法',
        duration: 40,
        type: 'video',
        videoUrl: 'https://example.com/videos/3-1-javascript-advanced.mp4',
        order: 100
      },
      {
        chapterId: chapterIds[2],
        title: '3.2 异步编程',
        content: '学习Promise、async/await和事件循环',
        duration: 35,
        type: 'video',
        videoUrl: 'https://example.com/videos/3-2-async-programming.mp4',
        order: 200
      }
    ];
    
    // 合并所有小节
    const allLessons = [...lessons, ...chapter2Lessons, ...chapter3Lessons];
    
    // 使用单个create创建小节
    console.log('开始创建小节...');
    for (const lesson of allLessons) {
      await prisma.lesson.create({
        data: lesson
      });
    }
    
    console.log('初始数据填充完成');
  } catch (error) {
    console.error('填充初始数据失败:', error);
    throw error;
  }
}; 