import axiosInstance from '../utils/axios';

// 课程API
export const CourseAPI = {
  // 获取所有课程
  getAllCourses: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/courses', { params });
      // 不需要 .data，因为拦截器已处理
      return response;
    } catch (error) {
      console.error('获取课程列表失败:', error);
      throw error;
    }
  },

  // 获取单个课程
  getCourseById: async (id) => {
    try {
      const response = await axiosInstance.get(`/courses/${id}`);
      return response;
    } catch (error) {
      console.error(`获取课程 ${id} 失败:`, error);
      throw error;
    }
  },

  // 创建课程
  createCourse: async (courseData) => {
    try {
      const response = await axiosInstance.post('/courses', courseData);
      return response;
    } catch (error) {
      console.error('创建课程失败:', error);
      throw error;
    }
  },

  // 更新课程
  updateCourse: async (id, courseData) => {
    try {
      const response = await axiosInstance.put(`/courses/${id}`, courseData);
      return response;
    } catch (error) {
      console.error(`更新课程 ${id} 失败:`, error);
      throw error;
    }
  },

  // 删除课程
  deleteCourse: async (id) => {
    try {
      const response = await axiosInstance.delete(`/courses/${id}`);
      return response;
    } catch (error) {
      console.error(`删除课程 ${id} 失败:`, error);
      throw error;
    }
  },

  // 获取课程的所有章节
  getCourseChapters: async (id) => {
    try {
      const response = await axiosInstance.get(`/courses/${id}/chapters`);
      return response;
    } catch (error) {
      console.error(`获取课程 ${id} 的章节失败:`, error);
      throw error;
    }
  },

  // 创建章节
  createChapter: async (courseId, chapterData) => {
    try {
      const response = await axiosInstance.post(`/courses/${courseId}/chapters`, chapterData);
      return response;
    } catch (error) {
      console.error(`为课程 ${courseId} 创建章节失败:`, error);
      throw error;
    }
  },

  // 获取课程的完整结构（包括章节和小节）
  getCourseStructure: async (id) => {
    try {
      console.log(`获取课程结构: /courses/${id}/structure`);
      const response = await axiosInstance.get(`/courses/${id}/structure`);
      console.log('课程结构响应:', response);
      return response;
    } catch (error) {
      console.error(`获取课程 ${id} 的结构失败:`, error);
      throw error;
    }
  }
};

// 章节API
export const ChapterAPI = {
  // 获取单个章节
  getChapterById: async (id) => {
    try {
      const response = await axiosInstance.get(`/chapters/${id}`);
      return response;
    } catch (error) {
      console.error(`获取章节 ${id} 失败:`, error);
      throw error;
    }
  },

  // 更新章节
  updateChapter: async (id, chapterData) => {
    try {
      const response = await axiosInstance.put(`/chapters/${id}`, chapterData);
      return response;
    } catch (error) {
      console.error(`更新章节 ${id} 失败:`, error);
      throw error;
    }
  },

  // 删除章节
  deleteChapter: async (id) => {
    try {
      const response = await axiosInstance.delete(`/chapters/${id}`);
      return response;
    } catch (error) {
      console.error(`删除章节 ${id} 失败:`, error);
      throw error;
    }
  },

  // 获取章节的所有小节
  getChapterLessons: async (id) => {
    try {
      const response = await axiosInstance.get(`/chapters/${id}/lessons`);
      return response;
    } catch (error) {
      console.error(`获取章节 ${id} 的小节失败:`, error);
      throw error;
    }
  },

  // 创建小节
  createLesson: async (chapterId, lessonData) => {
    try {
      const response = await axiosInstance.post(`/chapters/${chapterId}/lessons`, lessonData);
      return response;
    } catch (error) {
      console.error(`为章节 ${chapterId} 创建小节失败:`, error);
      throw error;
    }
  },

  // 重新排序章节
  reorderChapters: async (reorderData) => {
    try {
      console.log('===== 章节排序请求开始 =====');
      
      // 确保数据格式正确
      let formattedData;
      if (Array.isArray(reorderData)) {
        // 如果传入的是数组，包装成正确的格式
        formattedData = { chapters: reorderData };
        console.log('章节排序数据格式化: 数组转换为对象格式');
      } else if (reorderData && typeof reorderData === 'object') {
        // 如果已经是对象，但没有chapters字段
        if (!reorderData.chapters && Object.keys(reorderData).length > 0) {
          formattedData = { chapters: [reorderData] };
          console.log('章节排序数据格式化: 单个对象转换为数组格式');
        } else {
          // 已经是正确的格式
          formattedData = reorderData;
        }
      } else {
        // 无效的数据格式
        throw new Error('无效的章节排序数据格式');
      }
      
      console.log('发送章节排序请求数据:', JSON.stringify(formattedData, null, 2));
      console.log('请求URL: /chapters/reorder');
      console.log('请求方法: PUT');
      
      // 记录请求开始时间
      const startTime = Date.now();
      
      // 构建请求配置，以便记录请求头
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      console.log('请求头:', JSON.stringify(config.headers, null, 2));
      
      // 添加重试逻辑
      let response;
      let retries = 2; // 最多重试2次
      let lastError;
      
      while (retries >= 0) {
        try {
          // 发送请求
          response = await axiosInstance.put('/chapters/reorder', formattedData, config);
          break; // 如果成功，跳出循环
        } catch (error) {
          lastError = error;
          if (retries > 0) {
            console.warn(`章节排序请求失败，剩余重试次数: ${retries}`);
            retries--;
            // 等待一秒后重试
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.error('章节排序请求达到最大重试次数，放弃重试');
            throw error; // 达到最大重试次数，抛出最后一次的错误
          }
        }
      }
      
      // 记录请求结束时间和耗时
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('===== 章节排序请求完成 =====');
      console.log('请求耗时:', duration, 'ms');
      console.log('响应状态: 成功');
      console.log('响应数据类型:', typeof response);
      console.log('响应数据:', JSON.stringify(response, null, 2));
      
      // 验证响应数据
      if (!response || (Array.isArray(response) && response.length === 0)) {
        console.warn('章节排序响应数据为空');
      }
      
      return response;
    } catch (error) {
      console.error('===== 章节排序请求失败 =====');
      console.error('错误名称:', error.name);
      console.error('错误消息:', error.message);
      
      if (error.response) {
        // 服务器响应了，但状态码不在 2xx 范围
        console.error('响应状态码:', error.response.status);
        console.error('响应头:', JSON.stringify(error.response.headers, null, 2));
        console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        // 请求已发送但没有收到响应
        console.error('未收到响应。请求详情:', error.request);
      } else {
        // 请求配置出错
        console.error('请求配置错误:', error.config);
      }
      
      // 记录详细的错误堆栈
      console.error('错误堆栈:', error.stack);
      
      throw error;
    }
  }
};

// 小节API
export const LessonAPI = {
  // 获取单个小节
  getLessonById: async (id) => {
    try {
      const response = await axiosInstance.get(`/lessons/${id}`);
      return response;
    } catch (error) {
      console.error(`获取小节 ${id} 失败:`, error);
      throw error;
    }
  },

  // 更新小节
  updateLesson: async (id, lessonData) => {
    try {
      const response = await axiosInstance.put(`/lessons/${id}`, lessonData);
      return response;
    } catch (error) {
      console.error(`更新小节 ${id} 失败:`, error);
      throw error;
    }
  },

  // 删除小节
  deleteLesson: async (id) => {
    try {
      const response = await axiosInstance.delete(`/lessons/${id}`);
      return response;
    } catch (error) {
      console.error(`删除小节 ${id} 失败:`, error);
      throw error;
    }
  },

  // 重新排序小节
  reorderLessons: async (reorderData) => {
    try {
      console.log('===== 小节排序请求开始 =====');
      
      // 确保数据格式正确
      let formattedData;
      if (Array.isArray(reorderData)) {
        // 如果传入的是数组，包装成正确的格式
        formattedData = { lessons: reorderData };
        console.log('小节排序数据格式化: 数组转换为对象格式');
      } else if (reorderData && typeof reorderData === 'object') {
        // 如果已经是对象，但没有lessons字段
        if (!reorderData.lessons && Object.keys(reorderData).length > 0) {
          formattedData = { lessons: [reorderData] };
          console.log('小节排序数据格式化: 单个对象转换为数组格式');
        } else {
          // 已经是正确的格式
          formattedData = reorderData;
        }
      } else {
        // 无效的数据格式
        throw new Error('无效的小节排序数据格式');
      }
      
      console.log('发送小节排序请求数据:', JSON.stringify(formattedData, null, 2));
      console.log('请求URL: /lessons/reorder');
      console.log('请求方法: PUT');
      
      // 记录请求开始时间
      const startTime = Date.now();
      
      // 构建请求配置，以便记录请求头
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      console.log('请求头:', JSON.stringify(config.headers, null, 2));
      
      // 添加重试逻辑
      let response;
      let retries = 2; // 最多重试2次
      let lastError;
      
      while (retries >= 0) {
        try {
          // 发送请求
          response = await axiosInstance.put('/lessons/reorder', formattedData, config);
          break; // 如果成功，跳出循环
        } catch (error) {
          lastError = error;
          if (retries > 0) {
            console.warn(`小节排序请求失败，剩余重试次数: ${retries}`);
            retries--;
            // 等待一秒后重试
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.error('小节排序请求达到最大重试次数，放弃重试');
            throw error; // 达到最大重试次数，抛出最后一次的错误
          }
        }
      }
      
      // 记录请求结束时间和耗时
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('===== 小节排序请求完成 =====');
      console.log('请求耗时:', duration, 'ms');
      console.log('响应状态: 成功');
      console.log('响应数据类型:', typeof response);
      console.log('响应数据:', JSON.stringify(response, null, 2));
      
      // 验证响应数据
      if (!response || (Array.isArray(response) && response.length === 0)) {
        console.warn('小节排序响应数据为空');
      }
      
      return response;
    } catch (error) {
      console.error('===== 小节排序请求失败 =====');
      console.error('错误名称:', error.name);
      console.error('错误消息:', error.message);
      
      if (error.response) {
        // 服务器响应了，但状态码不在 2xx 范围
        console.error('响应状态码:', error.response.status);
        console.error('响应头:', JSON.stringify(error.response.headers, null, 2));
        console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        // 请求已发送但没有收到响应
        console.error('未收到响应。请求详情:', error.request);
      } else {
        // 请求配置出错
        console.error('请求配置错误:', error.config);
      }
      
      // 记录详细的错误堆栈
      console.error('错误堆栈:', error.stack);
      
      throw error;
    }
  }
}; 