import http from '../utils/axios'

/**
 * 提交包含图片的表单
 * @param {Object} formData - 表单数据
 * @param {string} formData.title - 表单标题
 * @param {string} formData.description - 表单描述
 * @param {Array} formData.imageIds - 图片ID数组
 * @returns {Promise} 返回提交结果
 */
export const submitFormWithImages = (formData) => {
  return http.post('/upload/form-with-images', formData)
} 