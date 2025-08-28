import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import productService from '@/services/product'

export const useProductStore = defineStore('product', () => {
  // --- State ---
  const products = ref([])
  const isLoading = ref(false)

  // --- Getters ---
  const totalProducts = computed(() => products.value.length)

  // --- Actions ---
  const fetchProducts = async (query = {}) => {
    isLoading.value = true
    try {
      // 1. 只挑選後端 API 認識的參數
      const apiQuery = {
        search: query.search,
        category: query.category,
        emotions: query.emotions,
      }

      // 2. 移除值為 undefined 或 null 的鍵，保持 query string 乾淨
      Object.keys(apiQuery).forEach((key) => {
        if (apiQuery[key] === undefined || apiQuery[key] === null) {
          delete apiQuery[key]
        }
      })

      // 3. 後端需要的是字串，如果前端傳來的是陣列，進行轉換
      if (apiQuery.emotions && Array.isArray(apiQuery.emotions)) {
        apiQuery.emotions = apiQuery.emotions.join(',')
      }

      const { data } = await productService.get(apiQuery)

      if (data.success && Array.isArray(data.products)) {
        products.value = data.products
      } else {
        products.value = []
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      products.value = []
      // Optionally re-throw or handle for the UI to show a message
    } finally {
      isLoading.value = false
    }
  }

  return {
    products,
    isLoading,
    totalProducts,
    fetchProducts,
  }
})
