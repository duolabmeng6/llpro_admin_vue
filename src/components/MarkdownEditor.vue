<template>
  <div class="markdown-editor-container">
    <!-- 预览模式使用 MdPreview 组件 -->
    <div v-if="previewOnly" class="preview-container">
      <MdPreview :id="previewId" :modelValue="content" :theme="theme" :preview-theme="previewTheme" :code-theme="codeTheme" :language="language" />
      <MdCatalog v-if="showCatalog" :editorId="previewId" scrollElement=".preview-container" />
    </div>
    <!-- 编辑模式使用完整的 MdEditor 组件 -->
    <MdEditor
      v-else
      v-model="content"
      :style="{ height }"
      :theme="theme"
      :preview-theme="previewTheme"
      :code-theme="codeTheme"
      :toolbars="toolbarConfig"
      :show-code-row-number="showCodeRowNumber"
      :language="language"
      :on-upload-img="handleUploadImage"
      @onSave="handleSave"
      @onGetCatalog="handleGetCatalog"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { MdEditor, MdPreview, MdCatalog } from 'md-editor-v3';
// 仅导入必要的CSS
import 'md-editor-v3/lib/preview.css'; // 预览模式需要的CSS
// 编辑器模式的CSS会在需要时动态导入

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  theme: {
    type: String,
    default: 'light', // light 或 dark
  },
  previewTheme: {
    type: String,
    default: 'default', // default, github, vuepress, mk-cute, smart-blue, cyanosis
  },
  codeTheme: {
    type: String,
    default: 'atom', // atom, a11y, github, gradient, kimbie, paraiso, qtcreator, stackoverflow
  },
  toolbars: {
    type: Array,
    default: () => [], // 为空时使用默认工具栏
  },
  height: {
    type: String,
    default: '500px',
  },
  showCodeRowNumber: {
    type: Boolean,
    default: true,
  },
  language: {
    type: String,
    default: 'zh-CN', // 默认使用内置的中文语言包
  },
  uploadImageConfig: {
    type: Object,
    default: () => ({}),
  },
  previewOnly: {
    type: Boolean,
    default: false,
  },
  showCatalog: {
    type: Boolean,
    default: false, // 默认不显示目录
  }
});

const emit = defineEmits([
  'update:modelValue',
  'onSave',
  'onUploadImage',
  'onGetCatalog',
]);

// 内部状态
const content = ref(props.modelValue);
// 预览模式的唯一ID
const previewId = ref(`preview-${Math.random().toString(36).substring(2, 9)}`);

// 工具栏配置
const toolbarConfig = computed(() => {
  if (props.toolbars.length === 0) {
    return undefined; // 使用默认工具栏
  }
  return props.toolbars;
});

// 监听外部 modelValue 变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== content.value) {
      content.value = newValue;
    }
  }
);

// 监听内部 content 变化
watch(
  content,
  (newValue) => {
    emit('update:modelValue', newValue);
  }
);

// 处理保存事件
const handleSave = (value, html) => {
  emit('onSave', value, html);
};

// 处理图片上传
const handleUploadImage = async (files, callback) => {
  // 如果有自定义上传配置，则使用自定义上传
  if (props.uploadImageConfig.customUpload) {
    emit('onUploadImage', files, callback);
    return;
  }

  // 默认上传处理逻辑
  const res = await Promise.all(
    files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            url: reader.result,
            alt: file.name,
          });
        };
        reader.readAsDataURL(file);
      });
    })
  );
  
  callback(res);
};

// 处理目录获取
const handleGetCatalog = (catalog) => {
  emit('onGetCatalog', catalog);
};
</script>

<style scoped>
.markdown-editor-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-container {
  height: 100%;
  overflow: auto;
  padding-right: 20px; /* 为目录留出空间 */
}
</style>
