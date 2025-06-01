import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

// 配置上传
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

// 上传多张图片
router.post('/images', upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '没有文件上传' });
    }
    
    const uploadedFiles = req.files.map(file => ({
      id: uuidv4(),
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      createdAt: new Date().toISOString()
    }));
    
    // 延迟响应，模拟网络延迟
    setTimeout(() => {
      res.status(200).json({
        message: '文件上传成功',
        data: uploadedFiles
      });
    }, 1000);
    
  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({ error: '文件上传失败' });
  }
});

// 上传单张图片
router.post('/image', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有文件上传' });
    }
    
    const uploadedFile = {
      id: uuidv4(),
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      createdAt: new Date().toISOString()
    };
    
    // 延迟响应，模拟网络延迟
    setTimeout(() => {
      res.status(200).json({
        message: '文件上传成功',
        data: uploadedFile
      });
    }, 1000);
    
  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({ error: '文件上传失败' });
  }
});

// 删除图片
router.delete('/images/:id', (req, res) => {
  const { id } = req.params;
  
  // 这里应该从数据库中查找图片信息并删除文件
  // 因为是模拟接口，这里只返回成功消息
  
  setTimeout(() => {
    res.status(200).json({
      message: '图片删除成功',
      id
    });
  }, 500);
});

// 表单提交（含图片）
router.post('/form-with-images', (req, res) => {
  try {
    const { title, description, imageIds } = req.body;
    
    // 验证必填字段
    if (!title) {
      return res.status(400).json({ error: '标题不能为空' });
    }
    
    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({ error: '至少需要上传一张图片' });
    }
    
    // 处理表单提交
    // 在实际应用中，这里会将数据保存到数据库
    
    // 模拟处理延迟
    setTimeout(() => {
      res.status(200).json({
        message: '表单提交成功',
        data: {
          id: Date.now().toString(),
          title,
          description,
          imageIds,
          createdAt: new Date().toISOString()
        }
      });
    }, 800);
    
  } catch (error) {
    console.error('表单提交错误:', error);
    res.status(500).json({ error: '表单提交失败' });
  }
});

export default router; 