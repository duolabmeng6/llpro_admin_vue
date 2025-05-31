import http from '../utils/axios'

/**
 * 获取系统设置
 * @returns {Promise} 返回系统设置
 */
export const getSystemSettings = () => {
  return http.get('/settings/system')
}

/**
 * 更新系统设置
 * @param {Object} data - 系统设置
 * @returns {Promise} 返回更新结果
 */
export const updateSystemSettings = (data) => {
  return http.put('/settings/system', data)
}

/**
 * 获取用户设置
 * @param {string} userId - 用户ID
 * @returns {Promise} 返回用户设置
 */
export const getUserSettings = (userId) => {
  return http.get(`/settings/user/${userId}`)
}

/**
 * 更新用户设置
 * @param {string} userId - 用户ID
 * @param {Object} data - 用户设置
 * @returns {Promise} 返回更新结果
 */
export const updateUserSettings = (userId, data) => {
  return http.put(`/settings/user/${userId}`, data)
}

/**
 * 获取网站配置
 * @returns {Promise} 返回网站配置
 */
export const getSiteConfig = () => {
  return http.get('/settings/site')
}

/**
 * 更新网站配置
 * @param {Object} data - 网站配置
 * @returns {Promise} 返回更新结果
 */
export const updateSiteConfig = (data) => {
  return http.put('/settings/site', data)
}

/**
 * 上传网站Logo
 * @param {FormData} formData - 包含logo文件的FormData
 * @returns {Promise} 返回上传结果
 */
export const uploadSiteLogo = (formData) => {
  return http.post('/settings/site/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 