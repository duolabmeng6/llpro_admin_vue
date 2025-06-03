<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import TreeNode from './TreeNode.vue';
import draggable from 'vuedraggable';

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

const emit = defineEmits(['node-click', 'node-toggle', 'node-drag', 'expand-all', 'collapse-all', 'node-add', 'node-edit', 'update:data']);

// 本地数据，用于draggable组件绑定
const localData = ref([]);

// 监听props.data变化，更新本地数据
watch(() => props.data, (newData) => {
  if (newData) {
    // 深拷贝数据，避免直接引用props
    localData.value = JSON.parse(JSON.stringify(newData));
  } else {
    localData.value = [];
  }
}, { immediate: true, deep: true });

// 展开的节点ID集合
const expandedNodes = ref(new Set());

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

// 添加子节点
const handleNodeAdd = (node) => {
  emit('node-add', node);
};

// 编辑节点
const handleNodeEdit = (node) => {
  emit('node-edit', node);
};

// 处理拖拽变化事件
const handleDragChange = (evt) => {
  // 只在开发环境输出详细日志
  if (process.env.NODE_ENV === 'development') {
    console.log('TreeView - 拖拽变化事件:', evt);
  }
  
  if (!evt.added && !evt.moved && !evt.removed) {
    if (process.env.NODE_ENV === 'development') {
      console.log('TreeView - 无拖拽变化，忽略事件');
    }
    return;
  }
  
  // 通知父组件更新数据
  emit('update:data', localData.value);
  
  // 处理章节拖拽
  if (evt.moved) {
    const { element: draggedNode, newIndex, oldIndex } = evt.moved;
    
    // 如果新旧索引相同，说明没有实际的拖拽发生
    if (newIndex === oldIndex) {
      if (process.env.NODE_ENV === 'development') {
        console.log('TreeView - 新旧索引相同，忽略事件');
      }
      return;
    }
    
    // 确定目标节点和位置
    let targetNode;
    let position;
    
    if (newIndex > oldIndex) {
      // 向下拖动
      targetNode = localData.value[newIndex];
      position = 'after';
    } else {
      // 向上拖动
      targetNode = localData.value[newIndex];
      position = 'before';
    }
    
    // 确保draggedNode和targetNode不是同一个节点
    // 注意：在vuedraggable中，draggedNode和targetNode可能有相同的id，但它们在数组中的位置不同
    // 所以我们应该使用索引来判断，而不是id
    if (draggedNode.id === targetNode.id && newIndex === oldIndex) {
      if (process.env.NODE_ENV === 'development') {
        console.log('TreeView - 拖拽到自身，忽略事件');
      }
      return;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('TreeView - 拖拽处理:', {
        draggedNode,
        targetNode,
        position,
        oldIndex,
        newIndex
      });
    }
    
    // 发出拖拽事件
    emit('node-drag', {
      draggedNode,
      targetNode,
      position,
      timestamp: new Date().toISOString()
    });
  }
};

// 处理子节点拖拽事件
const handleNodeDragEvent = (dragInfo) => {
  console.log('TreeView - 接收到子节点拖拽事件:', dragInfo);
  
  // 验证拖拽数据
  if (!dragInfo.draggedNode?.id || !dragInfo.targetNode?.id) {
    console.error('TreeView - 拖拽数据不完整:', dragInfo);
    return;
  }
  
  // 直接传递给父组件
  emit('node-drag', dragInfo);
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
    <draggable
      v-if="localData && localData.length > 0"
      :list="localData"
      :disabled="!props.draggable"
      item-key="id"
      ghost-class="tree-node-ghost"
      chosen-class="tree-node-chosen"
      drag-class="tree-node-drag"
      @change="handleDragChange"
      handle=".tree-node-content"
    >
      <template #item="{ element: node }">
        <div class="tree-root">
          <TreeNode
            :node="node"
            :selected-id="props.selectedId"
            :draggable="props.draggable"
            :expanded-nodes="expandedNodes"
            @node-click="handleNodeClick"
            @node-toggle="toggleNode"
            @node-drag="handleNodeDragEvent"
            @node-add="handleNodeAdd"
            @node-edit="handleNodeEdit"
          />
        </div>
      </template>
    </draggable>
    <div v-else class="tree-empty">
      <p>暂无数据</p>
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

.tree-empty {
  padding: 20px;
  text-align: center;
  color: var(--color-text-secondary);
}

/* 拖拽相关样式 */
.tree-node-ghost {
  opacity: 0.5;
  background: var(--color-bg-tertiary);
  border: 1px dashed var(--color-primary);
}

.tree-node-chosen {
  background-color: var(--color-bg-selected);
}

.tree-node-drag {
  opacity: 0.8;
}
</style> 