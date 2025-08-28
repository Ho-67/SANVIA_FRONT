// 用 Pinia 建立使用者資料中心
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import apiService from '@/services/api'

export const useUserStore = defineStore(
  'user',
  () => {
    const id = ref('')
    const account = ref('')
    const cartTotal = ref(0)
    const role = ref('buyer')
    const token = ref('')
    const email = ref('')
    const bio = ref('')
    const theme = ref('')
    const avatar = ref('')
    const favorites = ref([])

    // 只要有 token 就算登入
    const isLoggedIn = computed(() => token.value.length > 0)
    const isSeller = computed(() => role.value === 'seller')

    const fetchFavorites = async () => {
      if (!token.value) {
        return
      }
      try {
        const { data } = await apiService.apiAuth.get('/user/favorites')
        if (data.success) {
          favorites.value = data.result
        }
      } catch (error) {
        console.error('無法獲取收藏列表', error)
      }
    }

    // 當從後端登入成功後，把回傳的使用者資料填進來
    const login = (data) => {
      if (data.token) {
        token.value = data.token
        localStorage.setItem('token', data.token)
      }

      id.value = data._id || ''
      account.value = data.account || ''
      cartTotal.value = data.cartTotal || 0
      role.value = data.role || 'buyer'
      email.value = data.email || ''
      bio.value = data.bio || ''
      theme.value = data.theme || theme.value || 'light'
      avatar.value = data.avatar || ''
      fetchFavorites()
    }

    const logout = () => {
      id.value = ''
      account.value = ''
      email.value = ''
      bio.value = ''
      theme.value = 'light'
      cartTotal.value = 0
      role.value = 'buyer'
      token.value = ''
      favorites.value = []
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
    }

    const setRole = (newRole) => {
      role.value = newRole
    }

    const setAccountInfo = (newInfo) => {
      account.value = newInfo.account
      email.value = newInfo.email
      bio.value = newInfo.bio
      if (newInfo.theme) {
        theme.value = newInfo.theme
      }
      if (newInfo.avatar) {
        avatar.value = newInfo.avatar
      }
    }

    const fetchUser = async () => {
      try {
        if (!token.value) {
          const storedToken = localStorage.getItem('token')
          if (storedToken) {
            token.value = storedToken
          } else {
            return false
          }
        }

        const { data } = await apiService.apiAuth.get('/user/profile')
        await fetchFavorites()

        if (data.success && data.user) {
          login(data.user)
          return true
        } else {
          return false
        }
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout()
        }
        return false
      }
    }

    const setTheme = async (newTheme) => {
      if (newTheme !== theme.value) {
        try {
          const response = await apiService.apiAuth.patch('/user/profile', {
            theme: newTheme,
          })
          if (response.data.success) {
            theme.value = newTheme
          }
        } catch (error) {
          console.error('Failed to update theme:', error)
        }
      }
    }

    const toggleFavorite = async (productId) => {
      try {
        const isFavorited = favorites.value.some(fav => fav._id === productId)
        if (isFavorited) {
          await apiService.apiAuth.delete(`/user/favorites/${productId}`)
          favorites.value = favorites.value.filter((fav) => fav._id !== productId)
        } else {
          await apiService.apiAuth.post('/user/favorites', { product: productId })
          // After adding, refetch favorites to get the populated product object
          await fetchFavorites()
        }
      } catch (error) {
        console.error('Failed to toggle favorite:', error)
      }
    }

    const clearCart = () => {
      cartTotal.value = 0
    }

    return {
      id,
      account,
      email,
      bio,
      theme,
      avatar,
      cartTotal,
      role,
      token,
      favorites,
      isLoggedIn,
      isSeller,
      login,
      logout,
      setRole,
      setAccountInfo,
      setTheme,
      fetchUser,
      clearCart,
      toggleFavorite,
      fetchFavorites,
    }
  },
  {
    persist: {
      key: 'user',
      paths: ['token', 'id', 'account', 'role', 'email', 'bio', 'theme', 'avatar'],
    },
  }
)
