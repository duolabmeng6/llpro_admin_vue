import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'dashboard' }
      },
      {
        path: 'components',
        name: 'ComponentsGallery',
        component: () => import('../views/ComponentsGallery.vue'),
        meta: { title: '组件画廊', icon: 'components' }
      },
      {
        path: 'examples/form',
        name: 'FormExample',
        component: () => import('../views/examples/FormExample.vue'),
        meta: { title: '表单组件示例', icon: 'form' }
      },
      {
        path: 'upload-demo',
        name: 'UploadDemo',
        component: () => import('../views/UploadDemo.vue'),
        meta: { title: '多图上传示例', icon: 'upload' }
      },
      {
        path: 'markdown-editor',
        name: 'MarkdownEditorDemo',
        component: () => import('../views/MarkdownEditorDemo.vue'),
        meta: { title: 'Markdown编辑器', icon: 'edit' }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('../views/UserManagement.vue'),
        meta: { title: '用户管理', icon: 'users' }
      },
      {
        path: 'users/profile',
        name: 'UserProfile',
        component: () => import('../views/UserProfile.vue'),
        meta: { title: '用户档案', icon: 'users' }
      },
      {
        path: 'roles',
        name: 'RoleManagement',
        component: () => import('../views/RoleManagement.vue'),
        meta: { title: '角色管理', icon: 'roles' }
      },
      {
        path: 'roles/permissions',
        name: 'RolePermissions',
        component: () => import('../views/RolePermissions.vue'),
        meta: { title: '权限设置', icon: 'roles' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue'),
        meta: { title: '系统设置', icon: 'settings' }
      },
      {
        path: 'settings/backup',
        name: 'Backup',
        component: () => import('../views/Backup.vue'),
        meta: { title: '备份恢复', icon: 'settings' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: '页面未找到' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/dashboard')
  } else {
    // 设置页面标题
    document.title = to.meta.title ? `${to.meta.title} - LL Pro 管理系统` : 'LL Pro 管理系统'
    next()
  }
})

export default router 