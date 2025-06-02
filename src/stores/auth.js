import { defineStore } from 'pinia'
import http from '../utils/axios'

// const API_URL = '/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || null,
    userAvatar: (state) => {
      // 返回用户头像，如果没有则返回null
      return state.user?.avatar || null
    },
    userFullName: (state) => {
      if (state.user?.firstName && state.user?.lastName) {
        return `${state.user.firstName} ${state.user.lastName}`
      }
      return state.user?.username || '用户'
    }
  },
  
  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        const response = await http.post('/auth/login', credentials)
        const { user, token } = response
        
        // 确保用户对象包含角色信息
        if (!user.role) {
          user.role = '普通用户' // 默认角色
        }
        
        this.user = user
        this.token = token
        
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('token', token)
        
        return user
      } catch (error) {
        this.error = error.response?.data?.message || '登录失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async logout() {
      try {
        if (this.token) {
          await http.post('/auth/logout')
        }
      } catch (error) {
        console.error('退出登录错误:', error)
      } finally {
        this.user = null
        this.token = null
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    },
    
    async fetchCurrentUser() {
      if (!this.token) return null
      
      this.loading = true
      
      try {
        const response = await http.get('/auth/me')
        
        // 确保用户对象包含角色信息
        if (!response.role) {
          response.role = '普通用户' // 默认角色
        }
        
        this.user = response
        localStorage.setItem('user', JSON.stringify(this.user))
        
        return this.user
      } catch (error) {
        if (error.response?.status === 401) {
          this.logout()
        }
        this.error = error.response?.data?.message || '获取用户数据失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 更新用户头像
    async updateAvatar(avatarUrl) {
      if (!this.user) return null
      
      try {
        // 这里可以添加上传头像到服务器的逻辑
        // const response = await http.post('/auth/avatar', { avatar: avatarUrl })
        
        // 更新本地用户信息
        this.user = {
          ...this.user,
          avatar: avatarUrl
        }
        
        localStorage.setItem('user', JSON.stringify(this.user))
        
        return this.user
      } catch (error) {
        this.error = error.response?.data?.message || '更新头像失败'
        throw error
      }
    }
  }
}) 