<template>
  <MdEditor
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
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

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
});

const emit = defineEmits([
  'update:modelValue',
  'onSave',
  'onUploadImage',
  'onGetCatalog',
]);

// 内部状态
const content = ref(props.modelValue);

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
