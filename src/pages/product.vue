<template>
  <v-container class="ma-0 text-text" fluid>
    <v-row class="mr-0">
      <!-- Main content column -->
      <v-col cols="12" md="9">
        <v-row class="pa-6">
          <!-- 載入中骨架 -->
          <template v-if="isLoading">
            <v-col v-for="n in 9" :key="n" cols="6" lg="4" md="6">
              <v-skeleton-loader type="card" />
            </v-col>
          </template>

          <!-- 商品卡片 -->
          <template v-else-if="paginatedProducts.length > 0">
            <v-col v-for="product in paginatedProducts" :key="product._id" cols="6" lg="4" md="6">
              <ProductCard v-bind="product" />
            </v-col>
          </template>

          <!-- 無商品訊息 -->
          <v-col v-else cols="12">
            <v-alert class="ma-4" type="info" variant="tonal"> 找不到符合條件的商品 </v-alert>
          </v-col>

          <v-col v-if="totalPages > 1" cols="12">
            <v-pagination v-model="page" circle :length="totalPages" :total-visible="5" />
          </v-col>
        </v-row>
      </v-col>

      <!-- Sidebar column -->
      <v-col cols="12" md="3">
        <RankingSidebar />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { storeToRefs } from 'pinia'
  import { computed, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import ProductCard from '@/components/product/productCard.vue'
  import RankingSidebar from '@/components/product/rankingSidebar.vue'
  import { useProductStore } from '@/stores/product'

  const route = useRoute()
  const productStore = useProductStore()
  const { products, isLoading } = storeToRefs(productStore)

  // --- 排序邏輯 ---
  const sortedProducts = computed(() => {
    const { sortBy, sortOrder } = route.query
    // 如果沒有排序參數，直接返回原陣列 (後端預設為最新)
    if (!sortBy) return products.value

    const order = Number.parseInt(sortOrder) || -1

    // 複製陣列以避免修改原始 store 狀態
    return [...products.value].sort((a, b) => {
      if (sortBy === 'price') {
        return (a.price - b.price) * order
      } else if (sortBy === 'createdAt') {
        return (new Date(a.createdAt) - new Date(b.createdAt)) * order
      }
      return 0
    })
  })

  // --- 分頁邏輯 ---
  const page = ref(1)
  const ITEMS_PER_PAGE = 9 // 一頁顯示 9 個

  const totalPages = computed(() => {
    return Math.ceil(sortedProducts.value.length / ITEMS_PER_PAGE)
  })

  const paginatedProducts = computed(() => {
    const start = (page.value - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return sortedProducts.value.slice(start, end)
  })

  // --- 資料擷取 ---
  watch(
    () => route.query,
    (newQuery) => {
      productStore.fetchProducts(newQuery)
      // 當搜尋條件改變時，重置回第一頁
      page.value = 1
    },
    {
      immediate: true, // 立即執行一次以載入初始資料
      deep: true,
    }
  )
</script>
