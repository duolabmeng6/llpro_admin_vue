<template>
  <div class="tree-node-wrapper">
    <div
      :class="[
        'tree-node',
        node.id === selectedId ? 'tree-node-selected' : '',
        hasChildren ? 'tree-node-has-children' : ''
      ]"
      @click="(event) => handleNodeClick(node, event)"
    >
      <div class="tree-node-content" :style="getNodeIndentStyle(level)">
        <span
          v-if="hasChildren"
          class="tree-node-expand-icon"
          @click.stop="toggleNode(node)"
        >
          <i :class="`fa ${isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'}`"></i>
        </span>
        <span v-else class="tree-node-expand-placeholder"></span>
        
        <span class="tree-node-icon" :class="`node-type-${node.type}`">
          <i :class="`fa ${getNodeTypeIcon(node)}`"></i>
        </span>
        
        <span class="tree-node-label">{{ node.title || node.label }}</span>
        
        <div class="tree-node-actions">
          <span class="tree-node-action" title="添加" v-if="node.type !== 'lesson'" @click.stop="handleNodeAdd(node)">
            <i class="fa fa-plus"></i>
          </span>
          <span class="tree-node-action" title="编辑" @click.stop.prevent="(event) => handleNodeEdit(node, event)">
            <i class="fa fa-pencil"></i>
          </span>
        </div>
      </div>
    </div>
    
    <div v-if="hasChildren && isExpanded" class="tree-node-children">
      <draggable
        :list="localChildren"
        :disabled="!draggable"
        item-key="id"
        ghost-class="tree-node-ghost"
        chosen-class="tree-node-chosen"
        drag-class="tree-node-drag"
        @change="handleChildDragChange"
        handle=".tree-node-content"
      >
        <template #item="{ element: childNode }">
          <TreeNode
            :node="childNode"
            :level="level + 1"
            :selected-id="selectedId"
            :draggable="draggable"
            :expanded-nodes="expandedNodes"
            @node-click="handleNodeClick"
            @node-toggle="toggleNode"
            @node-drag="(data) => emit('node-drag', data)"
            @node-add="(node) => emit('node-add', node)"
            @node-edit="(node) => emit('node-edit', node)"
          />
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import draggable from 'vuedraggable';

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

const emit = defineEmits(['node-click', 'node-toggle', 'node-drag', 'node-add', 'node-edit']);

// 本地数据，用于draggable组件绑定
const localChildren = ref([]);

// 监听props.node.children变化，更新本地数据
watch(() => props.node.children, (newChildren) => {
  if (newChildren) {
    // 深拷贝数据，避免直接引用props
    localChildren.value = JSON.parse(JSON.stringify(newChildren));
  } else {
    localChildren.value = [];
  }
}, { immediate: true, deep: true });

// 计算属性
const hasChildren = computed(() => props.node.children && props.node.children.length > 0);
const isExpanded = computed(() => props.expandedNodes.has(props.node.id));

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
  // 确保传递的是原始节点，而不是事件对象
  emit('node-click', node);
};

// 添加子节点
const handleNodeAdd = (node) => {
  emit('node-add', node);
};

// 编辑节点
const handleNodeEdit = (node, event) => {
  // 确保事件不会冒泡和触发默认行为
  if (event) {
    if (typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
    if (typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    
    // 阻止事件进一步传播
    event.cancelBubble = true;
    event.returnValue = false;
  }
  
  // 发出编辑事件
  emit('node-edit', node);
};

// 处理子节点拖拽变化事件
const handleChildDragChange = (evt) => {
  // 只在开发环境输出详细日志
  if (process.env.NODE_ENV === 'development') {
    console.log('TreeNode - 子节点拖拽变化事件:', evt);
  }
  
  if (!evt.added && !evt.moved && !evt.removed) {
    if (process.env.NODE_ENV === 'development') {
      console.log('TreeNode - 无拖拽变化，忽略事件');
    }
    return;
  }
  
  // 更新父节点的children属性
  if (props.node && typeof props.node === 'object') {
    // 创建一个新的节点对象，避免直接修改props
    const updatedNode = { ...props.node, children: localChildren.value };
    
    // 处理小节拖拽
    if (evt.moved) {
      const { element: draggedNode, newIndex, oldIndex } = evt.moved;
      
      // 如果新旧索引相同，说明没有实际的拖拽发生
      if (newIndex === oldIndex) {
        if (process.env.NODE_ENV === 'development') {
          console.log('TreeNode - 新旧索引相同，忽略事件');
        }
        return;
      }
      
      // 确定目标节点和位置
      let targetNode;
      let position;
      
      if (newIndex > oldIndex) {
        // 向下拖动
        targetNode = localChildren.value[newIndex];
        position = 'after';
      } else {
        // 向上拖动
        targetNode = localChildren.value[newIndex];
        position = 'before';
      }
      
      // 确保draggedNode和targetNode不是同一个节点
      // 在vuedraggable中，只要新旧索引不同，就表示位置发生了变化
      // 不需要再通过ID判断是否为同一节点
      
      if (process.env.NODE_ENV === 'development') {
        console.log('TreeNode - 拖拽处理:', {
          draggedNode,
          targetNode,
          position,
          oldIndex,
          newIndex
        });
      }
      
      // 发出拖拽事件，确保包含完整的拖拽信息
      emit('node-drag', {
        draggedNode,
        targetNode,
        position,
        oldIndex,
        newIndex,
        parentNode: props.node,
        timestamp: new Date().toISOString()
      });
    }
  }
};
</script>

<style scoped>
.tree-node-wrapper {
  position: relative;
}

.tree-node {
  display: flex;
  align-items: center;
  padding: 6px 0;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  margin: 2px 0;
}

.tree-node:hover {
  background-color: var(--color-bg-tertiary);
}

.tree-node:hover .tree-node-actions {
  opacity: 1;
}

.tree-node-selected {
  background-color: var(--modern-accent-color, rgba(0, 120, 215, 0.15));
  color: var(--modern-accent-text-color, inherit);
}

.tree-node-content {
  display: flex;
  align-items: center;
  width: 100%;
  padding-right: 8px;
}

.tree-node-expand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.tree-node-expand-icon:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.tree-node-expand-placeholder {
  width: 24px;
}

.tree-node-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 8px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.05);
}

.node-type-course .fa {
  color: var(--color-primary-600, #4f46e5);
}

.node-type-chapter .fa {
  color: var(--color-secondary-600, #0891b2);
}

.node-type-lesson .fa {
  color: var(--color-success, #059669);
}

.tree-node-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
}

.tree-node-actions {
  display: flex;
  gap: 4px;
  opacity: 1;
  transition: opacity 0.2s ease;
}

.tree-node-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  transition: all 0.15s ease;
  background-color: rgba(0, 0, 0, 0.05);
}

.tree-node-action:hover {
  background-color: rgba(0, 0, 0, 0.15);
  color: var(--color-text-primary);
  transform: scale(1.1);
}

.tree-node-children {
  position: relative;
}

.tree-node-children::before {
  content: '';
  position: absolute;
  top: 0;
  left: 12px;
  bottom: 12px;
  width: 1px;
  background-color: var(--color-border);
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

/* 放置成功动画 */
.tree-node-drop-success {
  animation: drop-success 0.8s ease-in-out;
}

@keyframes drop-success {
  0% {
    background-color: rgba(16, 185, 129, 0.05);
    box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2);
  }
  50% {
    background-color: rgba(16, 185, 129, 0.15);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.4);
  }
  100% {
    background-color: transparent;
    box-shadow: none;
  }
}
</style> 