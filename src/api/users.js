import http from '../utils/axios'

/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.search - 搜索关键词
 * @returns {Promise} 返回用户列表
 */
export const getUsers = (params) => {
  return http.get('/users', { params })
}

/**
 * 获取用户详情
 * @param {string} id - 用户ID
 * @returns {Promise} 返回用户详情
 */
export const getUserById = (id) => {
  return http.get(`/users/${id}`)
}

/**
 * 创建用户
 * @param {Object} data - 用户信息
 * @returns {Promise} 返回创建结果
 */
export const createUser = (data) => {
  return http.post('/users', data)
}

/**
 * 更新用户
 * @param {string} id - 用户ID
 * @param {Object} data - 用户信息
 * @returns {Promise} 返回更新结果
 */
export const updateUser = (id, data) => {
  return http.put(`/users/${id}`, data)
}

/**
 * 删除用户
 * @param {string} id - 用户ID
 * @returns {Promise} 返回删除结果
 */
export const deleteUser = (id) => {
  return http.delete(`/users/${id}`)
}

/**
 * 批量删除用户
 * @param {Array} ids - 用户ID数组
 * @returns {Promise} 返回批量删除结果
 */
export const batchDeleteUsers = (ids) => {
  return http.post('/users/batch-delete', { ids })
}

/**
 * 更新用户状态
 * @param {string} id - 用户ID
 * @param {boolean} status - 用户状态
 * @returns {Promise} 返回更新结果
 */
export const updateUserStatus = (id, status) => {
  return http.patch(`/users/${id}/status`, { status })
} 