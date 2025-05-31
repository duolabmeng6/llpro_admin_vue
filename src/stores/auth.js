import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = '/api'

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
        const response = await axios.post(`${API_URL}/auth/login`, credentials)
        const { user, token } = response.data
        
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
          await axios.post(`${API_URL}/auth/logout`, {}, {
            headers: { Authorization: `Bearer ${this.token}` }
          })
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
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        
        this.user = response.data
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