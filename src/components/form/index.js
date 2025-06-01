// 表单组件入口文件
// 导出所有表单组件，方便统一引入

import Form from './Form.vue'
import FormGroup from './FormGroup.vue'
import Select from './Select.vue'
import Checkbox from './Checkbox.vue'
import Radio from './Radio.vue'
import Textarea from './Textarea.vue'
import Switch from './Switch.vue'

// 导出所有组件
export {
  Form,
  FormGroup,
  Select,
  Checkbox,
  Radio,
  Textarea,
  Switch
}

// 默认导出所有组件
export default {
  install(app) {
    app.component('Form', Form)
    app.component('FormGroup', FormGroup)
    app.component('Select', Select)
    app.component('Checkbox', Checkbox)
    app.component('Radio', Radio)
    app.component('Textarea', Textarea)
    app.component('Switch', Switch)
  }
} 