// 已經設定好伺服器網址，不用每次打完整地址
import apiService from './api'

export default {
  // data 是要送給後端的資料
  // 註冊新帳號
  create(data) {
    return apiService.api.post('/user', data)
  },
  // 登入
  login(data) {
    return apiService.api.post('/user/login', data)
  },
  // 重新整理頁面後，根據 token 查詢使用者資料
  profile(data) {
    return apiService.apiAuth.get('/user/profile')
  },
  // 更新某些使用者狀態（例如延長登入狀態或更新暱稱等）
  refresh() {
    return apiService.apiAuth.patch('/user/refresh')
  },
  // 登出
  logout() {
    return apiService.apiAuth.delete('/user/logout')
  },
  // 購物車
  cart(data) {
    return apiService.apiAuth.patch('/user/cart', data)
  },
  getCart() {
    return apiService.apiAuth.get('/user/cart')
  },
  // 新增取得擲骰結果的 API 呼叫
  getDiceRoll(productId) {
    return apiService.apiAuth.get(`/diceRolls/${productId}`)
  },
}