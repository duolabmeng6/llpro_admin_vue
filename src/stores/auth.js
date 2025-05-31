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
    userRole: (state) => state.user?.role || null
  },
  
  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        const response = await http.post('/auth/login', credentials)
        const { user, token } = response
        
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
    }
  }
}) 