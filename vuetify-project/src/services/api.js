// 發送 HTTP 請求
import axios from 'axios'
import userService from '@/services/user'
import { useUserStore } from '@/stores/user'

// axios.create 建立一個有自己預設設定的 axios
// baseURL = http://localhost:4000
// api.post('/user')
// api.post('/user/login')
// baseURL = x
// axios.post('http://localhost:4000/user')
// axios.post('http://localhost:4000/user/login')
// 發送不需要授權（token）的請求，例如註冊、公開資料等
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
})

// 請求前自動在 headers 加入 token
const apiAuth = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
})

// 在每次 apiAuth 發送請求前加入 token
apiAuth.interceptors.request.use(
  (config) => {
    const user = useUserStore()
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// .use(成功處理,失敗處理)
// token 過期後自動更新 token 自動續約登入
apiAuth.interceptors.response.use(
  (res) => res,
  async (error) => {
    // 如果錯誤有回應，沒網路的話不會有回應
    // 而且是 400 錯誤，而且是過期錯誤，而且請求不是更新
    if (
      error.response &&
      error.response.status === 400 &&
      error.config.url !== '/user/refresh' &&
      error.response.data.message === 'token 已過期'
    ) {
      const user = useUserStore()
      try {
        // 傳送更新請求
        const { data } = await userService.refresh()
        // 更新使用者資料
        user.token = data.token
        // 修改發生錯誤的請求設定，換成新的 token
        error.config.headers.Authorization = `Bearer ${data.token}`
        // 重新發送原本的請求
        return apiAuth(error.config)
      } catch {
        // 如果更新失敗，清除 pinia 存的使用者 token 和資料
        user.logout()
      }
    }
    // 如果沒有回應，或是其他錯誤
    // 回傳原本的錯誤
    throw error
  }
)

export default { api, apiAuth }
