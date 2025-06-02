# 技术背景 (Technical Context)

## 技术栈选型
- **前端框架**: Vue 3.5.13
- **构建工具**: Vite 6.3.5
- **路由管理**: Vue Router 4.5.1
- **状态管理**: Pinia 3.0.2
- **样式框架**: Tailwind CSS 4.1.8
- **HTTP客户端**: Axios 1.9.0
- **模拟服务器**: Express 5.1.0
- **包管理工具**: pnpm

## 开发环境
- **Node.js**: 推荐v18+
- **包管理器**: pnpm
- **IDE推荐**: Visual Studio Code
- **浏览器**: Chrome/Edge/Firefox最新版
- **开发命令**: `pnpm run dev` (启动前端+模拟服务器)

## 运行环境
- **浏览器兼容**: 现代浏览器（Chrome、Firefox、Safari、Edge最新版）
- **部署环境**: 静态文件服务器
- **构建命令**: `pnpm run build`
- **预览命令**: `pnpm run preview`

## 主要依赖项
### 核心依赖
- `vue`: ^3.5.13 - 前端框架
- `vue-router`: ^4.5.1 - 路由管理
- `pinia`: ^3.0.2 - 状态管理
- `axios`: ^1.9.0 - HTTP客户端
- `tailwindcss`: ^4.1.8 - 样式框架

### UI与交互
- `@fontsource/inter`: ^5.2.5 - 字体
- `cropperjs`: 1 - 图片裁剪
- `screenfull`: ^6.0.2 - 全屏功能

### 数据可视化
- `chart.js`: ^4.4.9 - 图表库

### Markdown编辑器相关
- `md-editor-v3`: ^5.6.0 - Markdown编辑器
- `highlight.js`: ^11.11.1 - 代码高亮
- `katex`: ^0.16.22 - 数学公式
- `mermaid`: ^11.6.0 - 图表绘制

### 后端模拟服务
- `express`: ^5.1.0 - Web服务器
- `cors`: ^2.8.5 - 跨域资源共享
- `multer`: ^1.4.5-lts.1 - 文件上传
- `nodemon`: ^3.1.10 - 开发热重载

### 工具库
- `uuid`: ^11.1.0 - 唯一ID生成
- `pinyin`: ^4.0.0 - 拼音转换

### 开发工具
- `@vitejs/plugin-vue`: ^5.2.3 - Vue插件
- `eslint`: ^9.28.0 - 代码检查
- `prettier`: ^3.5.3 - 代码格式化
- `@vue/eslint-config-prettier`: ^10.2.0 - ESLint与Prettier集成 