<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  // 当前页码
  currentPage: {
    type: Number,
    required: true
  },
  // 总页数
  totalPages: {
    type: Number,
    required: true
  },
  // 显示的页码按钮数量
  pageRange: {
    type: Number,
    default: 5
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 当前每页显示数量
  pageSize: {
    type: Number,
    default: 10
  },
  // 总记录数
  totalItems: {
    type: Number,
    default: 0
  },
  // 是否显示每页显示数量选择器
  showPageSizeSelector: {
    type: Boolean,
    default: false
  },
  // 每页显示数量选项
  pageSizeOptions: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  // 是否显示快速跳转
  showQuickJumper: {
    type: Boolean,
    default: false
  },
  // 是否显示详细的分页信息
  showDetailedInfo: {
    type: Boolean,
    default: false
  },
  // 是否使用精简版UI
  compact: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:currentPage', 'update:pageSize']);

// 页码改变事件处理
const handlePageChange = (page) => {
  if (props.disabled || page === props.currentPage) return;
  if (page < 1 || page > props.totalPages) return;
  
  emit('update:currentPage', page);
};

// 计算需要显示的页码
const pagesArray = computed(() => {
  if (props.totalPages <= 1) return [];
  
  // 计算开始和结束页码
  let startPage = Math.max(1, props.currentPage - Math.floor(props.pageRange / 2));
  let endPage = Math.min(props.totalPages, startPage + props.pageRange - 1);
  
  // 调整开始页码，确保显示足够的页码
  if (endPage - startPage + 1 < props.pageRange) {
    startPage = Math.max(1, endPage - props.pageRange + 1);
  }
  
  // 生成页码数组
  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
});

// 是否显示省略号
const showLeftEllipsis = computed(() => {
  return props.totalPages > props.pageRange && props.currentPage > Math.ceil(props.pageRange / 2);
});

const showRightEllipsis = computed(() => {
  return props.totalPages > props.pageRange && 
         props.currentPage < props.totalPages - Math.floor(props.pageRange / 2);
});

// 页码格式化显示
const formatPageInfo = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize + 1;
  const end = Math.min(props.currentPage * props.pageSize, props.totalItems);
  return `${start}-${end} / ${props.totalItems}`;
});

// 详细的分页信息
const detailedPageInfo = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize + 1;
  const end = Math.min(props.currentPage * props.pageSize, props.totalItems);
  return {
    start,
    end,
    total: props.totalItems,
    currentPage: props.currentPage,
    totalPages: props.totalPages,
    pageSize: props.pageSize
  };
});

// 跳转页码
const jumpPage = ref('');

// 处理页码跳转
const handleJumpPage = () => {
  const page = parseInt(jumpPage.value);
  if (isNaN(page)) {
    jumpPage.value = '';
    return;
  }
  
  // 限制页码范围
  const targetPage = Math.max(1, Math.min(page, props.totalPages));
  handlePageChange(targetPage);
  jumpPage.value = '';
};

// 处理每页显示数量变更
const handlePageSizeChange = (size) => {
  if (props.disabled) return;
  emit('update:pageSize', size);
};
</script>

<template>
  <div class="pagination-container flex flex-col space-y-2" :class="{ 'pagination-compact': compact }">
    <!-- 普通模式 -->
    <template v-if="!compact">
      <!-- 分页信息和控制区 -->
      <div class="pagination-info-container">
        <div class="pagination-row flex flex-wrap justify-between items-center">
          <!-- 基础分页信息 -->
          <div v-if="totalItems > 0 && !showDetailedInfo" class="pagination-info text-xs text-gray-500 dark:text-gray-400">
            {{ formatPageInfo }}
          </div>
          
          <!-- 详细分页信息 -->
          <div v-if="totalItems > 0 && showDetailedInfo" class="pagination-detailed-info text-xs text-gray-500 dark:text-gray-400 flex items-center flex-wrap gap-2">
            <span>{{ detailedPageInfo.total }}条记录</span>
            <span class="pagination-divider"></span>
            <span>第{{ detailedPageInfo.currentPage }}/{{ detailedPageInfo.totalPages }}页</span>
          </div>
          
          <div v-else-if="totalItems === 0" class="pagination-info text-xs text-gray-500 dark:text-gray-400">
            暂无数据
          </div>
          
          <!-- 分页控制区 -->
          <div class="pagination-controls flex items-center space-x-2">
            <!-- 每页显示数量选择器 -->
            <div v-if="showPageSizeSelector" class="page-size-selector flex items-center">
              <select 
                class="page-size-select"
                :disabled="disabled"
                :value="pageSize"
                @change="handlePageSizeChange(parseInt($event.target.value))"
              >
                <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}条/页</option>
              </select>
            </div>
            
            <!-- 快速跳转 -->
            <div v-if="showQuickJumper && totalPages > 1" class="quick-jumper flex items-center quick-jump-container">
              <input 
                type="text" 
                class="jump-input"
                v-model="jumpPage"
                :disabled="disabled"
                @keyup.enter="handleJumpPage"
                placeholder="页码"
              />
              <button 
                class="jump-btn" 
                :disabled="disabled"
                @click="handleJumpPage"
                aria-label="跳转"
              >
                <i class="fa fa-arrow-right text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <!-- 精简模式 -->
    <template v-else>
      <div class="pagination-compact-container">
        <div class="pagination-compact-row flex justify-between items-center">
          <!-- 精简分页信息 -->
          <div v-if="totalItems > 0" class="pagination-compact-info text-xs text-gray-500 dark:text-gray-400">
            {{ detailedPageInfo.total }}条 {{ detailedPageInfo.currentPage }}/{{ detailedPageInfo.totalPages }}页
          </div>
          
          <div v-else class="pagination-compact-info text-xs text-gray-500 dark:text-gray-400">
            暂无数据
          </div>
          
          <!-- 精简控制区 -->
          <div v-if="showPageSizeSelector" class="pagination-compact-controls">
            <select 
              class="page-size-select-compact"
              :disabled="disabled"
              :value="pageSize"
              @change="handlePageSizeChange(parseInt($event.target.value))"
            >
              <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}条</option>
            </select>
          </div>
        </div>
      </div>
    </template>
    
    <!-- 分页按钮组 -->
    <div class="flex items-center justify-center space-x-1" v-if="totalPages > 1">
      <!-- 上一页按钮 -->
      <button 
        class="pagination-btn"
        :class="{ 'disabled': currentPage === 1 || disabled }"
        @click="handlePageChange(currentPage - 1)"
        :disabled="currentPage === 1 || disabled"
        aria-label="上一页"
      >
        <i class="fa fa-chevron-left text-xs"></i>
      </button>
      
      <!-- 第一页按钮 -->
      <button 
        v-if="showLeftEllipsis && !compact"
        class="pagination-btn" 
        :class="{ 'active': currentPage === 1, 'disabled': disabled }"
        @click="handlePageChange(1)"
        :disabled="disabled"
      >
        1
      </button>
      
      <!-- 左侧省略号 -->
      <span v-if="showLeftEllipsis && !compact" class="pagination-ellipsis">...</span>
      
      <!-- 页码按钮 -->
      <button 
        v-for="page in pagesArray" 
        :key="page"
        class="pagination-btn" 
        :class="{ 'active': currentPage === page, 'disabled': disabled }"
        @click="handlePageChange(page)"
        :disabled="disabled"
      >
        {{ page }}
      </button>
      
      <!-- 右侧省略号 -->
      <span v-if="showRightEllipsis && !compact" class="pagination-ellipsis">...</span>
      
      <!-- 最后一页按钮 -->
      <button 
        v-if="showRightEllipsis && totalPages > 1 && !compact"
        class="pagination-btn" 
        :class="{ 'active': currentPage === totalPages, 'disabled': disabled }"
        @click="handlePageChange(totalPages)"
        :disabled="disabled"
      >
        {{ totalPages }}
      </button>
      
      <!-- 下一页按钮 -->
      <button 
        class="pagination-btn"
        :class="{ 'disabled': currentPage === totalPages || disabled }"
        @click="handlePageChange(currentPage + 1)"
        :disabled="currentPage === totalPages || disabled"
        aria-label="下一页"
      >
        <i class="fa fa-chevron-right text-xs"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.pagination-container {
  width: 100%;
}

.pagination-info-container {
  padding: 0 0.5rem;
}

.pagination-row {
  width: 100%;
}

.pagination-info,
.pagination-detailed-info {
  margin-bottom: 0.5rem;
}

@media (min-width: 640px) {
  .pagination-info,
  .pagination-detailed-info {
    margin-bottom: 0;
  }
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.75rem;
  height: 1.75rem;
  padding: 0 0.25rem;
  font-size: 0.75rem;
  background-color: var(--color-bg-secondary, #f9fafb);
  color: var(--color-text-primary, #1f2937);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(.disabled):not(.active) {
  background-color: var(--color-bg-hover, #f3f4f6);
  border-color: var(--color-border-hover, #d1d5db);
}

.pagination-btn.active {
  background-color: var(--color-primary, #3b82f6);
  color: white;
  border-color: var(--color-primary, #3b82f6);
}

.pagination-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.75rem;
  height: 1.75rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary, #6b7280);
}

/* 新增控件样式 */
.page-size-select {
  height: 1.5rem;
  padding: 0 0.5rem;
  font-size: 0.75rem;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 0.25rem;
  background-color: var(--color-bg-secondary, #f9fafb);
  color: var(--color-text-primary, #1f2937);
  min-width: 4.5rem;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.25rem center;
  background-size: 1rem;
  padding-right: 1.5rem;
}

.page-size-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.jump-input {
  height: 1.5rem;
  width: 2.5rem;
  padding: 0 0.25rem;
  font-size: 0.75rem;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 0.25rem;
  background-color: var(--color-bg-secondary, #f9fafb);
  color: var(--color-text-primary, #1f2937);
  text-align: center;
  transition: all 0.2s ease;
}

.jump-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式调整 */
@media (max-width: 639px) {
  .pagination-controls {
    width: 100%;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }
}

/* 中等窄屏幕适配 (240px-300px) */
@media (max-width: 300px) and (min-width: 241px) {
  .pagination-info-container {
    padding: 0 0.25rem;
  }
  
  .pagination-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .pagination-controls {
    width: 100%;
    justify-content: space-between;
    margin-top: 0.25rem;
  }
  
  .pagination-detailed-info {
    font-size: 0.65rem;
    width: 100%;
    justify-content: center;
  }
  
  .pagination-btn {
    min-width: 1.5rem;
    height: 1.5rem;
    font-size: 0.7rem;
  }
  
  .pagination-ellipsis {
    min-width: 1.25rem;
  }
  
  .page-size-select {
    min-width: 3.5rem;
    padding: 0 0.25rem;
    font-size: 0.7rem;
    padding-right: 1.25rem;
    background-size: 0.8rem;
    height: 1.4rem;
  }
  
  .jump-input {
    width: 2rem;
    height: 1.4rem;
    font-size: 0.7rem;
    padding: 0 0.2rem;
  }
  
  .jump-btn {
    width: 1.5rem;
    height: 1.4rem;
  }
  
  .pagination-divider {
    height: 8px;
  }
}

/* 极窄屏幕适配 (小于240px) */
@media (max-width: 240px) {
  .pagination-info-container {
    padding: 0 0.25rem;
  }
  
  .pagination-row {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .pagination-controls {
    width: 100%;
    justify-content: center;
  }
  
  .pagination-detailed-info {
    font-size: 0.65rem;
    width: 100%;
    justify-content: center;
  }
  
  /* 隐藏快速跳转功能 */
  .quick-jump-container {
    display: none;
  }
  
  .pagination-btn {
    min-width: 1.4rem;
    height: 1.4rem;
    font-size: 0.65rem;
    padding: 0;
  }
  
  .pagination-ellipsis {
    min-width: 1rem;
    font-size: 0.65rem;
  }
  
  .page-size-select {
    min-width: 3.2rem;
    padding: 0 0.2rem;
    font-size: 0.65rem;
    padding-right: 1.1rem;
    background-size: 0.7rem;
    background-position: right 0.1rem center;
    height: 1.3rem;
  }
  
  .pagination-divider {
    height: 6px;
    margin: 0 0.2rem;
  }
}

/* 深色模式 */
:deep(.dark) .pagination-btn,
:deep(.dark) .page-size-select,
:deep(.dark) .jump-input {
  background-color: var(--color-bg-secondary-dark, #1f2937);
  color: var(--color-text-primary-dark, #f9fafb);
  border-color: var(--color-border-dark, #374151);
}

:deep(.dark) .pagination-btn:hover:not(.disabled):not(.active),
:deep(.dark) .page-size-select:hover:not(:disabled),
:deep(.dark) .jump-input:hover:not(:disabled) {
  background-color: var(--color-bg-hover-dark, #374151);
  border-color: var(--color-border-hover-dark, #4b5563);
}

:deep(.dark) .pagination-btn.active {
  background-color: var(--color-primary-dark, #60a5fa);
  color: #111827;
  border-color: var(--color-primary-dark, #60a5fa);
}

:deep(.dark) .pagination-ellipsis {
  color: var(--color-text-secondary-dark, #9ca3af);
}

.pagination-divider {
  display: inline-block;
  width: 1px;
  height: 10px;
  background-color: var(--color-border, #e5e7eb);
}

:deep(.dark) .pagination-divider {
  background-color: var(--color-border-dark, #374151);
}

.jump-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.5rem;
  background-color: var(--color-bg-secondary, #f9fafb);
  color: var(--color-text-primary, #1f2937);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 0.25rem;
  margin-left: 0.25rem;
  transition: all 0.2s ease;
}

.jump-btn:hover:not(:disabled) {
  background-color: var(--color-bg-hover, #f3f4f6);
  border-color: var(--color-border-hover, #d1d5db);
}

.jump-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

:deep(.dark) .jump-btn {
  background-color: var(--color-bg-secondary-dark, #1f2937);
  color: var(--color-text-primary-dark, #f9fafb);
  border-color: var(--color-border-dark, #374151);
}

:deep(.dark) .jump-btn:hover:not(:disabled) {
  background-color: var(--color-bg-hover-dark, #374151);
  border-color: var(--color-border-hover-dark, #4b5563);
}

/* 精简模式样式 */
.pagination-compact .pagination-btn {
  min-width: 1.5rem;
  height: 1.5rem;
  font-size: 0.7rem;
}

.pagination-compact-container {
  padding: 0 0.25rem;
}

.pagination-compact-row {
  width: 100%;
}

.pagination-compact-info {
  font-size: 0.7rem;
}

.page-size-select-compact {
  height: 1.4rem;
  padding: 0 0.25rem;
  font-size: 0.7rem;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 0.25rem;
  background-color: var(--color-bg-secondary, #f9fafb);
  color: var(--color-text-primary, #1f2937);
  min-width: 3.5rem;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.25rem center;
  background-size: 0.8rem;
  padding-right: 1.25rem;
}

.page-size-select-compact:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

:deep(.dark) .page-size-select-compact {
  background-color: var(--color-bg-secondary-dark, #1f2937);
  color: var(--color-text-primary-dark, #f9fafb);
  border-color: var(--color-border-dark, #374151);
}

:deep(.dark) .page-size-select-compact:hover:not(:disabled) {
  background-color: var(--color-bg-hover-dark, #374151);
  border-color: var(--color-border-hover-dark, #4b5563);
}
</style> 