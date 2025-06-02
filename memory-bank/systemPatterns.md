# 系统模式 (System Patterns)

## 系统架构
LL Pro Admin Web采用前后端分离的架构：
- 前端：Vue 3 + Vite构建的SPA应用
- 后端：Express模拟服务器提供API

## 关键组件
1. **布局系统**
   - 位于`src/layouts`目录
   - 包含主布局、侧边栏、顶部导航等组件

2. **路由系统**
   - 基于Vue Router 4
   - 路由配置位于`src/router`目录
   - 支持路由懒加载和权限控制

3. **状态管理**
   - 使用Pinia进行状态管理
   - 存储模块位于`src/stores`目录

4. **API层**
   - 基于Axios的HTTP客户端
   - API服务位于`src/api`目录
   - 统一的请求/响应拦截器

5. **主题系统**
   - 基于Tailwind CSS 4的原生主题功能
   - 通过HTML的`data-theme`属性实现主题切换
   - 主题定义在`src/styles/themes/`目录

6. **组件库**
   - 自定义UI组件位于`src/components`目录
   - 包含表单、图表、示例等组件

7. **Mock服务**
   - 基于Express的模拟数据服务
   - 位于`mock-server`目录

## 重要设计决策
1. **使用Tailwind CSS而非UI组件库**
   - 提供更大的设计自由度和定制性
   - 减少额外的依赖包大小

2. **采用Pinia代替Vuex**
   - 更好的TypeScript支持
   - 更简洁的API和开发体验

3. **集成Markdown编辑器**
   - 使用md-editor-v3提供富文本编辑功能
   - 支持代码高亮、数学公式、图表等扩展功能

4. **多主题支持**
   - 使用CSS变量实现主题切换
   - 支持明亮、深色、赛博朋克、自然绿四种主题 