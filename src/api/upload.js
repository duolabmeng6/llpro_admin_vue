import http from '../utils/axios'

/**
 * 上传多个图片
 * @param {FormData} formData - 包含图片文件的FormData
 * @param {Function} onProgress - 上传进度回调函数
 * @returns {Promise} 返回上传结果
 */
export const uploadImages = (formData, onProgress) => {
  return http.post('/upload/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: onProgress ? (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      onProgress(percentCompleted)
    } : undefined
  })
}

/**
 * 上传单个图片
 * @param {FormData} formData - 包含图片文件的FormData
 * @param {Function} onProgress - 上传进度回调函数
 * @returns {Promise} 返回上传结果
 */
export const uploadImage = (formData, onProgress) => {
  return http.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: onProgress ? (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      onProgress(percentCompleted)
    } : undefined
  })
}

/**
 * 删除已上传的图片
 * @param {string} imageId - 图片ID
 * @returns {Promise} 返回删除结果
 */
export const deleteImage = (imageId) => {
  return http.delete(`/upload/images/${imageId}`)
} 