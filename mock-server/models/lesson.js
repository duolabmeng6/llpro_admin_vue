import { v4 as uuidv4 } from 'uuid';

// 初始小节数据
let lessons = [
  {
    id: uuidv4(),
    chapterId: '1', // 这里需要替换为实际的章节ID
    title: '1.1 前端开发概述',
    content: '本节介绍前端开发的基本概念和工具链',
    duration: 15, // 分钟
    type: 'video',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    chapterId: '1', // 这里需要替换为实际的章节ID
    title: '1.2 HTML基础',
    content: '学习HTML的基本标签和结构',
    duration: 20,
    type: 'video',
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    chapterId: '1', // 这里需要替换为实际的章节ID
    title: '1.3 CSS基础',
    content: '学习CSS的基本标签和结构',
    duration: 20,
    type: 'video',
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    chapterId: '1', // 这里需要替换为实际的章节ID
    title: '1.4 JavaScript基础',
    content: '学习JavaScript的基本标签和结构',
    duration: 20,
    type: 'video',
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    chapterId: '2', // 这里需要替换为实际的章节ID
    title: '2.1 CSS高级选择器',
    content: '学习CSS的高级选择器和伪类',
    duration: 25,
    type: 'video',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // 添加更多测试数据 - 第二章的小节
  {
    id: uuidv4(),
    chapterId: '2', // 第二章
    title: '2.2 CSS布局技术',
    content: '学习Flexbox和Grid等现代CSS布局技术',
    duration: 30,
    type: 'video',
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    chapterId: '2', // 第二章
    title: '2.3 CSS动画与过渡',
    content: '学习CSS动画、过渡和变换效果',
    duration: 25,
    type: 'video',
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    chapterId: '2', // 第二章
    title: '2.4 响应式设计',
    content: '学习媒体查询和响应式网页设计原则',
    duration: 35,
    type: 'video',
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // 添加第三章的小节
  {
    id: uuidv4(),
    chapterId: '3', // 第三章
    title: '3.1 JavaScript进阶',
    content: '深入学习JavaScript的高级特性和ES6+语法',
    duration: 40,
    type: 'video',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    chapterId: '3', // 第三章
    title: '3.2 异步编程',
    content: '学习Promise、async/await和事件循环',
    duration: 35,
    type: 'video',
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    chapterId: '3', // 第三章
    title: '3.3 前端框架介绍',
    content: '了解主流前端框架的基本概念和比较',
    duration: 30,
    type: 'document',
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 小节模型
const LessonModel = {
  // 获取所有小节
  getAll: () => {
    return lessons;
  },

  // 获取单个小节
  getById: (id) => {
    return lessons.find(lesson => lesson.id === id);
  },

  // 获取章节的所有小节
  getByChapterId: (chapterId) => {
    return lessons.filter(lesson => lesson.chapterId === chapterId)
      .sort((a, b) => a.order - b.order);
  },

  // 创建小节
  create: (lessonData) => {
    // 获取当前章节最大的order值
    const maxOrder = lessons
      .filter(lesson => lesson.chapterId === lessonData.chapterId)
      .reduce((max, lesson) => Math.max(max, lesson.order), 0);
    
    const newLesson = {
      id: uuidv4(),
      ...lessonData,
      order: lessonData.order || maxOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    lessons.push(newLesson);
    return newLesson;
  },

  // 更新小节
  update: (id, lessonData) => {
    const index = lessons.findIndex(lesson => lesson.id === id);
    if (index === -1) return null;

    const updatedLesson = {
      ...lessons[index],
      ...lessonData,
      updatedAt: new Date().toISOString()
    };
    lessons[index] = updatedLesson;
    return updatedLesson;
  },

  // 删除小节
  delete: (id) => {
    const index = lessons.findIndex(lesson => lesson.id === id);
    if (index === -1) return false;

    lessons.splice(index, 1);
    return true;
  },

  // 重新排序小节
  reorder: (reorderData) => {
    console.log('小节排序 - 接收到的数据:', reorderData);
    
    // reorderData格式: [{id: '1', order: 2}, {id: '2', order: 1}]
    const updatedLessons = [];
    
    // 记录排序前的状态，用于日志
    const beforeState = {};
    lessons.forEach(lesson => {
      beforeState[lesson.id] = {
        order: lesson.order,
        chapterId: lesson.chapterId,
        title: lesson.title
      };
    });
    console.log('排序前的小节状态:', beforeState);
    
    // 更新指定小节的顺序
    reorderData.forEach(item => {
      const lesson = lessons.find(l => l.id === item.id);
      if (lesson) {
        console.log(`更新小节 ${lesson.id} 的顺序: ${lesson.order} -> ${item.order}`);
        lesson.order = item.order;
        lesson.updatedAt = new Date().toISOString();
        updatedLessons.push({ ...lesson });
      } else {
        console.warn(`未找到小节: ${item.id}`);
      }
    });
    
    // 获取所有受影响的章节
    const affectedChapterIds = new Set(updatedLessons.map(l => l.chapterId));
    console.log('受影响的章节:', Array.from(affectedChapterIds));
    
    // 记录排序后的状态，用于日志
    const afterState = {};
    lessons.forEach(lesson => {
      afterState[lesson.id] = {
        order: lesson.order,
        chapterId: lesson.chapterId,
        title: lesson.title
      };
    });
    console.log('排序后的小节状态:', afterState);
    
    // 记录变化的小节
    const changes = {};
    Object.keys(beforeState).forEach(id => {
      if (beforeState[id].order !== afterState[id]?.order) {
        changes[id] = {
          before: beforeState[id],
          after: afterState[id]
        };
      }
    });
    console.log('小节顺序变化:', changes);
    
    return updatedLessons;
  }
};

// 更新初始数据中的章节ID
const updateChapterIds = (chapterIds) => {
  if (chapterIds && chapterIds.length >= 2) {
    console.log('更新小节的章节ID关联，可用章节ID:', chapterIds);
    
    // 为每个小节分配适当的章节ID
    lessons.forEach((lesson, index) => {
      // 根据小节的title前缀判断它属于哪个章节
      const titlePrefix = lesson.title.split('.')[0];
      
      if (titlePrefix === '1') {
        // 第一章的小节
        if (chapterIds[0]) {
          console.log(`更新小节 "${lesson.title}" 的章节ID: ${lesson.chapterId} -> ${chapterIds[0]}`);
          lesson.chapterId = chapterIds[0];
        }
      } else if (titlePrefix === '2') {
        // 第二章的小节
        if (chapterIds[1]) {
          console.log(`更新小节 "${lesson.title}" 的章节ID: ${lesson.chapterId} -> ${chapterIds[1]}`);
          lesson.chapterId = chapterIds[1];
        }
      } else if (titlePrefix === '3') {
        // 第三章的小节
        if (chapterIds[2]) {
          console.log(`更新小节 "${lesson.title}" 的章节ID: ${lesson.chapterId} -> ${chapterIds[2]}`);
          lesson.chapterId = chapterIds[2];
        }
      }
    });
    
    console.log('小节章节ID更新完成');
  }
};

export {
  LessonModel,
  updateChapterIds
}; 