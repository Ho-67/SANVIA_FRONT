// Utilities
// 建立 Pinia 狀態容器
import { createPinia } from 'pinia'
// 自動把 store 的資料保存到 localStorage
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'

const pinia = createPinia()
// pinia.use() 掛載插件到 pinia
pinia.use(piniaPluginPersistedState)

export default pinia
