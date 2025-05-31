import http from '../utils/axios'

/**
 * 用户登录
 * @param {Object} data - 登录信息
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @returns {Promise} 返回登录结果
 */
export const login = (data) => {
  return http.post('/auth/login', data)
}

/**
 * 用户注册
 * @param {Object} data - 注册信息
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.email - 邮箱
 * @returns {Promise} 返回注册结果
 */
export const register = (data) => {
  return http.post('/auth/register', data)
}

/**
 * 退出登录
 * @returns {Promise} 返回退出结果
 */
export const logout = () => {
  return http.post('/auth/logout')
}

/**
 * 获取当前用户信息
 * @returns {Promise} 返回用户信息
 */
export const getCurrentUser = () => {
  return http.get('/auth/me')
}

/**
 * 刷新令牌
 * @returns {Promise} 返回新的令牌
 */
export const refreshToken = () => {
  return http.post('/auth/refresh-token')
} 