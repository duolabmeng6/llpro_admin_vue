<script setup>
import { computed, ref, watch } from 'vue';
import { Form, FormGroup, Select, Textarea } from './form';
import Button from './Button.vue';
import Modal from './Modal.vue';
import MultiImageUpload from './MultiImageUpload.vue';
import MarkdownEditor from './MarkdownEditor.vue';

const props = defineProps({
  // 节点类型：'course', 'chapter', 'lesson'
  nodeType: {
    type: String,
    default: null
  },
  // 节点数据
  nodeData: {
    type: Object,
    default: null
  },
  // 是否处于加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 是否处于编辑模式（由父组件控制）
  editMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'save',
  'delete',
  'create-chapter',
  'create-lesson',
  'update:editMode' // 添加编辑模式更新事件
]);

// 编辑表单数据
const formData = ref({});
// 是否处于编辑模式
const isEditing = ref(false);
// 是否显示删除确认对话框
const showDeleteConfirm = ref(false);
// 是否显示添加章节对话框
const showAddChapterModal = ref(false);
// 是否显示添加小节对话框
const showAddLessonModal = ref(false);
// 新章节表单数据
const newChapterData = ref({
  title: '',
  description: '',
  order: 1,
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
  status: 'draft'
});

// 判断表单是否有未保存的修改
const hasUnsavedChanges = ref(false);

// 原始数据副本，用于比较是否有修改
const originalData = ref({});

// 监听节点数据变化，重置表单数据
watch(() => props.nodeData, (newVal) => {
  if (newVal) {
    console.log(`DetailPanel - nodeData changed, nodeType: ${props.nodeType}, content type:`, typeof newVal.content);
    
    // 创建formData的副本
    const processedData = { ...newVal };
    
    // 处理特殊字段
    if (props.nodeType === 'course') {
      // 确保content字段是字符串
      if (processedData.content === null || processedData.content === undefined) {
        console.log('课程content字段为null或undefined，设置为空字符串');
        processedData.content = '';
      } else if (typeof processedData.content !== 'string') {
        console.log(`课程content字段类型为${typeof processedData.content}，转换为字符串`);
        processedData.content = String(processedData.content);
      }
    } else if (props.nodeType === 'lesson') {
      // 确保lesson的content字段也是字符串
      if (processedData.content === null || processedData.content === undefined) {
        console.log('小节content字段为null或undefined，设置为空字符串');
        processedData.content = '';
      } else if (typeof processedData.content !== 'string') {
        console.log(`小节content字段类型为${typeof processedData.content}，转换为字符串`);
        processedData.content = String(processedData.content);
      }
    }
    
    formData.value = processedData;
    isEditing.value = false;
  } else {
    formData.value = {};
    isEditing.value = false;
  }
}, { immediate: true, deep: true });

// 监听editMode属性变化
watch(() => props.editMode, (newVal) => {
  if (newVal && !isEditing.value && props.nodeData) {
    // 当外部设置editMode为true且当前不在编辑状态时进入编辑模式
    isEditing.value = true;
    
    console.log(`DetailPanel - 进入编辑模式, nodeType: ${props.nodeType}, content type:`, typeof props.nodeData.content);
    
    // 创建formData的副本并处理特殊字段
    const processedData = { ...props.nodeData };
    
    if (props.nodeType === 'course') {
      // 确保content字段是字符串
      if (processedData.content === null || processedData.content === undefined) {
        console.log('进入编辑模式 - 课程content字段为null或undefined，设置为空字符串');
        processedData.content = '';
      } else if (typeof processedData.content !== 'string') {
        console.log(`进入编辑模式 - 课程content字段类型为${typeof processedData.content}，转换为字符串`);
        processedData.content = String(processedData.content);
      }
    } else if (props.nodeType === 'lesson') {
      // 确保lesson的content字段也是字符串
      if (processedData.content === null || processedData.content === undefined) {
        console.log('进入编辑模式 - 小节content字段为null或undefined，设置为空字符串');
        processedData.content = '';
      } else if (typeof processedData.content !== 'string') {
        console.log(`进入编辑模式 - 小节content字段类型为${typeof processedData.content}，转换为字符串`);
        processedData.content = String(processedData.content);
      }
    }
    
    formData.value = processedData;
  }
}, { immediate: true });

// 监听表单数据变化，检测未保存的修改
watch(formData, (newVal) => {
  if (!isEditing.value) return;
  
  // 简单比较是否有变化
  hasUnsavedChanges.value = JSON.stringify(newVal) !== JSON.stringify(originalData.value);
  console.log('表单数据变更，未保存状态:', hasUnsavedChanges.value);
}, { deep: true });

// 进入编辑模式时，保存原始数据副本
watch(isEditing, (newVal) => {
  if (newVal) {
    originalData.value = JSON.parse(JSON.stringify(formData.value));
    hasUnsavedChanges.value = false;
    console.log('进入编辑模式，保存原始数据副本');
  } else {
    hasUnsavedChanges.value = false;
    console.log('退出编辑模式，重置未保存状态');
  }
});

// 定义一个方法，检查是否有未保存的修改
const checkUnsavedChanges = () => {
  return isEditing.value && hasUnsavedChanges.value;
};

// 将方法暴露给父组件
defineExpose({
  checkUnsavedChanges
});

// 计算面板标题
const panelTitle = computed(() => {
  if (!props.nodeType || !props.nodeData) return '详情';
  
  switch (props.nodeType) {
    case 'course':
      return `课程: ${props.nodeData.title || ''}`;
    case 'chapter':
      return `章节: ${props.nodeData.title || ''}`;
    case 'lesson':
      return `小节: ${props.nodeData.title || ''}`;
    default:
      return '详情';
  }
});

// 计算是否显示添加章节按钮
const showAddChapterButton = computed(() => {
  return props.nodeType === 'course';
});

// 计算是否显示添加小节按钮
const showAddLessonButton = computed(() => {
  return props.nodeType === 'chapter';
});

// 确保content字段是字符串类型
const safeContent = computed(() => {
  if (props.nodeType === 'course' && props.nodeData && props.nodeData.content) {
    return typeof props.nodeData.content === 'string' 
      ? props.nodeData.content 
      : String(props.nodeData.content);
  } else if (props.nodeType === 'lesson' && props.nodeData && props.nodeData.content) {
    return typeof props.nodeData.content === 'string' 
      ? props.nodeData.content 
      : String(props.nodeData.content);
  }
  return '';
});

// 切换编辑模式
const toggleEditMode = () => {
  if (isEditing.value) {
    // 保存编辑
    emit('save', props.nodeType, formData.value);
    // 通知父组件编辑模式已关闭
    emit('update:editMode', false);
  } else {
    // 进入编辑模式
    emit('update:editMode', true);
  }
  isEditing.value = !isEditing.value;
};

// 取消编辑
const cancelEdit = () => {
  formData.value = { ...props.nodeData };
  isEditing.value = false;
  // 通知父组件编辑模式已关闭
  emit('update:editMode', false);
};

// 确认删除
const confirmDelete = () => {
  showDeleteConfirm.value = false;
  emit('delete', props.nodeType, props.nodeData.id);
};

// 添加章节
const addChapter = () => {
  emit('create-chapter', newChapterData.value);
  showAddChapterModal.value = false;
  newChapterData.value = {
    title: '',
    description: '',
    order: 1,
    status: 'draft'
  };
};

// 添加小节
const addLesson = () => {
  emit('create-lesson', newLessonData.value);
  showAddLessonModal.value = false;
  newLessonData.value = {
    title: '',
    content: '',
    duration: 0,
    type: 'video',
    videoUrl: '',
    order: 100,
    status: 'draft'
  };
};
</script>

<template>
  <div class="detail-panel-container">
    <div class="detail-panel-header-main">
      <div class="flex justify-between items-center w-full">
        <h3 class="detail-panel-title">{{ panelTitle }}</h3>
        <div class="detail-panel-actions flex gap-2 flex-wrap justify-end ml-4">
          <Button 
            v-if="!isEditing" 
            @click="toggleEditMode" 
            size="sm" 
            variant="outline"
            title="编辑"
          >
            <i class="fa fa-pencil mr-2"></i>编辑
          </Button>
          <Button 
            v-if="isEditing" 
            @click="toggleEditMode" 
            size="sm" 
            variant="primary"
            title="保存"
          >
            <i class="fa fa-save mr-2"></i>保存
          </Button>
          <Button 
            v-if="isEditing" 
            @click="cancelEdit" 
            size="sm" 
            variant="outline"
            title="取消"
          >
            <i class="fa fa-times mr-2"></i>取消
          </Button>
          <Button 
            v-if="!isEditing && showAddChapterButton" 
            @click="showAddChapterModal = true" 
            size="sm" 
            variant="outline"
            title="添加章节"
          >
            <i class="fa fa-plus mr-2"></i>章节
          </Button>
          <Button 
            v-if="!isEditing && showAddLessonButton" 
            @click="showAddLessonModal = true" 
            size="sm" 
            variant="outline"
            title="添加小节"
          >
            <i class="fa fa-plus mr-2"></i>小节
          </Button>
          <Button 
            v-if="!isEditing" 
            @click="showDeleteConfirm = true" 
            size="sm" 
            variant="outline"
            class="delete-button"
            title="删除"
          >
            <i class="fa fa-trash mr-2"></i>删除
          </Button>
        </div>
      </div>
    </div>
    
    <div class="detail-panel-body">
      <template v-if="loading">
        <div class="loading-container flex-1 flex items-center justify-center">
          <i class="fa fa-spinner fa-spin"></i>
          <span class="ml-2">加载中...</span>
        </div>
      </template>
      
      <template v-else-if="!nodeData">
        <div class="empty-container flex-1 flex items-center justify-center">
          <i class="fa fa-info-circle empty-icon"></i>
          <p>请选择一个节点查看详情</p>
        </div>
      </template>
      
      <template v-else>
        <div class="detail-panel-content-wrapper">
          <div class="detail-panel-header">
            <div class="detail-panel-title-inner">
              <i class="fa fa-info-circle mr-2"></i>详细信息
            </div>
          </div>
          
          <div class="detail-panel-content">
            <!-- 详细信息内容 -->
            <div class="detail-tab-content h-full">
              <!-- 课程详情 -->
              <div v-if="nodeType === 'course'" class="course-detail-container">
                <div v-if="isEditing" class="course-form">
                  <Form :model="formData">
                    <FormGroup label="课程标题">
                      <input
                        v-model="formData.title"
                        type="text"
                        class="form-input"
                        placeholder="请输入课程标题"
                      />
                    </FormGroup>
                    
                    <FormGroup label="课程描述">
                      <Textarea
                        v-model="formData.description"
                        placeholder="请输入课程描述"
                        rows="4"
                      />
                    </FormGroup>
                    
                    <FormGroup label="课程内容">
                      <MarkdownEditor
                        v-model="formData.content"
                        height="300px"
                        :toolbars="['bold', 'underline', 'italic', '-', 'title', 'quote', 'unorderedList', 'orderedList', '-', 'codeRow', 'code', 'link', 'image', 'table', 'mermaid', 'katex', '-', 'preview', 'save', 'fullscreen']"
                        placeholder="请输入课程内容"
                      />
                    </FormGroup>
                    
                    <FormGroup label="价格">
                      <input
                        v-model.number="formData.price"
                        type="number"
                        min="0"
                        step="0.01"
                        class="form-input"
                        placeholder="请输入课程价格"
                      />
                    </FormGroup>
                    
                    <FormGroup label="付费类型">
                      <Select
                        v-model="formData.pricingType"
                        :options="[
                          { value: 'free', label: '免费' },
                          { value: 'paid', label: '付费' }
                        ]"
                      />
                    </FormGroup>
                    
                    <FormGroup label="课程状态">
                      <Select
                        v-model="formData.status"
                        :options="[
                          { value: 'draft', label: '草稿' },
                          { value: 'published', label: '已发布' }
                        ]"
                      />
                    </FormGroup>
                    
                    <FormGroup label="课程封面">
                      <MultiImageUpload
                        v-model="formData.cover"
                        :max="1"
                        accept="image/*"
                      />
                    </FormGroup>
                  </Form>
                </div>
                <div v-else class="course-detail">
                  <div class="detail-list">
                    <div class="detail-row">
                      <div class="detail-label">课程标题</div>
                      <div class="detail-value">{{ nodeData.title }}</div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-label">课程描述</div>
                      <div class="detail-value description">{{ nodeData.description }}</div>
                    </div>
                    
                    <div v-if="nodeData.content" class="detail-row">
                      <div class="detail-label">课程内容</div>
                      <div class="detail-value content-preview">
                        <MarkdownEditor
                          v-model="safeContent"
                          preview-only
                        />
                      </div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-label">付费类型</div>
                      <div class="detail-value">
                        <span :class="`pricing-badge ${nodeData.pricingType === 'free' ? 'pricing-free' : 'pricing-paid'}`">
                          {{ nodeData.pricingType === 'free' ? '免费' : '付费' }}
                        </span>
                      </div>
                    </div>
                    
                    <div v-if="nodeData.pricingType === 'paid'" class="detail-row">
                      <div class="detail-label">价格</div>
                      <div class="detail-value">{{ nodeData.price || 0 }} 元</div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-label">课程状态</div>
                      <div class="detail-value">
                        <span :class="`status-badge ${nodeData.status === 'published' ? 'status-published' : 'status-draft'}`">
                          {{ nodeData.status === 'published' ? '已发布' : '草稿' }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-label">课程封面</div>
                      <div class="detail-value">
                        <img v-if="nodeData.cover" :src="nodeData.cover" class="course-cover" alt="课程封面" />
                        <div v-else class="no-cover">暂无封面</div>
                      </div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-label">创建时间</div>
                      <div class="detail-value">{{ new Date(nodeData.createdAt).toLocaleString() }}</div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-label">更新时间</div>
                      <div class="detail-value">{{ new Date(nodeData.updatedAt).toLocaleString() }}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 章节详情 -->
              <div v-else-if="nodeType === 'chapter'" class="chapter-detail-container">
                <!-- 章节编辑表单 -->
                <div v-if="isEditing" class="chapter-form">
                  <Form :model="formData">
                    <FormGroup label="章节标题">
                      <input
                        v-model="formData.title"
                        type="text"
                        class="form-input"
                        placeholder="请输入章节标题"
                      />
                    </FormGroup>
                    
                    <FormGroup label="章节描述">
                      <Textarea
                        v-model="formData.description"
                        placeholder="请输入章节描述"
                        rows="4"
                      />
                    </FormGroup>
                    
                    <FormGroup label="章节状态">
                      <Select
                        v-model="formData.status"
                        :options="[
                          { value: 'draft', label: '草稿' },
                          { value: 'published', label: '已发布' }
                        ]"
                      />
                    </FormGroup>
                    
                    <FormGroup label="排序">
                      <input
                        v-model.number="formData.order"
                        type="number"
                        min="0"
                        class="form-input"
                        placeholder="请输入排序值"
                      />
                    </FormGroup>
                  </Form>
                </div>
                
                <!-- 章节详情展示 -->
                <div v-else class="chapter-detail">
                  <div class="detail-list">
                    <div class="detail-row">
                      <div class="detail-label">章节标题</div>
                      <div class="detail-value">{{ nodeData.title }}</div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-label">章节描述</div>
                      <div class="detail-value description">{{ nodeData.description }}</div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-label">章节状态</div>
                      <div class="detail-value">
                        <span :class="`status-badge ${nodeData.status === 'published' ? 'status-published' : 'status-draft'}`">
                          {{ nodeData.status === 'published' ? '已发布' : '草稿' }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-label">排序</div>
                      <div class="detail-value">{{ nodeData.order }}</div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-label">小节数量</div>
                      <div class="detail-value">{{ nodeData.lessons ? nodeData.lessons.length : 0 }}</div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-label">创建时间</div>
                      <div class="detail-value">{{ new Date(nodeData.createdAt).toLocaleString() }}</div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-label">更新时间</div>
                      <div class="detail-value">{{ new Date(nodeData.updatedAt).toLocaleString() }}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 小节详情 -->
              <div v-else-if="nodeType === 'lesson'" class="lesson-detail-container">
                <!-- 小节编辑表单 -->
                <div v-if="isEditing" class="lesson-form">
                  <Form :model="formData">
                    <FormGroup label="小节标题">
                      <input
                        v-model="formData.title"
                        type="text"
                        class="form-input"
                        placeholder="请输入小节标题"
                      />
                    </FormGroup>
                    
                    <FormGroup label="小节类型">
                      <Select
                        v-model="formData.type"
                        :options="[
                          { value: 'video', label: '视频' },
                          { value: 'text', label: '文本' },
                          { value: 'quiz', label: '测验' }
                        ]"
                      />
                    </FormGroup>
                    
                    <FormGroup label="小节状态">
                      <Select
                        v-model="formData.status"
                        :options="[
                          { value: 'draft', label: '草稿' },
                          { value: 'published', label: '已发布' }
                        ]"
                      />
                    </FormGroup>
                    
                    <FormGroup label="时长(分钟)" v-if="formData.type === 'video'">
                      <input
                        v-model.number="formData.duration"
                        type="number"
                        min="0"
                        class="form-input"
                        placeholder="请输入视频时长"
                      />
                    </FormGroup>
                    
                    <FormGroup label="视频地址" v-if="formData.type === 'video'">
                      <input
                        v-model="formData.videoUrl"
                        type="text"
                        class="form-input"
                        placeholder="请输入视频URL地址"
                      />
                    </FormGroup>
                    
                    <FormGroup label="排序">
                      <input
                        v-model.number="formData.order"
                        type="number"
                        min="0"
                        class="form-input"
                        placeholder="请输入排序值"
                      />
                    </FormGroup>
                    
                    <FormGroup label="是否可试看">
                      <div class="flex items-center">
                        <input
                          type="checkbox"
                          id="free-preview-checkbox"
                          v-model="formData.isFreePreview"
                          class="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <label for="free-preview-checkbox" class="ml-2 text-gray-700 dark:text-gray-300">允许未购买课程的用户试看此小节</label>
                      </div>
                    </FormGroup>
                    
                    <FormGroup label="内容">
                      <MarkdownEditor
                        v-model="formData.content"
                        height="300px"
                        :toolbars="['bold', 'underline', 'italic', '-', 'title', 'quote', 'unorderedList', 'orderedList', '-', 'codeRow', 'code', 'link', 'image', 'table', 'mermaid', 'katex', '-', 'preview', 'save', 'fullscreen']"
                      />
                    </FormGroup>
                  </Form>
                </div>
                
                <!-- 小节详情展示 -->
                <div v-else class="lesson-detail">
                  <div class="detail-list">
                    <div class="detail-row">
                      <div class="detail-label">小节标题</div>
                      <div class="detail-value">{{ nodeData.title }}</div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-label">小节类型</div>
                      <div class="detail-value">
                        <span class="lesson-type-badge" :class="`type-${nodeData.type}`">
                          {{ 
                            nodeData.type === 'video' ? '视频' : 
                            nodeData.type === 'text' ? '文本' : 
                            nodeData.type === 'quiz' ? '测验' : '未知'
                          }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-label">小节状态</div>
                      <div class="detail-value">
                        <span :class="`status-badge ${nodeData.status === 'published' ? 'status-published' : 'status-draft'}`">
                          {{ nodeData.status === 'published' ? '已发布' : '草稿' }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="detail-row" v-if="nodeData.type === 'video'">
                      <div class="detail-label">视频时长</div>
                      <div class="detail-value">{{ nodeData.duration }} 分钟</div>
                    </div>
                    
                    <div class="detail-row" v-if="nodeData.type === 'video' && nodeData.videoUrl">
                      <div class="detail-label">视频地址</div>
                      <div class="detail-value">
                        <a :href="nodeData.videoUrl" target="_blank" class="video-url">{{ nodeData.videoUrl }}</a>
                      </div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-label">排序</div>
                      <div class="detail-value">{{ nodeData.order }}</div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-label">试看状态</div>
                      <div class="detail-value">
                        <span :class="`preview-badge ${nodeData.isFreePreview ? 'preview-enabled' : 'preview-disabled'}`">
                          {{ nodeData.isFreePreview ? '允许试看' : '不可试看' }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-label">创建时间</div>
                      <div class="detail-value">{{ new Date(nodeData.createdAt).toLocaleString() }}</div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-label">更新时间</div>
                      <div class="detail-value">{{ new Date(nodeData.updatedAt).toLocaleString() }}</div>
                    </div>
                    
                    <div v-if="nodeData.content" class="detail-row">
                      <div class="detail-label">内容</div>
                      <div class="detail-value content-preview">
                        <MarkdownEditor
                          v-model="safeContent"
                          preview-only
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    
    <!-- 删除确认对话框 -->
    <Modal
      v-model:show="showDeleteConfirm"
      title="确认删除"
      @confirm="confirmDelete"
    >
      <div class="delete-confirm-content">
        <i class="fa fa-exclamation-triangle warning-icon"></i>
        <p>确定要删除{{ 
          nodeType === 'course' ? '课程' : 
          nodeType === 'chapter' ? '章节' : 
          nodeType === 'lesson' ? '小节' : '内容'
        }} "{{ nodeData?.title }}" 吗？</p>
        <p class="delete-warning">此操作不可恢复！</p>
      </div>
    </Modal>
    
    <!-- 添加章节对话框 -->
    <Modal
      v-model:show="showAddChapterModal"
      title="添加章节"
      @confirm="addChapter"
    >
      <div class="add-chapter-form">
        <div class="form-group">
          <label for="chapter-title" class="form-label">章节标题</label>
          <input
            id="chapter-title"
            v-model="newChapterData.title"
            type="text"
            class="form-input"
            placeholder="请输入章节标题"
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
        
        <div class="form-group">
          <label for="chapter-order" class="form-label">排序</label>
          <input
            id="chapter-order"
            v-model.number="newChapterData.order"
            type="number"
            min="0"
            class="form-input"
            placeholder="请输入排序值"
          />
        </div>
        
        <div class="form-group">
          <label for="chapter-status" class="form-label">状态</label>
          <select
            id="chapter-status"
            v-model="newChapterData.status"
            class="form-select"
          >
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
          </select>
        </div>
      </div>
    </Modal>
    
    <!-- 添加小节对话框 -->
    <Modal
      v-model:show="showAddLessonModal"
      title="添加小节"
      @confirm="addLesson"
    >
      <div class="add-lesson-form">
        <div class="form-group">
          <label for="lesson-title" class="form-label">小节标题</label>
          <input
            id="lesson-title"
            v-model="newLessonData.title"
            type="text"
            class="form-input"
            placeholder="请输入小节标题"
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
        
        <div class="form-group" v-if="newLessonData.type === 'video'">
          <label for="lesson-duration" class="form-label">视频时长(分钟)</label>
          <input
            id="lesson-duration"
            v-model.number="newLessonData.duration"
            type="number"
            min="0"
            class="form-input"
            placeholder="请输入视频时长"
          />
        </div>
        
        <div class="form-group" v-if="newLessonData.type === 'video'">
          <label for="lesson-video-url" class="form-label">视频地址</label>
          <input
            id="lesson-video-url"
            v-model="newLessonData.videoUrl"
            type="text"
            class="form-input"
            placeholder="请输入视频URL地址"
          />
        </div>
        
        <div class="form-group">
          <label for="lesson-order" class="form-label">排序</label>
          <input
            id="lesson-order"
            v-model.number="newLessonData.order"
            type="number"
            min="0"
            class="form-input"
            placeholder="请输入排序值"
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
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.detail-panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 0.5rem;
  overflow: hidden;
}

.detail-panel-header-main {
  display: flex;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.detail-panel-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50%;
}

.detail-panel-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.detail-panel-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.detail-panel-content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.detail-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem 0;
  margin-bottom: 1rem;
}

.detail-panel-title-inner {
  display: flex;
  align-items: center;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50%;
}

.detail-panel-content {
  flex: 1;
  overflow: auto;
  padding: 0 1.5rem 1.5rem;
}

.detail-tab-content {
  min-height: calc(100% - 4rem);
  overflow-y: visible;
  padding-bottom: 1rem;
}

/* 针对不同类型表单的容器样式优化 */
.course-form,
.chapter-form,
.lesson-form,
.lesson-content-editor {
  padding-bottom: 2rem;
}

/* 暗色模式适配 */
:root.dark .detail-panel-container {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2);
}

:root.dark .detail-panel-header-main {
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  color: var(--color-text-secondary);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

.detail-list {
  display: flex;
  flex-direction: column;
}

.detail-row {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 0.95rem;
}

.detail-value.description {
  white-space: pre-wrap;
  line-height: 1.5;
  margin-top: 0.25rem;
}

.course-cover {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.no-cover {
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  color: var(--color-text-secondary);
}

.lesson-type-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.type-video {
  color: var(--color-primary-600, #4f46e5);
}

.type-text {
  color: var(--color-secondary-600, #0891b2);
}

.type-quiz {
  color: var(--color-success, #059669);
}

.video-url {
  color: var(--color-primary, #4f46e5);
  text-decoration: underline;
  word-break: break-all;
}

.video-url:hover {
  color: var(--color-primary-600, #4338ca);
}

.delete-button {
  color: var(--color-danger, #dc2626);
}

.delete-confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
}

.warning-icon {
  font-size: 3rem;
  color: var(--color-warning, #f59e0b);
  margin-bottom: 1rem;
}

.delete-warning {
  color: var(--color-danger, #dc2626);
  font-weight: 500;
  margin-top: 0.5rem;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--color-text-secondary);
  height: 100%;
  text-align: center;
}

.settings-container {
  padding: 1rem 0;
}

.settings-section {
  margin-bottom: 2rem;
}

.settings-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.settings-description {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .detail-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .detail-item:nth-child(1),
  .detail-item:nth-child(2) {
    grid-column: span 2;
  }
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-draft {
  background-color: rgba(251, 146, 60, 0.15);
  color: #f97316; /* 橙色 */
}

.status-published {
  background-color: rgba(34, 197, 94, 0.15);
  color: #10b981; /* 绿色 */
}

.pricing-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.pricing-free {
  background-color: rgba(59, 130, 246, 0.15);
  color: #3b82f6; /* 蓝色 */
}

.pricing-paid {
  background-color: rgba(245, 158, 11, 0.15);
  color: #f59e0b; /* 黄色 */
}

.preview-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.preview-enabled {
  background-color: rgba(16, 185, 129, 0.15);
  color: #10b981; /* 绿色 */
}

.preview-disabled {
  background-color: rgba(107, 114, 128, 0.15);
  color: #6b7280; /* 灰色 */
}
</style> 