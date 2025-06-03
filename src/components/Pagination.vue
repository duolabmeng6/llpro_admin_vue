<script setup>
import { computed } from 'vue';

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
</script>

<template>
  <div class="pagination-container flex items-center justify-between py-3">
    <!-- 页码信息 -->
    <div class="text-sm text-gray-500 dark:text-gray-400" v-if="totalItems > 0">
      显示 {{ formatPageInfo }}
    </div>
    <div v-else class="text-sm text-gray-500 dark:text-gray-400">
      暂无数据
    </div>
    
    <!-- 分页按钮组 -->
    <div class="flex items-center space-x-2" v-if="totalPages > 1">
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
        v-if="showLeftEllipsis"
        class="pagination-btn" 
        :class="{ 'active': currentPage === 1, 'disabled': disabled }"
        @click="handlePageChange(1)"
        :disabled="disabled"
      >
        1
      </button>
      
      <!-- 左侧省略号 -->
      <span v-if="showLeftEllipsis" class="pagination-ellipsis">...</span>
      
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
      <span v-if="showRightEllipsis" class="pagination-ellipsis">...</span>
      
      <!-- 最后一页按钮 -->
      <button 
        v-if="showRightEllipsis && totalPages > 1"
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

.pagination-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  font-size: 0.875rem;
  background-color: var(--color-bg-secondary, #f9fafb);
  color: var(--color-text-primary, #1f2937);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 0.375rem;
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
  min-width: 2rem;
  height: 2rem;
  color: var(--color-text-secondary, #6b7280);
}

/* 深色模式 */
:deep(.dark) .pagination-btn {
  background-color: var(--color-bg-secondary-dark, #1f2937);
  color: var(--color-text-primary-dark, #f9fafb);
  border-color: var(--color-border-dark, #374151);
}

:deep(.dark) .pagination-btn:hover:not(.disabled):not(.active) {
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
</style> 