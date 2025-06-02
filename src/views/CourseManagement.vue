<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCourseStore } from '../stores/course';
import TreeView from '../components/TreeView.vue';
import DetailPanel from '../components/DetailPanel.vue';
import Card from '../components/Card.vue';
import Button from '../components/Button.vue';
import Modal from '../components/Modal.vue';

const courseStore = useCourseStore();

// 控制主工作区显示模式：'welcome', 'content'
const mainAreaViewMode = ref('welcome'); 

// 当前选中的课程ID
const currentCourseId = ref(null);
// 是否显示创建课程对话框
const showCreateCourseModal = ref(false);
// 新课程表单数据
const newCourseData = ref({
  title: '',
  description: '',
  status: 'draft',
  cover: ''
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
  courseStore.selectNode(node);
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
  } catch (error) {
    console.error('创建章节失败:', error);
  }
};

// 创建小节
const handleCreateLesson = async (lessonData) => {
  if (!courseStore.currentChapter) return;
  
  try {
    await courseStore.createLesson(courseStore.currentChapter.id, lessonData);
  } catch (error) {
    console.error('创建小节失败:', error);
  }
};
</script>

<template>
  <div class="course-management">
    <div class="course-management-header">
      <h1 class="page-title">课程管理</h1>
      <Button @click="showCreateCourseModal = true" variant="primary">
        <i class="fa fa-plus mr-2"></i>创建课程
      </Button>
    </div>
    
    <div class="course-management-content">
      <!-- 左侧：课程列表 -->
      <div class="course-sidebar">
        <Card title="课程列表" shadow="sm">
          <div class="course-sidebar-header">
            <div class="search-box">
              <i class="fa fa-search search-icon"></i>
              <input type="text" placeholder="搜索课程..." class="search-input" />
            </div>
          </div>
          
          <div v-if="loading && !currentCourseId && courseStore.courses.length > 0" class="loading-container"> 
            <i class="fa fa-spinner fa-spin"></i>
            <span class="ml-2">加载中...</span>
          </div>
          
          <div v-else-if="courseStore.courses.length === 0" class="empty-container">
            <i class="fa fa-graduation-cap empty-icon"></i>
            <p>暂无课程</p>
            <Button @click="showCreateCourseModal = true" size="sm" variant="outline" class="mt-4">
              创建新课程
            </Button>
          </div>
          
          <div v-else class="course-list-items">
            <div
              v-for="course in courseStore.courses"
              :key="course.id"
              :class="['course-list-item', currentCourseId === course.id ? 'course-list-item-active' : '']"
              @click="selectCourse(course.id)"
            >
              <div class="course-list-item-content">
                <div class="course-list-item-title">{{ course.title }}</div>
                <div class="course-list-item-status">
                  <span :class="['status-badge', course.status === 'published' ? 'status-published' : 'status-draft']">
                    {{ course.status === 'published' ? '已发布' : '草稿' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <!-- 主工作区 -->
      <div class="main-workspace">
        <!-- 欢迎视图 -->
        <div v-if="mainAreaViewMode === 'welcome'" class="welcome-view">
          <Card title="欢迎使用课程管理系统" shadow="sm">
            <div class="empty-container">
              <i class="fa fa-book-open empty-icon"></i>
              <p v-if="courseStore.courses.length > 0">请从左侧选择一个课程开始编辑，或</p>
              <p v-else>当前没有课程，您可以</p>
              <Button @click="showCreateCourseModal = true" size="large" variant="primary" class="mt-4">
                <i class="fa fa-plus mr-2"></i>创建新课程
              </Button>
            </div>
          </Card>
        </div>

        <!-- 内容视图：课程结构与详情 -->
        <template v-else-if="mainAreaViewMode === 'content'">
          <!-- 中间：课程结构 -->
          <div class="course-structure-panel">
            <Card title="课程结构" shadow="sm">
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
              
              <div v-if="!currentCourseId" class="empty-container">
                <p>请选择一个课程</p>
              </div>
              
              <div v-else-if="loading && currentCourseId" class="loading-container">
                <i class="fa fa-spinner fa-spin"></i>
                <span class="ml-2">加载中...</span>
              </div>
              
              <div v-else-if="treeData.length === 0" class="empty-container">
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
              
              <div v-else class="tree-container">
                <TreeView
                  ref="treeViewRef"
                  :data="treeData"
                  :selected-id="selectedNodeId"
                  :draggable="true"
                  @node-click="handleNodeClick"
                  @node-drag="handleNodeDrag"
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
              @save="handleSave"
              @delete="handleDelete"
              @create-chapter="handleCreateChapter"
              @create-lesson="handleCreateLesson"
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
  </div>
</template>

<style scoped>
/* 在这里定义一些局部的、实验性的颜色变量 */
:root {
  /* 一个更现代的强调色示例 (亮蓝色) */
  --modern-accent-color: oklch(65% 0.15 240);
  --modern-accent-text-color: oklch(100% 0 0); /* 白色 */

  /* 列表项选中背景 */
  --course-list-item-active-bg: var(--modern-accent-color);
  --course-list-item-active-text: var(--modern-accent-text-color);

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
  height: calc(100vh - 64px);
  overflow: hidden;
}

/* 左侧课程列表 */
.course-sidebar {
  width: 20%;
  min-width: 250px;
  border-right: 1px solid var(--color-border);
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.course-sidebar :deep(.card) {
  height: 100%;
  border-radius: 0;
  border: none;
  box-shadow: none;
  display: flex;
  flex-direction: column;
}

.course-sidebar :deep(.card-header) {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.course-sidebar :deep(.card) > div:not(.card-header) {
  flex: 1;
  overflow: auto;
  padding: 0;
}

.course-sidebar-header {
  padding: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.search-box {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
}

/* 主工作区 */
.main-workspace {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 欢迎视图 */
.welcome-view {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.welcome-view .card {
  width: 100%;
  max-width: 600px;
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
}

/* 通用样式 */
.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--enhanced-text-secondary);
  height: 100%;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.course-list-items {
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
}

.course-list-item {
  padding: 0.85rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.25rem;
}

.course-list-item:hover {
  background-color: var(--color-bg-tertiary);
}

.course-list-item-active {
  background-color: var(--course-list-item-active-bg);
  color: var(--course-list-item-active-text);
}

.course-list-item-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.course-list-item-title {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
}

.status-published {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}

.status-draft {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
}

.tree-container {
  padding: 0.5rem;
  height: 100%;
  overflow: auto;
}

.create-course-form {
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