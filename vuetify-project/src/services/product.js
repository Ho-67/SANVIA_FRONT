import apiService from './api'

export default {
  create(data) {
    return apiService.apiAuth.post('/product', data)
  },
  getAll(filters) {
    // axios.get 第二個參數是一個 config 物件，裡面要包 params，否則 query string 不會附上
    return apiService.apiAuth.get('/product/all', { params: filters })
    // return apiService.apiAuth.get('/product/all')
  },
  get(params) {
    return apiService.api.get('/product', { params })
  },
  getId(id) {
    return apiService.api.get('/product/' + id)
  },
  update(id, data) {
    return apiService.apiAuth.patch(`/product/${id}`, data)
  },
  getBySeller(sellerId, excludeProductId) {
    return apiService.api.get(`/product/seller/${sellerId}`, {
      params: { exclude: excludeProductId }
    })
  },
  getRelated(productId) {
    return apiService.api.get(`/product/related/${productId}`)
  }
}
