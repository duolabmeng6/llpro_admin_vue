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
    // 记录原始主题以备恢复
    const originalBodyClasses = [...document.body.classList];
    
    // 添加过渡类
    document.body.classList.add('theme-transition');
    
    // 获取当前主题的计算样式，用于颜色过渡
    const computedStyle = window.getComputedStyle(document.body);
    const originalColors = {
      background: computedStyle.backgroundColor,
      text: computedStyle.color,
      border: computedStyle.borderColor,
      accent: computedStyle.getPropertyValue('--color-primary') || '#3b82f6'
    };
    
    // 更平滑的过渡效果 - 使用多个透明度步骤
    const applyOpacityTransition = async (start, end, steps, duration) => {
      const stepTime = duration / steps;
      const stepValue = (end - start) / steps;
      
      for (let i = 0; i < steps; i++) {
        const opacity = start + stepValue * i;
        document.body.style.opacity = String(opacity);
        await new Promise(resolve => setTimeout(resolve, stepTime));
      }
      
      document.body.style.opacity = String(end);
    };
    
    // 开始淡出 - 更平滑的过渡
    await applyOpacityTransition(1, 0.6, 8, 200);
    
    // 添加过渡背景，避免在主题切换过程中出现闪烁
    document.body.classList.add('theme-transition-bg');
    
    // 保存滚动位置
    const scrollPosition = window.scrollY;
    
    // 创建动画过渡元素
    const transitionOverlay = document.createElement('div');
    transitionOverlay.className = 'theme-transition-overlay';
    transitionOverlay.style.position = 'fixed';
    transitionOverlay.style.top = '0';
    transitionOverlay.style.left = '0';
    transitionOverlay.style.width = '100%';
    transitionOverlay.style.height = '100%';
    transitionOverlay.style.zIndex = '9999';
    transitionOverlay.style.pointerEvents = 'none';
    transitionOverlay.style.transition = 'opacity 0.4s ease';
    transitionOverlay.style.opacity = '0';
    transitionOverlay.style.backdropFilter = 'blur(8px)';
    document.body.appendChild(transitionOverlay);
    
    // 应用过渡效果
    await new Promise(resolve => {
      transitionOverlay.style.opacity = '0.2';
      setTimeout(resolve, 100);
    });
    
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
    
    // 获取新主题的计算样式
    const newComputedStyle = window.getComputedStyle(document.body);
    const newColors = {
      background: newComputedStyle.backgroundColor,
      text: newComputedStyle.color,
      border: newComputedStyle.borderColor,
      accent: newComputedStyle.getPropertyValue('--color-primary') || '#3b82f6'
    };
    
    // 应用颜色过渡效果
    document.body.style.transition = 'background-color 0.6s ease, color 0.6s ease, border-color 0.6s ease';
    
    // 淡出过渡遮罩
    transitionOverlay.style.opacity = '0';
    
    // 等待颜色过渡完成
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 应用滚动锁定，避免过渡期间的滚动问题
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${scrollPosition}px`;
    
    // 开始淡入 - 更平滑的淡入效果
    await applyOpacityTransition(0.6, 1, 10, 300);
    
    // 移除滚动锁定
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    window.scrollTo(0, scrollPosition);
    
    // 移除过渡背景类
    document.body.classList.remove('theme-transition-bg');
    
    // 移除过渡遮罩
    document.body.removeChild(transitionOverlay);
    
    // 等待淡入动画完成后移除过渡类
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
      document.body.style.transition = '';
    }, 150);
    
  } catch (error) {
    console.error('应用主题过渡效果失败:', error);
    // 确保界面可见，即使出错
    document.body.style.opacity = '1';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    document.body.classList.remove('theme-transition');
    document.body.classList.remove('theme-transition-bg');
    
    // 移除可能存在的过渡遮罩
    const overlay = document.querySelector('.theme-transition-overlay');
    if (overlay) {
      document.body.removeChild(overlay);
    }
  }
}; 