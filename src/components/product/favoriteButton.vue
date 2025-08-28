<template>
  <v-btn class="no-swipe-click" icon @click.stop.prevent="toggleFavorite">
    <v-icon :color="isFavorited ? 'red' : ''">{{
      isFavorited ? 'mdi-heart' : 'mdi-heart-outline'
    }}</v-icon>
  </v-btn>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '@/stores/user'

  const props = defineProps({
    productId: {
      type: String,
      required: true,
    },
  })

  const user = useUserStore()
  const router = useRouter()

  const isFavorited = computed(() => {
    return user.favorites.some((fav) => fav._id === props.productId)
  })

  const toggleFavorite = async () => {
    if (!user.isLoggedIn) {
      router.push('/register')
    }

    await user.toggleFavorite(props.productId)
  }
</script>
