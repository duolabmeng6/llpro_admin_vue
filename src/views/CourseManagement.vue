<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useCourseStore } from '../stores/course';
import TreeView from '../components/TreeView.vue';
import DetailPanel from '../components/DetailPanel.vue';
import Card from '../components/Card.vue';
import Button from '../components/Button.vue';
import Modal from '../components/Modal.vue';
import Pagination from '../components/Pagination.vue';

const courseStore = useCourseStore();

// 控制主工作区显示模式：'welcome', 'content'
const mainAreaViewMode = ref('welcome'); 

// 当前选中的课程ID
const currentCourseId = ref(null);
// 是否显示创建课程对话框
const showCreateCourseModal = ref(false);
// 是否显示创建章节对话框
const showAddChapterModal = ref(false);
// 是否显示创建小节对话框
const showAddLessonModal = ref(false);
// 详情面板是否处于编辑模式
const detailPanelEditMode = ref(false);
// 新课程表单数据
const newCourseData = ref({
  title: '',
  description: '',
  status: 'draft',
  cover: ''
});
// 新章节表单数据
const newChapterData = ref({
  title: '',
  description: '',
  order: 0
});
// 新小节表单数据
const newLessonData = ref({
  title: '',
  content: '',
  duration: 0,
  type: 'video',
  videoUrl: ''
});

// 计算属性：树形数据
const treeData = computed(() => courseStore.getTreeData);
// 计算属性：当前选中的节点类型
const selectedNodeType = computed(() => courseStore.getSelectedNodeType);
// 计算属性：当前选中的节点数据
const selectedNodeData = computed(() => courseStore.getSelectedNode);
// 计算属性：加载状态
const loading = computed(() => courseStore.loading);
// 计算属性：错误信息
const error = computed(() => courseStore.error);
// 计算属性：当前选中的节点ID
const selectedNodeId = computed(() => {
  if (!selectedNodeType.value) return null;
  
  switch (selectedNodeType.value) {
    case 'course':
      return courseStore.currentCourse?.id;
    case 'chapter':
      return courseStore.currentChapter?.id;
    case 'lesson':
      return courseStore.currentLesson?.id;
    default:
      return null;
  }
});

// 分页相关计算属性
const pagination = computed(() => courseStore.pagination);
const currentPage = computed(() => pagination.value.currentPage);
const totalPages = computed(() => pagination.value.totalPages);
const pageSize = computed(() => pagination.value.pageSize);
const totalItems = computed(() => pagination.value.totalItems);

// 添加树形结构组件引用
const treeViewRef = ref(null);

// 展开全部节点
const expandAllNodes = () => {
  if (treeViewRef.value) {
    treeViewRef.value.expandAllNodes();
  }
};

// 折叠全部节点
const collapseAllNodes = () => {
  if (treeViewRef.value) {
    treeViewRef.value.collapseAllNodes();
  }
};

// 初始化：获取课程列表
onMounted(async () => {
  try {
    await courseStore.fetchCourses();
    if (!courseStore.courses.length) {
      mainAreaViewMode.value = 'welcome';
    }
  } catch (error) {
    console.error('获取课程列表失败:', error);
    mainAreaViewMode.value = 'welcome'; // 出错时也显示欢迎页
  }
});

// 选择课程
const selectCourse = async (courseId) => {
  if (currentCourseId.value === courseId && mainAreaViewMode.value === 'content') return;
  
  currentCourseId.value = courseId;
  mainAreaViewMode.value = 'content'; // 选中课程后，切换到内容显示模式
  
  try {
    await courseStore.fetchCourseStructure(courseId);
  } catch (error) {
    console.error(`获取课程 ${courseId} 结构失败:`, error);
  }
};

// 创建课程
const createCourse = async () => {
  try {
    const newCourse = await courseStore.createCourse(newCourseData.value);
    showCreateCourseModal.value = false;
    newCourseData.value = {
      title: '',
      description: '',
      status: 'draft',
      cover: ''
    };
    
    // 选择新创建的课程
    selectCourse(newCourse.id);
  } catch (error) {
    console.error('创建课程失败:', error);
  }
};

// 树节点点击事件
const handleNodeClick = (node) => {
  // 重置编辑模式
  detailPanelEditMode.value = false;
  // 选中节点
  courseStore.selectNode(node);
};

// 树节点添加事件
const handleNodeAdd = (node) => {
  if (node.type === 'course') {
    // 显示添加章节对话框
    showAddChapterModal.value = true;
  } else if (node.type === 'chapter') {
    // 选中该章节，然后显示添加小节对话框
    courseStore.selectNode(node);
    showAddLessonModal.value = true;
  }
};

// 树节点编辑事件
const handleNodeEdit = (node) => {
  // 选中该节点
  courseStore.selectNode(node);
  
  // 强制刷新编辑模式：先设置为false，然后在下一个DOM更新周期设置为true
  detailPanelEditMode.value = false;
  nextTick(() => {
    detailPanelEditMode.value = true;
  });
};

// 处理详情面板编辑模式变更
const handleEditModeChange = (value) => {
  detailPanelEditMode.value = value;
};

// 树节点拖拽事件
const handleNodeDrag = async (dragInfo) => {
  const { draggedNode, targetNode, position, oldIndex, newIndex } = dragInfo;
  
  console.log('===== 拖拽事件开始 =====');
  console.log('拖拽事件时间:', new Date().toISOString());
  console.log('拖拽事件详情:', { 
    draggedNode: {
      id: draggedNode.id,
      type: draggedNode.type,
      label: draggedNode.title || draggedNode.label,
      order: draggedNode.order,
      parentId: draggedNode.parentId,
      children: draggedNode.children ? `包含${draggedNode.children.length}个子节点` : '无子节点'
    },
    targetNode: {
      id: targetNode.id,
      type: targetNode.type,
      label: targetNode.title || targetNode.label,
      order: targetNode.order,
      parentId: targetNode.parentId,
      children: targetNode.children ? `包含${targetNode.children.length}个子节点` : '无子节点'
    },
    position,
    oldIndex,
    newIndex
  });
  
  // 验证拖拽数据的完整性
  if (!draggedNode.id || !targetNode.id || !draggedNode.type || !targetNode.type) {
    console.error('拖拽数据不完整:', JSON.stringify(dragInfo, null, 2));
    showToast('error', '拖拽操作失败: 数据不完整');
    return;
  }
  
  // 只允许同级节点之间拖拽
  if (draggedNode.type !== targetNode.type) {
    console.warn('不允许不同类型节点之间拖拽:', {
      draggedNodeType: draggedNode.type,
      targetNodeType: targetNode.type
    });
    showToast('warning', '不允许不同类型节点之间拖拽');
    return;
  }
  
  // 如果是同一个节点且位置没有变化，不处理
  // 使用oldIndex和newIndex进行比较，确保位置确实发生了变化
  if (oldIndex !== undefined && newIndex !== undefined && oldIndex === newIndex) {
    console.log('拖拽位置未变化，不处理');
    return;
  }
  
  // 检查目标节点是否有顺序属性
  if (targetNode.order === undefined) {
    console.warn('目标节点缺少顺序属性，尝试使用索引作为顺序:', targetNode);
    // 为缺少顺序的节点添加默认顺序
    if (draggedNode.type === 'chapter' && courseStore.courseStructure?.chapters) {
      const index = courseStore.courseStructure.chapters.findIndex(c => c.id === targetNode.id);
      if (index !== -1) {
        targetNode.order = index + 1;
        console.log('为目标章节添加默认顺序:', targetNode.order);
      }
    } else if (draggedNode.type === 'lesson') {
      // 查找目标小节所在的章节
      for (const chapter of courseStore.courseStructure?.chapters || []) {
        if (chapter.lessons) {
          const index = chapter.lessons.findIndex(l => l.id === targetNode.id);
          if (index !== -1) {
            targetNode.order = index + 1;
            console.log('为目标小节添加默认顺序:', targetNode.order);
            break;
          }
        }
      }
    }
  }
  
  // 显示加载状态
  const loadingToastId = showToast('info', '正在更新排序...', true);
  
  try {
    let updatedItems = [];
    let newOrder = 0;
    let reorderData = null;
    
    switch (draggedNode.type) {
      case 'chapter':
        // 章节排序
        if (position === 'before') {
          // 将拖拽的章节放到目标章节前面
          newOrder = targetNode.order - 0.5;
          console.log(`将章节 ${draggedNode.id} 放到章节 ${targetNode.id} 前面，新顺序: ${newOrder}`);
          
          // 记录排序前的章节结构
          console.log('===== 章节排序前的数据结构 =====');
          if (courseStore.courseStructure && courseStore.courseStructure.chapters) {
            console.log('课程ID:', courseStore.courseStructure.id);
            console.log('课程标题:', courseStore.courseStructure.title);
            console.log('章节数量:', courseStore.courseStructure.chapters.length);
            console.log('章节列表:', JSON.stringify(
              courseStore.courseStructure.chapters.map(c => ({
                id: c.id,
                title: c.title,
                order: c.order
              })),
              null, 2
            ));
            
            // 记录被拖拽章节的当前信息
            const draggedChapterBefore = courseStore.courseStructure.chapters.find(c => c.id === draggedNode.id);
            if (draggedChapterBefore) {
              console.log('被拖拽章节当前信息:', JSON.stringify(draggedChapterBefore, null, 2));
            } else {
              console.warn('在课程结构中未找到被拖拽的章节:', draggedNode.id);
            }
          } else {
            console.warn('课程结构不完整或为空');
          }
          
          // 构建重排序数据
          reorderData = [{ id: draggedNode.id, order: newOrder }];
          console.log('准备发送的章节排序数据:', JSON.stringify(reorderData, null, 2));
          
          // 发送排序请求
          console.log('===== 开始调用 courseStore.reorderChapters =====');
          updatedItems = await courseStore.reorderChapters(reorderData);
          console.log('===== 结束调用 courseStore.reorderChapters =====');
          console.log('章节排序API返回结果:', updatedItems);
        } else if (position === 'after') {
          // 将拖拽的章节放到目标章节后面
          newOrder = targetNode.order + 0.5;
          console.log(`将章节 ${draggedNode.id} 放到章节 ${targetNode.id} 后面，新顺序: ${newOrder}`);
          
          // 记录排序前的章节结构
          console.log('===== 章节排序前的数据结构 =====');
          if (courseStore.courseStructure && courseStore.courseStructure.chapters) {
            console.log('课程ID:', courseStore.courseStructure.id);
            console.log('课程标题:', courseStore.courseStructure.title);
            console.log('章节数量:', courseStore.courseStructure.chapters.length);
            console.log('章节列表:', JSON.stringify(
              courseStore.courseStructure.chapters.map(c => ({
                id: c.id,
                title: c.title,
                order: c.order
              })),
              null, 2
            ));
            
            // 记录被拖拽章节的当前信息
            const draggedChapterBefore = courseStore.courseStructure.chapters.find(c => c.id === draggedNode.id);
            if (draggedChapterBefore) {
              console.log('被拖拽章节当前信息:', JSON.stringify(draggedChapterBefore, null, 2));
            } else {
              console.warn('在课程结构中未找到被拖拽的章节:', draggedNode.id);
            }
          } else {
            console.warn('课程结构不完整或为空');
          }
          
          // 构建重排序数据
          reorderData = [{ id: draggedNode.id, order: newOrder }];
          console.log('准备发送的章节排序数据:', JSON.stringify(reorderData, null, 2));
          
          // 发送排序请求
          console.log('===== 开始调用 courseStore.reorderChapters =====');
          updatedItems = await courseStore.reorderChapters(reorderData);
          console.log('===== 结束调用 courseStore.reorderChapters =====');
          console.log('章节排序API返回结果:', updatedItems);
        } else {
          console.warn(`不支持的位置: ${position}`);
          hideToast(loadingToastId);
          showToast('warning', `不支持的拖拽位置: ${position}`);
          return;
        }
        
        console.log('章节排序更新结果:', updatedItems);
        
        if (!updatedItems || updatedItems.length === 0) {
          console.error('章节排序更新失败: API 返回空结果');
          hideToast(loadingToastId);
          showToast('error', '章节排序更新失败: 服务器未返回更新结果');
          return;
        }
        
        // 验证排序是否成功
        const updatedChapter = courseStore.courseStructure?.chapters?.find(c => c.id === draggedNode.id);
        if (updatedChapter) {
          console.log(`章节 ${draggedNode.id} 的新顺序: ${updatedChapter.order}`);
          
          // 验证顺序是否正确更新
          if (Math.abs(updatedChapter.order - newOrder) > 0.001) {
            console.warn(`章节顺序更新不匹配: 期望 ${newOrder}, 实际 ${updatedChapter.order}`);
          }
          
          // 记录排序后的章节结构
          console.log('===== 章节排序后的数据结构 =====');
          if (courseStore.courseStructure && courseStore.courseStructure.chapters) {
            console.log('章节数量:', courseStore.courseStructure.chapters.length);
            console.log('章节列表:', JSON.stringify(
              courseStore.courseStructure.chapters.map(c => ({
                id: c.id,
                title: c.title,
                order: c.order
              })),
              null, 2
            ));
            
            // 记录被拖拽章节的更新后信息
            console.log('被拖拽章节更新后信息:', JSON.stringify(updatedChapter, null, 2));
            
            // 记录排序前后的对比
            console.log('章节排序结果对比:');
            const originalOrder = draggedNode.order;
            console.log(`- 原始顺序: ${originalOrder}`);
            console.log(`- 期望顺序: ${newOrder}`);
            console.log(`- 实际顺序: ${updatedChapter.order}`);
          }
        } else {
          console.warn(`未找到更新后的章节 ${draggedNode.id}`);
          hideToast(loadingToastId);
          showToast('warning', `排序后未找到章节 ${draggedNode.id}`);
          return;
        }
        
        // 显示成功消息
        hideToast(loadingToastId);
        showToast('success', '章节排序已更新');
        break;
        
      case 'lesson':
        // 小节排序
        if (position === 'before') {
          // 将拖拽的小节放到目标小节前面
          newOrder = targetNode.order - 0.5;
          console.log(`将小节 ${draggedNode.id} 放到小节 ${targetNode.id} 前面，新顺序: ${newOrder}`);
          
          // 记录排序前的小节结构
          console.log('===== 小节排序前的数据结构 =====');
          if (courseStore.courseStructure && courseStore.courseStructure.chapters) {
            // 找到包含被拖拽小节的章节
            let draggedLessonChapter = null;
            let targetLessonChapter = null;
            let draggedLessonBefore = null;
            let targetLessonBefore = null;
            
            for (const chapter of courseStore.courseStructure.chapters) {
              if (chapter.lessons) {
                const draggedLesson = chapter.lessons.find(l => l.id === draggedNode.id);
                if (draggedLesson) {
                  draggedLessonChapter = chapter;
                  draggedLessonBefore = draggedLesson;
                }
                
                const targetLesson = chapter.lessons.find(l => l.id === targetNode.id);
                if (targetLesson) {
                  targetLessonChapter = chapter;
                  targetLessonBefore = targetLesson;
                }
                
                if (draggedLessonChapter && targetLessonChapter) break;
              }
            }
            
            if (draggedLessonChapter) {
              console.log('被拖拽小节所属章节:', JSON.stringify({
                id: draggedLessonChapter.id,
                title: draggedLessonChapter.title,
                lessonCount: draggedLessonChapter.lessons ? draggedLessonChapter.lessons.length : 0
              }, null, 2));
              
              if (draggedLessonBefore) {
                console.log('被拖拽小节当前信息:', JSON.stringify(draggedLessonBefore, null, 2));
              }
              
              console.log('章节中的所有小节:', JSON.stringify(
                draggedLessonChapter.lessons.map(l => ({
                  id: l.id,
                  title: l.title,
                  order: l.order
                })),
                null, 2
              ));
            } else {
              console.warn('在课程结构中未找到被拖拽的小节:', draggedNode.id);
            }
            
            if (targetLessonChapter && targetLessonChapter.id !== draggedLessonChapter?.id) {
              console.log('目标小节所属章节:', JSON.stringify({
                id: targetLessonChapter.id,
                title: targetLessonChapter.title,
                lessonCount: targetLessonChapter.lessons ? targetLessonChapter.lessons.length : 0
              }, null, 2));
            }
          } else {
            console.warn('课程结构不完整或为空');
          }
          
          // 构建重排序数据
          reorderData = [{ id: draggedNode.id, order: newOrder }];
          console.log('准备发送的小节排序数据:', JSON.stringify(reorderData, null, 2));
          
          // 发送排序请求
          console.log('===== 开始调用 courseStore.reorderLessons =====');
          updatedItems = await courseStore.reorderLessons(reorderData);
          console.log('===== 结束调用 courseStore.reorderLessons =====');
          console.log('小节排序API返回结果:', updatedItems);
        } else if (position === 'after') {
          // 将拖拽的小节放到目标小节后面
          newOrder = targetNode.order + 0.5;
          console.log(`将小节 ${draggedNode.id} 放到小节 ${targetNode.id} 后面，新顺序: ${newOrder}`);
          
          // 记录排序前的小节结构
          console.log('===== 小节排序前的数据结构 =====');
          if (courseStore.courseStructure && courseStore.courseStructure.chapters) {
            // 找到包含被拖拽小节的章节
            let draggedLessonChapter = null;
            let targetLessonChapter = null;
            let draggedLessonBefore = null;
            let targetLessonBefore = null;
            
            for (const chapter of courseStore.courseStructure.chapters) {
              if (chapter.lessons) {
                const draggedLesson = chapter.lessons.find(l => l.id === draggedNode.id);
                if (draggedLesson) {
                  draggedLessonChapter = chapter;
                  draggedLessonBefore = draggedLesson;
                }
                
                const targetLesson = chapter.lessons.find(l => l.id === targetNode.id);
                if (targetLesson) {
                  targetLessonChapter = chapter;
                  targetLessonBefore = targetLesson;
                }
                
                if (draggedLessonChapter && targetLessonChapter) break;
              }
            }
            
            if (draggedLessonChapter) {
              console.log('被拖拽小节所属章节:', JSON.stringify({
                id: draggedLessonChapter.id,
                title: draggedLessonChapter.title,
                lessonCount: draggedLessonChapter.lessons ? draggedLessonChapter.lessons.length : 0
              }, null, 2));
              
              if (draggedLessonBefore) {
                console.log('被拖拽小节当前信息:', JSON.stringify(draggedLessonBefore, null, 2));
              }
              
              console.log('章节中的所有小节:', JSON.stringify(
                draggedLessonChapter.lessons.map(l => ({
                  id: l.id,
                  title: l.title,
                  order: l.order
                })),
                null, 2
              ));
            } else {
              console.warn('在课程结构中未找到被拖拽的小节:', draggedNode.id);
            }
            
            if (targetLessonChapter && targetLessonChapter.id !== draggedLessonChapter?.id) {
              console.log('目标小节所属章节:', JSON.stringify({
                id: targetLessonChapter.id,
                title: targetLessonChapter.title,
                lessonCount: targetLessonChapter.lessons ? targetLessonChapter.lessons.length : 0
              }, null, 2));
            }
          } else {
            console.warn('课程结构不完整或为空');
          }
          
          // 构建重排序数据
          reorderData = [{ id: draggedNode.id, order: newOrder }];
          console.log('准备发送的小节排序数据:', JSON.stringify(reorderData, null, 2));
          
          // 发送排序请求
          console.log('===== 开始调用 courseStore.reorderLessons =====');
          updatedItems = await courseStore.reorderLessons(reorderData);
          console.log('===== 结束调用 courseStore.reorderLessons =====');
          console.log('小节排序API返回结果:', updatedItems);
        } else {
          console.warn(`不支持的位置: ${position}`);
          hideToast(loadingToastId);
          showToast('warning', `不支持的拖拽位置: ${position}`);
          return;
        }
        
        console.log('小节排序更新结果:', updatedItems);
        
        if (!updatedItems || updatedItems.length === 0) {
          console.error('小节排序更新失败: API 返回空结果');
          hideToast(loadingToastId);
          showToast('error', '小节排序更新失败: 服务器未返回更新结果');
          return;
        }
        
        // 验证排序是否成功
        let updatedLesson = null;
        if (courseStore.courseStructure?.chapters) {
          for (const chapter of courseStore.courseStructure.chapters) {
            if (chapter.lessons) {
              updatedLesson = chapter.lessons.find(l => l.id === draggedNode.id);
              if (updatedLesson) break;
            }
          }
        }
        
        if (updatedLesson) {
          console.log(`小节 ${draggedNode.id} 的新顺序: ${updatedLesson.order}`);
          
          // 验证顺序是否正确更新
          if (Math.abs(updatedLesson.order - newOrder) > 0.001) {
            console.warn(`小节顺序更新不匹配: 期望 ${newOrder}, 实际 ${updatedLesson.order}`);
          }
          
          // 记录排序后的小节结构
          console.log('===== 小节排序后的数据结构 =====');
          if (courseStore.courseStructure && courseStore.courseStructure.chapters) {
            // 找到包含被拖拽小节的章节
            let updatedLessonChapter = null;
            
            for (const chapter of courseStore.courseStructure.chapters) {
              if (chapter.lessons) {
                const foundLesson = chapter.lessons.find(l => l.id === draggedNode.id);
                if (foundLesson) {
                  updatedLessonChapter = chapter;
                  break;
                }
              }
            }
            
            if (updatedLessonChapter) {
              console.log('被拖拽小节所属章节:', JSON.stringify({
                id: updatedLessonChapter.id,
                title: updatedLessonChapter.title,
                lessonCount: updatedLessonChapter.lessons ? updatedLessonChapter.lessons.length : 0
              }, null, 2));
              
              console.log('章节中的所有小节:', JSON.stringify(
                updatedLessonChapter.lessons.map(l => ({
                  id: l.id,
                  title: l.title,
                  order: l.order
                })),
                null, 2
              ));
              
              // 记录排序前后的对比
              console.log('小节排序结果对比:');
              const originalOrder = draggedNode.order;
              console.log(`- 原始顺序: ${originalOrder}`);
              console.log(`- 期望顺序: ${newOrder}`);
              console.log(`- 实际顺序: ${updatedLesson.order}`);
            } else {
              console.warn('在课程结构中未找到被拖拽小节的章节');
            }
          }
        } else {
          console.warn(`未找到更新后的小节 ${draggedNode.id}`);
          hideToast(loadingToastId);
          showToast('warning', `排序后未找到小节 ${draggedNode.id}`);
          return;
        }
        
        // 显示成功消息
        hideToast(loadingToastId);
        showToast('success', '小节排序已更新');
        break;
        
      default:
        console.warn(`不支持的节点类型: ${draggedNode.type}`);
        hideToast(loadingToastId);
        showToast('warning', `不支持的节点类型: ${draggedNode.type}`);
        return;
    }
  } catch (error) {
    console.error('===== 节点排序失败 =====');
    console.error('错误时间:', new Date().toISOString());
    console.error('错误类型:', error.name);
    console.error('错误消息:', error.message);
    
    // 记录详细的错误信息
    if (error.response) {
      // 服务器响应了，但状态码不在 2xx 范围
      console.error('响应状态码:', error.response.status);
      console.error('响应头:', JSON.stringify(error.response.headers, null, 2));
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('未收到响应。请求详情:', error.request);
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.config);
    }
    
    // 记录拖拽相关信息用于调试
    console.error('拖拽节点类型:', draggedNode.type);
    console.error('拖拽节点ID:', draggedNode.id);
    console.error('目标节点ID:', targetNode.id);
    console.error('拖拽位置:', position);
    console.error('计算的新顺序:', newOrder);
    
    // 记录堆栈跟踪
    console.error('错误堆栈:', error.stack);
    
    // 隐藏加载状态并显示错误消息
    hideToast(loadingToastId);
    showToast('error', `排序失败: ${error.message || '未知错误'}`);
    
    // 尝试执行备用排序
    console.log('尝试执行备用排序...');
    const success = performFallbackSort(
      draggedNode.type,
      draggedNode.id,
      targetNode.id,
      position
    );
    
    if (success) {
      showToast('info', '已使用备用方法完成排序（仅临时有效，刷新页面后将恢复）');
    } else {
      showToast('error', '排序失败，请刷新页面后重试');
    }
  }
};

// 简单的消息提示函数（模拟实现）
const toasts = ref([]);
const showToast = (type, message, persistent = false) => {
  const id = Date.now().toString();
  const toast = { id, type, message, persistent };
  toasts.value.push(toast);
  
  // 如果不是持久的，设置定时器自动关闭
  if (!persistent) {
    setTimeout(() => hideToast(id), 3000);
  }
  
  return id;
};

const hideToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
};

// 保存节点
const handleSave = async (nodeType, nodeData) => {
  try {
    switch (nodeType) {
      case 'course':
        await courseStore.updateCourse(nodeData.id, nodeData);
        break;
      case 'chapter':
        await courseStore.updateChapter(nodeData.id, nodeData);
        break;
      case 'lesson':
        await courseStore.updateLesson(nodeData.id, nodeData);
        break;
    }
  } catch (error) {
    console.error('保存失败:', error);
  }
};

// 删除节点
const handleDelete = async (nodeType, nodeId) => {
  try {
    switch (nodeType) {
      case 'course':
        await courseStore.deleteCourse(nodeId);
        currentCourseId.value = null;
        mainAreaViewMode.value = 'welcome'; // 删除课程后回到欢迎页
        // 清理可能残留的选中节点状态
        courseStore.selectNode(null); 
        break;
      case 'chapter':
        await courseStore.deleteChapter(nodeId);
        break;
      case 'lesson':
        await courseStore.deleteLesson(nodeId);
        break;
    }
  } catch (error) {
    console.error('删除失败:', error);
  }
};

// 创建章节
const handleCreateChapter = async (chapterData) => {
  if (!currentCourseId.value) return;
  
  try {
    await courseStore.createChapter(currentCourseId.value, chapterData);
    // 关闭对话框并重置表单
    showAddChapterModal.value = false;
    newChapterData.value = {
      title: '',
      description: '',
      order: 0
    };
  } catch (error) {
    console.error('创建章节失败:', error);
  }
};

// 创建小节
const handleCreateLesson = async (lessonData) => {
  if (!courseStore.currentChapter) return;
  
  try {
    await courseStore.createLesson(courseStore.currentChapter.id, lessonData);
    // 关闭对话框并重置表单
    showAddLessonModal.value = false;
    newLessonData.value = {
      title: '',
      content: '',
      duration: 0,
      type: 'video',
      videoUrl: ''
    };
  } catch (error) {
    console.error('创建小节失败:', error);
  }
};

// 处理页码变化
const handlePageChange = (page) => {
  courseStore.handlePageChange(page);
};

// 备用排序函数：当API调用失败时使用前端排序
const performFallbackSort = (nodeType, draggedNodeId, targetNodeId, position) => {
  console.log('===== 执行备用排序逻辑 =====');
  
  if (nodeType === 'chapter') {
    // 章节排序备用实现
    if (!courseStore.courseStructure?.chapters) {
      console.warn('课程结构中没有章节，无法执行备用排序');
      return false;
    }
    
    // 找到拖拽的章节和目标章节
    const chapters = [...courseStore.courseStructure.chapters];
    const dragIndex = chapters.findIndex(c => c.id === draggedNodeId);
    const targetIndex = chapters.findIndex(c => c.id === targetNodeId);
    
    if (dragIndex === -1 || targetIndex === -1) {
      console.warn('未找到拖拽的章节或目标章节，无法执行备用排序');
      return false;
    }
    
    console.log('备用排序前章节顺序:', chapters.map(c => ({
      id: c.id,
      title: c.title,
      order: c.order
    })));
    
    // 从数组中移除拖拽的章节
    const [draggedChapter] = chapters.splice(dragIndex, 1);
    
    // 计算新的插入位置
    const newPosition = position === 'before' ? targetIndex : targetIndex + 1;
    
    // 将拖拽的章节插入到目标位置
    chapters.splice(newPosition, 0, draggedChapter);
    
    // 更新顺序属性
    chapters.forEach((chapter, index) => {
      chapter.order = index + 1;
    });
    
    // 更新本地数据
    courseStore.courseStructure.chapters = chapters;
    
    console.log('备用排序后章节顺序:', chapters.map(c => ({
      id: c.id,
      title: c.title,
      order: c.order
    })));
    
    return true;
  } else if (nodeType === 'lesson') {
    // 小节排序备用实现
    if (!courseStore.courseStructure?.chapters) {
      console.warn('课程结构中没有章节，无法执行备用排序');
      return false;
    }
    
    // 找到包含拖拽小节和目标小节的章节
    let targetChapter = null;
    let draggedLessonIndex = -1;
    let targetLessonIndex = -1;
    
    // 寻找包含两个小节的章节
    for (const chapter of courseStore.courseStructure.chapters) {
      if (!chapter.lessons) continue;
      
      const dragIdx = chapter.lessons.findIndex(l => l.id === draggedNodeId);
      const targetIdx = chapter.lessons.findIndex(l => l.id === targetNodeId);
      
      if (dragIdx !== -1 && targetIdx !== -1) {
        // 两个小节在同一章节中
        targetChapter = chapter;
        draggedLessonIndex = dragIdx;
        targetLessonIndex = targetIdx;
        break;
      }
    }
    
    if (!targetChapter || draggedLessonIndex === -1 || targetLessonIndex === -1) {
      console.warn('未找到拖拽的小节或目标小节，或者它们不在同一章节中，无法执行备用排序');
      return false;
    }
    
    // 复制小节数组，避免直接修改原数组
    const lessons = [...targetChapter.lessons];
    
    console.log('备用排序前小节顺序:', lessons.map(l => ({
      id: l.id,
      title: l.title,
      order: l.order
    })));
    
    // 从数组中移除拖拽的小节
    const [draggedLesson] = lessons.splice(draggedLessonIndex, 1);
    
    // 计算新的插入位置（需要重新计算，因为移除了一个元素）
    const newPosition = position === 'before' 
      ? targetLessonIndex > draggedLessonIndex ? targetLessonIndex - 1 : targetLessonIndex
      : targetLessonIndex > draggedLessonIndex ? targetLessonIndex : targetLessonIndex + 1;
    
    // 将拖拽的小节插入到目标位置
    lessons.splice(newPosition, 0, draggedLesson);
    
    // 更新顺序属性
    lessons.forEach((lesson, index) => {
      lesson.order = index + 1;
    });
    
    // 更新本地数据
    targetChapter.lessons = lessons;
    
    console.log('备用排序后小节顺序:', lessons.map(l => ({
      id: l.id,
      title: l.title,
      order: l.order
    })));
    
    return true;
  }
  
  return false;
};

// 增强的节点拖拽处理函数
const handleNodeDragWithFallback = async (dragInfo) => {
  // 只在开发环境输出详细日志
  if (process.env.NODE_ENV === 'development') {
    console.log('===== CourseManagement.vue 接收到拖拽事件 =====', new Date().toISOString());
    console.log('拖拽事件信息:', JSON.stringify(dragInfo, null, 2));
  }
  
  // 验证拖拽信息完整性
  if (!dragInfo) {
    console.error('拖拽信息为空，无法处理');
    showToast('error', '拖拽操作失败: 数据不完整');
    return;
  }
  
  // 检查是否是vuedraggable的事件格式
  if (dragInfo.added || dragInfo.moved || dragInfo.removed) {
    if (process.env.NODE_ENV === 'development') {
      console.log('检测到vuedraggable事件格式');
    }
    
    // 转换为我们的标准格式
    let standardDragInfo = {};
    
    if (dragInfo.moved) {
      const { element: draggedNode, newIndex, oldIndex } = dragInfo.moved;
      let targetNode;
      let position;
      
      // 确定目标节点和位置
      if (draggedNode.type === 'chapter') {
        // 对于章节，从courseStore.courseStructure.chapters中获取
        if (courseStore.courseStructure && courseStore.courseStructure.chapters) {
          if (newIndex > oldIndex) {
            // 向下拖动
            targetNode = courseStore.courseStructure.chapters[newIndex];
            position = 'after';
          } else {
            // 向上拖动
            targetNode = courseStore.courseStructure.chapters[newIndex];
            position = 'before';
          }
        }
      } else if (draggedNode.type === 'lesson') {
        // 对于小节，需要找到它所在的章节
        for (const chapter of courseStore.courseStructure?.chapters || []) {
          if (chapter.lessons && chapter.lessons.some(l => l.id === draggedNode.id)) {
            if (newIndex > oldIndex) {
              // 向下拖动
              targetNode = chapter.lessons[newIndex];
              position = 'after';
            } else {
              // 向上拖动
              targetNode = chapter.lessons[newIndex];
              position = 'before';
            }
            break;
          }
        }
      }
      
      if (draggedNode && targetNode) {
        standardDragInfo = {
          draggedNode,
          targetNode,
          position
        };
        
        if (process.env.NODE_ENV === 'development') {
          console.log('转换后的标准拖拽信息:', standardDragInfo);
        }
      } else {
        console.error('无法转换拖拽信息:', dragInfo);
        showToast('error', '拖拽操作失败: 无法处理拖拽数据');
        return;
      }
    } else {
      console.warn('不支持的vuedraggable事件类型:', dragInfo);
      return;
    }
    
    dragInfo = standardDragInfo;
  }
  
  // 标准格式验证
  if (!dragInfo.draggedNode || !dragInfo.targetNode) {
    console.error('拖拽信息不完整，无法处理:', dragInfo);
    showToast('error', '拖拽操作失败: 数据不完整');
    return;
  }
  
  try {
    // 首先尝试正常的API排序
    await handleNodeDrag(dragInfo);
  } catch (error) {
    console.error('API排序失败，尝试执行备用排序:', error);
    
    const { draggedNode, targetNode, position } = dragInfo;
    
    // 显示加载状态
    const loadingToastId = showToast('info', '正在尝试备用排序方法...', true);
    
    // 执行备用排序
    const success = performFallbackSort(
      draggedNode.type,
      draggedNode.id,
      targetNode.id,
      position
    );
    
    hideToast(loadingToastId);
    
    if (success) {
      showToast('info', '已使用备用方法完成排序（仅临时有效，刷新页面后将恢复）');
    } else {
      showToast('error', '排序失败，请刷新页面后重试');
    }
  }
};

// 处理TreeView组件的update:data事件
const handleTreeDataUpdate = async (newData) => {
  // 只在开发环境输出详细日志
  if (process.env.NODE_ENV === 'development') {
    console.log('CourseManagement - 接收到树形数据更新:', newData);
  }
  
  // 只有在courseStructure存在且有chapters属性时才更新
  if (courseStore.courseStructure && Array.isArray(courseStore.courseStructure.chapters)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('CourseManagement - 更新课程结构章节数据');
    }
    
    // 从newData中提取课程信息
    if (newData && newData.length > 0 && newData[0].type === 'course') {
      const courseNode = newData[0];
      
      // 更新章节数据，保留原有的章节属性
      if (courseNode.children && Array.isArray(courseNode.children)) {
        // 将拖拽后的章节数据与原始章节数据合并
        const updatedChapters = courseNode.children.map(chapterNode => {
          // 查找原始章节数据
          const originalChapter = courseStore.courseStructure.chapters.find(c => c.id === chapterNode.id);
          if (originalChapter) {
            // 合并数据，保留原始章节的所有属性，但更新顺序和子节点
            return {
              ...originalChapter,
              order: chapterNode.order,
              // 如果有小节数据，也更新小节
              lessons: chapterNode.children && Array.isArray(chapterNode.children)
                ? chapterNode.children.map(lessonNode => {
                    const originalLesson = originalChapter.lessons?.find(l => l.id === lessonNode.id);
                    return originalLesson ? { ...originalLesson, order: lessonNode.order } : lessonNode;
                  })
                : originalChapter.lessons
            };
          }
          return chapterNode;
        });
        
        // 更新课程结构中的章节数据
        courseStore.courseStructure.chapters = updatedChapters;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('CourseManagement - 章节数据更新完成:', updatedChapters);
        }
        
        // 检测是否有章节顺序变化，如果有则提交到服务器
        const hasChapterOrderChanged = detectChapterOrderChanges(updatedChapters);
        if (hasChapterOrderChanged) {
          // 显示加载状态
          const loadingToastId = showToast('info', '正在更新章节排序...', true);
          
          try {
            // 构建重排序数据
            const reorderData = updatedChapters.map(chapter => ({
              id: chapter.id,
              order: chapter.order
            }));
            
            console.log('提交章节排序数据到服务器:', reorderData);
            
            // 调用API进行排序
            const result = await courseStore.reorderChapters(reorderData);
            
            // 隐藏加载状态并显示成功消息
            hideToast(loadingToastId);
            showToast('success', '章节排序已更新');
            
            if (process.env.NODE_ENV === 'development') {
              console.log('章节排序服务器响应:', result);
            }
          } catch (error) {
            // 隐藏加载状态并显示错误消息
            hideToast(loadingToastId);
            showToast('error', `章节排序更新失败: ${error.message || '未知错误'}`);
            console.error('章节排序更新失败:', error);
          }
        }
        
        // 检测是否有小节顺序变化，如果有则提交到服务器
        const lessonChanges = detectLessonOrderChanges(updatedChapters);
        if (lessonChanges.length > 0) {
          // 显示加载状态
          const loadingToastId = showToast('info', '正在更新小节排序...', true);
          
          try {
            console.log('提交小节排序数据到服务器:', lessonChanges);
            
            // 调用API进行排序
            const result = await courseStore.reorderLessons(lessonChanges);
            
            // 隐藏加载状态并显示成功消息
            hideToast(loadingToastId);
            showToast('success', '小节排序已更新');
            
            if (process.env.NODE_ENV === 'development') {
              console.log('小节排序服务器响应:', result);
            }
          } catch (error) {
            // 隐藏加载状态并显示错误消息
            hideToast(loadingToastId);
            showToast('error', `小节排序更新失败: ${error.message || '未知错误'}`);
            console.error('小节排序更新失败:', error);
          }
        }
      }
    } else {
      // 如果newData不是预期的格式，直接替换chapters
      courseStore.courseStructure.chapters = newData;
      console.warn('CourseManagement - newData格式不符合预期，直接替换chapters');
    }
  } else {
    console.warn('CourseManagement - 无法更新课程结构章节数据，courseStructure不完整');
  }
};

// 检测章节顺序是否有变化
const detectChapterOrderChanges = (chapters) => {
  // 检查是否有任何章节的顺序发生了变化
  // 通过比较章节的当前顺序与其索引+1的差异来判断
  // 如果所有章节的顺序都等于其索引+1，则说明没有变化
  const hasChanges = chapters.some((chapter, index) => {
    // 如果章节的顺序不是整数，说明发生了拖拽操作
    if (Math.floor(chapter.order) !== chapter.order) {
      return true;
    }
    // 如果章节的顺序不等于其索引+1，说明顺序发生了变化
    return chapter.order !== index + 1;
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log('检测章节顺序变化:', hasChanges ? '有变化' : '无变化');
  }
  
  return hasChanges;
};

// 检测小节顺序是否有变化，并返回需要更新的小节数据
const detectLessonOrderChanges = (chapters) => {
  const changes = [];
  
  // 遍历所有章节
  chapters.forEach(chapter => {
    // 如果章节有小节，检查小节顺序是否有变化
    if (chapter.lessons && Array.isArray(chapter.lessons)) {
      // 检查是否有任何小节的顺序发生了变化
      const hasChangesInChapter = chapter.lessons.some((lesson, index) => {
        // 如果小节的顺序不是整数，说明发生了拖拽操作
        if (Math.floor(lesson.order) !== lesson.order) {
          return true;
        }
        // 如果小节的顺序不等于其索引+1，说明顺序发生了变化
        return lesson.order !== index + 1;
      });
      
      // 如果有变化，将所有小节的顺序信息添加到changes数组
      if (hasChangesInChapter) {
        chapter.lessons.forEach(lesson => {
          changes.push({
            id: lesson.id,
            order: lesson.order
          });
        });
      }
    }
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log('检测小节顺序变化:', changes.length > 0 ? `有${changes.length}个变化` : '无变化');
  }
  
  return changes;
};
</script>

<template>
  <div class="course-management">

    <div class="course-management-content">
      <!-- 左侧：课程列表 -->
      <div class="flex flex-col h-full overflow-hidden border-r border-gray-200 dark:border-gray-700 w-1/5 min-w-[250px]">
        <Card shadow="sm" class="h-full flex flex-col">
          <div class="flex flex-col gap-3 p-3 border-b border-gray-200 dark:border-gray-700">
            <div class="w-full">
              <Button @click="showCreateCourseModal = true" variant="primary" size="sm" class="w-full flex items-center justify-center">
                <i class="fa fa-plus mr-2"></i>创建课程
              </Button>
            </div>
            <div class="relative">
              <input 
                type="text" 
                placeholder="搜索课程..." 
                class="w-full py-2 pl-3 pr-8 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i class="fa fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          
          <div v-if="loading && !currentCourseId && courseStore.courses.length > 0" class="flex flex-col items-center justify-center p-8 h-full text-gray-500"> 
            <i class="fa fa-spinner fa-spin text-xl mb-2"></i>
            <span>加载中...</span>
          </div>
          
          <div v-else-if="courseStore.courses.length === 0" class="flex flex-col items-center justify-center p-8 h-full text-gray-500">
            <i class="fa fa-graduation-cap text-5xl mb-4 opacity-50"></i>
            <p class="mb-4">暂无课程</p>
            <Button @click="showCreateCourseModal = true" size="sm" variant="outline" class="mt-2">
              创建新课程
            </Button>
          </div>
          
          <div v-else class="flex flex-col p-3 gap-3 overflow-auto flex-1">
            <div
              v-for="course in courseStore.courses"
              :key="course.id"
              :class="[
                'flex items-start p-4 rounded-lg cursor-pointer transition-all duration-200 border',
                currentCourseId === course.id 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm' 
                  : 'bg-white dark:bg-gray-800 border-transparent hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-200 dark:hover:border-gray-700 hover:-translate-y-0.5 hover:shadow-sm'
              ]"
              @click="selectCourse(course.id)"
            >
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center mb-1.5">
                  <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ course.title }}</h3>
                </div>
                <p v-if="course.description" class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-1.5">
                  {{ course.description.length > 50 ? course.description.substring(0, 50) + '...' : course.description }}
                </p>
                <div class="flex items-center text-xs text-gray-400 dark:text-gray-500">
                  <i class="fa fa-clock mr-1"></i>
                  {{ course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : '最近更新' }}
                  <span 
                    :class="[
                      'ml-2 px-2 py-0.5 text-xs font-medium rounded-full',
                      course.status === 'published' 
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    ]"
                  >
                    {{ course.status === 'published' ? '已发布' : '草稿' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分页组件 -->
          <div v-if="totalItems > pageSize" class="px-3 pt-2 pb-3 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              :current-page="currentPage"
              :total-pages="totalPages"
              :page-size="pageSize"
              :total-items="totalItems"
              @update:currentPage="handlePageChange"
            />
          </div>
        </Card>
      </div>
      
      <!-- 主工作区 -->
      <div class="main-workspace">
        <!-- 欢迎视图 -->
        <div v-if="mainAreaViewMode === 'welcome'" class="welcome-view">
          <!-- 欢迎内容已移除 -->
        </div>

        <!-- 内容视图：课程结构与详情 -->
        <template v-else-if="mainAreaViewMode === 'content'">
          <!-- 中间：课程结构 -->
          <div class="course-structure-panel">
            <Card title="课程结构" shadow="sm" class="h-full flex flex-col">
              <div class="course-structure-header">
                <div class="course-structure-actions">
                  <Button size="sm" variant="outline" title="展开全部" @click="expandAllNodes">
                    <i class="fa fa-expand"></i>
                  </Button>
                  <Button size="sm" variant="outline" title="折叠全部" @click="collapseAllNodes">
                    <i class="fa fa-compress"></i>
                  </Button>
                </div>
              </div>
              
              <div v-if="!currentCourseId" class="empty-container flex-1 flex items-center justify-center">
                <p>请选择一个课程</p>
              </div>
              
              <div v-else-if="loading && currentCourseId" class="loading-container flex-1 flex items-center justify-center">
                <i class="fa fa-spinner fa-spin"></i>
                <span class="ml-2">加载中...</span>
              </div>
              
              <div v-else-if="treeData.length === 0" class="empty-container flex-1 flex flex-col items-center justify-center">
                <i class="fa fa-sitemap empty-icon"></i>
                <p>课程结构为空</p>
                <Button 
                  v-if="currentCourseId" 
                  @click="showAddChapterModal = true" 
                  size="sm" 
                  variant="outline" 
                  class="mt-4"
                >
                  添加章节
                </Button>
              </div>
              
              <div v-else class="tree-container flex-1">
                <TreeView
                  ref="treeViewRef"
                  :data="treeData"
                  :selected-id="selectedNodeId"
                  :draggable="true"
                  @node-click="handleNodeClick"
                  @node-drag="handleNodeDragWithFallback"
                  @node-add="handleNodeAdd"
                  @node-edit="handleNodeEdit"
                  @update:data="handleTreeDataUpdate"
                />
                <div class="mt-4 text-center">
                  <p class="text-sm text-gray-500">
                    提示: 可以通过拖拽调整章节和小节的顺序
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          <!-- 右侧：详情面板 -->
          <div class="detail-panel">
            <DetailPanel
              :node-type="selectedNodeType"
              :node-data="selectedNodeData"
              :loading="loading"
              :edit-mode="detailPanelEditMode"
              @update:edit-mode="handleEditModeChange"
              @save="handleSave"
              @delete="handleDelete"
              @create-chapter="handleCreateChapter"
              @create-lesson="handleCreateLesson"
              class="h-full"
            />
          </div>
        </template>
      </div>
    </div>
    
    <!-- 创建课程对话框 -->
    <Modal
      v-model:show="showCreateCourseModal"
      title="创建课程"
      @confirm="createCourse"
    >
      <div class="create-course-form">
        <div class="form-group">
          <label for="course-title" class="form-label">课程标题</label>
          <input
            id="course-title"
            v-model="newCourseData.title"
            type="text"
            class="form-input"
            placeholder="请输入课程标题"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="course-description" class="form-label">课程描述</label>
          <textarea
            id="course-description"
            v-model="newCourseData.description"
            class="form-textarea"
            placeholder="请输入课程描述"
            rows="4"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="course-status" class="form-label">课程状态</label>
          <select
            id="course-status"
            v-model="newCourseData.status"
            class="form-select"
          >
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
          </select>
        </div>
      </div>
    </Modal>
    
    <!-- 创建章节对话框 -->
    <Modal
      v-model:show="showAddChapterModal"
      title="创建章节"
      @confirm="handleCreateChapter(newChapterData)"
    >
      <div class="create-chapter-form">
        <div class="form-group">
          <label for="chapter-title" class="form-label">章节标题</label>
          <input
            id="chapter-title"
            v-model="newChapterData.title"
            type="text"
            class="form-input"
            placeholder="请输入章节标题"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="chapter-description" class="form-label">章节描述</label>
          <textarea
            id="chapter-description"
            v-model="newChapterData.description"
            class="form-textarea"
            placeholder="请输入章节描述"
            rows="4"
          ></textarea>
        </div>
      </div>
    </Modal>
    
    <!-- 创建小节对话框 -->
    <Modal
      v-model:show="showAddLessonModal"
      title="创建小节"
      @confirm="handleCreateLesson(newLessonData)"
    >
      <div class="create-lesson-form">
        <div class="form-group">
          <label for="lesson-title" class="form-label">小节标题</label>
          <input
            id="lesson-title"
            v-model="newLessonData.title"
            type="text"
            class="form-input"
            placeholder="请输入小节标题"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="lesson-type" class="form-label">小节类型</label>
          <select
            id="lesson-type"
            v-model="newLessonData.type"
            class="form-select"
          >
            <option value="video">视频</option>
            <option value="text">文本</option>
            <option value="quiz">测验</option>
          </select>
        </div>
        
        <div v-if="newLessonData.type === 'video'" class="form-group">
          <label for="lesson-video-url" class="form-label">视频URL</label>
          <input
            id="lesson-video-url"
            v-model="newLessonData.videoUrl"
            type="text"
            class="form-input"
            placeholder="请输入视频URL"
          />
        </div>
        
        <div class="form-group">
          <label for="lesson-duration" class="form-label">时长(分钟)</label>
          <input
            id="lesson-duration"
            v-model.number="newLessonData.duration"
            type="number"
            min="0"
            class="form-input"
            placeholder="请输入小节时长"
          />
        </div>
      </div>
    </Modal>
    
    <!-- 消息提示组件 -->
    <div class="toast-container">
      <transition-group name="toast">
        <div 
          v-for="toast in toasts" 
          :key="toast.id" 
          :class="['toast', `toast-${toast.type}`]"
        >
          <div class="toast-icon">
            <i 
              :class="[
                'fa', 
                toast.type === 'success' ? 'fa-check-circle' : 
                toast.type === 'error' ? 'fa-exclamation-circle' : 
                toast.type === 'warning' ? 'fa-exclamation-triangle' : 
                'fa-info-circle'
              ]"
            ></i>
          </div>
          <div class="toast-content">{{ toast.message }}</div>
          <div class="toast-close" @click="hideToast(toast.id)">
            <i class="fa fa-times"></i>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<style scoped>
/* 在这里定义一些局部的、实验性的颜色变量 */
:root {
  /* 一个更现代的强调色示例 (亮蓝色) */
  --modern-accent-color: oklch(65% 0.15 240);
  --modern-accent-text-color: oklch(100% 0 0); /* 白色 */

  /* 更清晰的次要文本颜色 */
  --enhanced-text-secondary: oklch(45% 0.02 255);
}

.course-management {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

.course-management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  height: 64px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text-primary);
  background-image: var(--title-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.course-management-content {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 主工作区 */
.main-workspace {
  flex: 1;
  display: flex;
  overflow: hidden;
  height: 100%;
}

/* 欢迎视图 */
.welcome-view {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  height: 100%;
}

/* 课程结构面板 */
.course-structure-panel {
  width: 35%;
  border-right: 1px solid var(--color-border);
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.course-structure-panel :deep(.card) {
  height: 100%;
  border-radius: 0;
  border: none;
  box-shadow: none;
  display: flex;
  flex-direction: column;
}

.course-structure-panel :deep(.card-header) {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-structure-panel :deep(.card) > div:not(.card-header) {
  flex: 1;
  overflow: auto;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.course-structure-header {
  padding: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}

.course-structure-actions {
  display: flex;
  gap: 0.5rem;
}

/* 详情面板 */
.detail-panel {
  flex: 1;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.detail-panel :deep(.card) {
  height: 100%;
  border-radius: 0;
  border: none;
  box-shadow: none;
  display: flex;
  flex-direction: column;
}

.detail-panel :deep(.card) > div:not(.card-header) {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

/* 通用样式 */
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.tree-container {
  padding: 0.5rem;
  height: 100%;
  overflow: auto;
}

.empty-container, .loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--color-text-secondary);
  text-align: center;
}

.create-course-form,
.create-chapter-form,
.create-lesson-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input,
.form-textarea,
.form-select {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-input-bg);
  color: var(--color-text-primary);
}

.form-textarea {
  resize: vertical;
}

.mt-4 {
  margin-top: 1rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

/* 消息提示组件样式 */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
}

.toast {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background-color: white;
  color: var(--color-text-primary);
  min-width: 250px;
  max-width: 350px;
}

.toast-success {
  border-left: 4px solid #10b981;
}

.toast-error {
  border-left: 4px solid #ef4444;
}

.toast-warning {
  border-left: 4px solid #f59e0b;
}

.toast-info {
  border-left: 4px solid #3b82f6;
}

.toast-icon {
  margin-right: 12px;
  font-size: 1.2rem;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

.toast-content {
  flex: 1;
  font-size: 0.9rem;
}

.toast-close {
  margin-left: 12px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

/* 消息提示动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 