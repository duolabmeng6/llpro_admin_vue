<template>
  <div class="tree-node-wrapper">
    <div
      :class="[
        'tree-node',
        node.id === selectedId ? 'tree-node-selected' : '',
        draggable ? 'tree-node-draggable' : ''
      ]"
      :draggable="draggable"
      @click="(event) => handleNodeClick(node, event)"
      @dragstart="(event) => handleDragStart(node, event)"
      @dragend="handleDragEnd"
      @dragenter="(event) => handleDragEnter(node, event)"
      @dragover="(event) => handleDragOver(node, event)"
      @dragleave="(event) => handleDragLeave(node, event)"
      @drop="(event) => handleDrop(node, event)"
    >
      <div class="tree-node-content" :style="getNodeIndentStyle(level)">
        <span
          v-if="hasChildren"
          class="tree-node-expand-icon"
          @click.stop="toggleNode(node)"
        >
          <i :class="`fa ${isExpanded ? 'fa-caret-down' : 'fa-caret-right'}`"></i>
        </span>
        <span v-else class="tree-node-expand-placeholder"></span>
        
        <span class="tree-node-icon">
          <i :class="`fa ${getNodeTypeIcon(node)}`"></i>
        </span>
        
        <span class="tree-node-label">{{ node.title || node.label }}</span>
      </div>
    </div>
    
    <div v-if="hasChildren && isExpanded" class="tree-node-children">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :selected-id="selectedId"
        :draggable="draggable"
        :expanded-nodes="expandedNodes"
        @node-click="(event) => $emit('node-click', child, event)"
        @node-toggle="(node) => $emit('node-toggle', node)"
        @node-drag="(data) => $emit('node-drag', data)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  selectedId: {
    type: String,
    default: null
  },
  draggable: {
    type: Boolean,
    default: false
  },
  expandedNodes: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['node-click', 'node-toggle', 'node-drag']);

// 计算属性
const hasChildren = computed(() => props.node.children && props.node.children.length > 0);
const isExpanded = computed(() => props.expandedNodes.has(props.node.id));

// 拖拽相关状态
const draggedNode = ref(null);
const dragOverNode = ref(null);
const dropPosition = ref(null);

// 获取节点的缩进样式
const getNodeIndentStyle = (level) => {
  return {
    paddingLeft: `${level * 20}px`
  };
};

// 获取节点的类型图标
const getNodeTypeIcon = (node) => {
  switch (node.type) {
    case 'course':
      return 'fa-book';
    case 'chapter':
      return 'fa-folder';
    case 'lesson':
      return 'fa-file-text';
    default:
      return 'fa-file';
  }
};

// 切换节点展开/折叠状态
const toggleNode = (node) => {
  emit('node-toggle', node);
};

// 点击节点
const handleNodeClick = (node, event) => {
  if (event && typeof event.stopPropagation === 'function') {
    event.stopPropagation();
  }
  emit('node-click', node, event);
};

// 开始拖拽
const handleDragStart = (node, event) => {
  if (!props.draggable) return;
  
  draggedNode.value = node;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', node.id);
};

// 拖拽结束
const handleDragEnd = () => {
  draggedNode.value = null;
  dragOverNode.value = null;
  dropPosition.value = null;
  
  // 移除拖拽时的样式
  const elements = document.querySelectorAll('.tree-node');
  elements.forEach(el => {
    el.classList.remove('tree-node-dragging');
    el.classList.remove('tree-node-drag-over');
    el.classList.remove('tree-node-drag-over-gap-top');
    el.classList.remove('tree-node-drag-over-gap-bottom');
  });
};

// 拖拽进入节点
const handleDragEnter = (node, event) => {
  if (!props.draggable || node.id === draggedNode.value?.id) return;
  
  event.preventDefault();
  dragOverNode.value = node;
};

// 拖拽经过节点
const handleDragOver = (node, event) => {
  if (!props.draggable || node.id === draggedNode.value?.id) return;
  
  event.preventDefault();
  dragOverNode.value = node;
  
  // 计算拖拽位置
  const { clientY } = event;
  const targetElement = event.currentTarget;
  const { top, height } = targetElement.getBoundingClientRect();
  
  // 清除所有拖拽样式
  targetElement.classList.remove('tree-node-drag-over');
  targetElement.classList.remove('tree-node-drag-over-gap-top');
  targetElement.classList.remove('tree-node-drag-over-gap-bottom');
  
  const gapHeight = height * 0.2;
  const gapTop = top + gapHeight;
  const gapBottom = top + height - gapHeight;
  
  if (clientY < gapTop) {
    // 拖拽到节点上方
    dropPosition.value = 'before';
    targetElement.classList.add('tree-node-drag-over-gap-top');
  } else if (clientY > gapBottom) {
    // 拖拽到节点下方
    dropPosition.value = 'after';
    targetElement.classList.add('tree-node-drag-over-gap-bottom');
  } else {
    // 拖拽到节点内部
    dropPosition.value = 'inside';
    targetElement.classList.add('tree-node-drag-over');
  }
};

// 拖拽离开节点
const handleDragLeave = (node, event) => {
  if (!props.draggable) return;
  
  event.preventDefault();
  const targetElement = event.currentTarget;
  
  // 清除拖拽样式
  targetElement.classList.remove('tree-node-drag-over');
  targetElement.classList.remove('tree-node-drag-over-gap-top');
  targetElement.classList.remove('tree-node-drag-over-gap-bottom');
  
  if (dragOverNode.value?.id === node.id) {
    dragOverNode.value = null;
    dropPosition.value = null;
  }
};

// 放置节点
const handleDrop = (node, event) => {
  if (!props.draggable || !draggedNode.value || !dropPosition.value) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  // 发出拖拽事件
  emit('node-drag', {
    draggedNode: draggedNode.value,
    targetNode: node,
    position: dropPosition.value
  });
  
  // 清除拖拽状态
  handleDragEnd();
};
</script>

<style scoped>
.tree-node-wrapper {
  position: relative;
}

.tree-node {
  display: flex;
  align-items: center;
  padding: 4px 0;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.tree-node:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.tree-node-selected {
  background-color: rgba(0, 120, 215, 0.1);
}

.tree-node-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.tree-node-expand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.tree-node-expand-placeholder {
  width: 20px;
}

.tree-node-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  margin-right: 4px;
}

.tree-node-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-node-children {
  position: relative;
}

/* 拖拽相关样式 */
.tree-node-draggable {
  user-select: none;
}

.tree-node-dragging {
  opacity: 0.5;
}

.tree-node-drag-over {
  background-color: rgba(0, 120, 215, 0.1);
}

.tree-node-drag-over-gap-top {
  position: relative;
}

.tree-node-drag-over-gap-top::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #0078d7;
}

.tree-node-drag-over-gap-bottom {
  position: relative;
}

.tree-node-drag-over-gap-bottom::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #0078d7;
}
</style> 