# LL Pro Admin Web

一个基于Vue 3、Vite、Tailwind CSS 4和Express的现代化后台管理系统。

## 技术栈

- Vue 3 - 前端框架
- Vite 6.3.5 - 构建工具
- Vue Router 4 - 路由管理
- Pinia - 状态管理
- Tailwind CSS 4.1.8 - 样式框架
- Axios - HTTP客户端
- Express - 模拟数据服务
- font-awesome 6.7
- pnpm 包管理工具

## 主题系统

系统使用Tailwind CSS 4的原生主题功能，通过HTML的`data-theme`属性实现主题切换：

- 明亮主题 (light) - 默认主题
- 深色主题 (dark)
- 赛博朋克主题 (cyberpunk)
- 自然绿主题 (green)

主题定义在`src/styles/themes/`目录下，并通过CSS变量实现不同主题的样式切换。系统会记住用户的主题选择，也支持根据系统偏好自动切换亮/暗模式。

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

```

# 打赏
![alt text](image.png)