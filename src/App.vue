<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script setup>
  import { computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useTheme } from 'vuetify'
  import HomeLayout from '@/layouts/home.vue'
  import ManageLayout from '@/layouts/manage.vue'
  import ProductLayout from '@/layouts/product.vue'

  import { useUserStore } from '@/stores/user'

  const route = useRoute()
  const layout = computed(() => {
    const layoutName = route.meta.layout || 'product'
    switch (layoutName) {
      case 'home': {
        return HomeLayout
      }
      case 'manage': {
        return ManageLayout
      }
      default: {
        return ProductLayout
      }
    }
  })

  const user = useUserStore()

  const theme = useTheme()

  function applyTheme(themeName) {
    theme.global.name.value = themeName === 'dark' || themeName === 'light' ? themeName : 'light'
  }

  onMounted(async () => {
    // 登出時清除整個 user localStorage，保證重置
    if (!user.token) {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        user.token = storedToken
      }
    }

    const success = await user.fetchUser()

    if (success && user.theme) {
      applyTheme(user.theme)
    } else {
      applyTheme('light')
    }
  })

  watch(
    () => user.theme,
    (newTheme) => {
      applyTheme(newTheme)
    },
    { immediate: true }
  )
</script>
