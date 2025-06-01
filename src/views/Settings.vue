<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

// Settings form data
const generalSettings = ref({
  siteName: 'LL Pro 管理系统',
  siteDescription: '专业管理系统仪表盘',
  logoUrl: '/logo.png',
  primaryColor: '#0ea5e9',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h'
})

const emailSettings = ref({
  smtpServer: 'smtp.example.com',
  smtpPort: '587',
  smtpUsername: 'admin@example.com',
  smtpPassword: '********',
  senderEmail: 'noreply@example.com',
  senderName: 'LL Pro 管理系统'
})

const securitySettings = ref({
  sessionTimeout: '30',
  maxLoginAttempts: '5',
  passwordMinLength: '8',
  requireSpecialChars: true,
  requireNumbers: true,
  requireUppercase: true
})

// Active tab
const activeTab = ref('general')

// Form submission
const successMessage = ref('')
const errorMessage = ref('')

const saveSettings = (settingsType) => {
  successMessage.value = ''
  errorMessage.value = ''
  
  try {
    // In a real app, this would save to API
    successMessage.value = `${settingsType}设置保存成功`
    
    // Simulate API delay
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    errorMessage.value = '保存设置失败'
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900">系统设置</h1>
    <p class="mt-1 text-sm text-gray-500">
      管理系统设置和偏好
    </p>
    
    <!-- Success/error messages -->
    <div v-if="successMessage" class="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
      {{ errorMessage }}
    </div>
    
    <!-- Settings tabs -->
    <div class="mt-6">
      <div class="settings-tabs border-b border-gray-200">
        <div class="tabs-container flex">
          <button
            @click="activeTab = 'general'"
            class="settings-tab relative px-6 py-3 font-medium text-sm transition-all duration-300"
            :class="[
              activeTab === 'general'
                ? 'settings-tab-active' 
                : 'settings-tab-inactive'
            ]"
          >
            <i class="fa-solid fa-gear mr-2"></i>
            常规
          </button>
          <button
            @click="activeTab = 'email'"
            class="settings-tab relative px-6 py-3 font-medium text-sm transition-all duration-300"
            :class="[
              activeTab === 'email'
                ? 'settings-tab-active' 
                : 'settings-tab-inactive'
            ]"
          >
            <i class="fa-solid fa-envelope mr-2"></i>
            邮件
          </button>
          <button
            @click="activeTab = 'security'"
            class="settings-tab relative px-6 py-3 font-medium text-sm transition-all duration-300"
            :class="[
              activeTab === 'security'
                ? 'settings-tab-active' 
                : 'settings-tab-inactive'
            ]"
          >
            <i class="fa-solid fa-shield-halved mr-2"></i>
            安全
          </button>
        </div>
      </div>
      
      <!-- General Settings -->
      <div v-if="activeTab === 'general'" class="mt-6 bg-white shadow rounded-lg p-6">
        <form @submit.prevent="saveSettings('常规')">
          <div class="space-y-4">
            <div>
              <label for="siteName" class="form-label">站点名称</label>
              <input
                id="siteName"
                v-model="generalSettings.siteName"
                type="text"
                class="form-input"
              />
            </div>
            
            <div>
              <label for="siteDescription" class="form-label">站点描述</label>
              <textarea
                id="siteDescription"
                v-model="generalSettings.siteDescription"
                class="form-input"
                rows="2"
              ></textarea>
            </div>
            
            <div>
              <label for="logoUrl" class="form-label">Logo 地址</label>
              <input
                id="logoUrl"
                v-model="generalSettings.logoUrl"
                type="text"
                class="form-input"
              />
            </div>
            
            <div>
              <label for="primaryColor" class="form-label">主要颜色</label>
              <div class="flex items-center">
                <input
                  id="primaryColor"
                  v-model="generalSettings.primaryColor"
                  type="text"
                  class="form-input"
                />
                <input
                  type="color"
                  v-model="generalSettings.primaryColor"
                  class="ml-2 h-8 w-8 rounded-md border border-gray-300"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="dateFormat" class="form-label">日期格式</label>
                <select
                  id="dateFormat"
                  v-model="generalSettings.dateFormat"
                  class="form-input"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              
              <div>
                <label for="timeFormat" class="form-label">时间格式</label>
                <select
                  id="timeFormat"
                  v-model="generalSettings.timeFormat"
                  class="form-input"
                >
                  <option value="12h">12小时制 (上午/下午)</option>
                  <option value="24h">24小时制</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end">
            <button type="submit" class="btn btn-primary">
              保存设置
            </button>
          </div>
        </form>
      </div>
      
      <!-- Email Settings -->
      <div v-if="activeTab === 'email'" class="mt-6 bg-white shadow rounded-lg p-6">
        <form @submit.prevent="saveSettings('邮件')">
          <div class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="smtpServer" class="form-label">SMTP 服务器</label>
                <input
                  id="smtpServer"
                  v-model="emailSettings.smtpServer"
                  type="text"
                  class="form-input"
                />
              </div>
              
              <div>
                <label for="smtpPort" class="form-label">SMTP 端口</label>
                <input
                  id="smtpPort"
                  v-model="emailSettings.smtpPort"
                  type="text"
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="smtpUsername" class="form-label">SMTP 用户名</label>
                <input
                  id="smtpUsername"
                  v-model="emailSettings.smtpUsername"
                  type="text"
                  class="form-input"
                />
              </div>
              
              <div>
                <label for="smtpPassword" class="form-label">SMTP 密码</label>
                <input
                  id="smtpPassword"
                  v-model="emailSettings.smtpPassword"
                  type="password"
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="senderEmail" class="form-label">发件人邮箱</label>
                <input
                  id="senderEmail"
                  v-model="emailSettings.senderEmail"
                  type="email"
                  class="form-input"
                />
              </div>
              
              <div>
                <label for="senderName" class="form-label">发件人名称</label>
                <input
                  id="senderName"
                  v-model="emailSettings.senderName"
                  type="text"
                  class="form-input"
                />
              </div>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end">
            <button type="submit" class="btn btn-primary">
              保存设置
            </button>
          </div>
        </form>
      </div>
      
      <!-- Security Settings -->
      <div v-if="activeTab === 'security'" class="mt-6 bg-white shadow rounded-lg p-6">
        <form @submit.prevent="saveSettings('安全')">
          <div class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label for="sessionTimeout" class="form-label">会话超时时间（分钟）</label>
                <input
                  id="sessionTimeout"
                  v-model="securitySettings.sessionTimeout"
                  type="number"
                  min="1"
                  class="form-input"
                />
              </div>
              
              <div>
                <label for="maxLoginAttempts" class="form-label">最大登录尝试次数</label>
                <input
                  id="maxLoginAttempts"
                  v-model="securitySettings.maxLoginAttempts"
                  type="number"
                  min="1"
                  class="form-input"
                />
              </div>
              
              <div>
                <label for="passwordMinLength" class="form-label">密码最小长度</label>
                <input
                  id="passwordMinLength"
                  v-model="securitySettings.passwordMinLength"
                  type="number"
                  min="6"
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="mt-4">
              <label class="form-label">密码要求</label>
              <div class="mt-2 space-y-2">
                <div class="flex items-center">
                  <input
                    id="requireSpecialChars"
                    v-model="securitySettings.requireSpecialChars"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label for="requireSpecialChars" class="ml-2 block text-sm text-gray-900">
                    要求特殊字符
                  </label>
                </div>
                
                <div class="flex items-center">
                  <input
                    id="requireNumbers"
                    v-model="securitySettings.requireNumbers"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label for="requireNumbers" class="ml-2 block text-sm text-gray-900">
                    要求数字
                  </label>
                </div>
                
                <div class="flex items-center">
                  <input
                    id="requireUppercase"
                    v-model="securitySettings.requireUppercase"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label for="requireUppercase" class="ml-2 block text-sm text-gray-900">
                    要求大写字母
                  </label>
                </div>
              </div>
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
</template>

<style scoped>
/* 设置页面选项卡 */
.settings-tabs {
  position: relative;
}

.tabs-container {
  position: relative;
  border-bottom: none;
}

.settings-tab {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.settings-tab::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  transition: width 0.3s ease;
}

/* 激活状态 */
.settings-tab-active {
  color: var(--color-accent, #3b82f6);
}

.settings-tab-active::after {
  width: 100%;
  background: linear-gradient(90deg, var(--color-accent, #3b82f6), var(--color-accent-light, #60a5fa));
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
}

/* 未激活状态 */
.settings-tab-inactive {
  color: var(--color-text-secondary, #64748b);
}

.settings-tab-inactive:hover {
  color: var(--color-text-primary, #1e293b);
}

.settings-tab-inactive:hover::after {
  width: 100%;
  background: rgba(59, 130, 246, 0.2);
}

/* 深色主题适配 */
:global(.dark) .settings-tab-active {
  color: white;
}

:global(.dark) .settings-tab-inactive {
  color: rgba(255, 255, 255, 0.7);
}

:global(.dark) .settings-tab-inactive:hover {
  color: white;
  background: rgba(255, 255, 255, 0.05);
}

/* 赛博朋克主题适配 */
:global(.cyberpunk) .settings-tab-active {
  color: #ff2cf0;
}

:global(.cyberpunk) .settings-tab-active::after {
  background: linear-gradient(90deg, #ff2cf0, #00eeff);
  box-shadow: 0 0 10px rgba(255, 44, 240, 0.5);
}

:global(.cyberpunk) .settings-tab-inactive:hover {
  color: white;
  background: rgba(255, 44, 240, 0.1);
}

:global(.cyberpunk) .settings-tab-inactive:hover::after {
  background: rgba(255, 44, 240, 0.3);
}
</style> 