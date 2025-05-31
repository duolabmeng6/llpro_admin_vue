/**
 * 主题加载工具
 * 用于动态加载和切换主题CSS文件
 */

// 主题样式标签的ID
const THEME_LINK_ID = 'dynamic-theme-stylesheet';

// 主题加载超时时间（毫秒）
const THEME_LOAD_TIMEOUT = 3000;

/**
 * 加载主题CSS文件
 * @param {string} themePath - 主题CSS文件路径
 * @returns {Promise<void>} - 加载完成的Promise
 */
export const loadTheme = (themePath) => {
  return new Promise((resolve) => {
    try {
      console.log(`开始加载主题: ${themePath}`);
      
      // 检查是否已存在主题样式标签
      const oldLinkElement = document.getElementById(THEME_LINK_ID);
      
      // 创建新的link标签
      const linkElement = document.createElement('link');
      linkElement.id = THEME_LINK_ID;
      linkElement.rel = 'stylesheet';
      
      // 设置加载超时
      const timeoutId = setTimeout(() => {
        console.warn(`主题加载超时: ${themePath}，将继续执行`);
        resolve();
      }, THEME_LOAD_TIMEOUT);
      
      // 加载完成处理
      linkElement.onload = () => {
        clearTimeout(timeoutId);
        console.log(`主题加载成功: ${themePath}`);
        resolve();
      };
      
      // 加载错误处理
      linkElement.onerror = () => {
        clearTimeout(timeoutId);
        console.error(`主题加载失败: ${themePath}`);
        resolve(); // 即使失败也resolve，避免UI阻塞
      };
      
      // 使用完整URL路径
      const baseUrl = window.location.origin;
      const fullPath = `${baseUrl}/${themePath}`;
      linkElement.href = fullPath;
      
      // 先添加新标签
      document.head.appendChild(linkElement);
      
      // 延迟移除旧标签
      if (oldLinkElement) {
        setTimeout(() => {
          try {
            document.head.removeChild(oldLinkElement);
          } catch (e) {
            console.warn('移除旧主题标签失败', e);
          }
        }, 100);
      }
    } catch (error) {
      console.error('主题加载过程出错:', error);
      resolve(); // 出错也resolve，避免UI阻塞
    }
  });
};

/**
 * 移除当前主题CSS
 */
export const removeCurrentTheme = () => {
  try {
    const linkElement = document.getElementById(THEME_LINK_ID);
    if (linkElement) {
      document.head.removeChild(linkElement);
    }
  } catch (error) {
    console.error('移除主题失败:', error);
  }
};

/**
 * 应用主题过渡效果
 * @param {Function} callback - 主题切换回调函数
 */
export const applyThemeTransition = async (callback) => {
  try {
    // 添加过渡类
    document.body.classList.add('theme-transition');
    
    // 设置半透明度，避免完全白屏
    document.body.style.opacity = '0.5';
    
    // 短暂等待过渡效果
    await new Promise(resolve => setTimeout(resolve, 50));
    
    try {
      // 设置超时Promise
      const timeoutPromise = new Promise(resolve => {
        setTimeout(() => {
          console.warn('主题切换超时');
          resolve();
        }, THEME_LOAD_TIMEOUT);
      });
      
      // 执行主题切换，但设置超时
      await Promise.race([callback(), timeoutPromise]);
      
    } catch (error) {
      console.error('主题切换出错:', error);
    }
    
    // 恢复透明度
    document.body.style.opacity = '1';
    
    // 等待淡入动画完成后移除过渡类
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 300);
    
  } catch (error) {
    console.error('应用主题过渡效果失败:', error);
    // 确保界面可见，即使出错
    document.body.style.opacity = '1';
    document.body.classList.remove('theme-transition');
  }
}; 