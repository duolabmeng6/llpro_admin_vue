import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

const API_URL = '/api'

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null
  }),
  
  getters: {
    getUserById: (state) => (id) => {
      return state.users.find(user => user.id === id) || null
    }
  },
  
  actions: {
    async fetchUsers() {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        const response = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        
        this.users = response.data
        return this.users
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch users'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async fetchUserById(id) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        const response = await axios.get(`${API_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        
        this.currentUser = response.data
        return this.currentUser
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch user'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async createUser(userData) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        const response = await axios.post(`${API_URL}/users`, userData, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        
        this.users.push(response.data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create user'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateUser(id, userData) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        const response = await axios.put(`${API_URL}/users/${id}`, userData, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        
        const index = this.users.findIndex(user => user.id === id)
        if (index !== -1) {
          this.users[index] = response.data
        }
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update user'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteUser(id) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        await axios.delete(`${API_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        
        this.users = this.users.filter(user => user.id !== id)
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete user'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
}) 