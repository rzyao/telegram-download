import { createApp } from 'vue'
// import { ElTable, ElTableColumn } from 'element-plus'
// import 'element-plus/theme-chalk/el-image-viewer.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './app.vue'


const app = createApp(App)
// app.use(ElTable).use(ElTableColumn)
app.use(ElementPlus)
app.mount('#app')

