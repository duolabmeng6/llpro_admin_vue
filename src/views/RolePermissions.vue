<script setup>
import { ref } from 'vue'

// 权限数据
const permissions = ref([
  { id: 'users_manage', name: '管理用户', description: '创建、编辑和删除用户', enabled: true },
  { id: 'roles_manage', name: '管理角色', description: '创建、编辑和删除角色', enabled: true },
  { id: 'settings_manage', name: '管理设置', description: '修改系统设置', enabled: true },
  { id: 'dashboard_view', name: '查看仪表盘', description: '访问系统仪表盘', enabled: true },
  { id: 'content_edit', name: '编辑内容', description: '编辑系统内容', enabled: false }
])

// 角色数据
const roles = ref([
  { id: '1', name: '管理员', description: '拥有所有功能的完全访问权限' },
  { id: '2', name: '编辑者', description: '可以编辑内容但不能管理用户或角色' },
  { id: '3', name: '查看者', description: '对内容的只读访问权限' }
])

// 选中的角色
const selectedRole = ref(roles.value[0])

// 切换角色选择
const selectRole = (role) => {
  selectedRole.value = role
}

// 切换权限状态
const togglePermission = (permission) => {
  permission.enabled = !permission.enabled
}

// 保存权限设置
const savePermissions = () => {
  // 实际项目中这里会调用API保存权限设置
  alert('权限设置已保存')
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900">权限设置</h1>
    <p class="mt-1 text-sm text-gray-500">
      管理角色的权限设置
    </p>
    
    <div class="mt-6 bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">
          选择角色
        </h3>
      </div>
      <div class="px-6 py-5">
        <div class="flex space-x-4">
          <button
            v-for="role in roles"
            :key="role.id"
            class="px-4 py-2 rounded-md"
            :class="[
              selectedRole.id === role.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
            @click="selectRole(role)"
          >
            {{ role.name }}
          </button>
        </div>
        <p class="mt-2 text-sm text-gray-500">
          {{ selectedRole.description }}
        </p>
      </div>
    </div>
    
    <div class="mt-6 bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">
          权限列表
        </h3>
        <button
          class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          @click="savePermissions"
        >
          保存设置
        </button>
      </div>
      <div class="px-6 py-5">
        <div class="space-y-4">
          <div
            v-for="permission in permissions"
            :key="permission.id"
            class="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <h4 class="text-base font-medium text-gray-900">{{ permission.name }}</h4>
              <p class="text-sm text-gray-500">{{ permission.description }}</p>
            </div>
            <div class="flex items-center">
              <button
                class="relative inline-flex items-center h-6 rounded-full w-11"
                :class="[
                  permission.enabled ? 'bg-primary-600' : 'bg-gray-200'
                ]"
                @click="togglePermission(permission)"
              >
                <span
                  class="inline-block w-4 h-4 transform bg-white rounded-full transition"
                  :class="[
                    permission.enabled ? 'translate-x-6' : 'translate-x-1'
                  ]"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 