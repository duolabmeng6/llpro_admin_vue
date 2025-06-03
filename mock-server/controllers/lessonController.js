import { LessonModel } from '../models/lesson.js';

// 小节控制器
// 获取所有小节
export const getAllLessons = (req, res) => {
  try {
    const lessons = LessonModel.getAll();
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取单个小节
export const getLessonById = (req, res) => {
  try {
    const { id } = req.params;
    const lesson = LessonModel.getById(id);
    
    if (!lesson) {
      return res.status(404).json({ message: '小节不存在' });
    }
    
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 创建小节
export const createLesson = (req, res) => {
  try {
    const lessonData = req.body;
    const newLesson = LessonModel.create(lessonData);
    res.status(201).json(newLesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 更新小节
export const updateLesson = (req, res) => {
  try {
    const { id } = req.params;
    const lessonData = req.body;
    const updatedLesson = LessonModel.update(id, lessonData);
    
    if (!updatedLesson) {
      return res.status(404).json({ message: '小节不存在' });
    }
    
    res.json(updatedLesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 删除小节
export const deleteLesson = (req, res) => {
  try {
    const { id } = req.params;
    const result = LessonModel.delete(id);
    
    if (!result) {
      return res.status(404).json({ message: '小节不存在' });
    }
    
    res.json({ message: '小节删除成功' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 重新排序小节
export const reorderLessons = (req, res) => {
  try {
    // 获取请求数据，可能是数组或包含lessons数组的对象
    let reorderData = req.body;
    
    console.log('接收到的小节排序数据:', JSON.stringify(reorderData, null, 2));
    
    // 如果是包含lessons数组的对象，提取lessons数组
    if (!Array.isArray(reorderData) && reorderData.lessons && Array.isArray(reorderData.lessons)) {
      console.log('接收到包含lessons数组的对象，提取lessons数组');
      reorderData = reorderData.lessons;
    }
    
    // 验证数据是否为数组
    if (!Array.isArray(reorderData)) {
      console.error('无效的排序数据格式:', reorderData);
      return res.status(400).json({ message: '无效的排序数据格式' });
    }
    
    // 验证数组是否为空
    if (reorderData.length === 0) {
      console.error('排序数据为空数组');
      return res.status(400).json({ message: '排序数据不能为空' });
    }
    
    // 验证每个排序项是否包含必要的id和order字段
    for (const item of reorderData) {
      if (!item.id || item.order === undefined) {
        console.error('排序项缺少必要字段:', item);
        return res.status(400).json({ message: '排序项必须包含id和order字段' });
      }
    }
    
    console.log('验证通过，开始重新排序小节');
    const updatedLessons = LessonModel.reorder(reorderData);
    console.log('小节排序完成，返回更新后的小节:', updatedLessons.length, '个');
    
    res.json(updatedLessons);
  } catch (error) {
    console.error('重新排序小节失败:', error);
    res.status(500).json({ message: error.message });
  }
}; 