<script setup>
import { ref } from 'vue'

// 备份列表
const backups = ref([
  { id: '1', name: '每日备份', date: '2023-05-20 03:00:00', size: '24.5 MB', type: '自动' },
  { id: '2', name: '每周备份', date: '2023-05-14 03:00:00', size: '26.2 MB', type: '自动' },
  { id: '3', name: '发布前备份', date: '2023-05-10 15:30:45', size: '25.8 MB', type: '手动' }
])

// 备份设置
const backupSettings = ref({
  daily: true,
  weekly: true,
  monthly: false,
  autoCleanup: true,
  keepDays: 30
})

// 创建备份
const createBackup = () => {
  // 实际项目中这里会调用API创建备份
  alert('备份创建中，请稍后...')
}

// 恢复备份
const restoreBackup = (backup) => {
  // 实际项目中这里会调用API恢复备份
  if (confirm(`确定要恢复备份 "${backup.name}" 吗？这将覆盖当前数据。`)) {
    alert('备份恢复中，请稍后...')
  }
}

// 删除备份
const deleteBackup = (backup) => {
  // 实际项目中这里会调用API删除备份
  if (confirm(`确定要删除备份 "${backup.name}" 吗？`)) {
    backups.value = backups.value.filter(b => b.id !== backup.id)
  }
}

// 保存备份设置
const saveSettings = () => {
  // 实际项目中这里会调用API保存备份设置
  alert('备份设置已保存')
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900">备份与恢复</h1>
    <p class="mt-1 text-sm text-gray-500">
      管理系统备份和恢复操作
    </p>
    
    <div class="mt-6 bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">
          备份列表
        </h3>
        <button
          class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          @click="createBackup"
        >
          创建备份
        </button>
      </div>
      <div class="px-6 py-5">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名称
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日期
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  大小
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="backup in backups" :key="backup.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ backup.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ backup.date }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ backup.size }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="[
                      backup.type === '自动' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    ]"
                  >
                    {{ backup.type }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    class="text-primary-600 hover:text-primary-900 mr-3"
                    @click="restoreBackup(backup)"
                  >
                    恢复
                  </button>
                  <button
                    class="text-red-600 hover:text-red-900"
                    @click="deleteBackup(backup)"
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
    
    <div class="mt-6 bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">
          备份设置
        </h3>
      </div>
      <div class="px-6 py-5">
        <div class="space-y-4">
          <div class="flex items-center">
            <input
              id="daily"
              v-model="backupSettings.daily"
              type="checkbox"
              class="h-4 w-4 text-primary-600 border-gray-300 rounded"
            />
            <label for="daily" class="ml-2 block text-sm text-gray-900">
              启用每日备份
            </label>
          </div>
          
          <div class="flex items-center">
            <input
              id="weekly"
              v-model="backupSettings.weekly"
              type="checkbox"
              class="h-4 w-4 text-primary-600 border-gray-300 rounded"
            />
            <label for="weekly" class="ml-2 block text-sm text-gray-900">
              启用每周备份
            </label>
          </div>
          
          <div class="flex items-center">
            <input
              id="monthly"
              v-model="backupSettings.monthly"
              type="checkbox"
              class="h-4 w-4 text-primary-600 border-gray-300 rounded"
            />
            <label for="monthly" class="ml-2 block text-sm text-gray-900">
              启用每月备份
            </label>
          </div>
          
          <div class="flex items-center">
            <input
              id="autoCleanup"
              v-model="backupSettings.autoCleanup"
              type="checkbox"
              class="h-4 w-4 text-primary-600 border-gray-300 rounded"
            />
            <label for="autoCleanup" class="ml-2 block text-sm text-gray-900">
              启用自动清理
            </label>
          </div>
          
          <div class="sm:flex sm:items-center">
            <label for="keepDays" class="block text-sm text-gray-900 sm:w-40">
              保留天数:
            </label>
            <input
              id="keepDays"
              v-model="backupSettings.keepDays"
              type="number"
              min="1"
              max="365"
              class="mt-1 sm:mt-0 block w-full sm:w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          
          <div class="pt-4">
            <button
              class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              @click="saveSettings"
            >
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 