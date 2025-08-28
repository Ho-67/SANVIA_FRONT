import apiService from './api'

export default {
  create(data) {
    return apiService.apiAuth.post('/order', data)
  },
  getMy() {
    return apiService.apiAuth.get('/order/my')
  },
  getAll() {
    return apiService.apiAuth.get('/order/all')
  },
}
