// 使用ES模块语法导入
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 存储测试过程中创建的资源ID
const testIds = {
  courseId: null,
  chapterId: null,
  lessonId: null
};

// 辅助函数：等待指定时间
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 测试数据
const testData = {
  course: {
    title: '测试课程',
    description: '这是一个测试课程',
    status: 'draft',
    cover: '/uploads/test-cover.jpg'
  },
  chapter: {
    title: '测试章节',
    description: '这是一个测试章节',
    order: 1
  },
  lesson: {
    title: '测试小节',
    content: '这是一个测试小节',
    duration: 10,
    type: 'video',
    videoUrl: 'https://example.com/videos/test.mp4',
    order: 100
  }
};

// 测试套件：数据库API
describe('数据库API测试', () => {
  test('获取数据库状态', async () => {
    try {
      const response = await axiosInstance.get('/db/status');
      console.log('数据库状态:', response.data);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success');
      expect(response.data.success).toBe(true);
    } catch (error) {
      console.error('获取数据库状态失败:', error.message);
      throw error;
    }
  });
  
  test('重置数据库', async () => {
    try {
      const response = await axiosInstance.post('/db/reset');
      console.log('数据库重置结果:', response.data);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success');
      expect(response.data.success).toBe(true);
      
      // 等待数据库重置完成
      await wait(1000);
    } catch (error) {
      console.error('重置数据库失败:', error.message);
      throw error;
    }
  });
});

// 测试套件：课程API
describe('课程API测试', () => {
  test('获取课程列表', async () => {
    try {
      const response = await axiosInstance.get('/courses');
      console.log('获取到的课程数量:', response.data.data.length);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(Array.isArray(response.data.data)).toBe(true);
    } catch (error) {
      console.error('获取课程列表失败:', error.message);
      throw error;
    }
  });
  
  test('创建课程', async () => {
    try {
      const response = await axiosInstance.post('/courses', testData.course);
      console.log('创建的课程:', response.data);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('title', testData.course.title);
      
      // 保存课程ID供后续测试使用
      testIds.courseId = response.data.id;
    } catch (error) {
      console.error('创建课程失败:', error.message);
      throw error;
    }
  });
  
  test('获取单个课程', async () => {
    try {
      const response = await axiosInstance.get(`/courses/${testIds.courseId}`);
      console.log('获取的课程:', response.data);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', testIds.courseId);
      expect(response.data).toHaveProperty('title', testData.course.title);
    } catch (error) {
      console.error('获取单个课程失败:', error.message);
      throw error;
    }
  });
  
  test('更新课程', async () => {
    try {
      const updatedData = {
        ...testData.course,
        title: '更新后的测试课程',
        status: 'published'
      };
      
      const response = await axiosInstance.put(`/courses/${testIds.courseId}`, updatedData);
      console.log('更新后的课程:', response.data);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', testIds.courseId);
      expect(response.data).toHaveProperty('title', updatedData.title);
      expect(response.data).toHaveProperty('status', updatedData.status);
    } catch (error) {
      console.error('更新课程失败:', error.message);
      throw error;
    }
  });
});

// 测试套件：章节API
describe('章节API测试', () => {
  test('创建章节', async () => {
    try {
      const chapterData = {
        ...testData.chapter,
        courseId: testIds.courseId
      };
      
      const response = await axiosInstance.post('/chapters', chapterData);
      console.log('创建的章节:', response.data);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('title', testData.chapter.title);
      expect(response.data).toHaveProperty('courseId', testIds.courseId);
      
      // 保存章节ID供后续测试使用
      testIds.chapterId = response.data.id;
    } catch (error) {
      console.error('创建章节失败:', error.message);
      throw error;
    }
  });
  
  test('获取章节列表', async () => {
    try {
      const response = await axiosInstance.get('/chapters');
      console.log('获取到的章节数量:', response.data.length);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    } catch (error) {
      console.error('获取章节列表失败:', error.message);
      throw error;
    }
  });
  
  test('获取单个章节', async () => {
    try {
      const response = await axiosInstance.get(`/chapters/${testIds.chapterId}`);
      console.log('获取的章节:', response.data);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', testIds.chapterId);
      expect(response.data).toHaveProperty('title', testData.chapter.title);
    } catch (error) {
      console.error('获取单个章节失败:', error.message);
      throw error;
    }
  });
  
  test('更新章节', async () => {
    try {
      const updatedData = {
        ...testData.chapter,
        title: '更新后的测试章节',
        order: 2
      };
      
      const response = await axiosInstance.put(`/chapters/${testIds.chapterId}`, updatedData);
      console.log('更新后的章节:', response.data);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', testIds.chapterId);
      expect(response.data).toHaveProperty('title', updatedData.title);
      expect(response.data).toHaveProperty('order', updatedData.order);
    } catch (error) {
      console.error('更新章节失败:', error.message);
      throw error;
    }
  });
  
  test('重新排序章节', async () => {
    try {
      const reorderData = [
        {
          id: testIds.chapterId,
          order: 3
        }
      ];
      
      const response = await axiosInstance.put('/chapters/reorder', reorderData);
      console.log('重新排序后的章节:', response.data);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      
      // 找到我们的测试章节
      const updatedChapter = response.data.find(chapter => chapter.id === testIds.chapterId);
      expect(updatedChapter).toBeDefined();
      expect(updatedChapter.order).toBe(3);
    } catch (error) {
      console.error('重新排序章节失败:', error.message);
      throw error;
    }
  });
});

// 测试套件：小节API
describe('小节API测试', () => {
  test('创建小节', async () => {
    try {
      // 使用章节路由创建小节
      const lessonData = {
        ...testData.lesson
      };
      
      const response = await axiosInstance.post(`/chapters/${testIds.chapterId}/lessons`, lessonData);
      console.log('创建的小节:', response.data);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('title', testData.lesson.title);
      expect(response.data).toHaveProperty('chapterId', testIds.chapterId);
      expect(response.data).toHaveProperty('videoUrl', testData.lesson.videoUrl);
      
      // 保存小节ID供后续测试使用
      testIds.lessonId = response.data.id;
    } catch (error) {
      console.error('创建小节失败:', error.message);
      throw error;
    }
  });
  
  test('获取小节列表', async () => {
    try {
      const response = await axiosInstance.get('/lessons');
      console.log('获取到的小节数量:', response.data.length);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    } catch (error) {
      console.error('获取小节列表失败:', error.message);
      throw error;
    }
  });
  
  test('获取单个小节', async () => {
    try {
      const response = await axiosInstance.get(`/lessons/${testIds.lessonId}`);
      console.log('获取的小节:', response.data);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', testIds.lessonId);
      expect(response.data).toHaveProperty('title', testData.lesson.title);
      expect(response.data).toHaveProperty('videoUrl', testData.lesson.videoUrl);
    } catch (error) {
      console.error('获取单个小节失败:', error.message);
      throw error;
    }
  });
  
  test('更新小节', async () => {
    try {
      const updatedData = {
        ...testData.lesson,
        title: '更新后的测试小节',
        duration: 15,
        videoUrl: 'https://example.com/videos/updated-test.mp4'
      };
      
      const response = await axiosInstance.put(`/lessons/${testIds.lessonId}`, updatedData);
      console.log('更新后的小节:', response.data);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', testIds.lessonId);
      expect(response.data).toHaveProperty('title', updatedData.title);
      expect(response.data).toHaveProperty('duration', updatedData.duration);
      expect(response.data).toHaveProperty('videoUrl', updatedData.videoUrl);
    } catch (error) {
      console.error('更新小节失败:', error.message);
      throw error;
    }
  });
  
  test('重新排序小节', async () => {
    try {
      const reorderData = [
        {
          id: testIds.lessonId,
          order: 200
        }
      ];
      
      const response = await axiosInstance.put('/lessons/reorder', reorderData);
      console.log('重新排序后的小节:', response.data);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      
      // 找到我们的测试小节
      const updatedLesson = response.data.find(lesson => lesson.id === testIds.lessonId);
      expect(updatedLesson).toBeDefined();
      expect(updatedLesson.order).toBe(200);
    } catch (error) {
      console.error('重新排序小节失败:', error.message);
      throw error;
    }
  });
});

// 测试套件：清理测试资源
describe('清理测试资源', () => {
  test('删除小节', async () => {
    try {
      const response = await axiosInstance.delete(`/lessons/${testIds.lessonId}`);
      console.log('删除小节结果:', response.data);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message');
    } catch (error) {
      console.error('删除小节失败:', error.message);
      throw error;
    }
  });
  
  test('删除章节', async () => {
    try {
      const response = await axiosInstance.delete(`/chapters/${testIds.chapterId}`);
      console.log('删除章节结果:', response.data);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message');
    } catch (error) {
      console.error('删除章节失败:', error.message);
      throw error;
    }
  });
  
  test('删除课程', async () => {
    try {
      const response = await axiosInstance.delete(`/courses/${testIds.courseId}`);
      console.log('删除课程结果:', response.data);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message');
    } catch (error) {
      console.error('删除课程失败:', error.message);
      throw error;
    }
  });
}); 