<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../stores/users'

const userStore = useUserStore()
const isLoading = computed(() => userStore.loading)
const users = computed(() => userStore.users)

// Form state
const showForm = ref(false)
const isEditing = ref(false)
const formData = ref({
  id: '',
  username: '',
  email: '',
  role: 'viewer',
  status: 'active'
})

// Error and success messages
const errorMessage = ref('')
const successMessage = ref('')

// Fetch users on component mount
onMounted(async () => {
  try {
    await userStore.fetchUsers()
  } catch (error) {
    errorMessage.value = '加载用户失败'
  }
})

// Reset form
const resetForm = () => {
  formData.value = {
    id: '',
    username: '',
    email: '',
    role: 'viewer',
    status: 'active'
  }
  isEditing.value = false
  errorMessage.value = ''
}

// Open form for adding a new user
const openAddForm = () => {
  resetForm()
  showForm.value = true
}

// Open form for editing an existing user
const openEditForm = (user) => {
  formData.value = { ...user }
  isEditing.value = true
  showForm.value = true
}

// Handle form submission
const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    if (isEditing.value) {
      await userStore.updateUser(formData.value.id, formData.value)
      successMessage.value = '用户更新成功'
    } else {
      await userStore.createUser(formData.value)
      successMessage.value = '用户创建成功'
    }
    
    showForm.value = false
    resetForm()
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '发生错误'
  }
}

// Handle user deletion
const handleDelete = async (userId) => {
  if (!confirm('确定要删除此用户吗？')) {
    return
  }
  
  try {
    await userStore.deleteUser(userId)
    successMessage.value = '用户删除成功'
  } catch (error) {
    errorMessage.value = '删除用户失败'
  }
}

// Get badge color based on status
const getStatusColor = (status) => {
  return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
}

// Get badge color based on role
const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800'
    case 'editor':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div>
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">用户管理</h1>
        <p class="mt-2 text-sm text-gray-700">
          管理用户账户和权限
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <button
          class="btn btn-primary"
          @click="openAddForm"
        >
          添加用户
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
    
    <!-- User form -->
    <div v-if="showForm" class="mt-6 bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900">
        {{ isEditing ? '编辑用户' : '添加用户' }}
      </h2>
      
      <form class="mt-4 space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="username" class="form-label">用户名</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            class="form-input"
            required
          />
        </div>
        
        <div>
          <label for="email" class="form-label">邮箱</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="form-input"
            required
          />
        </div>
        
        <div>
          <label for="role" class="form-label">角色</label>
          <select
            id="role"
            v-model="formData.role"
            class="form-input"
          >
            <option value="admin">管理员</option>
            <option value="editor">编辑者</option>
            <option value="viewer">查看者</option>
          </select>
        </div>
        
        <div>
          <label for="status" class="form-label">状态</label>
          <select
            id="status"
            v-model="formData.status"
            class="form-input"
          >
            <option value="active">活跃</option>
            <option value="inactive">非活跃</option>
          </select>
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
            :disabled="isLoading"
          >
            {{ isEditing ? '更新' : '创建' }}
          </button>
        </div>
      </form>
    </div>
    
    <!-- Users table -->
    <div class="mt-6 bg-white shadow rounded-lg">
      <div v-if="isLoading" class="p-6 text-center text-gray-500">
        正在加载用户...
      </div>
      
      <div v-else-if="users.length === 0" class="p-6 text-center text-gray-500">
        未找到用户
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用户
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                角色
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.username }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', getRoleColor(user.role)]">
                  {{ user.role === 'admin' ? '管理员' : user.role === 'editor' ? '编辑者' : '查看者' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', getStatusColor(user.status)]">
                  {{ user.status === 'active' ? '活跃' : '非活跃' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ new Date(user.createdAt).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  class="text-primary-600 hover:text-primary-900 mr-3"
                  @click="openEditForm(user)"
                >
                  编辑
                </button>
                <button
                  class="text-red-600 hover:text-red-900"
                  @click="handleDelete(user.id)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template> 