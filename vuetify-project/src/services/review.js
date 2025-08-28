import apiService from './api'

export default {
  // 新增評價
  addReview(productId, data) {
    return apiService.apiAuth.post(`/product/${productId}/reviews`, data)
  },
  // 獲取商品評價
  getReviewsByProductId(productId) {
    return apiService.api.get(`/product/${productId}/reviews`)
  },
  // 獲取訂單商品評價
  getReviewsByOrderId(orderId) {
    return apiService.apiAuth.get(`/orders/${orderId}/reviews`)
  },
  // 獲取用戶評價
  getUserReviews() {
    return apiService.apiAuth.get('/user/reviews')
  },
  // 更新評價
  updateReview(productId, reviewId, data) {
    return apiService.apiAuth.patch(`/product/${productId}/reviews/${reviewId}`, data)
  }
}