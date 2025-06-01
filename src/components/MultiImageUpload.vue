<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { uploadImages, uploadImage } from '../api/upload'
import Button from './Button.vue'

const props = defineProps({
  // 最大文件数量
  maxFiles: {
    type: Number,
    default: 5
  },
  // 单个文件最大大小（MB）
  maxSize: {
    type: Number,
    default: 2
  },
  // 允许的文件类型
  acceptTypes: {
    type: String,
    default: 'image/jpeg, image/png, image/gif'
  },
  // 自定义上传URL，如果不提供则使用默认API
  uploadUrl: {
    type: String,
    default: ''
  },
  // 初始文件列表
  initialFiles: {
    type: Array,
    default: () => []
  },
  // 预览图宽度
  previewWidth: {
    type: Number,
    default: 160
  },
  // 预览图高度
  previewHeight: {
    type: Number,
    default: 160
  },
  // 是否禁用组件
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否自动上传文件
  autoUpload: {
    type: Boolean,
    default: true
  },
  // 是否开启图片压缩
  enableCompression: {
    type: Boolean,
    default: false
  },
  // 压缩质量（1-100）
  compressionQuality: {
    type: Number,
    default: 80
  },
  // 是否允许排序
  allowSort: {
    type: Boolean,
    default: true
  },
  // v-model绑定值（文件ID数组）
  modelValue: {
    type: Array,
    default: () => []
  },
  // 网格列数（响应式布局）
  gridColumns: {
    type: Object,
    default: () => ({
      sm: 2,  // 小屏幕
      md: 3,  // 中等屏幕
      lg: 4,  // 大屏幕
      xl: 5   // 超大屏幕
    })
  },
  // 深色模式
  darkMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:modelValue',
  'upload-success',
  'upload-error',
  'files-change',
  'file-removed',
  'files-sorted'
])

const fileInput = ref(null)
const isDragging = ref(false)
const isDragActive = ref(false) // 拖放激活状态，用于增强视觉反馈
const files = ref([])
const uploading = ref(false)
const uploadProgress = ref(0)
const errors = ref([])
const hasUnsavedFiles = ref(false)
const previewModalVisible = ref(false)
const previewModalImage = ref(null)
const draggedFile = ref(null)
const dragOverIndex = ref(null)
const successMessage = ref('')
const showSuccessMessage = ref(false)
const notificationTimeout = ref(null)
const dropzoneHovered = ref(false) // 上传区域悬停状态

// 初始化文件列表
onMounted(() => {
  if (props.initialFiles && props.initialFiles.length > 0) {
    files.value = props.initialFiles.map(file => ({
      id: file.id || generateId(),
      name: file.name,
      url: file.url,
      file: null,
      size: file.size || 0,
      sizeFormatted: file.size ? formatFileSize(file.size) : '',
      status: 'uploaded',
      progress: 100
    }))
    
    // 同步到modelValue
    updateModelValue()
  }
})

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// 更新modelValue
const updateModelValue = () => {
  const fileIds = files.value
    .filter(file => file.status === 'uploaded')
    .map(file => file.id)
  
  emit('update:modelValue', fileIds)
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 计算是否达到最大文件数
const isMaxFilesReached = computed(() => {
  return files.value.length >= props.maxFiles
})

// 选择文件
const handleFileSelect = (event) => {
  if (props.disabled || uploading.value) return
  
  addFiles(event.target.files)
  // 重置input以便重复选择同一文件
  event.target.value = ''
}

// 文件排序处理 - 完全重构
const handleDragStart = (event, file, index) => {
  if (props.disabled || uploading.value || !props.allowSort) {
    event.preventDefault()
    return false
  }

  // 记录被拖拽的文件信息
  draggedFile.value = { file, index }
  
  // 设置拖拽效果和数据
  event.dataTransfer.effectAllowed = 'move'
  // 存储索引作为数据
  event.dataTransfer.setData('text/plain', index.toString())
  
  // 添加拖拽中的视觉效果
  const dragEl = event.target.closest('.preview-card')
  if (dragEl) {
    dragEl.classList.add('dragging')
    
    // 稍后移除类，确保在整个拖拽过程中保持视觉效果
    setTimeout(() => {
      dragEl.classList.add('drag-active')
    }, 0)
  }
  
  return true
}

// 当拖拽元素进入目标区域时触发
const handleDragEnter = (event, index) => {
  if (props.disabled || uploading.value || !props.allowSort || !draggedFile.value) {
    return false
  }
  
  // 仅在不同元素之间切换时更新
  if (dragOverIndex.value !== index) {
    dragOverIndex.value = index
    
    // 移除所有其他元素的drop-target类
    const cards = document.querySelectorAll('.preview-card')
    cards.forEach(card => card.classList.remove('drop-target'))
    
    // 添加当前目标的drop-target类
    const currentTarget = event.currentTarget
    if (currentTarget && currentTarget.classList.contains('preview-card')) {
      currentTarget.classList.add('drop-target')
    }
  }
  
  event.preventDefault()
  return true
}

// 当拖拽元素在目标区域上方移动时持续触发
const handleDragOver = (event, index) => {
  if (props.disabled || uploading.value || !props.allowSort || !draggedFile.value) {
    return false
  }
  
  // 设置放置效果
  event.dataTransfer.dropEffect = 'move'
  
  // 阻止默认行为以允许放置
  event.preventDefault()
  return true
}

// 当拖拽元素离开目标区域时触发
const handleDragLeave = (event) => {
  if (props.disabled || uploading.value || !props.allowSort) {
    return false
  }
  
  // 确保我们真的离开了元素，而不是进入了子元素
  const relatedTarget = event.relatedTarget
  if (!event.currentTarget.contains(relatedTarget)) {
    // 只移除当前目标的drop-target类
    event.currentTarget.classList.remove('drop-target')
  }
  
  return true
}

// 当拖拽元素放置到目标区域时触发
const handleDrop = (event, index) => {
  if (props.disabled || uploading.value || !props.allowSort || !draggedFile.value) {
    return false
  }
  
  // 阻止默认行为（例如某些元素的打开链接）
  event.preventDefault()
  event.stopPropagation()
  
  const sourceIndex = draggedFile.value.index
  const targetIndex = index
  
  if (sourceIndex !== targetIndex) {
    // 重新排序文件
    const fileToMove = files.value.splice(sourceIndex, 1)[0]
    files.value.splice(targetIndex, 0, fileToMove)
    
    // 触发事件
    emit('files-sorted', files.value)
    emit('files-change', files.value)
    
    // 更新modelValue
    updateModelValue()
    
    // 显示成功提示
    showSuccess('文件排序成功')
  }
  
  // 清理所有拖拽状态
  cleanupDragState()
  
  return false
}

// 当拖拽操作完成时触发（无论是否成功放置）
const handleDragEnd = (event) => {
  // 清理所有拖拽状态
  cleanupDragState()
  return false
}

// 清理所有拖拽相关状态
const cleanupDragState = () => {
  // 移除所有拖拽相关的类
  const allCards = document.querySelectorAll('.preview-card')
  allCards.forEach(card => {
    card.classList.remove('dragging', 'drag-active', 'drop-target')
  })
  
  // 重置拖拽状态变量
  draggedFile.value = null
  dragOverIndex.value = null
}

// 用于拖拽手柄的mousedown事件处理
const handleSortHandleMouseDown = (event, file, index) => {
  // 仅设置状态，实际拖拽由dragstart事件处理
  if (!props.disabled && !uploading.value && props.allowSort) {
    // 这里不做太多处理，只是为了视觉反馈
    const card = event.target.closest('.preview-card')
    if (card) {
      card.classList.add('prepare-drag')
      
      // 添加一个全局的mouseup监听器，以防拖拽没有开始就结束了
      const cleanup = () => {
        card.classList.remove('prepare-drag')
        window.removeEventListener('mouseup', cleanup)
      }
      
      window.addEventListener('mouseup', cleanup, { once: true })
    }
  }
}

// 图片压缩
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // 保持宽高比例
        canvas.width = img.width
        canvas.height = img.height
        
        // 绘制图片
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // 转换为Blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('图片压缩失败'))
            return
          }
          
          // 创建新的File对象
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: file.lastModified
          })
          
          resolve(compressedFile)
        }, file.type, props.compressionQuality / 100)
      }
      
      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }
      
      img.src = event.target.result
    }
    
    reader.onerror = () => {
      reject(new Error('读取文件失败'))
    }
    
    reader.readAsDataURL(file)
  })
}

// 添加文件
const addFiles = async (fileList) => {
  errors.value = []
  
  if (isMaxFilesReached.value) {
    errors.value.push(`最多只能上传${props.maxFiles}个文件`)
    return
  }
  
  const remainingSlots = props.maxFiles - files.value.length
  const newFiles = Array.from(fileList).slice(0, remainingSlots)
  
  // 添加计数器跟踪已处理的文件数量
  let processedCount = 0
  const totalFiles = newFiles.length
  
  // 验证文件
  for (const file of newFiles) {
    // 验证文件类型
    const fileType = file.type
    if (!props.acceptTypes.includes(fileType)) {
      errors.value.push(`文件 ${file.name} 类型不支持，请上传 ${props.acceptTypes} 类型的文件`)
      processedCount++
      continue
    }
    
    // 验证文件大小
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > props.maxSize) {
      errors.value.push(`文件 ${file.name} 超过最大大小 ${props.maxSize}MB`)
      processedCount++
      continue
    }
    
    try {
      // 如果启用压缩，且文件是图片，进行压缩
      let processedFile = file
      if (props.enableCompression && file.type.startsWith('image/')) {
        processedFile = await compressImage(file)
      }
      
      // 创建文件预览
      const reader = new FileReader()
      reader.onload = (e) => {
        const fileObj = {
          id: generateId(),
          name: file.name,
          url: e.target.result,
          file: processedFile,
          size: processedFile.size,
          sizeFormatted: formatFileSize(processedFile.size),
          status: 'ready',
          progress: 0
        }
        
        files.value.push(fileObj)
        hasUnsavedFiles.value = true
        emit('files-change', files.value)
        
        // 增加已处理文件计数
        processedCount++
        
        // 只有当所有文件都处理完成后，才执行上传
        if (props.autoUpload && processedCount === totalFiles) {
          uploadFiles()
        }
      }
      
      reader.readAsDataURL(processedFile)
    } catch (error) {
      errors.value.push(`处理文件 ${file.name} 失败: ${error.message}`)
      processedCount++
    }
  }
}

// 删除文件
const removeFile = (index) => {
  if (props.disabled || uploading.value) return
  
  const removedFile = files.value.splice(index, 1)[0]
  emit('file-removed', removedFile)
  emit('files-change', files.value)
  
  // 更新modelValue
  updateModelValue()
  
  // 如果删除的是未上传文件，更新未保存状态
  if (removedFile.status !== 'uploaded') {
    hasUnsavedFiles.value = files.value.some(file => file.status !== 'uploaded')
  }
}

// 点击选择文件
const openFileSelector = () => {
  if (props.disabled || uploading.value || isMaxFilesReached.value) return
  
  fileInput.value.click()
}

// 打开预览图片模态框
const openPreviewModal = (file) => {
  previewModalImage.value = file
  previewModalVisible.value = true
}

// 关闭预览图片模态框
const closePreviewModal = () => {
  previewModalVisible.value = false
  setTimeout(() => {
    previewModalImage.value = null
  }, 300)
}

// 显示成功消息
const showSuccess = (message) => {
  // 清除之前的定时器
  if (notificationTimeout.value) {
    clearTimeout(notificationTimeout.value)
  }
  
  successMessage.value = message
  showSuccessMessage.value = true
  
  // 3秒后自动关闭
  notificationTimeout.value = setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

// 上传文件 - 可从外部调用
const uploadFiles = async () => {
  if (props.disabled || uploading.value || files.value.length === 0) return
  
  // 过滤出未上传的文件
  const filesToUpload = files.value.filter(f => f.status !== 'uploaded')
  if (filesToUpload.length === 0) {
    hasUnsavedFiles.value = false
    return
  }
  
  uploading.value = true
  uploadProgress.value = 0
  errors.value = []
  
  try {
    // 由于一次只能处理一个文件，所以我们需要逐个上传
    for (const fileObj of filesToUpload) {
      if (!fileObj.file) continue
      
      const formData = new FormData()
      formData.append('file', fileObj.file)
      
      // 更新当前文件状态为上传中
      const fileIndex = files.value.findIndex(f => f.id === fileObj.id)
      if (fileIndex !== -1) {
        files.value[fileIndex].status = 'uploading'
      }
      
      try {
        // 使用uploadImage API替代直接fetch调用
        const response = await uploadImage(formData, (progress) => {
          if (fileIndex !== -1) {
            files.value[fileIndex].progress = progress
          }
        })
        
        const uploadedFile = response.data
        
        if (fileIndex !== -1) {
          files.value[fileIndex].status = 'uploaded'
          files.value[fileIndex].progress = 100
          
          if (uploadedFile && uploadedFile.url) {
            files.value[fileIndex].url = uploadedFile.url
          }
          
          if (uploadedFile && uploadedFile.id) {
            files.value[fileIndex].id = uploadedFile.id
          }
        }
      } catch (error) {
        console.error(`文件 ${fileObj.name} 上传失败:`, error)
        if (fileIndex !== -1) {
          files.value[fileIndex].status = 'error'
        }
        errors.value.push(`文件 ${fileObj.name} 上传失败: ${error.message}`)
      }
    }
    
    // 更新v-model
    updateModelValue()
    
    // 标记所有文件已保存
    hasUnsavedFiles.value = false
    
    // 显示成功消息
    const successCount = files.value.filter(f => f.status === 'uploaded').length
    showSuccess(`成功上传${successCount}个文件`)
    
    emit('files-change', files.value)
  } catch (error) {
    console.error('上传过程中发生错误:', error)
    errors.value.push('上传过程中发生错误: ' + (error.message || '未知错误'))
    emit('upload-error', error)
  } finally {
    uploading.value = false
  }
}

// 计算上传区域的样式
const uploadAreaClasses = computed(() => {
  return [
    'upload-area',
    'flex flex-col items-center justify-center rounded-xl transition-all duration-300 ease-in-out overflow-hidden',
    {
      'border-2 border-dashed border-primary-400 bg-primary-50 dark:bg-primary-900/10 dark:border-primary-600 shadow-inner scale-102 animate-pulse': isDragging.value,
      'border border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800/50': !isDragging.value,
      'opacity-50 cursor-not-allowed': props.disabled || isMaxFilesReached.value,
      'cursor-pointer': !props.disabled && !isMaxFilesReached.value,
      'dark': props.darkMode
    }
  ]
})

// 计算是否显示上传按钮
const showUploadButton = computed(() => {
  return !props.autoUpload && hasUnsavedFiles.value
})

// 计算网格列样式
const gridStyle = computed(() => {
  return {
    'grid-template-columns': `repeat(auto-fill, minmax(${props.previewWidth}px, 1fr))`,
    'gap': '1rem'
  }
})

// 监听文件列表变化，更新父组件
watch(files, (newFiles) => {
  emit('files-change', newFiles)
}, { deep: true })

// 暴露方法给父组件
defineExpose({
  uploadFiles,
  hasUnsavedFiles
})

// 处理上传区域的拖放事件
const handleUploadAreaDragOver = (event) => {
  if (props.disabled || uploading.value) return
  
  event.preventDefault()
  isDragging.value = true
}

const handleUploadAreaDragEnter = (event) => {
  if (props.disabled || uploading.value) return
  
  event.preventDefault()
  isDragActive.value = true
  dropzoneHovered.value = true
}

const handleUploadAreaDragLeave = (event) => {
  event.preventDefault()
  isDragging.value = false
  dropzoneHovered.value = false
  
  // 检查是否真的离开了元素（避免内部元素触发）
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY
  
  if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
    isDragActive.value = false
  }
}

const handleUploadAreaDrop = (event) => {
  if (props.disabled || uploading.value) return
  
  event.preventDefault()
  isDragging.value = false
  isDragActive.value = false
  dropzoneHovered.value = false
  
  if (event.dataTransfer.files.length > 0) {
    addFiles(event.dataTransfer.files)
  }
}
</script>

<template>
  <div :class="['multi-image-upload max-w-full', { 'dark': props.darkMode }]">
    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      :accept="acceptTypes"
      multiple
      class="hidden"
      @change="handleFileSelect"
    />
    
    <!-- 成功消息提示 -->
    <div 
      v-if="showSuccessMessage" 
      class="success-notification fixed top-4 right-4 z-50 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg shadow-lg flex items-center max-w-md"
    >
      <div class="w-8 h-8 mr-3 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center flex-shrink-0">
        <i class="fas fa-check text-green-500 dark:text-green-300"></i>
      </div>
      <div>
        <p class="font-medium">成功</p>
        <p class="text-sm">{{ successMessage }}</p>
      </div>
      <button 
        @click="showSuccessMessage = false" 
        class="ml-auto text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <!-- 错误信息显示 -->
    <div v-if="errors.length > 0" class="mb-4 space-y-2">
      <div 
        v-for="(error, index) in errors" 
        :key="index"
        class="error-notification bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-start"
      >
        <div class="w-6 h-6 mr-3 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center flex-shrink-0 mt-0.5">
          <i class="fas fa-exclamation-circle text-red-500 dark:text-red-300 text-sm"></i>
        </div>
        <span class="text-sm">{{ error }}</span>
        <button 
          @click="errors.splice(index, 1)" 
          class="ml-auto text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <!-- 上传区域 -->
    <div
      :class="uploadAreaClasses"
      @click="openFileSelector"
      @dragover="handleUploadAreaDragOver"
      @dragenter="handleUploadAreaDragEnter"
      @dragleave="handleUploadAreaDragLeave"
      @drop="handleUploadAreaDrop"
    >
      <div class="flex flex-col items-center justify-center p-8">
        <div 
          class="upload-icon-container w-16 h-16 mb-4 rounded-full flex items-center justify-center transition-all duration-300 bg-gray-100 dark:bg-gray-800" 
          :class="{'animate-pulse bg-primary-100 dark:bg-primary-900/30': isDragging}"
        >
          <i class="fas fa-cloud-upload-alt text-2xl text-gray-400 dark:text-gray-300 transition-transform duration-300"
             :class="{'text-primary-500 dark:text-primary-400 scale-110': isDragging}"></i>
        </div>
        <h3 class="text-lg font-medium mb-2 text-gray-700 dark:text-gray-200">
          {{ isDragging ? '释放上传图片' : '上传图片' }}
        </h3>
        <p class="mb-2 text-sm text-gray-500 dark:text-gray-400 text-center">
          拖放图片到此处，或
          <span class="text-primary-600 dark:text-primary-400 font-medium hover:underline cursor-pointer">点击选择文件</span>
        </p>
        <div class="flex flex-wrap justify-center gap-2 mt-2">
          <span v-for="type in acceptTypes.replace(/image\//g, '').split(', ')" :key="type"
                class="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-xs">
            {{ type }}
          </span>
        </div>
        <div class="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
          <i class="fas fa-info-circle mr-1.5"></i>
          <span>最大 {{ maxSize }}MB{{ maxFiles > 0 ? '，最多 ' + maxFiles + ' 个文件' : '' }}</span>
        </div>
        <div v-if="enableCompression" class="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
          <i class="fas fa-compress mr-1.5"></i>
          <span>图片将自动压缩 (质量: {{ compressionQuality }}%)</span>
        </div>
      </div>
    </div>
    
    <!-- 已上传文件计数 -->
    <div v-if="files.length > 0" class="flex justify-between items-center mt-4 mb-2">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        已上传 <span class="font-medium text-gray-700 dark:text-gray-300">{{ files.length }}</span> 
        <span v-if="maxFiles > 0">/ {{ maxFiles }}</span> 个文件
      </div>
      
      <div v-if="showUploadButton" class="flex items-center">
        <Button 
          @click="uploadFiles"
          :disabled="disabled || uploading"
          :variant="uploading ? 'outline' : 'primary'"
          size="sm"
          class="ml-auto"
        >
          <i v-if="uploading" class="fas fa-spinner fa-spin mr-1"></i>
          {{ uploading ? '上传中...' : '上传所有文件' }}
        </Button>
      </div>
    </div>
    
    <!-- 预览区域 -->
    <div v-if="files.length > 0" class="mt-4">
      <div class="preview-gallery" :style="gridStyle">
        <div 
          v-for="(file, index) in files"
          :key="file.id"
          class="preview-card relative group"
          :class="{'opacity-75': draggedFile && draggedFile.index === index}"
          draggable="true"
          @dragstart="handleDragStart($event, file, index)"
          @dragenter="handleDragEnter($event, index)"
          @dragover="handleDragOver($event, index)"
          @dragend="handleDragEnd($event)"
          @drop="handleDrop($event, index)"
        >
          <div 
            class="preview-item overflow-hidden rounded-xl transition-all duration-300 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
            :class="{'ring-2 ring-primary-500 shadow-md': dragOverIndex === index}"
          >
            <!-- 图片预览 -->
            <div class="relative overflow-hidden" :style="{ paddingBottom: '100%' }">
              <img 
                :src="file.url" 
                :alt="file.name"
                class="absolute inset-0 w-full h-full object-cover cursor-pointer transition-all duration-500 hover:scale-105"
                @click="openPreviewModal(file)"
              />
              
              <!-- 图片状态指示器与覆盖层 -->
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-40 transition-opacity duration-300">
                <div class="flex gap-2">
                  <!-- 预览按钮 -->
                  <button
                    @click.stop="openPreviewModal(file)"
                    class="w-10 h-10 rounded-full bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 flex items-center justify-center transition-colors"
                    title="预览"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  
                  <!-- 删除按钮 -->
                  <button
                    v-if="!disabled && !uploading"
                    @click.stop="removeFile(index)"
                    class="w-10 h-10 rounded-full bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center transition-colors"
                    title="删除"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              
              <!-- 上传进度指示器 -->
              <div 
                v-if="file.status === 'uploading'"
                class="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center"
              >
                <!-- 环形进度条 -->
                <div class="relative w-16 h-16">
                  <svg class="w-full h-full" viewBox="0 0 100 100">
                    <!-- 背景圆环 -->
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e5e7eb"
                      stroke-width="8"
                    />
                    <!-- 进度圆环 -->
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#4f46e5"
                      stroke-width="8"
                      stroke-linecap="round"
                      :stroke-dasharray="`${2 * Math.PI * 45}`"
                      :stroke-dashoffset="`${2 * Math.PI * 45 * (1 - file.progress / 100)}`"
                      transform="rotate(-90 50 50)"
                      class="transition-all duration-300 ease-out"
                    />
                  </svg>
                  <!-- 百分比显示 -->
                  <div class="absolute inset-0 flex items-center justify-center text-white font-medium">
                    {{ file.progress }}%
                  </div>
                </div>
                <p class="text-white text-sm mt-2">上传中...</p>
              </div>
              
              <!-- 错误状态显示 -->
              <div 
                v-if="file.status === 'error'"
                class="absolute inset-0 bg-red-500 bg-opacity-40 flex items-center justify-center"
              >
                <div class="bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 text-red-500 rounded-lg px-3 py-2 shadow-lg">
                  <i class="fas fa-exclamation-triangle mr-1"></i>
                  <span class="font-medium">上传失败</span>
                </div>
              </div>
              
              <!-- 文件状态指示器 -->
              <div class="absolute bottom-2 left-2">
                <span 
                  v-if="file.status === 'uploaded'" 
                  class="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
                  title="已上传"
                >
                  <i class="fas fa-check"></i>
                </span>
                <span 
                  v-else-if="file.status === 'ready'" 
                  class="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
                  title="待上传"
                >
                  <i class="fas fa-clock"></i>
                </span>
              </div>
            </div>
            
            <!-- 文件信息 -->
            <div class="p-3 border-t dark:border-gray-700">
              <div class="flex justify-between items-center">
                <div class="truncate max-w-full text-gray-700 dark:text-gray-300 font-medium" :title="file.name">
                  {{ file.name }}
                </div>
              </div>
              <div class="flex justify-between items-center mt-1">
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ file.sizeFormatted }}
                </div>
                <div class="text-xs flex items-center">
                  <span 
                    v-if="file.status === 'uploaded'" 
                    class="text-green-500 dark:text-green-400 flex items-center"
                  >
                    <i class="fas fa-check-circle mr-1"></i>
                    已上传
                  </span>
                  <span 
                    v-else-if="file.status === 'ready'" 
                    class="text-yellow-500 dark:text-yellow-400 flex items-center"
                  >
                    <i class="fas fa-clock mr-1"></i>
                    待上传
                  </span>
                  <span 
                    v-else-if="file.status === 'error'" 
                    class="text-red-500 dark:text-red-400 flex items-center"
                  >
                    <i class="fas fa-exclamation-circle mr-1"></i>
                    上传失败
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 拖拽排序指示器 -->
          <div v-if="props.allowSort && !props.disabled && !uploading" 
               class="absolute -top-3 -right-3 w-8 h-8 bg-white dark:bg-gray-700 rounded-full shadow flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity hover:shadow-md active:shadow-inner"
               title="拖动排序"
               @mousedown="handleSortHandleMouseDown($event, file, index)"
          >
            <i class="fas fa-grip-vertical text-gray-500 dark:text-gray-400"></i>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 预览图片模态框 -->
    <div 
      v-if="previewModalVisible" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 transition-all duration-300"
      :class="{ 'opacity-0': !previewModalImage }"
      @click="closePreviewModal"
    >
      <div 
        class="max-w-5xl w-full mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-500"
        :class="{ 'scale-95 opacity-0': !previewModalImage, 'scale-100 opacity-100': previewModalImage }"
        @click.stop
      >
        <div class="flex items-center justify-between p-4 border-b dark:border-gray-800">
          <h3 class="text-lg font-medium truncate text-gray-800 dark:text-gray-200" v-if="previewModalImage">
            {{ previewModalImage.name }}
          </h3>
          <div class="flex items-center space-x-2">
            <button 
              class="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              @click="closePreviewModal"
              title="关闭"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="relative bg-gray-100 dark:bg-gray-800" v-if="previewModalImage">
          <img 
            :src="previewModalImage.url" 
            :alt="previewModalImage.name"
            class="max-h-[70vh] w-full object-contain"
          />
          
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium truncate">{{ previewModalImage.name }}</div>
                <div class="text-sm opacity-80 mt-1 flex items-center">
                  <i class="fas fa-file-image mr-2"></i>
                  <span v-if="previewModalImage.sizeFormatted">{{ previewModalImage.sizeFormatted }}</span>
                </div>
              </div>
              
              <div class="flex space-x-2">
                <span 
                  v-if="previewModalImage.status === 'uploaded'" 
                  class="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm flex items-center"
                >
                  <i class="fas fa-check-circle mr-1.5"></i>
                  已上传
                </span>
                <span 
                  v-else-if="previewModalImage.status === 'ready'" 
                  class="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm flex items-center"
                >
                  <i class="fas fa-clock mr-1.5"></i>
                  待上传
                </span>
                <span 
                  v-else-if="previewModalImage.status === 'error'" 
                  class="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm flex items-center"
                >
                  <i class="fas fa-exclamation-circle mr-1.5"></i>
                  上传失败
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.multi-image-upload {
  max-width: 100%;
}

.upload-area {
  min-height: 220px;
}

.preview-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.preview-card {
  transition: all 0.3s ease;
}

.preview-item {
  position: relative;
  background-color: #ffffff;
  transition: all 0.3s ease;
  height: 100%;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 深色模式适配 */
.dark .preview-item {
  background-color: #1f2937;
}

.dark ::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.scale-102 {
  transform: scale(1.02);
}

/* 提示消息动画 */
.success-notification,
.error-notification {
  animation: slideInRight 0.4s ease forwards;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 拖放和排序相关动画 */
.preview-card.dragging,
.preview-card.drag-active {
  z-index: 10;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  opacity: 0.8;
  transform: scale(1.02) rotate(1deg);
  transition: all 0.2s ease;
  pointer-events: none; /* 确保拖动中的元素不会干扰其他元素 */
}

.preview-card.prepare-drag {
  cursor: grabbing;
  transform: scale(1.01);
  transition: transform 0.1s ease;
}

.preview-card.drop-target {
  transform: scale(1.05);
  box-shadow: 0 5px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 5;
  animation: pulse-border 1s infinite alternate;
}

@keyframes pulse-border {
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.3);
  }
  100% {
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.6);
  }
}

.preview-card.drop-target::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px dashed rgba(79, 70, 229, 0.5);
  border-radius: 0.75rem;
  pointer-events: none;
  z-index: 1;
  animation: pulse-opacity 1s infinite alternate;
}

@keyframes pulse-opacity {
  0% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.8;
  }
}

/* 上传进度动画 */
@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
}

/* 响应式适配 */
@media (max-width: 640px) {
  .upload-area {
    min-height: 180px;
  }
  
  .preview-gallery {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
}
</style> 