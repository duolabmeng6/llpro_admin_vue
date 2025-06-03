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
    
    // 记录排序相关请求
    if (
      (config.url.includes('/chapters/reorder') || config.url.includes('/lessons/reorder')) &&
      config.method === 'put'
    ) {
      console.log(`===== 发送${config.url.includes('chapters') ? '章节' : '小节'}排序请求 =====`);
      console.log('请求URL:', config.url);
      console.log('请求方法:', config.method.toUpperCase());
      console.log('请求头:', JSON.stringify(config.headers, null, 2));
      console.log('请求数据:', JSON.stringify(config.data, null, 2));
      
      // 添加请求ID用于跟踪
      config.requestId = Date.now().toString();
      console.log('请求ID:', config.requestId);
      console.log('请求时间:', new Date().toISOString());
    }
    
    return config
  },
  error => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  response => {
    // 记录排序相关响应
    if (
      (response.config.url.includes('/chapters/reorder') || response.config.url.includes('/lessons/reorder')) &&
      response.config.method === 'put'
    ) {
      console.log(`===== 接收${response.config.url.includes('chapters') ? '章节' : '小节'}排序响应 =====`);
      console.log('请求ID:', response.config.requestId || '未知');
      console.log('响应状态:', response.status);
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      console.log('响应时间:', new Date().toISOString());
      
      // 检查响应数据结构
      if (!response.data) {
        console.warn('警告: 响应数据为空');
      } else if (Array.isArray(response.data) && response.data.length === 0) {
        console.warn('警告: 响应数据为空数组');
      } else {
        // 记录返回的节点数量
        if (Array.isArray(response.data)) {
          console.log('返回节点数量:', response.data.length);
        } else if (response.data.chapters) {
          console.log('返回章节数量:', response.data.chapters.length);
        } else if (response.data.lessons) {
          console.log('返回小节数量:', response.data.lessons.length);
        }
      }
    }
    
    // 直接返回响应数据
    return response.data
  },
  error => {
    console.error('响应拦截器错误:', error);
    const { response, config } = error
    
    // 记录排序相关错误
    if (config && (config.url.includes('/chapters/reorder') || config.url.includes('/lessons/reorder'))) {
      console.error(`===== ${config.url.includes('chapters') ? '章节' : '小节'}排序请求失败 =====`);
      console.error('请求ID:', config.requestId || '未知');
      console.error('请求URL:', config.url);
      console.error('请求方法:', config.method.toUpperCase());
      console.error('请求数据:', JSON.stringify(config.data, null, 2));
      console.error('错误时间:', new Date().toISOString());
      
      if (response) {
        console.error('状态码:', response.status);
        console.error('响应数据:', JSON.stringify(response.data, null, 2));
      } else {
        console.error('无响应对象，可能是网络错误或请求超时');
      }
    }
    
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