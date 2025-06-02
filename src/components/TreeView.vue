<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import TreeNode from './TreeNode.vue'; // 新增TreeNode组件引用

const props = defineProps({
  // 树形数据
  data: {
    type: Array,
    required: true
  },
  // 是否允许拖拽
  draggable: {
    type: Boolean,
    default: false
  },
  // 当前选中的节点ID
  selectedId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['node-click', 'node-toggle', 'node-drag', 'expand-all', 'collapse-all']);

// 展开的节点ID集合
const expandedNodes = ref(new Set());
// 当前拖拽的节点
const draggedNode = ref(null);
// 当前拖拽的目标节点
const dragOverNode = ref(null);
// 拖拽位置：'before', 'after', 'inside'
const dropPosition = ref(null);

// 初始化时展开所有节点
onMounted(() => {
  expandAllNodes();
});

// 监听数据变化，重新展开所有节点
watch(() => props.data, () => {
  expandAllNodes();
}, { deep: true });

// 展开所有节点
const expandAllNodes = () => {
  const expandAll = (nodes) => {
    if (!nodes) return;
    
    nodes.forEach(node => {
      expandedNodes.value.add(node.id);
      if (node.children && node.children.length > 0) {
        expandAll(node.children);
      }
    });
  };
  
  expandAll(props.data);
  emit('expand-all');
};

// 折叠所有节点
const collapseAllNodes = () => {
  expandedNodes.value.clear();
  emit('collapse-all');
};

// 切换节点展开/折叠状态
const toggleNode = (node) => {
  if (expandedNodes.value.has(node.id)) {
    expandedNodes.value.delete(node.id);
  } else {
    expandedNodes.value.add(node.id);
  }
  
  emit('node-toggle', node, expandedNodes.value.has(node.id));
};

// 点击节点
const handleNodeClick = (node, event) => {
  // 检查event是否为有效的DOM事件对象
  if (event && typeof event.stopPropagation === 'function') {
    event.stopPropagation();
  }
  emit('node-click', node);
};

// 开始拖拽
const handleDragStart = (node, event) => {
  if (!props.draggable) return;
  
  draggedNode.value = node;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', node.id);
  
  // 添加拖拽时的样式
  nextTick(() => {
    const elements = document.querySelectorAll('.tree-node');
    elements.forEach(el => {
      el.classList.add('tree-node-dragging');
    });
  });
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

// 获取节点的缩进样式
const getNodeIndentStyle = (level) => {
  return {
    paddingLeft: `${level * 20}px`
  };
};

// 获取节点的图标
const getNodeIcon = (node) => {
  if (!node.children || node.children.length === 0) {
    return 'fa-file-text-o';
  }
  
  return expandedNodes.value.has(node.id) ? 'fa-folder-open-o' : 'fa-folder-o';
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

// 导出方法供父组件调用
defineExpose({
  expandAllNodes,
  collapseAllNodes
});
</script>

<template>
  <div class="tree-container">
    <div v-for="node in props.data" :key="node.id" class="tree-root">
      <TreeNode
        :node="node"
        :selected-id="props.selectedId"
        :draggable="props.draggable"
        :expanded-nodes="expandedNodes"
        @node-click="handleNodeClick"
        @node-toggle="toggleNode"
        @node-drag="(data) => emit('node-drag', data)"
      />
    </div>
  </div>
</template>

<style scoped>
.tree-container {
  width: 100%;
  overflow: auto;
}

.tree-root {
  margin-bottom: 4px;
}

.tree-node-wrapper {
  position: relative;
}

.tree-node {
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: 4px;
  margin: 2px 0;
}

.tree-node:hover {
  background-color: var(--color-bg-tertiary);
}

.tree-node-selected {
  background-color: var(--color-bg-selected);
  color: var(--color-text-selected);
}

.tree-node-content {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  height: 36px;
}

.tree-node-expand-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
  cursor: pointer;
}

.tree-node-expand-placeholder {
  width: 16px;
  margin-right: 4px;
}

.tree-node-icon {
  margin-right: 8px;
  width: 16px;
  text-align: center;
}

.tree-node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-node-children {
  margin-left: 16px;
}

/* 拖拽相关样式 */
.tree-node-draggable {
  user-select: none;
}

.tree-node-dragging {
  opacity: 0.7;
}

.tree-node-drag-over {
  background-color: var(--color-bg-hover);
  border: 1px dashed var(--color-primary);
}

.tree-node-drag-over-gap-top {
  position: relative;
}

.tree-node-drag-over-gap-top::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-primary);
}

.tree-node-drag-over-gap-bottom {
  position: relative;
}

.tree-node-drag-over-gap-bottom::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-primary);
}
</style> 