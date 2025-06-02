/**
 * 菜单配置
 * id: 唯一标识
 * title: 菜单标题
 * path: 路由路径
 * icon: Font Awesome图标类名
 * children: 子菜单
 * external: 是否为外部链接
 * externalUrl: 外部链接地址（当external为true时必须提供）
 * newWindow: 是否在新窗口打开（默认false，在iframe中打开）
 */

export const menuConfig = [
  {
    id: 'dashboard',
    title: '仪表盘',
    path: '/dashboard',
    icon: 'fa-solid fa-house',
    children: []
  },
  {
    id: 'components',
    title: '组件画廊',
    path: '/components',
    icon: 'fa-solid fa-puzzle-piece',
    children: []
  },
  {
    id: 'course-management',
    title: '课程管理',
    path: '/courses',
    icon: 'fa-solid fa-book',
    children: []
  },
  {
    id: 'examples',
    title: '示例',
    path: '/examples',
    icon: 'fa-solid fa-flask',
    children: [
      {
        id: 'form-example',
        title: '表单组件',
        path: '/examples/form',
        icon: 'fa-solid fa-clipboard-list'
      }
    ]
  },
  {
    id: 'upload-demo',
    title: '多图上传',
    path: '/upload-demo',
    icon: 'fa-solid fa-upload',
    children: []
  },
  {
    id: 'markdown-editor',
    title: 'Markdown编辑器',
    path: '/markdown-editor',
    icon: 'fa-solid fa-pen-to-square',
    children: []
  },
  {
    id: 'user',
    title: '用户管理',
    path: '/users',
    icon: 'fa-solid fa-users',
    children: [
      {
        id: 'user-list',
        title: '用户列表',
        path: '/users',
        icon: 'fa-solid fa-list'
      },
      {
        id: 'user-profile',
        title: '用户档案',
        path: '/users/profile',
        icon: 'fa-solid fa-id-card'
      }
    ]
  },
  {
    id: 'role',
    title: '角色管理',
    path: '/roles',
    icon: 'fa-solid fa-shield-halved',
    children: [
      {
        id: 'role-list',
        title: '角色列表',
        path: '/roles',
        icon: 'fa-solid fa-list-check'
      },
      {
        id: 'role-permission',
        title: '权限设置',
        path: '/roles/permissions',
        icon: 'fa-solid fa-key'
      }
    ]
  },
  {
    id: 'settings',
    title: '系统设置',
    path: '/settings',
    icon: 'fa-solid fa-gear',
    children: [
      {
        id: 'system-config',
        title: '系统配置',
        path: '/settings',
        icon: 'fa-solid fa-sliders'
      },
      {
        id: 'backup',
        title: '备份恢复',
        path: '/settings/backup',
        icon: 'fa-solid fa-database'
      }
    ]
  },
  {
    id: 'external-links',
    title: '外部链接',
    path: '/external',
    icon: 'fa-solid fa-link',
    children: [
      {
        id: 'vue-docs',
        title: 'Vue文档',
        path: '/iframe',
        icon: 'fa-brands fa-vuejs',
        external: true,
        externalUrl: 'https://cn.vuejs.org/',
        newWindow: true
      },
      {
        id: 'tailwind-docs',
        title: 'Tailwind文档',
        path: '/iframe',
        icon: 'fa-solid fa-wind',
        external: true,
        externalUrl: 'https://tailwindcss.com/docs'
      },
      {
        id: 'baidu',
        title: '必应搜索',
        path: '/iframe',
        icon: 'fa-solid fa-search',
        external: true,
        externalUrl: 'https://cn.bing.com/',
        newWindow: true
      }
    ]
  }
] 