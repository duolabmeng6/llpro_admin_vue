<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useCourseStore } from '../stores/course';
import TreeView from '../components/TreeView.vue';
import DetailPanel from '../components/DetailPanel.vue';
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
// 是否显示未保存修改确认对话框
const showUnsavedChangesModal = ref(false);
// 待执行的操作
const pendingAction = ref(null);
// 详情面板是否处于编辑模式
const detailPanelEditMode = ref(false);
// 树结构是否处于展开状态
const treeExpanded = ref(true);
// 新课程表单数据
const newCourseData = ref({
  title: '',
  description: '',
  content: '',
  price: 0,
  pricingType: 'free',
  status: 'draft',
  cover: ''
});
// 新章节表单数据
const newChapterData = ref({
  title: '',
  description: '',
  order: 0,
  status: 'draft'
});
// 新小节表单数据
const newLessonData = ref({
  title: '',
  content: '',
  duration: 0,
  type: 'video',
  videoUrl: '',
  order: 100,
  status: 'draft',
  isFreePreview: false
});

// 计算属性：树形数据
const treeData = computed(() => courseStore.getTreeData);
// 计算属性：当前选中的节点类型
const selectedNodeType = computed(() => courseStore.getSelectedNodeType);
// 计算属性：当前选中的节点数据
const selectedNodeData = computed(() => courseStore.getSelectedNode);
// 计算属性：加载状态
const loading = computed(() => courseStore.loading);
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
// 添加详情面板组件引用
const detailPanelRef = ref(null);

// 展开全部节点
const expandAllNodes = () => {
  if (treeViewRef.value) {
    treeViewRef.value.expandAllNodes();
    treeExpanded.value = true;
  }
};

// 折叠全部节点
const collapseAllNodes = () => {
  if (treeViewRef.value) {
    treeViewRef.value.collapseAllNodes();
    treeExpanded.value = false;
  }
};

// 切换树结构的展开/折叠状态
const toggleTreeExpansion = () => {
  if (treeExpanded.value) {
    collapseAllNodes();
  } else {
    expandAllNodes();
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

// 树节点点击事件
const handleNodeClick = (node) => {
  // 使用导航处理逻辑
  handlePendingNavigation({ type: 'selectNode', payload: node });
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

// 简单的消息提示函数（模拟实现）
const toasts = ref([]);
const showToast = (type, message, persistent = false) => {
  const id = Date.now().toString();
  const toast = { id, type, message, persistent };
  toasts.value.push(toast);
  
  // 如果不是持久的，设置定时器自动关闭
  if (!persistent) {
    setTimeout(() => hideToast(id), 3000);
  }
  
  return id;
};

const hideToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
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
      order: 0,
      status: 'draft'
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
      videoUrl: '',
      order: 100,
      status: 'draft',
      isFreePreview: false
    };
  } catch (error) {
    console.error('创建小节失败:', error);
  }
};

// 处理页码变化
const handlePageChange = (page) => {
  courseStore.handlePageChange(page);
};

// 处理每页显示数量变化
const handlePageSizeChange = (size) => {
  courseStore.handlePageSizeChange(size);
};

// 处理可能导致离开编辑状态的导航
const handlePendingNavigation = (action) => {
  if (detailPanelRef.value && detailPanelRef.value.checkUnsavedChanges()) {
    pendingAction.value = action;
    showUnsavedChangesModal.value = true;
  } else {
    executePendingAction(action);
  }
};

// 执行待处理的操作
const executePendingAction = (action) => {
  if (!action) return;
  
  if (action.type === 'selectNode') {
    detailPanelEditMode.value = false;
    courseStore.selectNode(action.payload);
  } else if (action.type === 'selectCourse') {
    currentCourseId.value = action.payload;
    mainAreaViewMode.value = 'content';
    courseStore.fetchCourseStructure(action.payload).catch(error => {
      console.error(`获取课程 ${action.payload} 结构失败:`, error);
    });
  }
  
  pendingAction.value = null;
};

// 确认离开编辑状态
const confirmNavigation = () => {
  showUnsavedChangesModal.value = false;
  executePendingAction(pendingAction.value);
};

// 取消离开编辑状态
const cancelNavigation = () => {
  showUnsavedChangesModal.value = false;
  pendingAction.value = null;
};

// 选择课程
const selectCourse = (courseId) => {
  if (currentCourseId.value === courseId && mainAreaViewMode.value === 'content') return;
  
  // 使用导航处理逻辑
  handlePendingNavigation({ type: 'selectCourse', payload: courseId });
};

// 创建课程
const createCourse = async () => {
  try {
    const newCourse = await courseStore.createCourse(newCourseData.value);
    showCreateCourseModal.value = false;
    newCourseData.value = {
      title: '',
      description: '',
      content: '',
      price: 0,
      pricingType: 'free',
      status: 'draft',
      cover: ''
    };
    
    // 选择新创建的课程
    selectCourse(newCourse.id);
  } catch (error) {
    console.error('创建课程失败:', error);
  }
};
</script>

<template>
  <div class="flex flex-col h-screen max-h-screen overflow-hidden">

    <div class="flex h-screen overflow-hidden">
      <!-- 左侧：课程列表 -->
      <div class="flex flex-col h-full overflow-hidden border-r border-gray-200 dark:border-gray-700 w-1/5 min-w-[250px]">
        <div class="course-list-container h-full flex flex-col">
          <!-- 顶部固定区域 -->
          <div class="course-list-header flex flex-col gap-3 p-3 border-b border-gray-200 dark:border-gray-700 z-10">
            <div class="w-full">
              <Button @click="showCreateCourseModal = true" variant="primary" size="sm" class="w-full flex items-center justify-center">
                <i class="fa fa-plus mr-2"></i>创建课程
              </Button>
            </div>
            <div class="relative">
              <input 
                type="text" 
                placeholder="搜索课程..." 
                class="w-full py-2 pl-3 pr-8 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i class="fa fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          
          <!-- 课程列表 -->
          <div class="course-list-content flex-1 overflow-hidden">
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
            
            <div v-else class="course-list-scroll p-3 h-full overflow-y-auto">
              <div class="flex flex-col gap-3">
                <div
                  v-for="course in courseStore.courses"
                  :key="course.id"
                  :class="[
                    'flex items-start p-4 rounded-lg cursor-pointer transition-all duration-200 border',
                    currentCourseId === course.id 
                      ? 'border-blue-200 dark:border-blue-800 shadow-sm' 
                      : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:-translate-y-0.5 hover:shadow-sm'
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
                            ? 'text-green-700 dark:text-green-400' 
                            : 'text-yellow-700 dark:text-yellow-400'
                        ]"
                      >
                        {{ course.status === 'published' ? '已发布' : '草稿' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 底部固定区域，包含分页功能 -->
          <div v-if="totalItems > 0" class="course-list-footer px-3 pt-2 pb-3 border-t border-gray-200 dark:border-gray-700 z-10">
            <Pagination
              :current-page="currentPage"
              :total-pages="totalPages"
              :page-size="pageSize"
              :total-items="totalItems"
              :show-detailed-info="true"
              :show-page-size-selector="true"
              :show-quick-jumper="true"
              :compact="true"
              @update:currentPage="handlePageChange"
              @update:pageSize="handlePageSizeChange"
            />
          </div>
        </div>
      </div>
      
      <!-- 主工作区 -->
      <div class="flex-1 flex overflow-hidden h-full">
        <!-- 欢迎视图 -->
        <div v-if="mainAreaViewMode === 'welcome'" class="flex-1 flex items-center justify-center p-6 h-full">
        </div>

        <!-- 内容视图：课程结构与详情 -->
        <template v-else-if="mainAreaViewMode === 'content'">
          <!-- 中间：课程结构 -->
          <div class="w-[35%] border-r border-gray-200 dark:border-gray-700 h-full">
            <div class="flex flex-col h-full overflow-hidden">
              <div class="px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 overflow-hidden text-ellipsis whitespace-nowrap">课程结构</h3>
                <div class="flex gap-2">
                  <Button size="sm" variant="outline" @click="toggleTreeExpansion" class="min-w-[100px]">
                    <i :class="[treeExpanded ? 'fa fa-compress' : 'fa fa-expand', 'mr-1.5']"></i>
                    {{ treeExpanded ? '全部折叠' : '全部展开' }}
                  </Button>
                </div>
              </div>
              
              <div v-if="!currentCourseId" class="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400 text-center flex-1">
                <p>请选择一个课程</p>
              </div>
              
              <div v-else-if="loading && currentCourseId" class="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400 text-center flex-1">
                <i class="fa fa-spinner fa-spin"></i>
                <span class="ml-2">加载中...</span>
              </div>
              
              <div v-else-if="treeData.length === 0" class="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400 text-center flex-1">
                <i class="fa fa-sitemap text-5xl mb-4 text-gray-400 dark:text-gray-600 opacity-50"></i>
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
              
              <div v-else class="tree-view-container flex-1">
                <TreeView
                  ref="treeViewRef"
                  :data="treeData"
                  :selected-id="selectedNodeId"
                  :draggable="false"
                  @node-click="handleNodeClick"
                  @node-add="handleNodeAdd"
                  @node-edit="handleNodeEdit"
                  class="h-full"
                />
              </div>
            </div>
          </div>
          
          <!-- 右侧：详情面板 -->
          <div class="flex-1 h-full overflow-hidden flex flex-col">
            <DetailPanel
              ref="detailPanelRef"
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
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-1.5">
          <label for="course-title" class="font-medium text-sm text-gray-700 dark:text-gray-300">课程标题</label>
          <input
            id="course-title"
            v-model="newCourseData.title"
            type="text"
            class="p-3 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入课程标题"
            required
          />
        </div>
        
        <div class="flex flex-col gap-1.5">
          <label for="course-description" class="font-medium text-sm text-gray-700 dark:text-gray-300">课程描述</label>
          <textarea
            id="course-description"
            v-model="newCourseData.description"
            class="p-3 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            placeholder="请输入课程描述"
            rows="4"
          ></textarea>
        </div>
        
        <div class="flex flex-col gap-1.5">
          <label for="course-pricing-type" class="font-medium text-sm text-gray-700 dark:text-gray-300">付费类型</label>
          <select
            id="course-pricing-type"
            v-model="newCourseData.pricingType"
            class="p-3 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="free">免费</option>
            <option value="paid">付费</option>
          </select>
        </div>
        
        <div v-if="newCourseData.pricingType === 'paid'" class="flex flex-col gap-1.5">
          <label for="course-price" class="font-medium text-sm text-gray-700 dark:text-gray-300">价格</label>
          <input
            id="course-price"
            v-model.number="newCourseData.price"
            type="number"
            min="0"
            step="0.01"
            class="p-3 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入课程价格"
          />
        </div>
        
        <div class="flex flex-col gap-1.5">
          <label for="course-status" class="font-medium text-sm text-gray-700 dark:text-gray-300">课程状态</label>
          <select
            id="course-status"
            v-model="newCourseData.status"
            class="p-3 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-1.5">
          <label for="chapter-title" class="font-medium text-sm text-gray-700 dark:text-gray-300">章节标题</label>
          <input
            id="chapter-title"
            v-model="newChapterData.title"
            type="text"
            class="p-3 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入章节标题"
            required
          />
        </div>
        
        <div class="flex flex-col gap-1.5">
          <label for="chapter-description" class="font-medium text-sm text-gray-700 dark:text-gray-300">章节描述</label>
          <textarea
            id="chapter-description"
            v-model="newChapterData.description"
            class="p-3 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            placeholder="请输入章节描述"
            rows="4"
          ></textarea>
        </div>
        
        <div class="flex flex-col gap-1.5">
          <label for="chapter-status" class="font-medium text-sm text-gray-700 dark:text-gray-300">章节状态</label>
          <select
            id="chapter-status"
            v-model="newChapterData.status"
            class="p-3 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
          </select>
        </div>
      </div>
    </Modal>
    
    <!-- 创建小节对话框 -->
    <Modal
      v-model:show="showAddLessonModal"
      title="创建小节"
      @confirm="handleCreateLesson(newLessonData)"
    >
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-1.5">
          <label for="lesson-title" class="font-medium text-sm text-gray-700 dark:text-gray-300">小节标题</label>
          <input
            id="lesson-title"
            v-model="newLessonData.title"
            type="text"
            class="p-3 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入小节标题"
            required
          />
        </div>
        
        <div class="flex flex-col gap-1.5">
          <label for="lesson-type" class="font-medium text-sm text-gray-700 dark:text-gray-300">小节类型</label>
          <select
            id="lesson-type"
            v-model="newLessonData.type"
            class="p-3 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="video">视频</option>
            <option value="text">文本</option>
            <option value="quiz">测验</option>
          </select>
        </div>
        
        <div v-if="newLessonData.type === 'video'" class="flex flex-col gap-1.5">
          <label for="lesson-video-url" class="font-medium text-sm text-gray-700 dark:text-gray-300">视频URL</label>
          <input
            id="lesson-video-url"
            v-model="newLessonData.videoUrl"
            type="text"
            class="p-3 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入视频URL"
          />
        </div>
        
        <div class="flex flex-col gap-1.5">
          <label for="lesson-duration" class="font-medium text-sm text-gray-700 dark:text-gray-300">时长(分钟)</label>
          <input
            id="lesson-duration"
            v-model.number="newLessonData.duration"
            type="number"
            min="0"
            class="p-3 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入小节时长"
          />
        </div>
        
        <div class="form-group">
          <label for="lesson-status" class="form-label">状态</label>
          <select
            id="lesson-status"
            v-model="newLessonData.status"
            class="form-select"
          >
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
          </select>
        </div>
        
        <div class="form-group">
          <div class="flex items-center">
            <input
              type="checkbox"
              id="new-lesson-free-preview"
              v-model="newLessonData.isFreePreview"
              class="form-checkbox h-5 w-5 text-blue-600"
            />
            <label for="new-lesson-free-preview" class="ml-2 text-gray-700 dark:text-gray-300">允许试看</label>
          </div>
          <div class="text-xs text-gray-500 mt-1 ml-7">勾选后，未购买课程的用户也可以查看此小节内容</div>
        </div>
      </div>
    </Modal>
    
    <!-- 消息提示组件 -->
    <div class="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-[350px]">
      <transition-group name="toast">
        <div 
          v-for="toast in toasts" 
          :key="toast.id" 
          :class="[
            'flex items-center p-3 rounded-lg shadow-md min-w-[250px] max-w-[350px]', 
            toast.type === 'success' ? 'border-l-4 border-l-green-500' : 
            toast.type === 'error' ? 'border-l-4 border-l-red-500' : 
            toast.type === 'warning' ? 'border-l-4 border-l-yellow-500' : 
            'border-l-4 border-l-blue-500'
          ]"
        >
          <div class="mr-3 text-lg">
            <i 
              :class="[
                'fa', 
                toast.type === 'success' ? 'fa-check-circle text-green-500' : 
                toast.type === 'error' ? 'fa-exclamation-circle text-red-500' : 
                toast.type === 'warning' ? 'fa-exclamation-triangle text-yellow-500' : 
                'fa-info-circle text-blue-500'
              ]"
            ></i>
          </div>
          <div class="flex-1 text-sm text-gray-900 dark:text-gray-100">{{ toast.message }}</div>
          <div class="ml-3 cursor-pointer opacity-60 hover:opacity-100 transition-opacity" @click="hideToast(toast.id)">
            <i class="fa fa-times"></i>
          </div>
        </div>
      </transition-group>
    </div>
    
    <!-- 未保存修改确认对话框 -->
    <Modal
      v-model:show="showUnsavedChangesModal"
      title="未保存的修改"
      confirm-text="放弃修改"
      cancel-text="继续编辑"
      @confirm="confirmNavigation"
      @cancel="cancelNavigation"
    >
      <div class="p-4">
        <p class="text-gray-700 dark:text-gray-300">您有未保存的修改，是否要离开当前页面？</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">如果离开，您的修改将会丢失。</p>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
/* 消息提示动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 详情面板样式覆盖 */
/* 删除已注释的样式代码 */

/* 课程列表样式 */
.course-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.course-list-header {
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.course-list-content {
  flex: 1;
  overflow: hidden;
}

.course-list-scroll {
  overflow-y: auto;
  overflow-x: hidden;
}

.course-list-footer {
  border-top: 1px solid var(--color-border, #e5e7eb);
}

/* 确保滚动条样式一致 */
.course-list-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.course-list-scroll::-webkit-scrollbar-thumb {
  border-radius: 3px;
}


/* 课程结构树视图容器 */
.tree-view-container {
  height: calc(100% - 46px); /* 减去顶部操作栏的高度 */
  padding: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tree-view-container :deep(.tree-container) {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 确保滚动条样式一致 */
.tree-view-container :deep(.tree-container::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

.tree-view-container :deep(.tree-container::-webkit-scrollbar-thumb) {
  border-radius: 3px;
}

</style> 