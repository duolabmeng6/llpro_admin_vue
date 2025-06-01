import { defineStore } from 'pinia'
import router from '../router'
import { useMenuStore } from './menu'

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    tabs: JSON.parse(localStorage.getItem('tabs')) || [
      {
        title: '仪表盘',
        path: '/dashboard',
        name: 'Dashboard',
        closable: false // 默认标签不可关闭
      }
    ],
    activeTab: localStorage.getItem('activeTab') || '/dashboard'
  }),
  
  getters: {
    getActiveTab: (state) => state.activeTab,
    getTabs: (state) => state.tabs
  },
  
  actions: {
    // 添加新标签
    addTab(route) {
      // 如果已存在相同路径的标签，则不重复添加
      const isExist = this.tabs.some(tab => tab.path === route.path)
      if (!isExist) {
        const newTab = {
          title: route.meta.title || route.name,
          path: route.path,
          name: route.name,
          closable: true
        }
        this.tabs.push(newTab)
      }
      this.activeTab = route.path
      this.saveTabs()
      
      // 展开对应的菜单
      const menuStore = useMenuStore()
      menuStore.expandMenuByPath(route.path)
    },
    
    // 关闭标签
    closeTab(targetPath) {
      const targetIndex = this.tabs.findIndex(tab => tab.path === targetPath)
      
      // 如果找不到标签，直接返回
      if (targetIndex === -1) return
      
      // 如果关闭的是当前激活的标签，则需要激活其他标签
      if (this.activeTab === targetPath) {
        // 优先激活右侧标签，如果没有则激活左侧标签
        if (targetIndex < this.tabs.length - 1) {
          this.activeTab = this.tabs[targetIndex + 1].path
        } else {
          this.activeTab = this.tabs[targetIndex - 1].path
        }
      }
      
      this.tabs.splice(targetIndex, 1)
      
      // 如果没有标签了，添加默认的仪表盘标签
      if (this.tabs.length === 0) {
        this.tabs.push({
          title: '仪表盘',
          path: '/dashboard',
          name: 'Dashboard',
          closable: false
        })
        this.activeTab = '/dashboard'
      }
      
      // 使用导入的路由实例而不是useRouter()
      router.push(this.activeTab)
      this.saveTabs()
      
      // 展开对应的菜单
      const menuStore = useMenuStore()
      menuStore.expandMenuByPath(this.activeTab)
    },
    
    // 切换标签
    switchTab(path) {
      this.activeTab = path
      router.push(path)
      this.saveTabs()
      
      // 展开对应的菜单
      const menuStore = useMenuStore()
      menuStore.expandMenuByPath(path)
    },
    
    // 保存标签到本地存储
    saveTabs() {
      localStorage.setItem('tabs', JSON.stringify(this.tabs))
      localStorage.setItem('activeTab', this.activeTab)
    },
    
    // 关闭其他标签
    closeOtherTabs(path) {
      const currentTab = this.tabs.find(tab => tab.path === path)
      // 保留不可关闭的标签和当前标签
      this.tabs = this.tabs.filter(tab => !tab.closable || tab.path === path)
      this.activeTab = path
      this.saveTabs()
      
      // 展开对应的菜单
      const menuStore = useMenuStore()
      menuStore.expandMenuByPath(path)
    },
    
    // 关闭所有可关闭的标签
    closeAllTabs() {
      // 只保留不可关闭的标签
      this.tabs = this.tabs.filter(tab => !tab.closable)
      // 默认激活第一个标签
      if (this.tabs.length > 0) {
        this.activeTab = this.tabs[0].path
        router.push(this.activeTab)
      }
      this.saveTabs()
      
      // 展开对应的菜单
      if (this.tabs.length > 0) {
        const menuStore = useMenuStore()
        menuStore.expandMenuByPath(this.activeTab)
      }
    }
  }
}) 