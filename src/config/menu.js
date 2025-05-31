/**
 * 菜单配置
 * id: 唯一标识
 * title: 菜单标题
 * path: 路由路径
 * icon: 图标SVG路径
 * children: 子菜单
 */

export const menuConfig = [
  {
    id: 'dashboard',
    title: '仪表盘',
    path: '/dashboard',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />`,
    children: []
  },
  {
    id: 'user',
    title: '用户管理',
    path: '/users',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />`,
    children: [
      {
        id: 'user-list',
        title: '用户列表',
        path: '/users',
        icon: ''
      },
      {
        id: 'user-profile',
        title: '用户档案',
        path: '/users/profile',
        icon: ''
      }
    ]
  },
  {
    id: 'role',
    title: '角色管理',
    path: '/roles',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />`,
    children: [
      {
        id: 'role-list',
        title: '角色列表',
        path: '/roles',
        icon: ''
      },
      {
        id: 'role-permission',
        title: '权限设置',
        path: '/roles/permissions',
        icon: ''
      }
    ]
  },
  {
    id: 'settings',
    title: '系统设置',
    path: '/settings',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />`,
    children: [
      {
        id: 'system-config',
        title: '系统配置',
        path: '/settings',
        icon: ''
      },
      {
        id: 'backup',
        title: '备份恢复',
        path: '/settings/backup',
        icon: ''
      }
    ]
  }
] 