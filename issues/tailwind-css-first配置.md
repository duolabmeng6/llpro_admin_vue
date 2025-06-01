# Tailwind CSS-first配置任务

## 上下文
- 当前Button组件使用Tailwind CSS类名定义样式
- 按钮颜色需要重新设计，已创建JS配置文件
- 需要升级到Tailwind CSS v4的CSS-first配置方式

## 计划
1. 修改src/styles/main.css文件
   - 在文件开头添加`@import "tailwindcss";`
   - 添加`@theme`部分定义颜色变量

2. 更新vite.config.js
   - 确保使用最新的Tailwind v4插件

3. 测试按钮组件
   - 验证按钮是否正确显示颜色

## 预期结果
- 按钮将显示正确的颜色样式
- 项目采用更现代的Tailwind v4配置方式
- CSS变量可在项目中灵活使用