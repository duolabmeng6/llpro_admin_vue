<script setup>
import { ref, reactive } from 'vue'
import Card from '../components/Card.vue'
import Button from '../components/Button.vue'
import MultiImageUpload from '../components/MultiImageUpload.vue'
import { submitFormWithImages } from '../api/form'

// 表单数据
const formData = reactive({
  title: '',
  description: '',
  imageIds: []
})

// 表单验证错误
const formErrors = reactive({
  title: '',
  description: '',
  imageIds: ''
})

// 表单提交状态
const isSubmitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref('')

// 上传组件引用
const uploadComponent = ref(null)

// 演示用的初始文件
const initialFiles = ref([
  {
    id: '1',
    name: 'sample-image-1.jpg',
    url: 'https://picsum.photos/id/1/300/200',
    status: 'uploaded',
    progress: 100
  }
])

// 验证表单
const validateForm = () => {
  let isValid = true
  
  // 重置错误
  formErrors.title = ''
  formErrors.description = ''
  formErrors.imageIds = ''
  
  // 验证标题
  if (!formData.title.trim()) {
    formErrors.title = '请输入标题'
    isValid = false
  } else if (formData.title.length > 100) {
    formErrors.title = '标题长度不能超过100个字符'
    isValid = false
  }
  
  // 验证描述
  if (formData.description.length > 500) {
    formErrors.description = '描述长度不能超过500个字符'
    isValid = false
  }
  
  // 验证图片
  if (formData.imageIds.length === 0) {
    formErrors.imageIds = '请至少上传一张图片'
    isValid = false
  }
  
  // 检查是否有未上传的图片
  if (uploadComponent.value?.hasUnsavedFiles) {
    formErrors.imageIds = '有图片尚未上传，请先上传图片'
    isValid = false
  }
  
  return isValid
}

// 提交表单
const submitForm = async () => {
  // 验证表单
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  submitSuccess.value = false
  submitError.value = ''
  
  try {
    // 调用API提交表单数据
    const response = await submitFormWithImages(formData)
    
    console.log('表单提交成功:', response)
    submitSuccess.value = true
    
    // 重置表单
    formData.title = ''
    formData.description = ''
    formData.imageIds = []
    
  } catch (error) {
    submitError.value = error.response?.data?.error || '提交失败，请稍后重试'
    console.error('表单提交错误:', error)
  } finally {
    isSubmitting.value = false
  }
}

// 上传成功处理
const handleUploadSuccess = (files) => {
  console.log('上传成功:', files)
}

// 上传失败处理
const handleUploadError = (error) => {
  console.error('上传失败:', error)
  formErrors.imageIds = '图片上传失败: ' + (error.message || '未知错误')
}

// 文件列表变化处理
const handleFilesChange = (files) => {
  console.log('文件列表变化:', files)
  // 如果有文件，清除图片相关错误
  if (files.length > 0 && formData.imageIds.length > 0) {
    formErrors.imageIds = ''
  }
}

// 文件删除处理
const handleFileRemoved = (file) => {
  console.log('文件已删除:', file)
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">多图上传组件示例</h1>
    
    <!-- 基本表单示例 -->
    <Card title="表单提交示例" class="mb-8">
      <div class="p-4">
        <p class="mb-4 text-sm text-gray-600">
          将多图上传组件集成到表单中，实现完整的表单提交流程。
        </p>
        
        <form @submit.prevent="submitForm" class="space-y-4">
          <!-- 标题输入 -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
              标题 <span class="text-red-500">*</span>
            </label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              :class="{'border-red-300': formErrors.title}"
              placeholder="请输入标题"
            />
            <p v-if="formErrors.title" class="mt-1 text-sm text-red-600">{{ formErrors.title }}</p>
          </div>
          
          <!-- 描述输入 -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              id="description"
              v-model="formData.description"
              rows="3"
              class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              :class="{'border-red-300': formErrors.description}"
              placeholder="请输入描述"
            ></textarea>
            <p v-if="formErrors.description" class="mt-1 text-sm text-red-600">{{ formErrors.description }}</p>
          </div>
          
          <!-- 图片上传 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              图片上传 <span class="text-red-500">*</span>
            </label>
            <MultiImageUpload
              ref="uploadComponent"
              v-model="formData.imageIds"
              :maxFiles="5"
              :maxSize="2"
              :autoUpload="true"
              acceptTypes="image/jpeg, image/png, image/gif"
              @upload-success="handleUploadSuccess"
              @upload-error="handleUploadError"
              @files-change="handleFilesChange"
              @file-removed="handleFileRemoved"
            />
            <p v-if="formErrors.imageIds" class="mt-1 text-sm text-red-600">{{ formErrors.imageIds }}</p>
          </div>
          
          <!-- 提交按钮 -->
          <div class="pt-4 flex justify-end">
            <Button
              type="submit"
              :disabled="isSubmitting"
              variant="primary"
              size="md"
            >
              <i v-if="isSubmitting" class="fas fa-spinner fa-spin mr-1"></i>
              {{ isSubmitting ? '提交中...' : '提交表单' }}
            </Button>
          </div>
          
          <!-- 提交成功消息 -->
          <div v-if="submitSuccess" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            <div class="flex">
              <i class="fas fa-check-circle text-green-500 mr-2 mt-0.5"></i>
              <div>
                <p class="font-medium">提交成功</p>
                <p class="text-sm">您的表单已成功提交！</p>
              </div>
            </div>
          </div>
          
          <!-- 提交错误消息 -->
          <div v-if="submitError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <div class="flex">
              <i class="fas fa-exclamation-circle text-red-500 mr-2 mt-0.5"></i>
              <div>
                <p class="font-medium">提交失败</p>
                <p class="text-sm">{{ submitError }}</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Card>
    
    <!-- 基本用法 -->
    <Card title="基本用法" class="mb-8">
      <div class="p-4">
        <p class="mb-4 text-sm text-gray-600">
          基本的多图上传组件，支持拖拽上传和选择文件。
        </p>
        
        <MultiImageUpload
          :maxFiles="5"
          :maxSize="2"
          acceptTypes="image/jpeg, image/png, image/gif"
          @upload-success="handleUploadSuccess"
          @upload-error="handleUploadError"
          @files-change="handleFilesChange"
          @file-removed="handleFileRemoved"
        />
      </div>
    </Card>
    
    <!-- 预览尺寸自定义 -->
    <Card title="自定义预览尺寸" class="mb-8">
      <div class="p-4">
        <p class="mb-4 text-sm text-gray-600">
          可以自定义预览图片的尺寸。
        </p>
        
        <MultiImageUpload
          :maxFiles="5"
          :maxSize="2"
          acceptTypes="image/jpeg, image/png, image/gif"
          :previewWidth="150"
          :previewHeight="100"
          @upload-success="handleUploadSuccess"
          @upload-error="handleUploadError"
        />
      </div>
    </Card>
    
    <!-- 手动上传模式 -->
    <Card title="手动上传模式" class="mb-8">
      <div class="p-4">
        <p class="mb-4 text-sm text-gray-600">
          关闭自动上传，需要手动点击上传按钮。
        </p>
        
        <MultiImageUpload
          :maxFiles="5"
          :maxSize="2"
          :autoUpload="false"
          acceptTypes="image/jpeg, image/png, image/gif"
          @upload-success="handleUploadSuccess"
          @upload-error="handleUploadError"
        />
      </div>
    </Card>
    
    <!-- 初始文件 -->
    <Card title="初始文件" class="mb-8">
      <div class="p-4">
        <p class="mb-4 text-sm text-gray-600">
          可以设置初始文件列表，适用于编辑场景。
        </p>
        
        <MultiImageUpload
          :maxFiles="5"
          :maxSize="2"
          acceptTypes="image/jpeg, image/png, image/gif"
          :initialFiles="initialFiles"
          @upload-success="handleUploadSuccess"
          @upload-error="handleUploadError"
        />
      </div>
    </Card>
    
    <!-- 禁用状态 -->
    <Card title="禁用状态" class="mb-8">
      <div class="p-4">
        <p class="mb-4 text-sm text-gray-600">
          组件的禁用状态，不可上传或删除文件。
        </p>
        
        <MultiImageUpload
          :maxFiles="5"
          :maxSize="2"
          acceptTypes="image/jpeg, image/png, image/gif"
          :initialFiles="initialFiles"
          :disabled="true"
        />
      </div>
    </Card>
    
    <!-- 组件说明 -->
    <Card title="组件说明">
      <div class="p-4">
        <h3 class="text-lg font-medium mb-3">属性</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">属性名</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">默认值</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">说明</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr>
                <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">modelValue</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">Array</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">[]</td>
                <td class="px-6 py-2 text-sm text-gray-500">v-model绑定值，包含已上传图片的ID</td>
              </tr>
              <tr>
                <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">maxFiles</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">Number</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">5</td>
                <td class="px-6 py-2 text-sm text-gray-500">最大文件数量</td>
              </tr>
              <tr>
                <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">maxSize</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">Number</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">2</td>
                <td class="px-6 py-2 text-sm text-gray-500">单个文件最大大小（MB）</td>
              </tr>
              <tr>
                <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">acceptTypes</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">String</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">image/jpeg, image/png, image/gif</td>
                <td class="px-6 py-2 text-sm text-gray-500">允许的文件类型</td>
              </tr>
              <tr>
                <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">uploadUrl</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">String</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">''</td>
                <td class="px-6 py-2 text-sm text-gray-500">自定义上传URL，如果不提供则使用默认API</td>
              </tr>
              <tr>
                <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">initialFiles</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">Array</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">[]</td>
                <td class="px-6 py-2 text-sm text-gray-500">初始文件列表</td>
              </tr>
              <tr>
                <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">previewWidth</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">Number</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">120</td>
                <td class="px-6 py-2 text-sm text-gray-500">预览图宽度</td>
              </tr>
              <tr>
                <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">previewHeight</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">Number</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">120</td>
                <td class="px-6 py-2 text-sm text-gray-500">预览图高度</td>
              </tr>
              <tr>
                <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">autoUpload</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">Boolean</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">true</td>
                <td class="px-6 py-2 text-sm text-gray-500">是否在选择文件后自动上传</td>
              </tr>
              <tr>
                <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">disabled</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">Boolean</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">false</td>
                <td class="px-6 py-2 text-sm text-gray-500">是否禁用组件</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="text-lg font-medium mb-3 mt-6">事件</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">事件名</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">回调参数</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">说明</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr>
                <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">update:modelValue</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">(fileIds)</td>
                <td class="px-6 py-2 text-sm text-gray-500">v-model绑定更新时触发</td>
              </tr>
              <tr>
                <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">upload-success</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">(files)</td>
                <td class="px-6 py-2 text-sm text-gray-500">上传成功时触发</td>
              </tr>
              <tr>
                <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">upload-error</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">(error)</td>
                <td class="px-6 py-2 text-sm text-gray-500">上传失败时触发</td>
              </tr>
              <tr>
                <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">files-change</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">(files)</td>
                <td class="px-6 py-2 text-sm text-gray-500">文件列表变化时触发</td>
              </tr>
              <tr>
                <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">file-removed</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">(file)</td>
                <td class="px-6 py-2 text-sm text-gray-500">文件被删除时触发</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h3 class="text-lg font-medium mb-3 mt-6">方法</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">方法名</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">参数</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">说明</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr>
                <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">uploadFiles</td>
                <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">无</td>
                <td class="px-6 py-2 text-sm text-gray-500">手动触发文件上传</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  </div>
</template> 