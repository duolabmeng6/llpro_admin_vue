import { defineStore } from 'pinia'
import { menuConfig } from '../config/menu'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    // 存储菜单展开状态，键为菜单ID，值为是否展开
    expandedMenus: {},
    // 侧边栏是否展开
    sidebarExpanded: true,
    // 临时展开状态（鼠标悬停时）
    tempExpanded: false,
    // 菜单操作定时器
    menuTimers: {}
  }),
  
  getters: {
    // 检查菜单是否展开
    isMenuExpanded: (state) => (menuId) => {
      return !!state.expandedMenus[menuId]
    },
    
    // 获取所有展开的菜单
    getAllExpandedMenus: (state) => {
      return state.expandedMenus
    },
    
    // 侧边栏状态
    isSidebarExpanded: (state) => state.sidebarExpanded,
    
    // 是否处于临时展开状态
    isTempExpanded: (state) => state.tempExpanded
  },
  
  actions: {
    // 切换菜单展开状态（添加延迟）
    toggleMenu(menuId) {
      // 清除之前可能存在的定时器
      if (this.menuTimers[menuId]) {
        clearTimeout(this.menuTimers[menuId])
      }
      
      const currentState = this.expandedMenus[menuId];
      
      // 如果当前是关闭状态，添加延迟再展开
      if (!currentState) {
        this.menuTimers[menuId] = setTimeout(() => {
          this.expandedMenus[menuId] = true;
          delete this.menuTimers[menuId];
        }, 200);
      } else {
        // 如果当前是展开状态，添加较短的延迟再关闭
        this.menuTimers[menuId] = setTimeout(() => {
          this.expandedMenus[menuId] = false;
          delete this.menuTimers[menuId];
        }, 100);
      }
    },
    
    // 展开指定菜单（添加延迟）
    expandMenu(menuId) {
      // 清除之前可能存在的定时器
      if (this.menuTimers[menuId]) {
        clearTimeout(this.menuTimers[menuId])
      }
      
      this.menuTimers[menuId] = setTimeout(() => {
        this.expandedMenus[menuId] = true;
        delete this.menuTimers[menuId];
      }, 200);
    },
    
    // 收起指定菜单（添加延迟）
    collapseMenu(menuId) {
      // 清除之前可能存在的定时器
      if (this.menuTimers[menuId]) {
        clearTimeout(this.menuTimers[menuId])
      }
      
      this.menuTimers[menuId] = setTimeout(() => {
        this.expandedMenus[menuId] = false;
        delete this.menuTimers[menuId];
      }, 100);
    },
    
    // 清除所有菜单定时器
    clearAllMenuTimers() {
      for (const menuId in this.menuTimers) {
        if (this.menuTimers[menuId]) {
          clearTimeout(this.menuTimers[menuId]);
          delete this.menuTimers[menuId];
        }
      }
    },
    
    // 展开所有菜单
    expandAllMenus() {
      this.clearAllMenuTimers();
      menuConfig.forEach(menu => {
        if (menu.children && menu.children.length > 0) {
          this.expandedMenus[menu.id] = true;
        }
      });
    },
    
    // 收起所有菜单
    collapseAllMenus() {
      this.clearAllMenuTimers();
      this.expandedMenus = {};
    },
    
    // 切换侧边栏状态
    toggleSidebar() {
      this.sidebarExpanded = !this.sidebarExpanded;
      
      // 当收起侧边栏时，清空展开菜单状态
      if (!this.sidebarExpanded) {
        this.collapseAllMenus();
        this.tempExpanded = false;
      }
    },
    
    // 设置侧边栏状态
    setSidebarExpanded(status) {
      this.sidebarExpanded = status;
    },
    
    // 设置临时展开状态
    setTempExpanded(status) {
      this.tempExpanded = status;
      
      // 如果关闭临时展开，同时收起所有菜单
      if (!status) {
        this.collapseAllMenus();
      }
    },
    
    // 根据路径查找并展开对应的菜单
    expandMenuByPath(path) {
      // 遍历所有一级菜单
      for (const menu of menuConfig) {
        // 如果路径直接匹配一级菜单，不需要展开任何子菜单
        if (menu.path === path) {
          return;
        }
        
        // 检查子菜单
        if (menu.children && menu.children.length > 0) {
          const matchedChild = menu.children.find(child => child.path === path);
          if (matchedChild) {
            // 找到匹配的子菜单，展开父菜单
            this.expandMenu(menu.id);
            return;
          }
        }
      }
    }
  }
})