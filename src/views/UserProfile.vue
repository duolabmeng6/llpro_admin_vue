<script setup>
import { ref } from 'vue'

// 用户档案数据
const userProfile = ref({
  id: '1',
  username: '管理员',
  email: 'admin@example.com',
  role: '管理员',
  lastLogin: '2023-05-20 14:30:45',
  createdAt: '2023-01-01 00:00:00',
  status: '活跃',
  permissions: ['users_manage', 'roles_manage', 'settings_manage', 'dashboard_view']
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900">用户档案</h1>
    <p class="mt-1 text-sm text-gray-500">
      查看和管理用户详细信息
    </p>
    
    <div class="mt-6 bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">
          基本信息
        </h3>
      </div>
      <div class="px-6 py-5">
        <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt class="text-sm font-medium text-gray-500">用户名</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ userProfile.username }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">邮箱</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ userProfile.email }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">角色</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ userProfile.role }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">状态</dt>
            <dd class="mt-1 text-sm text-gray-900">
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                {{ userProfile.status }}
              </span>
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">创建时间</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ userProfile.createdAt }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">最后登录</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ userProfile.lastLogin }}</dd>
          </div>
        </dl>
      </div>
    </div>
    
    <div class="mt-6 bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">
          权限信息
        </h3>
      </div>
      <div class="px-6 py-5">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(permission, index) in userProfile.permissions"
            :key="index"
            class="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800"
          >
            {{ permission }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template> 