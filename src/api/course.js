import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 课程API
export const CourseAPI = {
  // 获取所有课程
  getAllCourses: async () => {
    try {
      const response = await axios.get(`${API_URL}/courses`);
      return response.data;
    } catch (error) {
      console.error('获取课程列表失败:', error);
      throw error;
    }
  },

  // 获取单个课程
  getCourseById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`获取课程 ${id} 失败:`, error);
      throw error;
    }
  },

  // 创建课程
  createCourse: async (courseData) => {
    try {
      const response = await axios.post(`${API_URL}/courses`, courseData);
      return response.data;
    } catch (error) {
      console.error('创建课程失败:', error);
      throw error;
    }
  },

  // 更新课程
  updateCourse: async (id, courseData) => {
    try {
      const response = await axios.put(`${API_URL}/courses/${id}`, courseData);
      return response.data;
    } catch (error) {
      console.error(`更新课程 ${id} 失败:`, error);
      throw error;
    }
  },

  // 删除课程
  deleteCourse: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`删除课程 ${id} 失败:`, error);
      throw error;
    }
  },

  // 获取课程的所有章节
  getCourseChapters: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/courses/${id}/chapters`);
      return response.data;
    } catch (error) {
      console.error(`获取课程 ${id} 的章节失败:`, error);
      throw error;
    }
  },

  // 创建章节
  createChapter: async (courseId, chapterData) => {
    try {
      const response = await axios.post(`${API_URL}/courses/${courseId}/chapters`, chapterData);
      return response.data;
    } catch (error) {
      console.error(`为课程 ${courseId} 创建章节失败:`, error);
      throw error;
    }
  },

  // 获取课程的完整结构（包括章节和小节）
  getCourseStructure: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/courses/${id}/structure`);
      return response.data;
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
      const response = await axios.get(`${API_URL}/chapters/${id}`);
      return response.data;
    } catch (error) {
      console.error(`获取章节 ${id} 失败:`, error);
      throw error;
    }
  },

  // 更新章节
  updateChapter: async (id, chapterData) => {
    try {
      const response = await axios.put(`${API_URL}/chapters/${id}`, chapterData);
      return response.data;
    } catch (error) {
      console.error(`更新章节 ${id} 失败:`, error);
      throw error;
    }
  },

  // 删除章节
  deleteChapter: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/chapters/${id}`);
      return response.data;
    } catch (error) {
      console.error(`删除章节 ${id} 失败:`, error);
      throw error;
    }
  },

  // 获取章节的所有小节
  getChapterLessons: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/chapters/${id}/lessons`);
      return response.data;
    } catch (error) {
      console.error(`获取章节 ${id} 的小节失败:`, error);
      throw error;
    }
  },

  // 创建小节
  createLesson: async (chapterId, lessonData) => {
    try {
      const response = await axios.post(`${API_URL}/chapters/${chapterId}/lessons`, lessonData);
      return response.data;
    } catch (error) {
      console.error(`为章节 ${chapterId} 创建小节失败:`, error);
      throw error;
    }
  },

  // 重新排序章节
  reorderChapters: async (reorderData) => {
    try {
      const response = await axios.put(`${API_URL}/chapters/reorder`, reorderData);
      return response.data;
    } catch (error) {
      console.error('重新排序章节失败:', error);
      throw error;
    }
  }
};

// 小节API
export const LessonAPI = {
  // 获取单个小节
  getLessonById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/lessons/${id}`);
      return response.data;
    } catch (error) {
      console.error(`获取小节 ${id} 失败:`, error);
      throw error;
    }
  },

  // 更新小节
  updateLesson: async (id, lessonData) => {
    try {
      const response = await axios.put(`${API_URL}/lessons/${id}`, lessonData);
      return response.data;
    } catch (error) {
      console.error(`更新小节 ${id} 失败:`, error);
      throw error;
    }
  },

  // 删除小节
  deleteLesson: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/lessons/${id}`);
      return response.data;
    } catch (error) {
      console.error(`删除小节 ${id} 失败:`, error);
      throw error;
    }
  },

  // 重新排序小节
  reorderLessons: async (reorderData) => {
    try {
      const response = await axios.put(`${API_URL}/lessons/reorder`, reorderData);
      return response.data;
    } catch (error) {
      console.error('重新排序小节失败:', error);
      throw error;
    }
  }
}; 