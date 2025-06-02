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
    chapterId: '2', // 这里需要替换为实际的章节ID
    title: '2.1 CSS高级选择器',
    content: '学习CSS的高级选择器和伪类',
    duration: 25,
    type: 'video',
    order: 1,
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
    // reorderData格式: [{id: '1', order: 2}, {id: '2', order: 1}]
    reorderData.forEach(item => {
      const lesson = lessons.find(l => l.id === item.id);
      if (lesson) {
        lesson.order = item.order;
        lesson.updatedAt = new Date().toISOString();
      }
    });
    return lessons.filter(lesson => 
      reorderData.some(item => item.id === lesson.id)
    );
  }
};

// 更新初始数据中的章节ID
const updateChapterIds = (chapterIds) => {
  if (chapterIds && chapterIds.length >= 2) {
    lessons[0].chapterId = chapterIds[0];
    lessons[1].chapterId = chapterIds[0];
    lessons[2].chapterId = chapterIds[1];
  }
};

export {
  LessonModel,
  updateChapterIds
}; 