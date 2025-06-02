<script setup>
import { computed, ref, watch } from 'vue';
import { Form, FormGroup, Select, Textarea } from './form';
import Button from './Button.vue';
import Card from './Card.vue';
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
  }
});

const emit = defineEmits([
  'save',
  'delete',
  'create-chapter',
  'create-lesson'
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
  description: ''
});
// 新小节表单数据
const newLessonData = ref({
  title: '',
  content: '',
  duration: 0,
  type: 'video'
});

// 监听节点数据变化，重置表单数据
watch(() => props.nodeData, (newVal) => {
  if (newVal) {
    formData.value = { ...newVal };
    isEditing.value = false;
  } else {
    formData.value = {};
    isEditing.value = false;
  }
}, { immediate: true, deep: true });

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

// 切换编辑模式
const toggleEditMode = () => {
  if (isEditing.value) {
    // 保存编辑
    emit('save', props.nodeType, formData.value);
  }
  isEditing.value = !isEditing.value;
};

// 取消编辑
const cancelEdit = () => {
  formData.value = { ...props.nodeData };
  isEditing.value = false;
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
    description: ''
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
    type: 'video'
  };
};
</script>

<template>
  <Card :title="panelTitle">
    <template v-if="loading">
      <div class="loading-container">
        <i class="fa fa-spinner fa-spin"></i>
        <span class="ml-2">加载中...</span>
      </div>
    </template>
    
    <template v-else-if="!nodeData">
      <div class="empty-container">
        <i class="fa fa-info-circle"></i>
        <span class="ml-2">请选择一个节点查看详情</span>
      </div>
    </template>
    
    <template v-else>
      <div class="detail-panel">
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
            <div class="detail-item">
              <div class="detail-label">课程标题</div>
              <div class="detail-value">{{ nodeData.title }}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">课程描述</div>
              <div class="detail-value">{{ nodeData.description }}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">课程状态</div>
              <div class="detail-value">
                <span :class="`status-badge ${nodeData.status === 'published' ? 'status-published' : 'status-draft'}`">
                  {{ nodeData.status === 'published' ? '已发布' : '草稿' }}
                </span>
              </div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">课程封面</div>
              <div class="detail-value">
                <img v-if="nodeData.cover" :src="nodeData.cover" class="course-cover" alt="课程封面" />
              </div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">创建时间</div>
              <div class="detail-value">{{ new Date(nodeData.createdAt).toLocaleString() }}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">更新时间</div>
              <div class="detail-value">{{ new Date(nodeData.updatedAt).toLocaleString() }}</div>
            </div>
          </div>
        </div>
        
        <!-- 章节详情 -->
        <div v-else-if="nodeType === 'chapter'" class="chapter-detail-container">
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
              
              <FormGroup label="排序">
                <input
                  v-model.number="formData.order"
                  type="number"
                  class="form-input"
                  min="1"
                />
              </FormGroup>
            </Form>
          </div>
          <div v-else class="chapter-detail">
            <div class="detail-item">
              <div class="detail-label">章节标题</div>
              <div class="detail-value">{{ nodeData.title }}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">章节描述</div>
              <div class="detail-value">{{ nodeData.description }}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">排序</div>
              <div class="detail-value">{{ nodeData.order }}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">创建时间</div>
              <div class="detail-value">{{ new Date(nodeData.createdAt).toLocaleString() }}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">更新时间</div>
              <div class="detail-value">{{ new Date(nodeData.updatedAt).toLocaleString() }}</div>
            </div>
          </div>
        </div>
        
        <!-- 小节详情 -->
        <div v-else-if="nodeType === 'lesson'" class="lesson-detail-container">
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
              
              <FormGroup label="小节内容">
                <MarkdownEditor
                  v-model="formData.content"
                  height="300px"
                />
              </FormGroup>
              
              <FormGroup label="时长(分钟)">
                <input
                  v-model.number="formData.duration"
                  type="number"
                  class="form-input"
                  min="0"
                />
              </FormGroup>
              
              <FormGroup label="类型">
                <Select
                  v-model="formData.type"
                  :options="[
                    { value: 'video', label: '视频' },
                    { value: 'text', label: '文本' },
                    { value: 'quiz', label: '测验' }
                  ]"
                />
              </FormGroup>
              
              <FormGroup label="排序">
                <input
                  v-model.number="formData.order"
                  type="number"
                  class="form-input"
                  min="1"
                />
              </FormGroup>
            </Form>
          </div>
          <div v-else class="lesson-detail">
            <div class="detail-item">
              <div class="detail-label">小节标题</div>
              <div class="detail-value">{{ nodeData.title }}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">小节类型</div>
              <div class="detail-value">
                <span :class="`type-badge type-${nodeData.type}`">
                  {{ nodeData.type === 'video' ? '视频' : 
                     nodeData.type === 'text' ? '文本' : '测验' }}
                </span>
              </div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">时长</div>
              <div class="detail-value">{{ nodeData.duration }} 分钟</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">排序</div>
              <div class="detail-value">{{ nodeData.order }}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">内容预览</div>
              <div class="detail-value content-preview">
                {{ nodeData.content?.substring(0, 200) }}
                {{ nodeData.content?.length > 200 ? '...' : '' }}
              </div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">创建时间</div>
              <div class="detail-value">{{ new Date(nodeData.createdAt).toLocaleString() }}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">更新时间</div>
              <div class="detail-value">{{ new Date(nodeData.updatedAt).toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <Button
          :variant="isEditing ? 'success' : 'primary'"
          @click="toggleEditMode"
        >
          {{ isEditing ? '保存' : '编辑' }}
        </Button>
        
        <Button
          v-if="isEditing"
          variant="outline"
          @click="cancelEdit"
        >
          取消
        </Button>
        
        <Button
          v-if="!isEditing"
          variant="danger"
          @click="showDeleteConfirm = true"
        >
          删除
        </Button>
        
        <Button
          v-if="!isEditing && showAddChapterButton"
          variant="secondary"
          @click="showAddChapterModal = true"
        >
          添加章节
        </Button>
        
        <Button
          v-if="!isEditing && showAddLessonButton"
          variant="secondary"
          @click="showAddLessonModal = true"
        >
          添加小节
        </Button>
      </div>
    </template>
    
    <!-- 删除确认对话框 -->
    <Modal
      v-model:show="showDeleteConfirm"
      title="确认删除"
      @confirm="confirmDelete"
    >
      <p>确定要删除{{ nodeType === 'course' ? '课程' : nodeType === 'chapter' ? '章节' : '小节' }} "{{ nodeData?.title }}" 吗？</p>
      <p class="text-danger">此操作不可逆，请谨慎操作！</p>
    </Modal>
    
    <!-- 添加章节对话框 -->
    <Modal
      v-model:show="showAddChapterModal"
      title="添加章节"
      @confirm="addChapter"
    >
      <Form :model="newChapterData">
        <FormGroup label="章节标题">
          <input
            v-model="newChapterData.title"
            type="text"
            class="form-input"
            placeholder="请输入章节标题"
            required
          />
        </FormGroup>
        
        <FormGroup label="章节描述">
          <Textarea
            v-model="newChapterData.description"
            placeholder="请输入章节描述"
            rows="4"
          />
        </FormGroup>
      </Form>
    </Modal>
    
    <!-- 添加小节对话框 -->
    <Modal
      v-model:show="showAddLessonModal"
      title="添加小节"
      @confirm="addLesson"
    >
      <Form :model="newLessonData">
        <FormGroup label="小节标题">
          <input
            v-model="newLessonData.title"
            type="text"
            class="form-input"
            placeholder="请输入小节标题"
            required
          />
        </FormGroup>
        
        <FormGroup label="小节内容">
          <Textarea
            v-model="newLessonData.content"
            placeholder="请输入小节内容"
            rows="4"
          />
        </FormGroup>
        
        <FormGroup label="时长(分钟)">
          <input
            v-model.number="newLessonData.duration"
            type="number"
            class="form-input"
            min="0"
          />
        </FormGroup>
        
        <FormGroup label="类型">
          <Select
            v-model="newLessonData.type"
            :options="[
              { value: 'video', label: '视频' },
              { value: 'text', label: '文本' },
              { value: 'quiz', label: '测验' }
            ]"
          />
        </FormGroup>
      </Form>
    </Modal>
  </Card>
</template>

<style scoped>
.detail-panel {
  padding: 1rem 0;
  overflow-y: auto;
  height: 100%;
}

.loading-container,
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.detail-item {
  margin-bottom: 1rem;
}

.detail-label {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--color-text-secondary);
}

.detail-value {
  color: var(--color-text-primary);
}

.course-cover {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
}

.no-cover {
  color: var(--color-text-secondary);
  font-style: italic;
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

.type-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.type-video {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}

.type-text {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}

.type-quiz {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
}

.content-preview {
  white-space: pre-line;
  font-family: monospace;
  padding: 0.5rem;
  background-color: var(--color-bg-tertiary);
  border-radius: 4px;
  max-height: 200px;
  overflow: auto;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: flex-end;
  position: sticky;
  bottom: 0;
  background-color: var(--color-bg-secondary);
  padding: 0.5rem 0;
  z-index: 1;
}
</style> 