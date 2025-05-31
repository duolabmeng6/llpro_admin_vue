import http from '../utils/axios'

/**
 * 获取角色列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @returns {Promise} 返回角色列表
 */
export const getRoles = (params) => {
  return http.get('/roles', { params })
}

/**
 * 获取角色详情
 * @param {string} id - 角色ID
 * @returns {Promise} 返回角色详情
 */
export const getRoleById = (id) => {
  return http.get(`/roles/${id}`)
}

/**
 * 创建角色
 * @param {Object} data - 角色信息
 * @param {string} data.name - 角色名称
 * @param {string} data.description - 角色描述
 * @param {Array} data.permissions - 权限列表
 * @returns {Promise} 返回创建结果
 */
export const createRole = (data) => {
  return http.post('/roles', data)
}

/**
 * 更新角色
 * @param {string} id - 角色ID
 * @param {Object} data - 角色信息
 * @returns {Promise} 返回更新结果
 */
export const updateRole = (id, data) => {
  return http.put(`/roles/${id}`, data)
}

/**
 * 删除角色
 * @param {string} id - 角色ID
 * @returns {Promise} 返回删除结果
 */
export const deleteRole = (id) => {
  return http.delete(`/roles/${id}`)
}

/**
 * 获取权限列表
 * @returns {Promise} 返回权限列表
 */
export const getPermissions = () => {
  return http.get('/permissions')
}

/**
 * 为角色分配权限
 * @param {string} roleId - 角色ID
 * @param {Array} permissionIds - 权限ID数组
 * @returns {Promise} 返回分配结果
 */
export const assignPermissions = (roleId, permissionIds) => {
  return http.post(`/roles/${roleId}/permissions`, { permissionIds })
} 