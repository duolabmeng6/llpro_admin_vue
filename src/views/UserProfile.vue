<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRoute } from 'vue-router'

const authStore = useAuthStore()
const route = useRoute()

// 选项卡管理
const activeTab = ref('profile')

// 监听路由查询参数，切换选项卡
onMounted(() => {
  if (route.query.tab === 'account') {
    activeTab.value = 'account'
  }
})

// 用户档案数据
const userProfile = ref({
  id: '1',
  username: '管理员',
  email: 'admin@example.com',
  firstName: '张',
  lastName: '三',
  phone: '13800138000',
  role: '管理员',
  department: '技术部',
  lastLogin: '2023-05-20 14:30:45',
  createdAt: '2023-01-01 00:00:00',
  status: '活跃',
  bio: '系统管理员，负责系统维护和用户管理。',
  permissions: ['users_manage', 'roles_manage', 'settings_manage', 'dashboard_view']
})

// 编辑模式
const isEditing = ref(false)
const editForm = ref({...userProfile.value})

// 开始编辑
const startEditing = () => {
  editForm.value = {...userProfile.value}
  isEditing.value = true
}

// 保存编辑
const saveProfile = () => {
  // 这里应该有API调用保存数据
  userProfile.value = {...editForm.value}
  isEditing.value = false
  
  // 显示成功消息
  successMessage.value = '个人资料已更新'
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// 取消编辑
const cancelEditing = () => {
  isEditing.value = false
}

// 头像上传
const avatarFile = ref(null)
const previewAvatar = ref(null)

const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  avatarFile.value = file
  
  // 预览头像
  const reader = new FileReader()
  reader.onload = (e) => {
    previewAvatar.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const uploadAvatar = async () => {
  if (!avatarFile.value) return
  
  try {
    // 模拟上传头像
    // 实际应用中应该调用API上传文件
    const avatarUrl = previewAvatar.value
    await authStore.updateAvatar(avatarUrl)
    
    // 显示成功消息
    successMessage.value = '头像已更新'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    
    // 重置上传状态
    avatarFile.value = null
  } catch (error) {
    errorMessage.value = '上传头像失败'
  }
}

// 账户设置 - 密码修改
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const changePassword = () => {
  // 验证密码
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    errorMessage.value = '两次输入的新密码不一致'
    return
  }
  
  // 这里应该有API调用修改密码
  
  // 显示成功消息
  successMessage.value = '密码已修改'
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
  
  // 重置表单
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

// 通知偏好设置
const notificationPreferences = ref({
  emailNotifications: true,
  smsNotifications: false,
  systemNotifications: true,
  marketingEmails: false
})

const saveNotificationPreferences = () => {
  // 这里应该有API调用保存通知偏好
  
  // 显示成功消息
  successMessage.value = '通知偏好已更新'
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// 隐私设置
const privacySettings = ref({
  profileVisibility: 'all',
  activityVisibility: 'team',
  showOnlineStatus: true
})

const savePrivacySettings = () => {
  // 这里应该有API调用保存隐私设置
  
  // 显示成功消息
  successMessage.value = '隐私设置已更新'
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// 消息提示
const successMessage = ref('')
const errorMessage = ref('')
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900">个人中心</h1>
    <p class="mt-1 text-sm text-gray-500">
      管理您的个人信息和账户设置
    </p>
    
    <!-- 成功/错误消息 -->
    <div v-if="successMessage" class="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
      {{ errorMessage }}
    </div>
    
    <!-- 选项卡 -->
    <div class="mt-6">
      <div class="settings-tabs border-b border-gray-200">
        <div class="tabs-container flex">
          <button
            @click="activeTab = 'profile'"
            class="settings-tab relative px-6 py-3 font-medium text-sm transition-all duration-300"
            :class="[
              activeTab === 'profile'
                ? 'settings-tab-active' 
                : 'settings-tab-inactive'
            ]"
          >
            <i class="fa-solid fa-user mr-2"></i>
            个人资料
          </button>
          <button
            @click="activeTab = 'account'"
            class="settings-tab relative px-6 py-3 font-medium text-sm transition-all duration-300"
            :class="[
              activeTab === 'account'
                ? 'settings-tab-active' 
                : 'settings-tab-inactive'
            ]"
          >
            <i class="fa-solid fa-cog mr-2"></i>
            账户设置
          </button>
        </div>
      </div>
      
      <!-- 个人资料选项卡 -->
      <div v-if="activeTab === 'profile'" class="mt-6">
        <!-- 头像上传区域 -->
        <div class="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div class="px-6 py-5 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              个人头像
            </h3>
          </div>
          <div class="px-6 py-5 flex items-center">
            <div class="flex-shrink-0">
              <div class="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                <img 
                  v-if="previewAvatar || authStore.userAvatar" 
                  :src="previewAvatar || authStore.userAvatar" 
                  alt="用户头像" 
                  class="h-full w-full object-cover"
                />
                <div v-else class="h-full w-full flex items-center justify-center bg-gray-200">
                  <i class="fas fa-user text-gray-400 text-xl"></i>
                </div>
              </div>
            </div>
            <div class="ml-6">
              <div class="mb-2">
                <label class="block text-sm font-medium text-gray-700">更换头像</label>
                <input 
                  type="file" 
                  @change="handleAvatarChange" 
                  accept="image/*"
                  class="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100"
                />
              </div>
              <button 
                v-if="avatarFile"
                @click="uploadAvatar"
                class="btn btn-primary btn-sm"
              >
                上传头像
              </button>
            </div>
          </div>
        </div>
        
        <!-- 基本信息区域 -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">
              基本信息
            </h3>
            <div v-if="!isEditing">
              <button @click="startEditing" class="btn btn-primary btn-sm">
                <i class="fas fa-edit mr-1"></i> 编辑资料
              </button>
            </div>
          </div>
          
          <!-- 查看模式 -->
          <div v-if="!isEditing" class="px-6 py-5">
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
                <dt class="text-sm font-medium text-gray-500">姓名</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ userProfile.firstName }} {{ userProfile.lastName }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">电话</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ userProfile.phone }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">部门</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ userProfile.department }}</dd>
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
              <div class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500">个人简介</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ userProfile.bio }}</dd>
              </div>
            </dl>
          </div>
          
          <!-- 编辑模式 -->
          <div v-else class="px-6 py-5">
            <form @submit.prevent="saveProfile">
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label for="username" class="block text-sm font-medium text-gray-700">用户名</label>
                  <input
                    id="username"
                    v-model="editForm.username"
                    type="text"
                    class="form-input"
                    disabled
                  />
                </div>
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700">邮箱</label>
                  <input
                    id="email"
                    v-model="editForm.email"
                    type="email"
                    class="form-input"
                  />
                </div>
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-700">姓</label>
                  <input
                    id="firstName"
                    v-model="editForm.firstName"
                    type="text"
                    class="form-input"
                  />
                </div>
                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-700">名</label>
                  <input
                    id="lastName"
                    v-model="editForm.lastName"
                    type="text"
                    class="form-input"
                  />
                </div>
                <div>
                  <label for="phone" class="block text-sm font-medium text-gray-700">电话</label>
                  <input
                    id="phone"
                    v-model="editForm.phone"
                    type="text"
                    class="form-input"
                  />
                </div>
                <div>
                  <label for="department" class="block text-sm font-medium text-gray-700">部门</label>
                  <input
                    id="department"
                    v-model="editForm.department"
                    type="text"
                    class="form-input"
                  />
                </div>
                <div class="sm:col-span-2">
                  <label for="bio" class="block text-sm font-medium text-gray-700">个人简介</label>
                  <textarea
                    id="bio"
                    v-model="editForm.bio"
                    rows="3"
                    class="form-input"
                  ></textarea>
                </div>
              </div>
              
              <div class="mt-6 flex justify-end space-x-3">
                <button type="button" @click="cancelEditing" class="btn btn-secondary">
                  取消
                </button>
                <button type="submit" class="btn btn-primary">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- 权限信息区域 -->
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
      
      <!-- 账户设置选项卡 -->
      <div v-if="activeTab === 'account'" class="mt-6">
        <!-- 密码修改 -->
        <div class="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div class="px-6 py-5 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              修改密码
            </h3>
          </div>
          <div class="px-6 py-5">
            <form @submit.prevent="changePassword">
              <div class="space-y-4">
                <div>
                  <label for="currentPassword" class="block text-sm font-medium text-gray-700">当前密码</label>
                  <input
                    id="currentPassword"
                    v-model="passwordForm.currentPassword"
                    type="password"
                    class="form-input"
                    required
                  />
                </div>
                <div>
                  <label for="newPassword" class="block text-sm font-medium text-gray-700">新密码</label>
                  <input
                    id="newPassword"
                    v-model="passwordForm.newPassword"
                    type="password"
                    class="form-input"
                    required
                  />
                </div>
                <div>
                  <label for="confirmPassword" class="block text-sm font-medium text-gray-700">确认新密码</label>
                  <input
                    id="confirmPassword"
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    class="form-input"
                    required
                  />
                </div>
              </div>
              
              <div class="mt-6 flex justify-end">
                <button type="submit" class="btn btn-primary">
                  更新密码
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- 通知偏好设置 -->
        <div class="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div class="px-6 py-5 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              通知偏好设置
            </h3>
          </div>
          <div class="px-6 py-5">
            <form @submit.prevent="saveNotificationPreferences">
              <fieldset>
                <legend class="sr-only">通知选项</legend>
                <div class="space-y-4">
                  <div class="flex items-center">
                    <input
                      id="emailNotifications"
                      v-model="notificationPreferences.emailNotifications"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label for="emailNotifications" class="ml-3 block text-sm font-medium text-gray-700">
                      接收邮件通知
                    </label>
                  </div>
                  <div class="flex items-center">
                    <input
                      id="smsNotifications"
                      v-model="notificationPreferences.smsNotifications"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label for="smsNotifications" class="ml-3 block text-sm font-medium text-gray-700">
                      接收短信通知
                    </label>
                  </div>
                  <div class="flex items-center">
                    <input
                      id="systemNotifications"
                      v-model="notificationPreferences.systemNotifications"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label for="systemNotifications" class="ml-3 block text-sm font-medium text-gray-700">
                      接收系统通知
                    </label>
                  </div>
                  <div class="flex items-center">
                    <input
                      id="marketingEmails"
                      v-model="notificationPreferences.marketingEmails"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label for="marketingEmails" class="ml-3 block text-sm font-medium text-gray-700">
                      接收营销邮件
                    </label>
                  </div>
                </div>
              </fieldset>
              
              <div class="mt-6 flex justify-end">
                <button type="submit" class="btn btn-primary">
                  保存偏好
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- 隐私设置 -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              隐私设置
            </h3>
          </div>
          <div class="px-6 py-5">
            <form @submit.prevent="savePrivacySettings">
              <div class="space-y-6">
                <div>
                  <label for="profileVisibility" class="block text-sm font-medium text-gray-700">个人资料可见性</label>
                  <select
                    id="profileVisibility"
                    v-model="privacySettings.profileVisibility"
                    class="form-input mt-1"
                  >
                    <option value="all">所有人可见</option>
                    <option value="team">仅团队成员可见</option>
                    <option value="none">仅自己可见</option>
                  </select>
                </div>
                
                <div>
                  <label for="activityVisibility" class="block text-sm font-medium text-gray-700">活动状态可见性</label>
                  <select
                    id="activityVisibility"
                    v-model="privacySettings.activityVisibility"
                    class="form-input mt-1"
                  >
                    <option value="all">所有人可见</option>
                    <option value="team">仅团队成员可见</option>
                    <option value="none">仅自己可见</option>
                  </select>
                </div>
                
                <div class="flex items-center">
                  <input
                    id="showOnlineStatus"
                    v-model="privacySettings.showOnlineStatus"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label for="showOnlineStatus" class="ml-3 block text-sm font-medium text-gray-700">
                    显示在线状态
                  </label>
                </div>
              </div>
              
              <div class="mt-6 flex justify-end">
                <button type="submit" class="btn btn-primary">
                  保存设置
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-tab {
  border-bottom: 2px solid transparent;
}

.settings-tab-active {
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
}

.settings-tab-inactive {
  color: var(--color-text-secondary);
}

.settings-tab-inactive:hover {
  color: var(--color-text-primary);
}

/* 使用CSS变量 */
.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gray-700);
  margin-bottom: 0.25rem;
}

.form-input {
  margin-top: 0.25rem;
  display: block;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid var(--color-gray-300);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.form-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 1px var(--color-primary-500);
}

.btn {
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px white, 0 0 0 4px var(--color-primary-500);
}

.btn-primary {
  background-color: var(--color-primary-600);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-700);
}

.btn-secondary {
  background-color: white;
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
}

.btn-secondary:hover {
  background-color: var(--color-gray-50);
}

.btn-sm {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
  font-size: 0.75rem;
}
</style> 