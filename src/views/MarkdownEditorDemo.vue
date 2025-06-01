<template>
  <div class="editor-container">
    <div class="editor-header">
      <h2>Markdown 编辑器示例</h2>
      <div class="theme-switcher">
        <label>
          主题：
          <select v-model="editorTheme">
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </label>
        <label>
          预览主题：
          <select v-model="previewTheme">
            <option value="default">默认</option>
            <option value="github">GitHub</option>
            <option value="vuepress">VuePress</option>
            <option value="mk-cute">可爱风</option>
            <option value="smart-blue">智能蓝</option>
            <option value="cyanosis">青色</option>
          </select>
        </label>
        <label>
          代码主题：
          <select v-model="codeTheme">
            <option value="atom">Atom</option>
            <option value="a11y">A11y</option>
            <option value="github">GitHub</option>
            <option value="gradient">Gradient</option>
            <option value="kimbie">Kimbie</option>
            <option value="paraiso">Paraiso</option>
            <option value="qtcreator">Qt Creator</option>
            <option value="stackoverflow">Stack Overflow</option>
          </select>
        </label>
      </div>
    </div>
    
    <MarkdownEditor
      v-model="text"
      :theme="editorTheme"
      :preview-theme="previewTheme"
      :code-theme="codeTheme"
      :height="editorHeight"
      :toolbars="customToolbars"
      @onSave="handleSave"
      @onGetCatalog="handleGetCatalog"
    />
    
    <div v-if="catalog.length > 0" class="catalog-container">
      <h3>文档目录</h3>
      <ul class="catalog-list">
        <li v-for="(item, index) in catalog" :key="index" :style="{ paddingLeft: item.level * 15 + 'px' }">
          {{ item.text }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import MarkdownEditor from '../components/MarkdownEditor.vue';

// 编辑器内容
const text = ref(`# Markdown 编辑器示例

## 基本功能

这是一个基于 md-editor-v3 封装的 Markdown 编辑器组件。

### 支持的功能

- 主题切换
- 预览主题切换
- 代码主题切换
- 图片上传
- 目录生成
- 自定义工具栏

## 代码示例

\`\`\`javascript
const greeting = 'Hello, World!';
console.log(greeting);
\`\`\`

## 表格示例

| 名称 | 描述 | 版本 |
| ---- | ---- | ---- |
| md-editor-v3 | Markdown 编辑器 | 5.6.0 |
| Vue | 前端框架 | 3.5.13 |

`);

// 编辑器配置
const editorTheme = ref('light');
const previewTheme = ref('default');
const codeTheme = ref('atom');
const editorHeight = ref('500px');
const customToolbars = ref([]); // 使用默认工具栏

// 目录
const catalog = ref([]);

// 处理保存事件
const handleSave = (value, html) => {
  console.log('保存内容:', value);
  console.log('HTML 内容:', html);
};

// 处理目录获取
const handleGetCatalog = (list) => {
  catalog.value = list;
};
</script>

<style scoped>
.editor-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.editor-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-switcher {
  display: flex;
  gap: 15px;
}

.theme-switcher label {
  display: flex;
  align-items: center;
  gap: 5px;
}

.catalog-container {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #eaeaea;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.catalog-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.catalog-list li {
  padding: 5px 0;
}
</style>
