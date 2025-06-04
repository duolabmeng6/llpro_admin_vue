import express from 'express';
import { resetDatabase, initDatabase } from '../lib/db.js';

const router = express.Router();

// 初始化数据库
initDatabase().catch(err => {
  console.error('数据库初始化失败:', err);
});

// 重置数据库API
router.post('/reset', async (req, res) => {
  try {
    const result = await resetDatabase();
    res.json(result);
  } catch (error) {
    console.error('重置数据库API错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '重置数据库失败', 
      error: error.message 
    });
  }
});

// 数据库状态API
router.get('/status', async (req, res) => {
  try {
    // 这里可以添加更多数据库状态检查
    res.json({ 
      success: true, 
      message: '数据库正常运行中'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '获取数据库状态失败', 
      error: error.message 
    });
  }
});

export default router; 