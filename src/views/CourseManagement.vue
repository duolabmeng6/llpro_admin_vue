<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useCourseStore } from '../stores/course';
import TreeView from '../components/TreeView.vue';
import DetailPanel from '../components/DetailPanel.vue';
import Card from '../components/Card.vue';
import Button from '../components/Button.vue';
import Modal from '../components/Modal.vue';
import Pagination from '../components/Pagination.vue';

const courseStore = useCourseStore();

// 控制主工作区显示模式：'welcome', 'content'
const mainAreaViewMode = ref('welcome'); 

// 当前选中的课程ID
const currentCourseId = ref(null);
// 是否显示创建课程对话框
const showCreateCourseModal = ref(false);
// 是否显示创建章节对话框
const showAddChapterModal = ref(false);
// 是否显示创建小节对话框
const showAddLessonModal = ref(false);
// 详情面板是否处于编辑模式
const detailPanelEditMode = ref(false);
// 新课程表单数据
const newCourseData = ref({
  title: '',
  description: '',
  status: 'draft',
  cover: ''
});
// 新章节表单数据
const newChapterData = ref({
  title: '',
  description: '',
  order: 0
});
// 新小节表单数据
const newLessonData = ref({
  title: '',
  content: '',
  duration: 0,
  type: 'video',
  videoUrl: ''
});

// 计算属性：树形数据
const treeData = computed(() => courseStore.getTreeData);
// 计算属性：当前选中的节点类型
const selectedNodeType = computed(() => courseStore.getSelectedNodeType);
// 计算属性：当前选中的节点数据
const selectedNodeData = computed(() => courseStore.getSelectedNode);
// 计算属性：加载状态
const loading = computed(() => courseStore.loading);
// 计算属性：错误信息
const error = computed(() => courseStore.error);
// 计算属性：当前选中的节点ID
const selectedNodeId = computed(() => {
  if (!selectedNodeType.value) return null;
  
  switch (selectedNodeType.value) {
    case 'course':
      return courseStore.currentCourse?.id;
    case 'chapter':
      return courseStore.currentChapter?.id;
    case 'lesson':
      return courseStore.currentLesson?.id;
    default:
      return null;
  }
});

// 分页相关计算属性
const pagination = computed(() => courseStore.pagination);
const currentPage = computed(() => pagination.value.currentPage);
const totalPages = computed(() => pagination.value.totalPages);
const pageSize = computed(() => pagination.value.pageSize);
const totalItems = computed(() => pagination.value.totalItems);

// 添加树形结构组件引用
const treeViewRef = ref(null);

// 展开全部节点
const expandAllNodes = () => {
  if (treeViewRef.value) {
    treeViewRef.value.expandAllNodes();
  }
};

// 折叠全部节点
const collapseAllNodes = () => {
  if (treeViewRef.value) {
    treeViewRef.value.collapseAllNodes();
  }
};

// 初始化：获取课程列表
onMounted(async () => {
  try {
    await courseStore.fetchCourses();
    if (!courseStore.courses.length) {
      mainAreaViewMode.value = 'welcome';
    }
  } catch (error) {
    console.error('获取课程列表失败:', error);
    mainAreaViewMode.value = 'welcome'; // 出错时也显示欢迎页
  }
});

// 选择课程
const selectCourse = async (courseId) => {
  if (currentCourseId.value === courseId && mainAreaViewMode.value === 'content') return;
  
  currentCourseId.value = courseId;
  mainAreaViewMode.value = 'content'; // 选中课程后，切换到内容显示模式
  
  try {
    await courseStore.fetchCourseStructure(courseId);
  } catch (error) {
    console.error(`获取课程 ${courseId} 结构失败:`, error);
  }
};

// 创建课程
const createCourse = async () => {
  try {
    const newCourse = await courseStore.createCourse(newCourseData.value);
    showCreateCourseModal.value = false;
    newCourseData.value = {
      title: '',
      description: '',
      status: 'draft',
      cover: ''
    };
    
    // 选择新创建的课程
    selectCourse(newCourse.id);
  } catch (error) {
    console.error('创建课程失败:', error);
  }
};

// 树节点点击事件
const handleNodeClick = (node) => {
  // 重置编辑模式
  detailPanelEditMode.value = false;
  // 选中节点
  courseStore.selectNode(node);
};

// 树节点添加事件
const handleNodeAdd = (node) => {
  if (node.type === 'course') {
    // 显示添加章节对话框
    showAddChapterModal.value = true;
  } else if (node.type === 'chapter') {
    // 选中该章节，然后显示添加小节对话框
    courseStore.selectNode(node);
    showAddLessonModal.value = true;
  }
};

// 树节点编辑事件
const handleNodeEdit = (node) => {
  // 选中该节点
  courseStore.selectNode(node);
  
  // 强制刷新编辑模式：先设置为false，然后在下一个DOM更新周期设置为true
  detailPanelEditMode.value = false;
  nextTick(() => {
    detailPanelEditMode.value = true;
  });
};

// 处理详情面板编辑模式变更
const handleEditModeChange = (value) => {
  detailPanelEditMode.value = value;
};

// 树节点拖拽事件
const handleNodeDrag = async (dragInfo) => {
  const { draggedNode, targetNode, position } = dragInfo;
  
  // 只允许同级节点之间拖拽
  if (draggedNode.type !== targetNode.type) return;
  
  try {
    switch (draggedNode.type) {
      case 'chapter':
        // 章节排序
        if (position === 'before') {
          // 将拖拽的章节放到目标章节前面
          await courseStore.reorderChapters([
            { id: draggedNode.id, order: targetNode.order - 0.5 }
          ]);
        } else if (position === 'after') {
          // 将拖拽的章节放到目标章节后面
          await courseStore.reorderChapters([
            { id: draggedNode.id, order: targetNode.order + 0.5 }
          ]);
        }
        
        // 重新获取课程结构
        await courseStore.fetchCourseStructure(currentCourseId.value);
        break;
        
      case 'lesson':
        // 小节排序
        if (position === 'before') {
          // 将拖拽的小节放到目标小节前面
          await courseStore.reorderLessons([
            { id: draggedNode.id, order: targetNode.order - 0.5 }
          ]);
        } else if (position === 'after') {
          // 将拖拽的小节放到目标小节后面
          await courseStore.reorderLessons([
            { id: draggedNode.id, order: targetNode.order + 0.5 }
          ]);
        }
        
        // 重新获取课程结构
        await courseStore.fetchCourseStructure(currentCourseId.value);
        break;
    }
  } catch (error) {
    console.error('节点排序失败:', error);
  }
};

// 保存节点
const handleSave = async (nodeType, nodeData) => {
  try {
    switch (nodeType) {
      case 'course':
        await courseStore.updateCourse(nodeData.id, nodeData);
        break;
      case 'chapter':
        await courseStore.updateChapter(nodeData.id, nodeData);
        break;
      case 'lesson':
        await courseStore.updateLesson(nodeData.id, nodeData);
        break;
    }
  } catch (error) {
    console.error('保存失败:', error);
  }
};

// 删除节点
const handleDelete = async (nodeType, nodeId) => {
  try {
    switch (nodeType) {
      case 'course':
        await courseStore.deleteCourse(nodeId);
        currentCourseId.value = null;
        mainAreaViewMode.value = 'welcome'; // 删除课程后回到欢迎页
        // 清理可能残留的选中节点状态
        courseStore.selectNode(null); 
        break;
      case 'chapter':
        await courseStore.deleteChapter(nodeId);
        break;
      case 'lesson':
        await courseStore.deleteLesson(nodeId);
        break;
    }
  } catch (error) {
    console.error('删除失败:', error);
  }
};

// 创建章节
const handleCreateChapter = async (chapterData) => {
  if (!currentCourseId.value) return;
  
  try {
    await courseStore.createChapter(currentCourseId.value, chapterData);
    // 关闭对话框并重置表单
    showAddChapterModal.value = false;
    newChapterData.value = {
      title: '',
      description: '',
      order: 0
    };
  } catch (error) {
    console.error('创建章节失败:', error);
  }
};

// 创建小节
const handleCreateLesson = async (lessonData) => {
  if (!courseStore.currentChapter) return;
  
  try {
    await courseStore.createLesson(courseStore.currentChapter.id, lessonData);
    // 关闭对话框并重置表单
    showAddLessonModal.value = false;
    newLessonData.value = {
      title: '',
      content: '',
      duration: 0,
      type: 'video',
      videoUrl: ''
    };
  } catch (error) {
    console.error('创建小节失败:', error);
  }
};

// 处理页码变化
const handlePageChange = (page) => {
  courseStore.handlePageChange(page);
};
</script>

<template>
  <div class="course-management">

    <div class="course-management-content">
      <!-- 左侧：课程列表 -->
      <div class="flex flex-col h-full overflow-hidden border-r border-gray-200 dark:border-gray-700 w-1/5 min-w-[250px]">
        <Card shadow="sm" class="h-full flex flex-col">
          <div class="flex flex-col gap-3 p-3 border-b border-gray-200 dark:border-gray-700">
            <div class="w-full">
              <Button @click="showCreateCourseModal = true" variant="primary" size="sm" class="w-full flex items-center justify-center">
                <i class="fa fa-plus mr-2"></i>创建课程
              </Button>
            </div>
            <div class="relative">
              <input 
                type="text" 
                placeholder="搜索课程..." 
                class="w-full py-2 pl-3 pr-8 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i class="fa fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          
          <div v-if="loading && !currentCourseId && courseStore.courses.length > 0" class="flex flex-col items-center justify-center p-8 h-full text-gray-500"> 
            <i class="fa fa-spinner fa-spin text-xl mb-2"></i>
            <span>加载中...</span>
          </div>
          
          <div v-else-if="courseStore.courses.length === 0" class="flex flex-col items-center justify-center p-8 h-full text-gray-500">
            <i class="fa fa-graduation-cap text-5xl mb-4 opacity-50"></i>
            <p class="mb-4">暂无课程</p>
            <Button @click="showCreateCourseModal = true" size="sm" variant="outline" class="mt-2">
              创建新课程
            </Button>
          </div>
          
          <div v-else class="flex flex-col p-3 gap-3 overflow-auto flex-1">
            <div
              v-for="course in courseStore.courses"
              :key="course.id"
              :class="[
                'flex items-start p-4 rounded-lg cursor-pointer transition-all duration-200 border',
                currentCourseId === course.id 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm' 
                  : 'bg-white dark:bg-gray-800 border-transparent hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-200 dark:hover:border-gray-700 hover:-translate-y-0.5 hover:shadow-sm'
              ]"
              @click="selectCourse(course.id)"
            >
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center mb-1.5">
                  <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ course.title }}</h3>
                </div>
                <p v-if="course.description" class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-1.5">
                  {{ course.description.length > 50 ? course.description.substring(0, 50) + '...' : course.description }}
                </p>
                <div class="flex items-center text-xs text-gray-400 dark:text-gray-500">
                  <i class="fa fa-clock mr-1"></i>
                  {{ course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : '最近更新' }}
                  <span 
                    :class="[
                      'ml-2 px-2 py-0.5 text-xs font-medium rounded-full',
                      course.status === 'published' 
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    ]"
                  >
                    {{ course.status === 'published' ? '已发布' : '草稿' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分页组件 -->
          <div v-if="totalItems > pageSize" class="px-3 pt-2 pb-3 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              :current-page="currentPage"
              :total-pages="totalPages"
              :page-size="pageSize"
              :total-items="totalItems"
              @update:currentPage="handlePageChange"
            />
          </div>
        </Card>
      </div>
      
      <!-- 主工作区 -->
      <div class="main-workspace">
        <!-- 欢迎视图 -->
        <div v-if="mainAreaViewMode === 'welcome'" class="welcome-view">
          <!-- 欢迎内容已移除 -->
        </div>

        <!-- 内容视图：课程结构与详情 -->
        <template v-else-if="mainAreaViewMode === 'content'">
          <!-- 中间：课程结构 -->
          <div class="course-structure-panel">
            <Card title="课程结构" shadow="sm" class="h-full flex flex-col">
              <div class="course-structure-header">
                <div class="course-structure-actions">
                  <Button size="sm" variant="outline" title="展开全部" @click="expandAllNodes">
                    <i class="fa fa-expand"></i>
                  </Button>
                  <Button size="sm" variant="outline" title="折叠全部" @click="collapseAllNodes">
                    <i class="fa fa-compress"></i>
                  </Button>
                </div>
              </div>
              
              <div v-if="!currentCourseId" class="empty-container flex-1 flex items-center justify-center">
                <p>请选择一个课程</p>
              </div>
              
              <div v-else-if="loading && currentCourseId" class="loading-container flex-1 flex items-center justify-center">
                <i class="fa fa-spinner fa-spin"></i>
                <span class="ml-2">加载中...</span>
              </div>
              
              <div v-else-if="treeData.length === 0" class="empty-container flex-1 flex flex-col items-center justify-center">
                <i class="fa fa-sitemap empty-icon"></i>
                <p>课程结构为空</p>
                <Button 
                  v-if="currentCourseId" 
                  @click="showAddChapterModal = true" 
                  size="sm" 
                  variant="outline" 
                  class="mt-4"
                >
                  添加章节
                </Button>
              </div>
              
              <div v-else class="tree-container flex-1">
                <TreeView
                  ref="treeViewRef"
                  :data="treeData"
                  :selected-id="selectedNodeId"
                  :draggable="true"
                  @node-click="handleNodeClick"
                  @node-drag="handleNodeDrag"
                  @node-add="handleNodeAdd"
                  @node-edit="handleNodeEdit"
                />
              </div>
            </Card>
          </div>
          
          <!-- 右侧：详情面板 -->
          <div class="detail-panel">
            <DetailPanel
              :node-type="selectedNodeType"
              :node-data="selectedNodeData"
              :loading="loading"
              :edit-mode="detailPanelEditMode"
              @update:edit-mode="handleEditModeChange"
              @save="handleSave"
              @delete="handleDelete"
              @create-chapter="handleCreateChapter"
              @create-lesson="handleCreateLesson"
              class="h-full"
            />
          </div>
        </template>
      </div>
    </div>
    
    <!-- 创建课程对话框 -->
    <Modal
      v-model:show="showCreateCourseModal"
      title="创建课程"
      @confirm="createCourse"
    >
      <div class="create-course-form">
        <div class="form-group">
          <label for="course-title" class="form-label">课程标题</label>
          <input
            id="course-title"
            v-model="newCourseData.title"
            type="text"
            class="form-input"
            placeholder="请输入课程标题"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="course-description" class="form-label">课程描述</label>
          <textarea
            id="course-description"
            v-model="newCourseData.description"
            class="form-textarea"
            placeholder="请输入课程描述"
            rows="4"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="course-status" class="form-label">课程状态</label>
          <select
            id="course-status"
            v-model="newCourseData.status"
            class="form-select"
          >
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
          </select>
        </div>
      </div>
    </Modal>
    
    <!-- 创建章节对话框 -->
    <Modal
      v-model:show="showAddChapterModal"
      title="创建章节"
      @confirm="handleCreateChapter(newChapterData)"
    >
      <div class="create-chapter-form">
        <div class="form-group">
          <label for="chapter-title" class="form-label">章节标题</label>
          <input
            id="chapter-title"
            v-model="newChapterData.title"
            type="text"
            class="form-input"
            placeholder="请输入章节标题"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="chapter-description" class="form-label">章节描述</label>
          <textarea
            id="chapter-description"
            v-model="newChapterData.description"
            class="form-textarea"
            placeholder="请输入章节描述"
            rows="4"
          ></textarea>
        </div>
      </div>
    </Modal>
    
    <!-- 创建小节对话框 -->
    <Modal
      v-model:show="showAddLessonModal"
      title="创建小节"
      @confirm="handleCreateLesson(newLessonData)"
    >
      <div class="create-lesson-form">
        <div class="form-group">
          <label for="lesson-title" class="form-label">小节标题</label>
          <input
            id="lesson-title"
            v-model="newLessonData.title"
            type="text"
            class="form-input"
            placeholder="请输入小节标题"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="lesson-type" class="form-label">小节类型</label>
          <select
            id="lesson-type"
            v-model="newLessonData.type"
            class="form-select"
          >
            <option value="video">视频</option>
            <option value="text">文本</option>
            <option value="quiz">测验</option>
          </select>
        </div>
        
        <div v-if="newLessonData.type === 'video'" class="form-group">
          <label for="lesson-video-url" class="form-label">视频URL</label>
          <input
            id="lesson-video-url"
            v-model="newLessonData.videoUrl"
            type="text"
            class="form-input"
            placeholder="请输入视频URL"
          />
        </div>
        
        <div class="form-group">
          <label for="lesson-duration" class="form-label">时长(分钟)</label>
          <input
            id="lesson-duration"
            v-model.number="newLessonData.duration"
            type="number"
            min="0"
            class="form-input"
            placeholder="请输入小节时长"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
/* 在这里定义一些局部的、实验性的颜色变量 */
:root {
  /* 一个更现代的强调色示例 (亮蓝色) */
  --modern-accent-color: oklch(65% 0.15 240);
  --modern-accent-text-color: oklch(100% 0 0); /* 白色 */

  /* 更清晰的次要文本颜色 */
  --enhanced-text-secondary: oklch(45% 0.02 255);
}

.course-management {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

.course-management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  height: 64px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text-primary);
  background-image: var(--title-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.course-management-content {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 主工作区 */
.main-workspace {
  flex: 1;
  display: flex;
  overflow: hidden;
  height: 100%;
}

/* 欢迎视图 */
.welcome-view {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  height: 100%;
}

/* 课程结构面板 */
.course-structure-panel {
  width: 35%;
  border-right: 1px solid var(--color-border);
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.course-structure-panel :deep(.card) {
  height: 100%;
  border-radius: 0;
  border: none;
  box-shadow: none;
  display: flex;
  flex-direction: column;
}

.course-structure-panel :deep(.card-header) {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-structure-panel :deep(.card) > div:not(.card-header) {
  flex: 1;
  overflow: auto;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.course-structure-header {
  padding: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}

.course-structure-actions {
  display: flex;
  gap: 0.5rem;
}

/* 详情面板 */
.detail-panel {
  flex: 1;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.detail-panel :deep(.card) {
  height: 100%;
  border-radius: 0;
  border: none;
  box-shadow: none;
  display: flex;
  flex-direction: column;
}

.detail-panel :deep(.card) > div:not(.card-header) {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

/* 通用样式 */
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.tree-container {
  padding: 0.5rem;
  height: 100%;
  overflow: auto;
}

.empty-container, .loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--color-text-secondary);
  text-align: center;
}

.create-course-form,
.create-chapter-form,
.create-lesson-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input,
.form-textarea,
.form-select {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-input-bg);
  color: var(--color-text-primary);
}

.form-textarea {
  resize: vertical;
}

.mt-4 {
  margin-top: 1rem;
}

.mr-2 {
  margin-right: 0.5rem;
}
</style> 