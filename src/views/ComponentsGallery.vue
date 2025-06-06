<script setup>
import { ref, computed, onMounted } from 'vue';
import Card from '../components/Card.vue';
import Button from '../components/Button.vue';
import Input from '../components/Input.vue';
import Alert from '../components/Alert.vue';
import Table from '../components/Table.vue';
import Modal from '../components/Modal.vue';
import Dropdown from '../components/Dropdown.vue';
import TabsNav from '../components/TabsNav.vue';
import ThemeSwitcher from '../components/ThemeSwitcher.vue';
import Notification from '../components/Notification.vue';
import BarChart from '../components/charts/BarChart.vue';
import LineChart from '../components/charts/LineChart.vue';
import PieChart from '../components/charts/PieChart.vue';
import { Form, FormGroup, Select, Checkbox, Radio, Textarea, Switch } from '../components/form';

// 搜索和筛选状态
const searchQuery = ref('');
const selectedCategory = ref('all');

// 组件分类
const categories = [
  { id: 'all', name: '全部组件' },
  { id: 'basic', name: '基础组件' },
  { id: 'form', name: '表单组件' },
  { id: 'data', name: '数据展示' },
  { id: 'navigation', name: '导航组件' },
  { id: 'feedback', name: '反馈组件' },
  { id: 'chart', name: '图表组件' }
];

// 组件数据
const componentsData = [
  {
    name: 'Button',
    component: Button,
    category: 'basic',
    description: '按钮组件，用于触发操作或提交表单',
    props: { 
      text: '按钮', 
      variant: 'primary', 
      size: 'md'
    }
  },
  {
    name: 'Card',
    component: Card,
    category: 'basic',
    description: '卡片容器，用于展示相关内容和操作',
    props: { 
      title: '卡片标题'
    },
    slots: {
      default: '<div class="p-4">卡片内容</div>'
    }
  },
  {
    name: 'Input',
    component: Input,
    category: 'form',
    description: '输入框组件，支持各种类型的文本输入',
    props: { 
      label: '用户名',
      placeholder: '请输入用户名',
      type: 'text'
    }
  },
  {
    name: 'Alert',
    component: Alert,
    category: 'feedback',
    description: '警告提示组件，用于展示重要的提示信息',
    props: { 
      type: 'info',
      title: '提示信息',
      message: '这是一条提示信息',
      closable: true
    }
  },
  {
    name: 'Table',
    component: Table,
    category: 'data',
    description: '表格组件，用于展示结构化数据',
    props: {
      columns: [
        { key: 'name', label: '姓名' },
        { key: 'age', label: '年龄' },
        { key: 'address', label: '地址' }
      ],
      data: [
        { name: '张三', age: 28, address: '北京市' },
        { name: '李四', age: 32, address: '上海市' }
      ]
    }
  },
  {
    name: 'Modal',
    component: null, // 不直接渲染Modal组件
    category: 'feedback',
    description: '模态对话框，用于重要操作的确认或展示详细信息',
    staticPreview: true, // 使用静态预览
    previewContent: `
      <div class="modal-preview border rounded-lg bg-white dark:bg-gray-800 shadow-lg p-4 max-w-full">
        <div class="modal-header border-b pb-2 mb-3 flex justify-between items-center">
          <h3 class="text-lg font-medium">对话框标题</h3>
          <button class="text-gray-500">×</button>
        </div>
        <div class="modal-body py-2">
          这是模态框的内容
        </div>
        <div class="modal-footer border-t pt-3 mt-3 flex justify-end gap-2">
          <button class="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">取消</button>
          <button class="px-3 py-1 bg-blue-500 text-white rounded text-sm">确定</button>
        </div>
      </div>
    `
  },
  {
    name: 'Dropdown',
    component: null, // 不直接渲染Dropdown组件
    category: 'navigation',
    description: '下拉菜单，提供选项列表供用户选择',
    staticPreview: true, // 使用静态预览
    previewContent: `
      <div class="dropdown-preview relative">
        <button class="flex items-center px-4 py-2 border rounded-md bg-white dark:bg-gray-800 shadow-sm">
          <span>下拉菜单</span>
          <i class="fas fa-chevron-down ml-2 text-xs"></i>
        </button>
        <div class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border rounded-md shadow-lg">
          <div class="py-1">
            <a class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">选项 1</a>
            <a class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">选项 2</a>
            <a class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">选项 3</a>
          </div>
        </div>
      </div>
    `
  },
  {
    name: 'TabsNav',
    component: TabsNav,
    category: 'navigation',
    description: '标签页导航，用于在同一区域切换不同内容',
    props: {
      tabs: [
        { id: 'tab1', label: '标签 1' },
        { id: 'tab2', label: '标签 2' },
        { id: 'tab3', label: '标签 3' }
      ],
      activeTab: 'tab1'
    }
  },
  {
    name: 'ThemeSwitcher',
    component: null, // 不直接渲染ThemeSwitcher组件
    category: 'basic',
    description: '主题切换器，用于切换应用的主题样式',
    staticPreview: true, // 使用静态预览
    previewContent: `
      <div class="theme-switcher-preview flex items-center justify-center gap-3">
        <button class="p-2 rounded-full bg-blue-100 text-blue-800 border-2 border-blue-300">
          <i class="fas fa-sun"></i>
        </button>
        <button class="p-2 rounded-full bg-gray-800 text-gray-100 border-2 border-gray-600">
          <i class="fas fa-moon"></i>
        </button>
        <button class="p-2 rounded-full bg-purple-900 text-pink-400 border-2 border-purple-600">
          <i class="fas fa-bolt"></i>
        </button>
      </div>
    `
  },
  {
    name: 'Notification',
    component: null, // 不直接渲染Notification组件
    category: 'feedback',
    description: '通知提醒，用于显示系统通知或操作反馈',
    staticPreview: true, // 使用静态预览
    previewContent: `
      <div class="notification-preview flex items-start p-4 border border-green-100 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-lg">
        <div class="flex-shrink-0 mr-3">
          <i class="fas fa-check-circle text-green-500 text-xl"></i>
        </div>
        <div class="flex-1">
          <h4 class="text-sm font-medium text-green-800 dark:text-green-300">操作成功</h4>
          <p class="text-xs text-green-700 dark:text-green-400 mt-1">数据已成功保存</p>
        </div>
        <button class="text-green-500 hover:text-green-700 dark:hover:text-green-300 ml-3">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `
  },
  {
    name: 'BarChart',
    component: BarChart,
    category: 'chart',
    description: '柱状图，用于比较不同类别的数据大小',
    props: {
      chartData: {
        labels: ['一月', '二月', '三月', '四月'],
        datasets: [{
          label: '销售额',
          data: [12, 19, 8, 15],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        }]
      }
    }
  },
  {
    name: 'LineChart',
    component: LineChart,
    category: 'chart',
    description: '折线图，用于展示随时间变化的连续数据',
    props: {
      chartData: {
        labels: ['一月', '二月', '三月', '四月'],
        datasets: [{
          label: '用户增长',
          data: [65, 59, 80, 81],
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      }
    }
  },
  {
    name: 'PieChart',
    component: PieChart,
    category: 'chart',
    description: '饼图，用于展示部分与整体的关系',
    props: {
      chartData: {
        labels: ['红色', '蓝色', '黄色'],
        datasets: [{
          label: '颜色分布',
          data: [300, 50, 100],
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)'
          ],
          hoverOffset: 4
        }]
      }
    }
  },
  {
    name: 'Form',
    component: Form,
    category: 'form',
    description: '表单容器组件，处理表单提交和验证',
    staticPreview: true,
    previewContent: `
      <div class="form-preview p-4 border rounded-lg bg-white dark:bg-gray-800">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">用户名</label>
          <input type="text" class="block w-full px-3 py-2 border rounded-md" placeholder="请输入用户名">
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">密码</label>
          <input type="password" class="block w-full px-3 py-2 border rounded-md" placeholder="请输入密码">
        </div>
        <div class="flex justify-end">
          <button class="px-4 py-2 bg-blue-500 text-white rounded-md">提交</button>
        </div>
      </div>
    `
  },
  {
    name: 'FormGroup',
    component: FormGroup,
    category: 'form',
    description: '表单项容器，提供标签和错误信息显示',
    props: {
      label: '用户名',
      required: true,
      helpText: '请输入4-16位字符'
    },
    slots: {
      default: '<input class="block w-full px-3 py-2 border rounded-md" placeholder="请输入用户名">'
    }
  },
  {
    name: 'Select',
    component: Select,
    category: 'form',
    description: '下拉选择框，支持选项组和多选',
    props: {
      options: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' },
        { label: '选项3', value: '3' }
      ],
      placeholder: '请选择'
    }
  },
  {
    name: 'Checkbox',
    component: Checkbox,
    category: 'form',
    description: '复选框，支持单个复选框和复选框组',
    props: {
      label: '我同意用户协议',
      modelValue: true
    }
  },
  {
    name: 'Radio',
    component: Radio,
    category: 'form',
    description: '单选按钮，用于在多个选项中选择一个',
    props: {
      label: '选项1',
      value: '1',
      modelValue: '1',
      name: 'demo-radio'
    }
  },
  {
    name: 'Textarea',
    component: Textarea,
    category: 'form',
    description: '多行文本输入，支持自动调整高度',
    props: {
      placeholder: '请输入内容',
      rows: 3,
      autoResize: true
    }
  },
  {
    name: 'Switch',
    component: Switch,
    category: 'form',
    description: '开关组件，用于切换状态',
    props: {
      label: '开启通知',
      modelValue: true
    }
  }
];

// 代码示例数据 - 移除预定义的componentExamples对象，改用动态生成

// 过滤后的组件列表
const filteredComponents = computed(() => {
  return componentsData.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         comp.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = selectedCategory.value === 'all' || comp.category === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });
});

// 显示代码示例的状态
const showCode = ref({});

// 组件挂载时初始化
onMounted(() => {
  componentsData.forEach(comp => {
    showCode.value[comp.name] = false;
  });
});

// 切换代码显示状态
const toggleCode = (componentName) => {
  showCode.value[componentName] = !showCode.value[componentName];
};

// 复制代码到剪贴板
const copyCode = async (code, componentName) => {
  try {
    await navigator.clipboard.writeText(code);
    // 添加复制成功的提示
    copiedComponent.value = componentName;
    setTimeout(() => {
      copiedComponent.value = null;
    }, 2000);
  } catch (err) {
    console.error('复制失败:', err);
  }
};

// 记录当前复制成功的组件
const copiedComponent = ref(null);

// 设置当前选中的分类
const setCategory = (categoryId) => {
  selectedCategory.value = categoryId;
};

// 清除所有筛选条件
const clearFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = 'all';
};

// 生成组件代码的函数
const generateComponentCode = (component) => {
  // 如果是静态预览，返回预览内容的HTML
  if (component.staticPreview) {
    // 为静态预览组件创建一个包装代码
    return generateStaticPreviewCode(component);
  }
  
  // 处理组件属性
  let propsCode = '';
  if (component.props && Object.keys(component.props).length > 0) {
    propsCode = Object.entries(component.props).map(([key, value]) => {
      // 根据值的类型生成不同的代码
      if (typeof value === 'string') {
        return `${key}="${value}"`;
      } else if (typeof value === 'boolean') {
        return value ? key : `:${key}="false"`;
      } else if (typeof value === 'number') {
        return `:${key}="${value}"`;
      } else if (Array.isArray(value) || typeof value === 'object') {
        return `:${key}="${formatObjectForDisplay(value)}"`;
      }
      return '';
    }).filter(prop => prop).join('\n  ');
  }

  // 处理组件插槽
  let slotsCode = '';
  if (component.slots) {
    if (component.slots.default) {
      slotsCode = `\n  ${component.slots.default}\n`;
    }
    
    // 处理具名插槽
    Object.entries(component.slots).forEach(([name, content]) => {
      if (name !== 'default') {
        slotsCode += `\n  <template #${name}>${content}</template>\n`;
      }
    });
  }

  // 生成最终代码
  let code = `<${component.name}`;
  if (propsCode) {
    code += `\n  ${propsCode}`;
  }
  
  if (slotsCode) {
    code += `>${slotsCode}</${component.name}>`;
  } else {
    code += ' />';
  }
  
  return code;
};

// 为静态预览组件生成代码
const generateStaticPreviewCode = (component) => {
  switch (component.name) {
    case 'Modal':
      return `<Modal 
  title="对话框标题" 
  :visible="visible" 
  width="500px"
>
  <div class="p-4">这是模态框的内容</div>
  <template #footer>
    <div class="flex justify-end gap-2">
      <button class="px-4 py-2 bg-gray-200 rounded">取消</button>
      <button class="px-4 py-2 bg-blue-500 text-white rounded">确定</button>
    </div>
  </template>
</Modal>`;
    case 'Dropdown':
      return `<Dropdown 
  label="下拉菜单" 
  :options="[
    { label: '选项 1', value: '1' },
    { label: '选项 2', value: '2' },
    { label: '选项 3', value: '3' }
  ]" 
/>`;
    case 'ThemeSwitcher':
      return `<ThemeSwitcher />`;
    case 'Notification':
      return `<Notification 
  title="操作成功" 
  message="数据已成功保存" 
  type="success" 
  :duration="3000" 
/>`;
    case 'Form':
      return `<Form @submit="handleSubmit">
  <FormGroup label="用户名" required>
    <Input placeholder="请输入用户名" />
  </FormGroup>
  <FormGroup label="密码" required>
    <Input type="password" placeholder="请输入密码" />
  </FormGroup>
  <div class="flex justify-end mt-4">
    <Button text="提交" variant="primary" type="submit" />
  </div>
</Form>`;
    default:
      return `<!-- ${component.name} 静态预览 -->`;
  }
};

// 格式化对象/数组为可读的代码字符串
const formatObjectForDisplay = (value) => {
  if (Array.isArray(value)) {
    // 处理数组
    if (typeof value[0] === 'object') {
      // 如果是对象数组，格式化为多行
      return `[\n    ${value.map(item => formatObjectForDisplay(item)).join(',\n    ')}\n  ]`;
    } else {
      // 简单类型数组
      return `[${value.map(item => typeof item === 'string' ? `'${item}'` : item).join(', ')}]`;
    }
  } else if (typeof value === 'object') {
    // 处理对象
    const entries = Object.entries(value).map(([k, v]) => {
      if (typeof v === 'string') {
        return `${k}: '${v}'`;
      } else if (typeof v === 'object') {
        return `${k}: ${formatObjectForDisplay(v)}`;
      } else {
        return `${k}: ${v}`;
      }
    });
    return `{ ${entries.join(', ')} }`;
  }
  return String(value);
};

// 获取组件代码
const getComponentCode = (component) => {
  if (component.name === 'Button') {
    return `<!-- 基本按钮 -->
<Button variant="primary">基本按钮</Button>

<!-- 不同变体 -->
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="danger">Danger</Button>
<Button variant="warning">Warning</Button>
<Button variant="info">Info</Button>
<Button variant="outline">Outline</Button>

<!-- 不同大小 -->
<Button size="sm">小按钮</Button>
<Button size="md">中按钮</Button>
<Button size="lg">大按钮</Button>

<!-- 不同状态 -->
<Button disabled>禁用按钮</Button>
<Button fullWidth>全宽按钮</Button>

<!-- 带图标按钮 -->
<Button>
  <i class="fas fa-check mr-1"></i>
  带图标按钮
</Button>`;
  }
  return generateComponentCode(component);
};
</script>

<template>
  <div class="components-gallery">
    <div class="gallery-container">
      <!-- 左侧菜单和搜索 -->
      <div class="sidebar-container">
        <h1 class="text-xl font-bold mb-2 text-blue-600 dark:text-blue-400">组件画廊</h1>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-tight">探索和了解项目中的UI组件库</p>
        
        <!-- 搜索 -->
        <div class="mb-6">
          <Input
            label="搜索组件"
            placeholder="输入组件名称或描述"
            v-model="searchQuery"
            type="text"
          />
        </div>

        <!-- 分类菜单 -->
        <h2 class="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 flex items-center">
          <i class="fas fa-layer-group mr-2"></i>组件分类
        </h2>
        
        <div class="category-menu">
          <button
            v-for="category in categories"
            :key="category.id"
            @click="setCategory(category.id)"
            class="w-full px-3 py-2 mb-1 rounded-md text-sm font-medium text-left transition-colors flex items-center"
            :class="[
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
          >
            <i 
              :class="[
                category.id === 'all' ? 'fas fa-th-large' :
                category.id === 'basic' ? 'fas fa-cube' :
                category.id === 'form' ? 'fas fa-edit' :
                category.id === 'data' ? 'fas fa-table' :
                category.id === 'navigation' ? 'fas fa-compass' :
                category.id === 'feedback' ? 'fas fa-bell' :
                category.id === 'chart' ? 'fas fa-chart-bar' :
                'fas fa-box',
                'mr-2 w-5 text-center'
              ]"
            ></i>
            {{ category.name }}
            <span v-if="category.id === 'all'" class="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {{ componentsData.length }}
            </span>
            <span v-else class="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {{ componentsData.filter(c => c.category === category.id).length }}
            </span>
          </button>
        </div>
        
        <div class="sidebar-footer">
          <p class="text-xs text-center text-gray-500 dark:text-gray-400 mb-3">
            展示 {{ filteredComponents.length }} 个组件 / 共 {{ componentsData.length }} 个
          </p>
          
          <Button 
            v-if="searchQuery || selectedCategory !== 'all'" 
            variant="outline" 
            size="sm" 
            @click="clearFilters"
            class="w-full flex items-center justify-center"
          >
            <i class="fas fa-times-circle mr-1.5"></i>
            清除筛选
          </Button>
        </div>
      </div>

      <!-- 右侧组件展示区域 -->
      <div class="main-container">
        <!-- 组件展示区域 -->
        <div v-if="filteredComponents.length > 0" class="space-y-8">
          <Card
            v-for="component in filteredComponents"
            :key="component.name"
            :title="component.name"
            class="component-card"
          >
            <div class="p-4 space-y-4">
              <!-- 组件描述和分类标签 -->
              <div class="flex flex-wrap items-center justify-between mb-2">
                <p class="text-sm text-gray-600 dark:text-gray-400 mr-4 flex-1">
                  {{ component.description }}
                </p>
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 whitespace-nowrap">
                  <i 
                    :class="[
                      component.category === 'basic' ? 'fas fa-cube' :
                      component.category === 'form' ? 'fas fa-edit' :
                      component.category === 'data' ? 'fas fa-table' :
                      component.category === 'navigation' ? 'fas fa-compass' :
                      component.category === 'feedback' ? 'fas fa-bell' :
                      component.category === 'chart' ? 'fas fa-chart-bar' :
                      'fas fa-box',
                      'mr-1'
                    ]"
                  ></i>
                  {{ categories.find(c => c.id === component.category)?.name || component.category }}
                </span>
              </div>

              <!-- 组件预览 -->
              <div class="component-preview p-6 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                <!-- Button组件特殊渲染 -->
                <div v-if="component.name === 'Button'" class="button-variants-preview flex flex-col gap-6 w-full">
                  <!-- 不同变体按钮 -->
                  <div class="variants">
                    <h4 class="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">按钮变体</h4>
                    <div class="flex flex-wrap gap-3">
                      <Button variant="primary">Primary</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="success">Success</Button>
                      <Button variant="danger">Danger</Button>
                      <Button variant="warning">Warning</Button>
                      <Button variant="info">Info</Button>
                      <Button variant="outline">Outline</Button>
                    </div>
                  </div>
                  
                  <!-- 不同大小按钮 -->
                  <div class="sizes">
                    <h4 class="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">按钮大小</h4>
                    <div class="flex items-center gap-3">
                      <Button size="sm" variant="primary">小按钮</Button>
                      <Button size="md" variant="primary">中按钮</Button>
                      <Button size="lg" variant="primary">大按钮</Button>
                    </div>
                  </div>
                  
                  <!-- 按钮状态 -->
                  <div class="states">
                    <h4 class="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">按钮状态</h4>
                    <div class="flex flex-col gap-3">
                      <div class="flex items-center gap-3">
                        <Button variant="primary">
                          <i class="fas fa-check mr-1"></i>
                          带图标按钮
                        </Button>
                        <Button disabled variant="primary">禁用按钮</Button>
                      </div>
                      <Button fullWidth variant="primary">全宽按钮</Button>
                    </div>
                  </div>
                </div>
                
                <!-- 其他组件渲染 -->
                <component
                  v-else
                  :is="component.component"
                  v-bind="component.props"
                >
                  <template v-if="component.slots?.default" v-html="component.slots.default"></template>
                  <template v-if="component.slots?.footer" #footer v-html="component.slots.footer"></template>
                </component>
                <div v-if="component.staticPreview" v-html="component.previewContent" class="w-full"></div>
              </div>

              <!-- 代码示例控制区 -->
              <div class="flex justify-between items-center border-t pt-3 mt-3 border-gray-100 dark:border-gray-700">
                <button
                  @click="toggleCode(component.name)"
                  class="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  <i :class="[showCode[component.name] ? 'fas fa-code-branch' : 'fas fa-code', 'mr-1.5']"></i>
                  <span v-if="showCode[component.name]">隐藏代码</span>
                  <span v-else>查看代码</span>
                </button>
                
                <button
                  v-if="showCode[component.name]"
                  @click="copyCode(getComponentCode(component), component.name)"
                  class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center relative"
                >
                  <i class="fas fa-copy mr-1.5"></i>
                  复制代码
                  <span 
                    v-if="copiedComponent === component.name" 
                    class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded text-xs whitespace-nowrap"
                  >
                    复制成功!
                  </span>
                </button>
              </div>

              <!-- 代码示例 -->
              <div v-if="showCode[component.name]" class="code-container">
                <pre class="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm font-mono"><code>{{ getComponentCode(component) }}</code></pre>
              </div>
            </div>
          </Card>
        </div>

        <!-- 没有匹配结果时显示 -->
        <div v-else class="empty-state text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
          <p class="text-xl text-gray-600 dark:text-gray-400 mb-3">未找到匹配的组件</p>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-6 max-w-md mx-auto">
            没有找到符合当前筛选条件的组件。请尝试调整搜索关键词或选择不同的分类。
          </p>
          <Button 
            variant="primary" 
            @click="clearFilters"
          >
            显示全部组件
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.components-gallery {
  height: calc(100vh - 130px); /* 减去导航栏和标签栏的高度 */
  overflow: hidden;
}

.gallery-container {
  display: grid;
  grid-template-columns: 260px 1fr;
  height: 100%;
}

.sidebar-container {
  padding: 1rem;
  border-right: 1px solid rgba(229, 231, 235, 0.5);
  background-color: rgba(249, 250, 251, 0.7);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.category-menu {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.sidebar-footer {
  padding-top: 1rem;
  border-top: 1px solid rgba(229, 231, 235, 0.5);
}

.main-container {
  padding: 1rem 1.5rem;
  background-color: rgba(249, 250, 251, 0.3);
  overflow-y: auto;
  height: 100%;
}

:deep(.dark) .sidebar-container {
  border-right-color: rgba(55, 65, 81, 0.5);
  background-color: rgba(31, 41, 55, 0.3);
}

:deep(.dark) .sidebar-footer {
  border-top-color: rgba(55, 65, 81, 0.5);
}

:deep(.dark) .main-container {
  background-color: rgba(17, 24, 39, 0.2);
}

.component-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(229, 231, 235, 0.7);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

:deep(.dark) .component-card {
  border-color: rgba(55, 65, 81, 0.5);
}

.component-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
}

.component-preview {
  transition: background-color 0.3s ease;
  position: relative;
  min-height: 120px;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
}

/* 隐藏模态框的关闭按钮，防止组件预览区域过于复杂 */
.component-preview .modal-close {
  display: none;
}

/* 调整模态框在预览中的样式 */
.component-preview .modal-container {
  position: relative;
  transform: none;
  max-height: 300px;
  overflow: hidden;
}

/* 防止图表组件溢出 */
.component-preview canvas {
  max-width: 100%;
  max-height: 200px;
}

.category-menu::-webkit-scrollbar {
  width: 4px;
}

.category-menu::-webkit-scrollbar-track {
  background: transparent;
}

.category-menu::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

.code-container {
  position: relative;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-top: 1rem;
}

.code-container pre {
  margin: 0;
  border-radius: 0;
  line-height: 1.5;
  tab-size: 2;
  white-space: pre-wrap;
  word-break: break-word;
}

.code-container code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .gallery-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  
  .sidebar-container {
    border-right: none;
    border-bottom: 1px solid rgba(229, 231, 235, 0.5);
    padding-bottom: 1rem;
    max-height: 300px;
  }
  
  :deep(.dark) .sidebar-container {
    border-bottom-color: rgba(55, 65, 81, 0.5);
  }
  
  .category-menu {
    max-height: 150px;
  }
  
  .sidebar-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .sidebar-footer button {
    max-width: 200px;
    margin-top: 0.5rem;
  }
}
</style> 