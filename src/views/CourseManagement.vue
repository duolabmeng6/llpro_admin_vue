<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCourseStore } from '../stores/course';
import TreeView from '../components/TreeView.vue';
import DetailPanel from '../components/DetailPanel.vue';
import Card from '../components/Card.vue';
import Button from '../components/Button.vue';
import Modal from '../components/Modal.vue';

const courseStore = useCourseStore();

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

// 初始化：获取课程列表
onMounted(async () => {
  try {
    await courseStore.fetchCourses();
  } catch (error) {
    console.error('获取课程列表失败:', error);
  }
});

// 选择课程
const selectCourse = async (courseId) => {
  if (currentCourseId.value === courseId) return;
  
  currentCourseId.value = courseId;
  
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
      <Button @click="showCreateCourseModal = true">创建课程</Button>
    </div>
    
    <div class="course-management-content">
      <!-- 左侧：课程列表 -->
      <div class="course-list">
        <Card title="课程列表" shadow="sm">
          <div v-if="loading && !currentCourseId" class="loading-container">
            <i class="fa fa-spinner fa-spin"></i>
            <span class="ml-2">加载中...</span>
          </div>
          
          <div v-else-if="courseStore.courses.length === 0" class="empty-container">
            <p>暂无课程，请创建新课程</p>
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
      
      <!-- 中间：课程结构 -->
      <div class="course-structure">
        <Card title="课程结构" shadow="sm">
          <div v-if="!currentCourseId" class="empty-container">
            <p>请选择一个课程</p>
          </div>
          
          <div v-else-if="loading && currentCourseId" class="loading-container">
            <i class="fa fa-spinner fa-spin"></i>
            <span class="ml-2">加载中...</span>
          </div>
          
          <div v-else-if="treeData.length === 0" class="empty-container">
            <p>课程结构为空</p>
          </div>
          
          <div v-else class="tree-container">
            <TreeView
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
.course-management {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.course-management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.course-management-content {
  display: grid;
  grid-template-columns: 250px 1fr 1.5fr;
  gap: 1rem;
  height: calc(100vh - 150px);
  overflow: auto;
}

.course-list,
.course-structure,
.detail-panel {
  display: flex;
  flex-direction: column;
  overflow: visible;
  max-height: 100%;
}

.course-list :deep(.card),
.course-structure :deep(.card),
.detail-panel :deep(.card) {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.course-list :deep(.card) > div:not(.card-header),
.course-structure :deep(.card) > div:not(.card-header),
.detail-panel :deep(.card) > div:not(.card-header) {
  flex: 1;
  overflow: auto;
  max-height: calc(100vh - 220px);
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--color-text-secondary);
  height: 100%;
}

.course-list-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
}

.course-list-item {
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.course-list-item:hover {
  background-color: var(--color-bg-tertiary);
}

.course-list-item-active {
  background-color: var(--color-bg-selected);
  color: var(--color-text-selected);
}

.course-list-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-label {
  font-weight: 500;
}

.form-input,
.form-textarea,
.form-select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-bg-input);
  color: var(--color-text-primary);
}

.form-textarea {
  resize: vertical;
}
</style> 