<template>
  <v-row class="text-text pa-6">
    <v-col cols="12">
      <v-card class="rounded-t-circle" color="section" flat>
        <v-card-text class="text-h6 text-onSecondary font-weight-bold">
          <div class="d-flex align-center justify-center">
            <Icon height="24" icon="ri:pulse-ai-line" />
            <span>心選好物</span>
            <Icon height="24" icon="gravity-ui:heart-pulse" />
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <!-- 載入中 -->
    <v-col v-if="loading" class="text-center" cols="12">
      <v-progress-circular color="primary" indeterminate />
    </v-col>
    <!-- 空狀態 -->
    <v-col v-else-if="favorites.length === 0" class="text-center my-10" cols="12">
      <v-img
        alt="空收藏的插圖"
        class="mx-auto mb-4"
        max-width="150"
        src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
      />
      <div class="text-h6 font-weight-medium mb-2">看來還沒有商品能引起你的共鳴</div>
      <router-link
        class="text-body-2 text-highlight2 font-weight-medium text-decoration-none"
        to="/product"
      >
        去逛逛，找到真正打動你的那一件吧！
      </router-link>
    </v-col>
    <!-- 收藏列表 -->
    <v-col v-for="product in favorites" :key="product._id" cols="12" lg="3" md="4" sm="6">
      <ProductCard
        :key="product._id"
        :_id="product._id"
        :category="product.category"
        :description="product.description"
        :emotions="product.emotions"
        :image="product.image"
        :name="product.name"
        :price="product.price"
      />
    </v-col>
  </v-row>
</template>

<script setup>
  import { Icon } from '@iconify/vue'
  import { onMounted, ref } from 'vue'
  import ProductCard from '@/components/product/productCard.vue'
  import { useUserStore } from '@/stores/user'

  const user = useUserStore()
  const favorites = ref([])
  const loading = ref(true)

  onMounted(async () => {
    if (user.isLoggedIn) {
      try {
        // 確保 user.favorites 已經被填充
        await user.fetchFavorites()
        favorites.value = user.favorites
      } catch (error) {
        console.error('Failed to fetch favorite products:', error)
      } finally {
        loading.value = false
      }
    } else {
      loading.value = false
    }
  })
</script>
