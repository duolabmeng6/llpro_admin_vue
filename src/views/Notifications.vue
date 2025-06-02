<script setup>
import { ref, onMounted, computed } from 'vue'

// 模拟通知数据
const notifications = ref([
  {
    id: 1,
    title: '系统更新通知',
    content: '系统将于今晚22:00-23:00进行维护更新，请提前保存您的工作。',
    type: 'system',
    isRead: false,
    createdAt: '2023-06-15 10:30:00'
  },
  {
    id: 2,
    title: '新用户注册',
    content: '新用户 李四 已注册，请及时审核。',
    type: 'user',
    isRead: true,
    createdAt: '2023-06-14 15:45:00'
  },
  {
    id: 3,
    title: '安全警告',
    content: '检测到异常登录尝试，IP地址：192.168.1.100，请确认是否为您本人操作。',
    type: 'security',
    isRead: false,
    createdAt: '2023-06-14 08:20:00'
  },
  {
    id: 4,
    title: '任务分配',
    content: '您有一个新的任务：更新用户手册，截止日期：2023-06-20。',
    type: 'task',
    isRead: false,
    createdAt: '2023-06-13 16:10:00'
  },
  {
    id: 5,
    title: '会议提醒',
    content: '明天上午10:00将举行项目进度会议，请准时参加。',
    type: 'meeting',
    isRead: true,
    createdAt: '2023-06-12 09:00:00'
  }
])

// 通知筛选
const filterType = ref('all')
const searchQuery = ref('')

// 筛选后的通知
const filteredNotifications = computed(() => {
  let result = [...notifications.value]
  
  // 按类型筛选
  if (filterType.value !== 'all') {
    result = result.filter(notification => notification.type === filterType.value)
  }
  
  // 按搜索关键词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(notification => 
      notification.title.toLowerCase().includes(query) || 
      notification.content.toLowerCase().includes(query)
    )
  }
  
  return result
})

// 通知统计
const notificationStats = computed(() => {
  const total = notifications.value.length
  const unread = notifications.value.filter(n => !n.isRead).length
  
  return {
    total,
    unread,
    read: total - unread
  }
})

// 当前选中的通知
const selectedNotification = ref(null)

// 查看通知详情
const viewNotification = (notification) => {
  selectedNotification.value = notification
  
  // 如果通知未读，则标记为已读
  if (!notification.isRead) {
    markAsRead(notification.id)
  }
}

// 关闭通知详情
const closeNotificationDetail = () => {
  selectedNotification.value = null
}

// 标记通知为已读
const markAsRead = (id) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.isRead = true
  }
}

// 标记通知为未读
const markAsUnread = (id) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.isRead = false
  }
}

// 标记所有通知为已读
const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.isRead = true
  })
}

// 删除通知
const deleteNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index !== -1) {
    notifications.value.splice(index, 1)
    
    // 如果删除的是当前选中的通知，则关闭详情面板
    if (selectedNotification.value && selectedNotification.value.id === id) {
      selectedNotification.value = null
    }
  }
}

// 获取通知类型图标
const getNotificationIcon = (type) => {
  switch (type) {
    case 'system':
      return 'fa-server'
    case 'user':
      return 'fa-user'
    case 'security':
      return 'fa-shield-alt'
    case 'task':
      return 'fa-tasks'
    case 'meeting':
      return 'fa-calendar'
    default:
      return 'fa-bell'
  }
}

// 获取通知类型文本
const getNotificationTypeText = (type) => {
  switch (type) {
    case 'system':
      return '系统'
    case 'user':
      return '用户'
    case 'security':
      return '安全'
    case 'task':
      return '任务'
    case 'meeting':
      return '会议'
    default:
      return '其他'
  }
}

// 获取通知类型颜色
const getNotificationTypeColor = (type) => {
  switch (type) {
    case 'system':
      return 'bg-blue-100 text-blue-800'
    case 'user':
      return 'bg-green-100 text-green-800'
    case 'security':
      return 'bg-red-100 text-red-800'
    case 'task':
      return 'bg-yellow-100 text-yellow-800'
    case 'meeting':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900">通知中心</h1>
    <p class="mt-1 text-sm text-gray-500">
      查看和管理系统通知
    </p>
    
    <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- 通知列表 -->
      <div class="lg:col-span-2">
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <!-- 通知工具栏 -->
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
              <div class="flex space-x-2">
                <button 
                  @click="filterType = 'all'"
                  class="px-3 py-1 text-xs font-medium rounded-md"
                  :class="filterType === 'all' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'"
                >
                  全部 ({{ notificationStats.total }})
                </button>
                <button 
                  @click="filterType = 'system'"
                  class="px-3 py-1 text-xs font-medium rounded-md"
                  :class="filterType === 'system' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'"
                >
                  系统
                </button>
                <button 
                  @click="filterType = 'security'"
                  class="px-3 py-1 text-xs font-medium rounded-md"
                  :class="filterType === 'security' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'"
                >
                  安全
                </button>
                <button 
                  @click="filterType = 'task'"
                  class="px-3 py-1 text-xs font-medium rounded-md"
                  :class="filterType === 'task' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'"
                >
                  任务
                </button>
              </div>
              
              <div class="flex space-x-2">
                <div class="relative">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="搜索通知..."
                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fas fa-search text-gray-400"></i>
                  </div>
                </div>
                
                <button 
                  @click="markAllAsRead"
                  class="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  title="全部标为已读"
                >
                  <i class="fas fa-check-double"></i>
                </button>
              </div>
            </div>
          </div>
          
          <!-- 通知列表 -->
          <div class="divide-y divide-gray-200">
            <div v-if="filteredNotifications.length === 0" class="py-12">
              <div class="text-center">
                <i class="fas fa-bell-slash text-gray-400 text-4xl"></i>
                <h3 class="mt-2 text-sm font-medium text-gray-900">没有通知</h3>
                <p class="mt-1 text-sm text-gray-500">
                  没有符合条件的通知，请尝试更改筛选条件。
                </p>
              </div>
            </div>
            
            <div
              v-for="notification in filteredNotifications"
              :key="notification.id"
              @click="viewNotification(notification)"
              class="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              :class="{ 'bg-primary-50': !notification.isRead }"
            >
              <div class="flex items-start">
                <div class="flex-shrink-0 pt-1">
                  <div class="h-8 w-8 rounded-full flex items-center justify-center" :class="getNotificationTypeColor(notification.type)">
                    <i :class="['fas', getNotificationIcon(notification.type)]"></i>
                  </div>
                </div>
                <div class="ml-3 flex-1">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-gray-900" :class="{ 'font-semibold': !notification.isRead }">
                      {{ notification.title }}
                    </p>
                    <div class="flex items-center">
                      <span class="px-2 py-1 text-xs font-medium rounded-md mr-2" :class="getNotificationTypeColor(notification.type)">
                        {{ getNotificationTypeText(notification.type) }}
                      </span>
                      <span v-if="!notification.isRead" class="h-2 w-2 rounded-full bg-primary-600"></span>
                    </div>
                  </div>
                  <p class="mt-1 text-sm text-gray-600 line-clamp-2">
                    {{ notification.content }}
                  </p>
                  <p class="mt-1 text-xs text-gray-500">
                    {{ notification.createdAt }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 通知详情 -->
      <div class="lg:col-span-1">
        <div v-if="selectedNotification" class="bg-white shadow rounded-lg overflow-hidden h-full">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">通知详情</h3>
            <button @click="closeNotificationDetail" class="text-gray-400 hover:text-gray-500">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="px-6 py-4">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full flex items-center justify-center" :class="getNotificationTypeColor(selectedNotification.type)">
                  <i :class="['fas', getNotificationIcon(selectedNotification.type)]"></i>
                </div>
                <div class="ml-3">
                  <h4 class="text-sm font-medium text-gray-900">{{ selectedNotification.title }}</h4>
                  <p class="text-xs text-gray-500">{{ selectedNotification.createdAt }}</p>
                </div>
              </div>
              <span class="px-2 py-1 text-xs font-medium rounded-md" :class="getNotificationTypeColor(selectedNotification.type)">
                {{ getNotificationTypeText(selectedNotification.type) }}
              </span>
            </div>
            
            <div class="mt-4 text-sm text-gray-700">
              {{ selectedNotification.content }}
            </div>
            
            <div class="mt-6 flex justify-between">
              <div>
                <button 
                  v-if="selectedNotification.isRead"
                  @click="markAsUnread(selectedNotification.id)"
                  class="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  标为未读
                </button>
                <button 
                  v-else
                  @click="markAsRead(selectedNotification.id)"
                  class="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  标为已读
                </button>
              </div>
              <button 
                @click="deleteNotification(selectedNotification.id)"
                class="px-3 py-1 text-xs font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50"
              >
                删除通知
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="bg-white shadow rounded-lg overflow-hidden h-full">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">通知统计</h3>
          </div>
          <div class="px-6 py-4">
            <div class="py-12 flex flex-col items-center justify-center">
              <div class="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <i class="fas fa-bell text-primary-600 text-3xl"></i>
              </div>
              <h3 class="text-lg font-medium text-gray-900">通知中心</h3>
              <p class="mt-2 text-sm text-gray-500 text-center">
                选择左侧的通知查看详情
              </p>
              
              <div class="mt-6 w-full">
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-2xl font-semibold text-gray-900">{{ notificationStats.total }}</div>
                    <div class="text-xs text-gray-500 mt-1">总通知</div>
                  </div>
                  <div class="bg-primary-50 p-4 rounded-lg">
                    <div class="text-2xl font-semibold text-primary-900">{{ notificationStats.unread }}</div>
                    <div class="text-xs text-primary-500 mt-1">未读</div>
                  </div>
                  <div class="bg-green-50 p-4 rounded-lg">
                    <div class="text-2xl font-semibold text-green-900">{{ notificationStats.read }}</div>
                    <div class="text-xs text-green-500 mt-1">已读</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 