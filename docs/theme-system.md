# LL Pro Admin 主题系统教程

本文档详细介绍了 LL Pro Admin 的主题系统设计和使用方法，包括如何自定义和扩展主题。

## 目录

1. [主题系统概述](#主题系统概述)
2. [主题文件结构](#主题文件结构)
3. [工作原理](#工作原理)
4. [如何添加新主题](#如何添加新主题)
5. [主题变量参考](#主题变量参考)
6. [进阶主题使用](#进阶主题使用)

## 主题系统概述

LL Pro Admin 的主题系统基于以下技术实现：

- **CSS 变量**：使用 CSS 自定义属性定义主题颜色和样式
- **HTML data-theme 属性**：通过设置 `<html>` 元素的 `data-theme` 属性切换主题
- **Tailwind CSS v4**：利用 Tailwind 的变量支持和工具类系统
- **Vue 3 + Pinia**：使用 Vue 的响应式系统和 Pinia 存储管理主题状态

主题系统支持：
- 明亮主题（默认）
- 深色主题
- 赛博朋克主题
- 自定义主题（可扩展）

## 主题文件结构

主题相关文件的组织结构如下：

```
src/
├── styles/
│   ├── themes/
│   │   ├── base.css      # 基础主题配置和通用变量
│   │   ├── light.css     # 明亮主题配置
│   │   ├── dark.css      # 深色主题配置
│   │   └── cyberpunk.css # 赛博朋克主题配置
│   └── main.css          # 主样式文件，导入所有主题
├── stores/
│   └── theme.js          # 主题状态管理
└── components/
    └── ThemeSwitcher.vue # 主题切换组件
```

## 工作原理

### 1. CSS 变量定义

每个主题都通过 CSS 变量定义其颜色和样式，例如：

```css
html[data-theme='light'] {
  --color-bg-primary: oklch(97.9% 0.005 256.8);
  --color-text-primary: oklch(23.8% 0.044 255.2);
  /* 更多变量... */
}

html[data-theme='dark'] {
  --color-bg-primary: oklch(19.2% 0.042 255.3);
  --color-text-primary: color-mix(in oklab, white 95%, transparent);
  /* 更多变量... */
}
```

### 2. Tailwind 工具类

为了使用这些变量，我们创建了对应的 Tailwind 工具类：

```css
@layer utilities {
  .bg-primary {
    background-color: var(--color-bg-primary);
  }
  
  .text-primary {
    color: var(--color-text-primary);
  }
  
  /* 更多工具类... */
}
```

### 3. 主题切换逻辑

主题切换通过设置 HTML 元素的 `data-theme` 属性实现：

```javascript
// 在 theme.js 中
const applyTheme = (themeId) => {
  document.documentElement.setAttribute('data-theme', themeId);
}
```

### 4. 初始主题

为了避免闪烁，在 `main.js` 中进行初始主题设置：

```javascript
// 初始化主题，防止闪烁 (FOUC)
(function() {
  const savedTheme = localStorage.getItem('ll_pro_admin_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // 设置初始主题
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initialTheme);
})();
```

## 如何添加新主题

要添加新的主题，请按照以下步骤操作：

### 1. 创建主题 CSS 文件

在 `src/styles/themes/` 目录下创建一个新的 CSS 文件，例如 `green.css`：

```css
/* 绿色主题配置 */
html[data-theme='green'] {
  /* 背景色 */
  --color-bg-primary: oklch(90% 0.08 150);  /* 浅绿色背景 */
  --color-bg-secondary: oklch(95% 0.05 148);
  --color-bg-tertiary: oklch(85% 0.1 152);
  
  /* 文本颜色 */
  --color-text-primary: oklch(25% 0.02 150);  /* 深绿色文字 */
  --color-text-secondary: oklch(40% 0.04 150);
  
  /* 边框和分隔线 */
  --color-border: oklch(80% 0.1 150);
  
  /* 强调色和交互元素 */
  --color-accent: oklch(50% 0.2 150);
  --color-accent-hover: oklch(45% 0.25 150);
  
  /* 卡片和面板 */
  --color-card-bg: oklch(92% 0.06 148);
  --color-card-border: var(--color-border);
  
  /* 输入框 */
  --color-input-bg: white;
  --color-input-border: var(--color-border);
  --color-input-text: var(--color-text-primary);
  --color-input-placeholder: var(--color-text-secondary);
  
  /* 按钮 - 默认 */
  --color-button-bg: var(--color-bg-tertiary);
  --color-button-text: var(--color-text-primary);
  --color-button-border: var(--color-border);
  --color-button-hover-bg: var(--color-bg-secondary);
  
  /* 按钮 - 主要 */
  --color-button-primary-bg: oklch(50% 0.2 150);
  --color-button-primary-text: white;
  --color-button-primary-hover-bg: oklch(45% 0.25 150);
  
  /* 按钮 - 次要 */
  --color-button-secondary-bg: oklch(60% 0.15 200);
  --color-button-secondary-text: white;
  --color-button-secondary-hover-bg: oklch(55% 0.2 200);
}
```

### 2. 在 main.css 中导入新主题

编辑 `src/styles/main.css` 文件，添加导入语句：

```css
@import "tailwindcss";

/* 导入主题文件 */
@import "./themes/base.css";
@import "./themes/light.css";
@import "./themes/dark.css";
@import "./themes/cyberpunk.css";
@import "./themes/green.css";  /* 新添加的主题 */
```

### 3. 在 theme.js 中注册新主题

编辑 `src/stores/theme.js` 文件，在 themes 对象中添加新主题：

```javascript
const themes = {
  dark: {
    id: 'dark',
    name: '深色科技',
    description: '深色科技风格主题',
    preview: '/theme-previews/dark.png'
  },
  light: {
    id: 'light',
    name: '明亮简约',
    description: '明亮简约风格主题',
    preview: '/theme-previews/light.png'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: '赛博朋克',
    description: '霓虹赛博朋克风格主题',
    preview: '/theme-previews/cyberpunk.png'
  },
  green: {
    id: 'green',
    name: '自然绿',
    description: '清新自然的绿色主题',
    preview: '/theme-previews/green.png'  // 如果有预览图
  }
}
```

### 4. 创建主题预览图（可选）

为了更好的用户体验，您可以在 `public/theme-previews/` 目录下添加一个主题预览图，尺寸建议为 300x200 像素。

### 5. 添加主题预览样式（可选）

在 `ThemeSwitcher.vue` 组件中添加新主题的预览样式：

```css
/* 绿色主题预览 */
.theme-preview-green {
  background-color: oklch(90% 0.08 150);
}

.theme-preview-green .theme-preview-header {
  background-color: oklch(95% 0.05 148);
}

.theme-preview-green .theme-preview-sidebar {
  background-color: oklch(85% 0.1 152);
}

.theme-preview-green .theme-preview-card {
  background-color: oklch(92% 0.06 148);
  border: 1px solid oklch(80% 0.1 150);
}

.theme-preview-green .theme-preview-button {
  background-color: oklch(50% 0.2 150);
}
```

完成上述步骤后，新主题将自动出现在主题选择器中，用户可以切换到新主题。

## 主题变量参考

以下是主题系统中使用的所有 CSS 变量及其用途：

| 变量名 | 描述 | 示例值 (亮色主题) |
|--------|------|------------------|
| `--color-bg-primary` | 主要背景色 | `oklch(97.9% 0.005 256.8)` |
| `--color-bg-secondary` | 次要背景色 | `oklch(100% 0 0)` |
| `--color-bg-tertiary` | 三级背景色 | `oklch(96.9% 0.013 244.4)` |
| `--color-text-primary` | 主要文本颜色 | `oklch(23.8% 0.044 255.2)` |
| `--color-text-secondary` | 次要文本颜色 | `oklch(50.6% 0.023 255.5)` |
| `--color-border` | 边框颜色 | `oklch(91.3% 0.023 244.9)` |
| `--color-accent` | 强调色 | `var(--color-primary-600)` |
| `--color-accent-hover` | 强调色悬停状态 | `var(--color-primary-700)` |
| `--color-card-bg` | 卡片背景色 | `white` |
| `--color-card-border` | 卡片边框色 | `var(--color-border)` |
| `--color-input-bg` | 输入框背景色 | `white` |
| `--color-input-border` | 输入框边框色 | `var(--color-gray-300)` |
| `--color-input-text` | 输入框文本色 | `var(--color-text-primary)` |
| `--color-button-bg` | 按钮背景色 | `var(--color-gray-100)` |
| `--color-button-text` | 按钮文本色 | `var(--color-gray-900)` |
| `--color-button-primary-bg` | 主要按钮背景色 | `var(--color-primary-600)` |
| `--color-button-primary-text` | 主要按钮文本色 | `white` |

## 进阶主题使用

### 自定义过渡效果

您可以通过修改基础主题文件 `base.css` 中的过渡变量来自定义主题切换的过渡效果：

```css
:root {
  --theme-transition-duration: 0.3s;
  --theme-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 实现时间感知主题

您可以扩展主题系统，实现根据时间自动切换主题：

```javascript
// 在 theme.js 中添加
const setupTimeBasedTheme = () => {
  const updateThemeByTime = () => {
    const hour = new Date().getHours();
    // 晚上 8 点到早上 6 点使用深色主题
    const shouldBeDark = hour >= 20 || hour < 6;
    
    // 只有用户没有明确设置主题时才自动切换
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (!savedTheme) {
      setTheme(shouldBeDark ? 'dark' : 'light');
    }
  };
  
  // 立即执行一次
  updateThemeByTime();
  
  // 每小时检查一次
  setInterval(updateThemeByTime, 3600000);
};
```

### 添加主题过渡动画

可以在主题切换时添加过渡动画，使体验更流畅：

```javascript
// 在 theme.js 中修改 setTheme 方法
const setTheme = (themeId) => {
  // ... 现有代码
  
  // 添加过渡效果
  document.body.classList.add('theme-transitioning');
  
  // 应用主题
  applyTheme(themeId);
  
  // 过渡结束后移除类
  setTimeout(() => {
    document.body.classList.remove('theme-transitioning');
  }, 300);
  
  // ... 现有代码
};
```

同时在 CSS 中添加相应的过渡样式：

```css
.theme-transitioning * {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
}
```

---

通过这些方法，您可以充分利用 LL Pro Admin 的主题系统，创建美观、响应式的用户界面，提供出色的用户体验。