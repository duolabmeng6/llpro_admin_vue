import axios from 'axios'

// 创建axios实例
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    
    // 如果有token则添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  response => {
    // 直接返回响应数据
    return response.data
  },
  error => {
    const { response } = error
    
    if (response) {
      // 处理401错误（未授权）
      if (response.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      
      // 返回错误信息
      return Promise.reject(response.data || 'Error')
    }
    
    return Promise.reject(error.message || 'Network Error')
  }
)

export default instance 