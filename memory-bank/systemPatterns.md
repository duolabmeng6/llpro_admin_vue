# 系统模式 (systemPatterns.md)

## 系统架构
- 基于Vue 3的前端单页应用
- 组件化设计，每个组件负责特定功能
- 使用Vue的组合式API (Composition API)

## 关键组件
- TreeView：树形视图容器组件
- TreeNode：树节点组件，支持递归渲染子节点

## 重要设计决策
- 使用递归组件结构来渲染无限嵌套的树形数据
- 使用事件委托模式处理节点交互（点击、拖拽等）
- 使用Vue的props和emits进行组件间通信
- 使用Set数据结构存储展开的节点ID

## 数据流向
- 父组件向TreeView传递树形数据
- TreeView向TreeNode传递节点数据和交互状态
- TreeNode通过事件向上传递用户交互信息

## 最后更新时间
2025-06-02 15:27:00 