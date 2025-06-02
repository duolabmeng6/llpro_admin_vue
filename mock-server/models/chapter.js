import { v4 as uuidv4 } from 'uuid';

// 初始章节数据
let chapters = [
  {
    id: uuidv4(),
    courseId: '1', // 这里需要替换为实际的课程ID
    title: '第一章：基础知识',
    description: '介绍前端开发的基础知识',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    courseId: '1', // 这里需要替换为实际的课程ID
    title: '第二章：进阶技术',
    description: '深入学习前端进阶技术',
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 章节模型
const ChapterModel = {
  // 获取所有章节
  getAll: () => {
    return chapters;
  },

  // 获取单个章节
  getById: (id) => {
    return chapters.find(chapter => chapter.id === id);
  },

  // 获取课程的所有章节
  getByCourseId: (courseId) => {
    return chapters.filter(chapter => chapter.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  },

  // 创建章节
  create: (chapterData) => {
    // 获取当前课程最大的order值
    const maxOrder = chapters
      .filter(chapter => chapter.courseId === chapterData.courseId)
      .reduce((max, chapter) => Math.max(max, chapter.order), 0);
    
    const newChapter = {
      id: uuidv4(),
      ...chapterData,
      order: chapterData.order || maxOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    chapters.push(newChapter);
    return newChapter;
  },

  // 更新章节
  update: (id, chapterData) => {
    const index = chapters.findIndex(chapter => chapter.id === id);
    if (index === -1) return null;

    const updatedChapter = {
      ...chapters[index],
      ...chapterData,
      updatedAt: new Date().toISOString()
    };
    chapters[index] = updatedChapter;
    return updatedChapter;
  },

  // 删除章节
  delete: (id) => {
    const index = chapters.findIndex(chapter => chapter.id === id);
    if (index === -1) return false;

    chapters.splice(index, 1);
    return true;
  },

  // 重新排序章节
  reorder: (reorderData) => {
    // reorderData格式: [{id: '1', order: 2}, {id: '2', order: 1}]
    reorderData.forEach(item => {
      const chapter = chapters.find(c => c.id === item.id);
      if (chapter) {
        chapter.order = item.order;
        chapter.updatedAt = new Date().toISOString();
      }
    });
    return chapters.filter(chapter => 
      reorderData.some(item => item.id === chapter.id)
    );
  }
};

// 更新初始数据中的课程ID
const updateCourseIds = (courseIds) => {
  if (courseIds && courseIds.length >= 2) {
    chapters[0].courseId = courseIds[0];
    chapters[1].courseId = courseIds[0];
  }
};

export {
  ChapterModel,
  updateCourseIds
}; 