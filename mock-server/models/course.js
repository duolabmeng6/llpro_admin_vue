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

// 生成测试数据
const generateTestCourses = () => {
  // 检查是否已经有足够的测试数据
  if (courses.length >= 20) return;

  const courseTemplates = [
    { title: 'JavaScript高级编程', description: '深入JavaScript核心概念、设计模式和高级特性', status: 'published' },
    { title: 'Vue.js项目实战', description: '从零构建企业级Vue.js应用', status: 'published' },
    { title: 'React Native移动应用开发', description: '使用React Native构建跨平台移动应用', status: 'draft' },
    { title: 'Python数据分析', description: '使用Python进行数据处理、分析和可视化', status: 'published' },
    { title: '微服务架构设计', description: '设计和实现可扩展的微服务架构', status: 'draft' },
    { title: 'DevOps实践指南', description: 'CI/CD、容器化和自动化部署最佳实践', status: 'published' },
    { title: '数据库优化与性能调优', description: '关系型数据库和NoSQL数据库性能优化技巧', status: 'draft' },
    { title: '机器学习入门', description: '机器学习算法和实践应用', status: 'published' },
    { title: '网络安全基础', description: '网络安全原理、威胁防范和最佳实践', status: 'draft' },
    { title: '区块链技术与应用', description: '区块链原理、架构和实际应用案例', status: 'published' },
    { title: '云原生应用开发', description: '基于Kubernetes的云原生应用设计和开发', status: 'draft' },
    { title: '前端性能优化', description: '前端应用性能分析和优化策略', status: 'published' },
    { title: 'UI/UX设计原则', description: '用户界面和用户体验设计最佳实践', status: 'draft' },
    { title: '移动应用UI设计', description: 'iOS和Android平台的用户界面设计规范', status: 'published' },
    { title: 'GraphQL API开发', description: '设计和实现高效的GraphQL API', status: 'draft' },
    { title: 'WebRTC实时通信', description: '基于WebRTC的音视频通信应用开发', status: 'published' },
    { title: '渐进式Web应用(PWA)', description: '构建离线可用、高性能的PWA应用', status: 'draft' },
    { title: 'Web安全与防护', description: 'Web应用安全漏洞分析与防护', status: 'published' }
  ];

  for (const template of courseTemplates) {
    courses.push({
      id: uuidv4(),
      title: template.title,
      description: template.description,
      status: template.status,
      cover: `/uploads/course-cover-${Math.floor(Math.random() * 5) + 1}.jpg`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
      updatedAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString()
    });
  }
};

// 生成测试数据
generateTestCourses();

// 课程模型
const CourseModel = {
  // 获取所有课程
  getAll: (options = {}) => {
    // 默认分页参数
    const page = options.page || 1;
    const limit = options.limit || 10;
    
    // 计算分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // 分页返回课程
    return {
      courses: courses.slice(startIndex, endIndex),
      total: courses.length
    };
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