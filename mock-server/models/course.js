import { v4 as uuidv4 } from 'uuid';

// 初始课程数据
let courses = [
  {
    id: uuidv4(),
    title: '前端开发进阶',
    description: '深入学习现代前端开发技术，包括Vue 3、React和TypeScript',
    status: 'published',
    cover: '/uploads/course-cover-1.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: '后端开发基础',
    description: 'Node.js、Express和MongoDB的基础知识',
    status: 'draft',
    cover: '/uploads/course-cover-2.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 课程模型
const CourseModel = {
  // 获取所有课程
  getAll: () => {
    return courses;
  },

  // 获取单个课程
  getById: (id) => {
    return courses.find(course => course.id === id);
  },

  // 创建课程
  create: (courseData) => {
    const newCourse = {
      id: uuidv4(),
      ...courseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    courses.push(newCourse);
    return newCourse;
  },

  // 更新课程
  update: (id, courseData) => {
    const index = courses.findIndex(course => course.id === id);
    if (index === -1) return null;

    const updatedCourse = {
      ...courses[index],
      ...courseData,
      updatedAt: new Date().toISOString()
    };
    courses[index] = updatedCourse;
    return updatedCourse;
  },

  // 删除课程
  delete: (id) => {
    const index = courses.findIndex(course => course.id === id);
    if (index === -1) return false;

    courses.splice(index, 1);
    return true;
  }
};

export { CourseModel }; 