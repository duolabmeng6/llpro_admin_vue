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
  description: '',
  videoUrl: '',
  content: '',
  type: 'video'
});
// 新小节表单数据
const newLessonData = ref({
  title: '',
  content: '',
  duration: 0,
  type: 'video',
  videoUrl: ''
});
// 当前激活的选项卡
const activeTab = ref('info');

// 监听节点数据变化，重置表单数据
watch(() => props.nodeData, (newVal) => {
  if (newVal) {
    formData.value = { ...newVal };
    isEditing.value = false;
    activeTab.value = 'info'; // 重置为基本信息选项卡
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
    description: '',
    videoUrl: '',
    content: '',
    type: 'video'
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
    videoUrl: ''
  };
};
</script>

<template>
  <Card :title="panelTitle" class="h-full flex flex-col">
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
      <div class="detail-panel h-full flex flex-col">
        <div class="detail-panel-header">
          <div class="detail-panel-tabs">
            <div 
              class="detail-panel-tab" 
              :class="{ 'active': activeTab === 'info' }"
              @click="activeTab = 'info'"
            >
              <i class="fa fa-info-circle mr-2"></i>基本信息
            </div>
            <div 
              v-if="nodeType === 'lesson'"
              class="detail-panel-tab" 
              :class="{ 'active': activeTab === 'content' }"
              @click="activeTab = 'content'"
            >
              <i class="fa fa-file-text mr-2"></i>内容
            </div>
            <div 
              class="detail-panel-tab" 
              :class="{ 'active': activeTab === 'settings' }"
              @click="activeTab = 'settings'"
            >
              <i class="fa fa-cog mr-2"></i>设置
            </div>
          </div>
          
          <div class="detail-panel-actions">
            <Button 
              v-if="!isEditing" 
              @click="toggleEditMode" 
              size="sm" 
              variant="outline"
              title="编辑"
            >
              <i class="fa fa-pencil"></i>
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
              <i class="fa fa-trash"></i>
            </Button>
          </div>
        </div>
        
        <div class="detail-panel-content flex-1 overflow-auto">
          <!-- 基本信息选项卡 -->
          <div v-show="activeTab === 'info'" class="detail-tab-content h-full">
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
                <div class="detail-grid">
                  <div class="detail-item">
                    <div class="detail-label">课程标题</div>
                    <div class="detail-value">{{ nodeData.title }}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">课程描述</div>
                    <div class="detail-value description">{{ nodeData.description }}</div>
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
                      <div v-else class="no-cover">暂无封面</div>
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
                  
                  <FormGroup label="章节类型">
                    <Select
                      v-model="formData.type"
                      :options="[
                        { value: 'video', label: '视频' },
                        { value: 'text', label: '文本' }
                      ]"
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
                  
                  <FormGroup label="章节内容" v-if="formData.type === 'text'">
                    <Textarea
                      v-model="formData.content"
                      placeholder="请输入章节内容"
                      rows="6"
                    />
                  </FormGroup>
                </Form>
              </div>
              
              <!-- 章节详情展示 -->
              <div v-else class="chapter-detail">
                <div class="detail-grid">
                  <div class="detail-item">
                    <div class="detail-label">章节标题</div>
                    <div class="detail-value">{{ nodeData.title }}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">章节描述</div>
                    <div class="detail-value description">{{ nodeData.description }}</div>
                  </div>
                  
                  <div class="detail-item" v-if="nodeData.type">
                    <div class="detail-label">章节类型</div>
                    <div class="detail-value">
                      <span class="lesson-type-badge" :class="`type-${nodeData.type}`">
                        {{ nodeData.type === 'video' ? '视频' : nodeData.type === 'text' ? '文本' : '未知' }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="detail-item" v-if="nodeData.type === 'video' && nodeData.videoUrl">
                    <div class="detail-label">视频地址</div>
                    <div class="detail-value">
                      <a :href="nodeData.videoUrl" target="_blank" class="video-url">{{ nodeData.videoUrl }}</a>
                    </div>
                  </div>
                  
                  <div class="detail-item" v-if="nodeData.type === 'text' && nodeData.content">
                    <div class="detail-label">章节内容</div>
                    <div class="detail-value description">{{ nodeData.content }}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">小节数量</div>
                    <div class="detail-value">{{ nodeData.lessons ? nodeData.lessons.length : 0 }}</div>
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
                </Form>
              </div>
              
              <!-- 小节详情展示 -->
              <div v-else class="lesson-detail">
                <div class="detail-grid">
                  <div class="detail-item">
                    <div class="detail-label">小节标题</div>
                    <div class="detail-value">{{ nodeData.title }}</div>
                  </div>
                  
                  <div class="detail-item">
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
                  
                  <div class="detail-item" v-if="nodeData.type === 'video'">
                    <div class="detail-label">视频时长</div>
                    <div class="detail-value">{{ nodeData.duration }} 分钟</div>
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
          </div>
          
          <!-- 内容选项卡 -->
          <div v-show="activeTab === 'content'" class="detail-tab-content h-full">
            <div v-if="isEditing" class="lesson-content-editor">
              <MarkdownEditor
                v-model="formData.content"
                height="400px"
                :toolbars="{ 
                  preview: true,
                  upload: true,
                  katex: true,
                  mermaid: true
                }"
              />
            </div>
            <div v-else class="lesson-content-preview">
              <div v-if="nodeData.content" class="content-preview">
                <MarkdownEditor
                  v-model="nodeData.content"
                  preview-only
                />
              </div>
              <div v-else class="empty-content">
                <i class="fa fa-file-text-o empty-icon"></i>
                <p>暂无内容</p>
              </div>
            </div>
          </div>
          
          <!-- 设置选项卡 -->
          <div v-show="activeTab === 'settings'" class="detail-tab-content h-full">
            <div class="settings-container">
              <div class="settings-section">
                <h3 class="settings-title">高级设置</h3>
                <p class="settings-description">此处可以设置更多高级选项</p>
                
                <div class="settings-form">
                  <div class="form-group">
                    <label class="form-label">可见性</label>
                    <select class="form-select">
                      <option value="public">公开</option>
                      <option value="private">私有</option>
                      <option value="password">密码保护</option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">排序</label>
                    <input type="number" class="form-input" :value="nodeData.order || 0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    
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
          <label for="chapter-type" class="form-label">章节类型</label>
          <select
            id="chapter-type"
            v-model="newChapterData.type"
            class="form-select"
          >
            <option value="video">视频</option>
            <option value="text">文本</option>
          </select>
        </div>
        
        <div class="form-group" v-if="newChapterData.type === 'video'">
          <label for="chapter-video-url" class="form-label">视频地址</label>
          <input
            id="chapter-video-url"
            v-model="newChapterData.videoUrl"
            type="text"
            class="form-input"
            placeholder="请输入视频URL地址"
          />
        </div>
        
        <div class="form-group" v-if="newChapterData.type === 'text'">
          <label for="chapter-content" class="form-label">章节内容</label>
          <textarea
            id="chapter-content"
            v-model="newChapterData.content"
            class="form-textarea"
            placeholder="请输入章节内容"
            rows="6"
          ></textarea>
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
      </div>
    </Modal>
  </Card>
</template>

<style scoped>
.detail-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1rem;
}

.detail-panel-tabs {
  display: flex;
  gap: 0.5rem;
}

.detail-panel-tab {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  color: var(--color-text-secondary);
}

.detail-panel-tab:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.detail-panel-tab.active {
  background-color: var(--modern-accent-color, rgba(0, 120, 215, 0.15));
  color: var(--color-text-primary);
  font-weight: 500;
}

.detail-panel-actions {
  display: flex;
  gap: 0.5rem;
}

.detail-panel-content {
  flex: 1;
  overflow: auto;
}

.detail-tab-content {
  height: 100%;
  overflow-y: auto;
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

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.detail-value {
  font-size: 0.95rem;
}

.detail-value.description {
  white-space: pre-wrap;
  line-height: 1.5;
}

.course-cover {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.no-cover {
  padding: 1rem;
  background-color: var(--color-bg-tertiary);
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
  background-color: var(--color-primary-100, rgba(79, 70, 229, 0.1));
  color: var(--color-primary-600, #4f46e5);
}

.type-text {
  background-color: var(--color-secondary-100, rgba(8, 145, 178, 0.1));
  color: var(--color-secondary-600, #0891b2);
}

.type-quiz {
  background-color: var(--color-success-bg, rgba(5, 150, 105, 0.1));
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
</style> 