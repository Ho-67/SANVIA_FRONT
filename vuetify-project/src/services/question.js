import apiService from './api'

export const apiQuestion = {
  create(data) {
    return apiService.apiAuth.post('/questions', data)
  },
  getByProduct(productId) {
    return apiService.api.get('/questions/product/' + productId)
  },
  reply(parentId, data) {
    return apiService.apiAuth.post('/questions', {
      ...data,
      parentId,
    })
  },
  like(questionId) {
    return apiService.apiAuth.patch(`/questions/like/${questionId}`)
  },
  dislike(questionId) {
    return apiService.apiAuth.patch(`/questions/dislike/${questionId}`)
  },
}
