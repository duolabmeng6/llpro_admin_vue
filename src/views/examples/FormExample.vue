<script setup>
import { ref, reactive } from 'vue'
import { Form, FormGroup, Select, Checkbox, Radio, Textarea, Switch } from '../../components/form'
import Input from '../../components/Input.vue'
import Button from '../../components/Button.vue'
import Card from '../../components/Card.vue'

// 表单数据
const formData = reactive({
  username: '',
  password: '',
  email: '',
  gender: '',
  interests: [],
  description: '',
  notification: false,
  country: '',
  agreement: false
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { pattern: /^[a-zA-Z0-9_]{4,16}$/, message: '用户名必须是4-16位字母、数字或下划线' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { validator: (value) => value.length >= 6 || '密码长度不能小于6位' }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入有效的邮箱地址' }
  ],
  gender: [
    { required: true, message: '请选择性别' }
  ],
  country: [
    { required: true, message: '请选择国家/地区' }
  ],
  agreement: [
    { validator: (value) => value === true || '请同意用户协议' }
  ]
}

// 表单提交状态
const loading = ref(false)
const submitResult = ref('')

// 国家/地区选项
const countryOptions = [
  { label: '中国', value: 'CN' },
  { label: '美国', value: 'US' },
  { label: '英国', value: 'GB' },
  { label: '日本', value: 'JP' },
  { label: '韩国', value: 'KR' },
  { 
    label: '欧洲',
    options: [
      { label: '法国', value: 'FR' },
      { label: '德国', value: 'DE' },
      { label: '意大利', value: 'IT' },
      { label: '西班牙', value: 'ES' }
    ]
  },
  { 
    label: '亚洲',
    options: [
      { label: '新加坡', value: 'SG' },
      { label: '马来西亚', value: 'MY' },
      { label: '泰国', value: 'TH' },
      { label: '越南', value: 'VN' }
    ]
  }
]

// 兴趣爱好选项
const interestOptions = [
  { label: '阅读', value: 'reading' },
  { label: '音乐', value: 'music' },
  { label: '电影', value: 'movie' },
  { label: '旅行', value: 'travel' },
  { label: '运动', value: 'sports' },
  { label: '编程', value: 'coding' }
]

// 表单提交处理
const handleSubmit = (formResult) => {
  if (formResult.isValid) {
    loading.value = true
    submitResult.value = ''
    
    // 模拟API请求
    setTimeout(() => {
      loading.value = false
      submitResult.value = '表单提交成功！'
      console.log('表单数据：', formResult.model)
    }, 1500)
  } else {
    submitResult.value = '表单验证失败，请检查输入'
  }
}

// 重置表单
const handleReset = () => {
  submitResult.value = ''
}
</script>

<template>
  <div class="form-example p-6">
    <h1 class="text-2xl font-bold mb-6">表单组件示例</h1>
    
    <Card class="mb-8">
      <template #header>
        <h2 class="text-xl font-semibold">基本表单</h2>
      </template>
      
      <Form 
        :model="formData" 
        :rules="rules" 
        layout="vertical"
        @submit="handleSubmit"
        @reset="handleReset"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormGroup label="用户名" required>
            <Input v-model="formData.username" placeholder="请输入用户名" />
          </FormGroup>
          
          <FormGroup label="密码" required>
            <Input v-model="formData.password" type="password" placeholder="请输入密码" />
          </FormGroup>
          
          <FormGroup label="邮箱" required>
            <Input v-model="formData.email" type="email" placeholder="请输入邮箱" />
          </FormGroup>
          
          <FormGroup label="国家/地区" required>
            <Select v-model="formData.country" :options="countryOptions" placeholder="请选择国家/地区" />
          </FormGroup>
          
          <FormGroup label="性别" required>
            <div class="flex space-x-4">
              <Radio v-model="formData.gender" value="male" label="男" name="gender" />
              <Radio v-model="formData.gender" value="female" label="女" name="gender" />
              <Radio v-model="formData.gender" value="other" label="其他" name="gender" />
            </div>
          </FormGroup>
          
          <FormGroup label="兴趣爱好">
            <div class="grid grid-cols-2 gap-2">
              <Checkbox 
                v-for="option in interestOptions" 
                :key="option.value"
                v-model="formData.interests"
                :value="option.value"
                :label="option.label"
              />
            </div>
          </FormGroup>
          
          <FormGroup label="个人简介" class="md:col-span-2">
            <Textarea 
              v-model="formData.description" 
              placeholder="请输入个人简介" 
              :rows="4"
              autoResize
            />
          </FormGroup>
          
          <FormGroup class="md:col-span-2">
            <Switch v-model="formData.notification" label="接收通知" />
          </FormGroup>
          
          <FormGroup class="md:col-span-2">
            <Checkbox v-model="formData.agreement" label="我已阅读并同意用户协议" />
          </FormGroup>
        </div>
        
        <div class="flex items-center justify-end space-x-4 mt-6">
          <Button type="reset" variant="outline">重置</Button>
          <Button type="submit" :disabled="loading">
            <span v-if="loading">提交中...</span>
            <span v-else>提交</span>
          </Button>
        </div>
        
        <div v-if="submitResult" class="mt-4 p-3 rounded" :class="{'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100': !submitResult.includes('失败'), 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100': submitResult.includes('失败')}">
          {{ submitResult }}
        </div>
      </Form>
    </Card>
    
    <Card class="mb-8">
      <template #header>
        <h2 class="text-xl font-semibold">水平布局表单</h2>
      </template>
      
      <Form 
        :model="formData" 
        :rules="rules" 
        layout="horizontal"
        labelWidth="120px"
      >
        <FormGroup label="用户名" required>
          <Input v-model="formData.username" placeholder="请输入用户名" />
        </FormGroup>
        
        <FormGroup label="邮箱" required>
          <Input v-model="formData.email" type="email" placeholder="请输入邮箱" />
        </FormGroup>
        
        <FormGroup label="国家/地区" required>
          <Select v-model="formData.country" :options="countryOptions" placeholder="请选择国家/地区" />
        </FormGroup>
        
        <FormGroup label="接收通知">
          <Switch v-model="formData.notification" />
        </FormGroup>
        
        <div class="flex items-center justify-end space-x-4 mt-6">
          <Button variant="outline">取消</Button>
          <Button>保存</Button>
        </div>
      </Form>
    </Card>
    
    <Card>
      <template #header>
        <h2 class="text-xl font-semibold">内联布局表单</h2>
      </template>
      
      <Form 
        :model="formData" 
        :rules="rules" 
        layout="inline"
      >
        <FormGroup label="用户名">
          <Input v-model="formData.username" placeholder="用户名" />
        </FormGroup>
        
        <FormGroup label="密码">
          <Input v-model="formData.password" type="password" placeholder="密码" />
        </FormGroup>
        
        <Button>登录</Button>
      </Form>
    </Card>
  </div>
</template>

<style scoped>
.form-example {
  max-width: 1200px;
  margin: 0 auto;
}
</style> 