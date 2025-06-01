import { createApp, ref } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './styles/main.css'
import App from './App.vue'
import { setupErrorHandler } from './utils/errorHandler'
import { useThemeStore } from './stores/theme'

// 创建Vue应用实例
const app = createApp(App)

// 全局通知方法
const notify = (options) => {
  if (window.$notificationInstance) {
    return window.$notificationInstance.notify(options)
  }
}

// 设置全局属性
app.config.globalProperties.$notify = notify

// 设置错误处理
setupErrorHandler(app, notify)

// 注册Pinia和路由
const pinia = createPinia()
app.use(pinia)
app.use(router)

// 挂载应用
app.mount('#app')

// 初始化主题
try {
  const themeStore = useThemeStore()
  console.log('初始化主题...')
  themeStore.initTheme()
} catch (error) {
  console.error('初始化主题失败:', error)
}

//## markdown editor
import { config } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

import screenfull from 'screenfull';

import katex from 'katex';
import 'katex/dist/katex.min.css';

import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

import mermaid from 'mermaid';

import highlight from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

// <3.0
// import prettier from 'prettier';
// import parserMarkdown from 'prettier/parser-markdown';
// >=3.0
import * as prettier from 'prettier';
import parserMarkdown from 'prettier/plugins/markdown';

config({
  editorExtensions: {
    prettier: {
      prettierInstance: prettier,
      parserMarkdownInstance: parserMarkdown,
    },
    highlight: {
      instance: highlight,
    },
    screenfull: {
      instance: screenfull,
    },
    katex: {
      instance: katex,
    },
    cropper: {
      instance: Cropper,
    },
    mermaid: {
      instance: mermaid,
    },
  },
});
//##