<script setup>
import { ref } from 'vue'

// Mock roles data
const roles = ref([
  {
    id: '1',
    name: '管理员',
    description: '拥有所有功能的完全访问权限',
    permissions: ['users_manage', 'roles_manage', 'settings_manage', 'dashboard_view']
  },
  {
    id: '2',
    name: '编辑者',
    description: '可以编辑内容但不能管理用户或角色',
    permissions: ['dashboard_view', 'content_edit']
  },
  {
    id: '3',
    name: '查看者',
    description: '对内容的只读访问权限',
    permissions: ['dashboard_view']
  }
])

// Available permissions
const availablePermissions = ref([
  { id: 'users_manage', name: '管理用户' },
  { id: 'roles_manage', name: '管理角色' },
  { id: 'settings_manage', name: '管理设置' },
  { id: 'dashboard_view', name: '查看仪表盘' },
  { id: 'content_edit', name: '编辑内容' }
])

// Form state
const showForm = ref(false)
const isEditing = ref(false)
const formData = ref({
  id: '',
  name: '',
  description: '',
  permissions: []
})

// Messages
const successMessage = ref('')
const errorMessage = ref('')

// Reset form
const resetForm = () => {
  formData.value = {
    id: '',
    name: '',
    description: '',
    permissions: []
  }
  isEditing.value = false
  errorMessage.value = ''
}

// Open form for adding a new role
const openAddForm = () => {
  resetForm()
  showForm.value = true
}

// Open form for editing an existing role
const openEditForm = (role) => {
  formData.value = { ...role }
  isEditing.value = true
  showForm.value = true
}

// Handle form submission
const handleSubmit = () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    if (isEditing.value) {
      // Find and update existing role
      const index = roles.value.findIndex(role => role.id === formData.value.id)
      if (index !== -1) {
        roles.value[index] = { ...formData.value }
      }
      successMessage.value = '角色更新成功'
    } else {
      // Add new role with generated ID
      const newRole = {
        ...formData.value,
        id: Date.now().toString()
      }
      roles.value.push(newRole)
      successMessage.value = '角色创建成功'
    }
    
    showForm.value = false
    resetForm()
  } catch (error) {
    errorMessage.value = '发生错误'
  }
}

// Handle role deletion
const handleDelete = (roleId) => {
  if (!confirm('确定要删除此角色吗？')) {
    return
  }
  
  try {
    roles.value = roles.value.filter(role => role.id !== roleId)
    successMessage.value = '角色删除成功'
  } catch (error) {
    errorMessage.value = '删除角色失败'
  }
}

// Check if permission is assigned to role
const hasPermission = (role, permissionId) => {
  return role.permissions.includes(permissionId)
}
</script>

<template>
  <div>
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">角色管理</h1>
        <p class="mt-2 text-sm text-gray-700">
          管理角色和权限
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <button
          class="btn btn-primary"
          @click="openAddForm"
        >
          添加角色
        </button>
      </div>
    </div>
    
    <!-- Success/error messages -->
    <div v-if="successMessage" class="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
      {{ errorMessage }}
    </div>
    
    <!-- Role form -->
    <div v-if="showForm" class="mt-6 bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900">
        {{ isEditing ? '编辑角色' : '添加角色' }}
      </h2>
      
      <form class="mt-4 space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="name" class="form-label">角色名称</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="form-input"
            required
          />
        </div>
        
        <div>
          <label for="description" class="form-label">描述</label>
          <textarea
            id="description"
            v-model="formData.description"
            class="form-input"
            rows="3"
          ></textarea>
        </div>
        
        <div>
          <label class="form-label">权限</label>
          <div class="mt-2 space-y-2">
            <div
              v-for="permission in availablePermissions"
              :key="permission.id"
              class="flex items-center"
            >
              <input
                :id="'permission-' + permission.id"
                type="checkbox"
                :value="permission.id"
                v-model="formData.permissions"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                :for="'permission-' + permission.id"
                class="ml-2 block text-sm text-gray-900"
              >
                {{ permission.name }}
              </label>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            class="btn btn-outline"
            @click="showForm = false"
          >
            取消
          </button>
          <button
            type="submit"
            class="btn btn-primary"
          >
            {{ isEditing ? '更新' : '创建' }}
          </button>
        </div>
      </form>
    </div>
    
    <!-- Roles list -->
    <div class="mt-6 space-y-6">
      <div
        v-for="role in roles"
        :key="role.id"
        class="bg-white shadow rounded-lg overflow-hidden"
      >
        <div class="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 class="text-lg font-medium text-gray-900">
              {{ role.name }}
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ role.description }}
            </p>
          </div>
          <div class="flex space-x-3">
            <button
              class="text-primary-600 hover:text-primary-900"
              @click="openEditForm(role)"
            >
              编辑
            </button>
            <button
              class="text-red-600 hover:text-red-900"
              @click="handleDelete(role.id)"
              :disabled="role.name === '管理员'"
            >
              删除
            </button>
          </div>
        </div>
        <div class="px-6 py-4">
          <h4 class="text-sm font-medium text-gray-900">权限</h4>
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="permission in availablePermissions"
              :key="permission.id"
              :class="[
                'px-2 py-1 text-xs font-medium rounded-full',
                hasPermission(role, permission.id)
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-400'
              ]"
            >
              {{ permission.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 