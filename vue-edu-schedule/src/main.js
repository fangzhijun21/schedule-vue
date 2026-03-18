import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// 引入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入所有图标（全局注册，无需单个导入）
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// ========== 新增：引入并注册 Pinia ==========
import { createPinia } from 'pinia'

const app = createApp(App)
// 关键：先注册 Pinia，再注册其他插件
const pinia = createPinia()
app.use(pinia)

app.use(router)
app.use(ElementPlus)
// 全局注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.mount('#app')
