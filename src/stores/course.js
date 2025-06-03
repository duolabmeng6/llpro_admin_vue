import { defineStore } from 'pinia';
import { CourseAPI, ChapterAPI, LessonAPI } from '../api/course';

export const useCourseStore = defineStore('course', {
  state: () => ({
    // 课程列表
    courses: [],
    // 当前选中的课程
    currentCourse: null,
    // 当前选中的章节
    currentChapter: null,
    // 当前选中的小节
    currentLesson: null,
    // 课程结构（包含章节和小节的完整数据）
    courseStructure: null,
    // 加载状态
    loading: false,
    // 错误信息
    error: null,
    // 当前选中的节点类型：'course', 'chapter', 'lesson'
    selectedNodeType: null,
    // 分页相关状态
    pagination: {
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 1
    }
  }),
  
  getters: {
    // 获取课程列表
    getCourses: (state) => state.courses,
    
    // 获取当前课程
    getCurrentCourse: (state) => state.currentCourse,
    
    // 获取当前章节
    getCurrentChapter: (state) => state.currentChapter,
    
    // 获取当前小节
    getCurrentLesson: (state) => state.currentLesson,
    
    // 获取课程结构
    getCourseStructure: (state) => state.courseStructure,
    
    // 获取当前选中节点类型
    getSelectedNodeType: (state) => state.selectedNodeType,
    
    // 获取当前选中的节点（根据类型）
    getSelectedNode: (state) => {
      switch (state.selectedNodeType) {
        case 'course':
          return state.currentCourse;
        case 'chapter':
          return state.currentChapter;
        case 'lesson':
          return state.currentLesson;
        default:
          return null;
      }
    },
    
    // 获取树形结构数据
    getTreeData: (state) => {
      if (!state.courseStructure) return [];
      
      return [
        {
          id: state.courseStructure.id,
          label: state.courseStructure.title,
          type: 'course',
          children: state.courseStructure.chapters?.map(chapter => ({
            id: chapter.id,
            label: chapter.title,
            type: 'chapter',
            parentId: state.courseStructure.id,
            order: chapter.order,
            children: chapter.lessons?.map(lesson => ({
              id: lesson.id,
              label: lesson.title,
              type: 'lesson',
              parentId: chapter.id,
              order: lesson.order
            })).sort((a, b) => a.order - b.order) || []
          })).sort((a, b) => a.order - b.order) || []
        }
      ];
    }
  },
  
  actions: {
    // 设置加载状态
    setLoading(status) {
      this.loading = status;
    },
    
    // 设置错误信息
    setError(error) {
      this.error = error;
    },
    
    // 清除错误信息
    clearError() {
      this.error = null;
    },
    
    // 获取所有课程
    async fetchCourses(params = {}) {
      this.setLoading(true);
      this.clearError();
      
      try {
        // 构建查询参数
        const queryParams = {
          page: params.page || this.pagination.currentPage,
          limit: params.limit || this.pagination.pageSize
        };
        
        // 获取课程列表
        const response = await CourseAPI.getAllCourses(queryParams);
        
        // 更新课程列表
        this.courses = response.data;
        
        // 更新分页信息
        this.pagination = {
          currentPage: response.meta.currentPage,
          pageSize: response.meta.pageSize,
          totalItems: response.meta.totalItems,
          totalPages: response.meta.totalPages
        };
        
        return this.courses;
      } catch (error) {
        this.setError(error.message || '获取课程列表失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 页码变化处理
    async handlePageChange(page) {
      if (page === this.pagination.currentPage) return;
      
      try {
        await this.fetchCourses({ page });
      } catch (error) {
        console.error('分页加载失败:', error);
      }
    },
    
    // 每页数量变化处理
    async handlePageSizeChange(pageSize) {
      if (pageSize === this.pagination.pageSize) return;
      
      try {
        await this.fetchCourses({ page: 1, limit: pageSize });
      } catch (error) {
        console.error('分页大小变更失败:', error);
      }
    },
    
    // 获取单个课程
    async fetchCourse(id) {
      this.setLoading(true);
      this.clearError();
      
      try {
        const course = await CourseAPI.getCourseById(id);
        this.currentCourse = course;
        this.selectedNodeType = 'course';
        return course;
      } catch (error) {
        this.setError(error.message || `获取课程 ${id} 失败`);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 获取课程结构
    async fetchCourseStructure(id) {
      this.setLoading(true);
      this.clearError();
      
      try {
        const structure = await CourseAPI.getCourseStructure(id);
        this.courseStructure = structure;
        this.currentCourse = {
          id: structure.id,
          title: structure.title,
          description: structure.description,
          status: structure.status,
          cover: structure.cover
        };
        this.selectedNodeType = 'course';
        return structure;
      } catch (error) {
        this.setError(error.message || `获取课程 ${id} 结构失败`);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 创建课程
    async createCourse(courseData) {
      this.setLoading(true);
      this.clearError();
      
      try {
        const newCourse = await CourseAPI.createCourse(courseData);
        this.courses.push(newCourse);
        return newCourse;
      } catch (error) {
        this.setError(error.message || '创建课程失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 更新课程
    async updateCourse(id, courseData) {
      this.setLoading(true);
      this.clearError();
      
      try {
        const updatedCourse = await CourseAPI.updateCourse(id, courseData);
        
        // 更新课程列表中的课程
        const index = this.courses.findIndex(course => course.id === id);
        if (index !== -1) {
          this.courses[index] = updatedCourse;
        }
        
        // 更新当前选中的课程
        if (this.currentCourse && this.currentCourse.id === id) {
          this.currentCourse = updatedCourse;
        }
        
        // 更新课程结构
        if (this.courseStructure && this.courseStructure.id === id) {
          this.courseStructure = {
            ...this.courseStructure,
            ...updatedCourse
          };
        }
        
        return updatedCourse;
      } catch (error) {
        this.setError(error.message || `更新课程 ${id} 失败`);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 删除课程
    async deleteCourse(id) {
      this.setLoading(true);
      this.clearError();
      
      try {
        await CourseAPI.deleteCourse(id);
        
        // 从课程列表中移除
        this.courses = this.courses.filter(course => course.id !== id);
        
        // 清除当前选中的课程
        if (this.currentCourse && this.currentCourse.id === id) {
          this.currentCourse = null;
          this.courseStructure = null;
          this.selectedNodeType = null;
        }
        
        return true;
      } catch (error) {
        this.setError(error.message || `删除课程 ${id} 失败`);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 创建章节
    async createChapter(courseId, chapterData) {
      this.setLoading(true);
      this.clearError();
      
      try {
        const newChapter = await CourseAPI.createChapter(courseId, chapterData);
        
        // 更新课程结构
        if (this.courseStructure && this.courseStructure.id === courseId) {
          if (!this.courseStructure.chapters) {
            this.courseStructure.chapters = [];
          }
          this.courseStructure.chapters.push(newChapter);
        }
        
        return newChapter;
      } catch (error) {
        this.setError(error.message || `为课程 ${courseId} 创建章节失败`);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 更新章节
    async updateChapter(id, chapterData) {
      this.setLoading(true);
      this.clearError();
      
      try {
        const updatedChapter = await ChapterAPI.updateChapter(id, chapterData);
        
        // 更新课程结构中的章节
        if (this.courseStructure && this.courseStructure.chapters) {
          const index = this.courseStructure.chapters.findIndex(chapter => chapter.id === id);
          if (index !== -1) {
            this.courseStructure.chapters[index] = {
              ...this.courseStructure.chapters[index],
              ...updatedChapter
            };
          }
        }
        
        // 更新当前选中的章节
        if (this.currentChapter && this.currentChapter.id === id) {
          this.currentChapter = {
            ...this.currentChapter,
            ...updatedChapter
          };
        }
        
        return updatedChapter;
      } catch (error) {
        this.setError(error.message || `更新章节 ${id} 失败`);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 删除章节
    async deleteChapter(id) {
      this.setLoading(true);
      this.clearError();
      
      try {
        await ChapterAPI.deleteChapter(id);
        
        // 从课程结构中移除章节
        if (this.courseStructure && this.courseStructure.chapters) {
          this.courseStructure.chapters = this.courseStructure.chapters.filter(
            chapter => chapter.id !== id
          );
        }
        
        // 清除当前选中的章节
        if (this.currentChapter && this.currentChapter.id === id) {
          this.currentChapter = null;
          this.selectedNodeType = 'course';
        }
        
        return true;
      } catch (error) {
        this.setError(error.message || `删除章节 ${id} 失败`);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 创建小节
    async createLesson(chapterId, lessonData) {
      this.setLoading(true);
      this.clearError();
      
      try {
        const newLesson = await ChapterAPI.createLesson(chapterId, lessonData);
        
        // 更新课程结构中的小节
        if (this.courseStructure && this.courseStructure.chapters) {
          const chapterIndex = this.courseStructure.chapters.findIndex(
            chapter => chapter.id === chapterId
          );
          
          if (chapterIndex !== -1) {
            if (!this.courseStructure.chapters[chapterIndex].lessons) {
              this.courseStructure.chapters[chapterIndex].lessons = [];
            }
            this.courseStructure.chapters[chapterIndex].lessons.push(newLesson);
          }
        }
        
        return newLesson;
      } catch (error) {
        this.setError(error.message || `为章节 ${chapterId} 创建小节失败`);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 更新小节
    async updateLesson(id, lessonData) {
      this.setLoading(true);
      this.clearError();
      
      try {
        const updatedLesson = await LessonAPI.updateLesson(id, lessonData);
        
        // 更新课程结构中的小节
        if (this.courseStructure && this.courseStructure.chapters) {
          for (const chapter of this.courseStructure.chapters) {
            if (chapter.lessons) {
              const lessonIndex = chapter.lessons.findIndex(lesson => lesson.id === id);
              if (lessonIndex !== -1) {
                chapter.lessons[lessonIndex] = {
                  ...chapter.lessons[lessonIndex],
                  ...updatedLesson
                };
                break;
              }
            }
          }
        }
        
        // 更新当前选中的小节
        if (this.currentLesson && this.currentLesson.id === id) {
          this.currentLesson = {
            ...this.currentLesson,
            ...updatedLesson
          };
        }
        
        return updatedLesson;
      } catch (error) {
        this.setError(error.message || `更新小节 ${id} 失败`);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 删除小节
    async deleteLesson(id) {
      this.setLoading(true);
      this.clearError();
      
      try {
        await LessonAPI.deleteLesson(id);
        
        // 从课程结构中移除小节
        if (this.courseStructure && this.courseStructure.chapters) {
          for (const chapter of this.courseStructure.chapters) {
            if (chapter.lessons) {
              chapter.lessons = chapter.lessons.filter(lesson => lesson.id !== id);
            }
          }
        }
        
        // 清除当前选中的小节
        if (this.currentLesson && this.currentLesson.id === id) {
          this.currentLesson = null;
          this.selectedNodeType = 'chapter';
        }
        
        return true;
      } catch (error) {
        this.setError(error.message || `删除小节 ${id} 失败`);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 重新排序章节
    async reorderChapters(reorderData) {
      this.setLoading(true);
      this.clearError();
      
      try {
        const updatedChapters = await ChapterAPI.reorderChapters(reorderData);
        
        // 更新课程结构中的章节顺序
        if (this.courseStructure && this.courseStructure.chapters) {
          for (const updatedChapter of updatedChapters) {
            const index = this.courseStructure.chapters.findIndex(
              chapter => chapter.id === updatedChapter.id
            );
            if (index !== -1) {
              this.courseStructure.chapters[index].order = updatedChapter.order;
            }
          }
        }
        
        return updatedChapters;
      } catch (error) {
        this.setError(error.message || '重新排序章节失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 重新排序小节
    async reorderLessons(reorderData) {
      this.setLoading(true);
      this.clearError();
      
      try {
        const updatedLessons = await LessonAPI.reorderLessons(reorderData);
        
        // 更新课程结构中的小节顺序
        if (this.courseStructure && this.courseStructure.chapters) {
          for (const updatedLesson of updatedLessons) {
            for (const chapter of this.courseStructure.chapters) {
              if (chapter.lessons) {
                const lessonIndex = chapter.lessons.findIndex(
                  lesson => lesson.id === updatedLesson.id
                );
                if (lessonIndex !== -1) {
                  chapter.lessons[lessonIndex].order = updatedLesson.order;
                  break;
                }
              }
            }
          }
        }
        
        return updatedLessons;
      } catch (error) {
        this.setError(error.message || '重新排序小节失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 选择节点
    selectNode(node) {
      if (!node) {
        this.selectedNodeType = null;
        this.currentCourse = null;
        this.currentChapter = null;
        this.currentLesson = null;
        return;
      }
      
      this.selectedNodeType = node.type;
      
      switch (node.type) {
        case 'course':
          this.currentCourse = this.courseStructure;
          this.currentChapter = null;
          this.currentLesson = null;
          break;
        case 'chapter':
          if (this.courseStructure && this.courseStructure.chapters) {
            this.currentChapter = this.courseStructure.chapters.find(
              chapter => chapter.id === node.id
            );
            this.currentLesson = null;
          }
          break;
        case 'lesson':
          if (this.courseStructure && this.courseStructure.chapters) {
            for (const chapter of this.courseStructure.chapters) {
              if (chapter.lessons) {
                const lesson = chapter.lessons.find(lesson => lesson.id === node.id);
                if (lesson) {
                  this.currentChapter = chapter;
                  this.currentLesson = lesson;
                  break;
                }
              }
            }
          }
          break;
      }
    }
  }
}); 