import Vue from 'vue'
import { Button, Input, Form, FormItem, Message } from 'element-ui'
// vue注册为全局组件
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.prototype.$message = Message
