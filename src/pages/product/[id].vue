<template>
  <v-container class="ma-0 pa-6 text-text" fluid>
    <!-- 載入中畫面 -->
    <div v-if="isLoading" class="text-center">
      <v-progress-circular color="primary" indeterminate size="64" />
      <p class="mt-4">載入中...</p>
    </div>

    <!-- 錯誤訊息 -->
    <v-alert v-else-if="error" prominent type="error" variant="tonal">
      {{ error }}
    </v-alert>

    <!-- 商品內容 -->
    <v-row v-else-if="product" justify="center">
      <!-- 商品圖片區塊 -->
      <v-col cols="12" lg="4" md="6">
        <!-- 主圖輪播 Swiper -->
        <div class="swiper-container">
          <swiper
            ref="mainSwiperRef"
            class="main-swiper"
            :modules="[Thumbs, Zoom, Pagination]"
            :pagination="{ clickable: true, dynamicBullets: true }"
            :thumbs="{ swiper: thumbsSwiper }"
            :zoom="true"
          >
            <swiper-slide v-for="(img, index) in product.images" :key="index">
              <div class="swiper-zoom-container">
                <v-img
                  aspect-ratio="1"
                  class="rounded-lg elevation-2 gallery-item"
                  cover
                  :src="img"
                  @click="openGallery(index)"
                />
              </div>
            </swiper-slide>
          </swiper>

          <!-- 縮圖列 Swiper -->
          <swiper
            class="thumb-swiper mt-4"
            :modules="[Thumbs]"
            :slides-per-view="3"
            space-between="10"
            watch-slides-progress
            @swiper="onThumbsSwiper"
          >
            <swiper-slide v-for="(img, index) in product.images" :key="'thumb-' + index">
              <v-img aspect-ratio="1" class="rounded-sm" cover :src="img" />
            </swiper-slide>
          </swiper>
        </div>
      </v-col>

      <!-- 商品文字資訊 -->
      <v-col cols="12" lg="8" md="6">
        <div class="pl-lg-6 d-flex flex-column h-100">
          <v-row align="center" class="mt-2" no-gutters>
            <v-col cols="12">
              <span class="d-flex align-center mb-2">
                分類：{{ product.emotions }} > {{ product.category }} ＞ {{ product.details }}
              </span>
            </v-col>
            <v-col>
              <span class="text-h5 font-weight-bold">{{ product.name }}</span>
              <br />
              <span class="text-body-2 text-nav">商品ID：{{ product._id }}</span>
            </v-col>
            <v-col cols="auto">
              <FavoriteButton :product-id="product._id" />
            </v-col>
            <!-- 自動擴展佔滿可用空間 -->
            <v-col cols="12">
              <div class="flex-grow-1">
                <p class="text-body-1 mb-6 mt-4">{{ product.description }}</p>
              </div>
            </v-col>
          </v-row>
          <v-row align="center" class="my-4" no-gutters>
            <!-- 商品評價統計 -->
            <v-col cols="6">
              <v-card class="pa-4" variant="text">
                <v-row no-gutters>
                  <v-col cols="12" md="auto">
                    <span class="text-body-1 font-weight-medium">商品評價：</span>
                  </v-col>
                  <v-col class="d-flex align-center" cols="12" md="auto">
                    <v-rating
                      color="highlight1"
                      half-increments
                      :model-value="averageRating"
                      readonly
                      size="24"
                    />
                    <div class="text-body-2 ml-2">{{ averageRating.toFixed(1) }}</div>
                  </v-col>
                  <v-col class="text-caption ml-2" cols="12" md="auto">
                    ({{ reviews.length }}則評價)
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
            <v-col class="text-right" cols="6">
              <span class="text-body-1 font-weight-medium">金錢打賞：</span>
            </v-col>
            <v-col cols="6">
              <span class="text-body-1 font-weight-medium">購買次數：</span>
            </v-col>
            <v-col class="text-right" cols="6">
              <span class="text-body-1 font-weight-medium">情感撤回：</span>
            </v-col>
          </v-row>

          <v-row align="center" class="mb-2" no-gutters>
            <v-col class="d-flex align-center">
              <p class="text-h6 font-weight-medium">情緒價值：</p>
              <p
                :class="[
                  'text-h6 font-weight-bold',
                  diceRollResult
                    ? diceRollResult.multiplier > 1
                      ? 'text-error'
                      : 'text-success'
                    : 'text-primary',
                ]"
              >
                {{ actualPrice }}
                <span v-if="diceRollResult" class="text-body-2">
                  ({{ diceRollResult.multiplier > 1 ? '上漲' : '下降' }}
                  {{ Math.abs((1 - diceRollResult.multiplier) * 100).toFixed(0) }}%)
                </span>
              </p>
            </v-col>
            <v-col cols="auto">
              <v-tooltip content-class="bg-info" location="start" :text="tooltipText">
                <template #activator="{ props }">
                  <span v-bind="props">
                    <v-btn
                      class="pb-1"
                      color="secondary"
                      :disabled="!product.roll || !userStore.isLoggedIn || !!diceRollResult"
                      variant="outlined"
                      @click="handleDiceClick"
                    >
                      <div class="d-flex flex-column align-center justify-center">
                        <v-icon>iconify:mdi:dice-d20</v-icon>
                        <small>{{ buttonText }}</small>
                      </div>
                    </v-btn>
                  </span>
                </template>
              </v-tooltip>
            </v-col>
          </v-row>

          <!-- 底部按鈕區塊 -->
          <div>
            <v-divider class="mb-6" />
            <v-row>
              <v-col>
                <v-btn
                  class="w-100"
                  color="primary"
                  :disabled="!product.sell"
                  size="large"
                  @click="handleAddToCart"
                >
                  加入購物車
                </v-btn>
              </v-col>
              <v-col>
                <v-btn
                  class="w-100"
                  :disabled="!product.sell"
                  size="large"
                  variant="outlined"
                  @click="handleBuyNow"
                >
                  立即購買
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-col>

      <!-- 商品詳細區塊 -->
      <v-col class="mt-8 mb-4" cols="12">
        <v-tabs v-model="tab" bg-color="primary" show-arrows>
          <v-tab value="features">商品特色</v-tab>
          <v-tab value="review">商品評價</v-tab>
          <v-tab value="specifications">商品規格</v-tab>
          <v-tab value="question">商品詢問</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <!-- 商品特色 -->
          <v-window-item value="features">
            <v-card flat>
              <v-card-text>
                <div v-if="product.features && product.features.length > 0">
                  <div v-for="(feature, i) in product.features" :key="'feature-' + i" class="mb-4">
                    <p v-if="feature.type === '文字說明'" class="text-body-1">
                      {{ feature.content[0] }}
                    </p>
                    <v-img
                      v-else-if="feature.type === '圖片說明'"
                      class="rounded-0 my-2 product-media-display"
                      :src="feature.content[0]"
                    />
                    <v-responsive
                      v-else-if="feature.type === '影音說明'"
                      aspect-ratio="16/9"
                      class="rounded-0 my-2"
                    >
                      <video class="product-media-display" controls :src="feature.content[0]" />
                    </v-responsive>
                  </div>
                </div>
                <div v-else class="text-center text-grey py-8">
                  <p>賣家未填寫</p>
                </div>
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- 商品評論 -->
          <v-window-item value="review">
            <v-card flat>
              <v-card-text>
                <div class="d-flex flex-wrap ga-2 mb-4">
                  <v-btn
                    :color="selectedRatings.length === 0 ? 'primary' : 'onSecondary'"
                    rounded="xl"
                    :variant="selectedRatings.length === 0 ? 'flat' : 'text'"
                    @click="selectedRatings = []"
                  >
                    全部 ({{ reviews.length }})
                  </v-btn>
                  <v-btn
                    v-for="rating in 5"
                    :key="rating"
                    :color="selectedRatings.includes(6 - rating) ? 'primary' : 'onSecondary'"
                    rounded="pill"
                    :variant="selectedRatings.includes(6 - rating) ? 'flat' : 'text'"
                    @click="toggleRatingFilter(6 - rating)"
                  >
                    {{ 6 - rating }}星 ({{ reviews.filter((r) => r.rating === 6 - rating).length }})
                  </v-btn>
                </div>
                <!-- 評論列表 -->
                <div v-if="filteredReviews.length > 0">
                  <v-list bg-color="transparent" lines="three">
                    <template v-for="(review, index) in filteredReviews" :key="review._id">
                      <v-list-item>
                        <template #prepend>
                          <v-avatar class="mr-4" color="primary">
                            <span class="text-h6">{{
                              review.userId.account.charAt(0).toUpperCase()
                            }}</span>
                          </v-avatar>
                        </template>

                        <v-list-item-title class="font-weight-bold">{{
                          review.userId.account
                        }}</v-list-item-title>
                        <v-list-item-subtitle class="d-flex align-center my-1">
                          <v-rating
                            color="amber"
                            density="compact"
                            half-increments
                            :model-value="review.rating"
                            readonly
                            size="small"
                          />
                          <span class="ml-2 text-caption">{{
                            new Date(review.createdAt).toLocaleDateString()
                          }}</span>
                        </v-list-item-subtitle>

                        <p class="text-body-2 py-2">{{ review.content }}</p>
                      </v-list-item>
                      <v-divider v-if="index < filteredReviews.length - 1" class="my-2" />
                    </template>
                  </v-list>
                </div>
                <div v-else class="text-center text-grey py-8">
                  <p v-if="selectedRatings.length === 0">目前還沒有人分享感受</p>
                  <p v-else>目前沒有符合篩選條件的評論</p>
                </div>
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- 商品規格 -->
          <v-window-item value="specifications">
            <v-card flat>
              <v-card-text>
                <div v-if="product.specifications && product.specifications.length > 0">
                  <div v-for="(spec, i) in product.specifications" :key="'spec-' + i" class="mb-4">
                    <p v-if="spec.type === '文字說明'" class="text-body-1">{{ spec.content[0] }}</p>
                    <v-img
                      v-else-if="spec.type === '圖片說明'"
                      class="rounded-0 my-2 product-media-display"
                      :src="spec.content[0]"
                    />
                  </div>
                </div>
                <div v-else class="text-center text-grey py-8">
                  <p>賣家未填寫</p>
                </div>
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- 商品詢問 -->
          <question-section ref="questionSection" :product-id="route.params.id" />
        </v-window>
      </v-col>

      <!-- 賣家其他商品 -->
      <v-col v-if="sellerProducts.length > 0" class="my-4" cols="12">
        <p class="text-h6 mb-2">賣家其他商品</p>
        <ProductCarousel :products="sellerProducts" />
      </v-col>

      <!-- 相關推薦 -->
      <v-col v-if="relatedProducts.length > 0" class="my-4" cols="12">
        <p class="text-h6 mb-2">同型態商品推薦</p>
        <ProductCarousel :products="relatedProducts" />
      </v-col>
    </v-row>

    <!-- 賭價 -->
    <Dice
      v-model="diceDialogVisible"
      :product-id="route.params.id"
      @roll-complete="handleRollComplete"
    />
    <div ref="galleryContainer" style="display: none" />
  </v-container>
  <v-overlay
    v-if="product"
    class="d-flex justify-center align-center"
    :model-value="!product.sell"
    opacity="0.7"
    persistent
  >
    <v-card class="pa-4 text-center">
      <v-alert class="mb-4" text="此商品已下架，無法購買" type="info" variant="tonal" />
      <v-btn color="primary" to="/product">看其他商品</v-btn>
    </v-card>
  </v-overlay>
</template>

<script setup>
  import lightgallery from 'lightgallery'
  import lgThumbnail from 'lightgallery/plugins/thumbnail'
  import lgZoom from 'lightgallery/plugins/zoom'
  import { Pagination, Thumbs, Zoom } from 'swiper/modules'
  import { Swiper, SwiperSlide } from 'swiper/vue'
  // vue
  import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  // vuetify
  import { useSnackbar } from 'vuetify-use-dialog'
  import Dice from '@/components/product/dice.vue'
  import FavoriteButton from '@/components/product/favoriteButton.vue'
  import ProductCarousel from '@/components/product/productCarousel.vue'
  import QuestionSection from '@/components/product/questionSection.vue'
  // services
  import apiService from '@/services/api'
  import productService from '@/services/product'
  import reviewService from '@/services/review'
  // stores
  import { useUserStore } from '@/stores/user'
  // styles
  import 'lightgallery/css/lg-thumbnail.css'
  import 'lightgallery/css/lg-zoom.css'
  import 'lightgallery/css/lightgallery.css'
  import 'swiper/css'
  import 'swiper/css/zoom'
  import 'swiper/css/pagination'
  import 'swiper/css/thumbs'

  const route = useRoute()
  const router = useRouter()
  const createSnackbar = useSnackbar()

  // Stores
  const userStore = useUserStore()

  // --- 商品資料相關 ---
  const product = ref(null)
  const isLoading = ref(true)
  const error = ref('')
  const sellerProducts = ref([])
  const relatedProducts = ref([])
  const tab = ref('features')

  // --- 評論相關 ---
  const reviews = ref([])
  const selectedRatings = ref([])

  // 商品詢問相關
  const questionSection = ref(null)

  // --- 計算屬性 ---
  const filteredReviews = computed(() => {
    if (selectedRatings.value.length === 0) {
      return reviews.value
    }
    return reviews.value.filter((review) => selectedRatings.value.includes(review.rating))
  })

  const averageRating = computed(() => {
    if (reviews.value.length === 0) return 0
    const totalRating = reviews.value.reduce((sum, review) => sum + review.rating, 0)
    return totalRating / reviews.value.length
  })

  const buttonText = computed(() => (diceRollResult.value ? '已擲骰' : '賭價'))
  const tooltipText = computed(() => {
    if (!userStore.isLoggedIn) return '請先登入'
    if (!product.value?.roll) return '此商品未開放賭價'
    if (diceRollResult.value) return '已完成賭價'
    return '僅一次機會，結果不可逆，請慎重選擇'
  })

  // --- 方法 ---
  const toggleRatingFilter = (rating) => {
    const index = selectedRatings.value.indexOf(rating)
    if (index === -1) {
      selectedRatings.value.push(rating)
    } else {
      selectedRatings.value.splice(index, 1)
    }
  }

  const handleDiceClick = () => {
    if (!userStore.isLoggedIn) {
      createSnackbar({
        text: '請先登入',
        snackbarProps: { color: 'warning' },
      })
      return
    }
    if (!product.value?.roll) {
      createSnackbar({
        text: '此商品未開放賭價',
        snackbarProps: { color: 'info' },
      })
      return
    }
    diceDialogVisible.value = true
  }

  // --- 擲骰相關 ---
  const diceDialogVisible = ref(false)
  const diceRollResult = ref(null)

  // 當骰子擲出結果時更新價格
  const handleRollComplete = async (newMultiplier) => {
    try {
      const { data } = await apiService.apiAuth.get(`/diceRolls/${route.params.id}`)
      if (data.success) {
        diceRollResult.value = data.result
      }
    } catch (error) {
      console.error('取得擲骰結果失敗:', error)
      createSnackbar({
        text: '取得擲骰結果失敗',
        snackbarProps: { color: 'error' },
      })
    }
  }

  // 計算實際價格
  const actualPrice = computed(() => {
    if (!product.value) return 0
    if (!diceRollResult.value) return product.value.price
    return Math.round(product.value.price * diceRollResult.value.multiplier)
  })

  // --- 評論方法 ---
  const fetchReviews = async () => {
    try {
      const { data } = await reviewService.getReviewsByProductId(route.params.id)
      if (data.success) {
        reviews.value = data.result
      }
    } catch (error) {
      console.error('取得商品評論失敗:', error)
      createSnackbar({
        text: '取得商品評論失敗',
        snackbarProps: { color: 'error' },
      })
    }
  }

  // --- 初始化資料 ---
  const fetchDiceRoll = async () => {
    try {
      const { data } = await apiService.apiAuth.get(`/diceRolls/${route.params.id}`)
      if (data.success) {
        diceRollResult.value = data.result
      }
    } catch (error) {
      if (error?.response?.status !== 404) {
        console.error('取得擲骰結果失敗:', error)
      }
    }
  }

  const fetchProduct = async () => {
    isLoading.value = true
    error.value = ''
    try {
      const productId = route.params.id
      const { data } = await productService.getId(productId)
      if (data.success) {
        product.value = data.product
        await fetchDiceRoll()

        // 假設資料沒有 images 陣列，轉換為陣列
        if (!product.value.images || !Array.isArray(product.value.images)) {
          product.value.images = [product.value.image].filter(Boolean)
        }
        fetchRecommendations()
      } else {
        throw new Error('找不到商品')
      }
    } catch (error) {
      console.error('載入商品失敗:', error)
      error.value =
        error?.response?.data?.message || error.message || '無法載入商品資料，請稍後再試'
      createSnackbar({
        text: error.value,
        snackbarProps: { color: 'error' },
      })
    } finally {
      isLoading.value = false
    }
  }

  // --- 推薦商品 ---
  const fetchRecommendations = async () => {
    if (!product.value) return

    // 決定 sellerId，處理 product.seller 是物件或字串的情況
    const sellerId = product.value?.seller?._id || product.value?.seller

    // 確保 sellerId 是有效的字串
    if (typeof sellerId !== 'string' || !sellerId.trim()) {
      console.error('無法取得有效的賣家 ID 字串。', '收到的值:', sellerId)
      return
    }

    try {
      // 取得賣家其他商品
      const sellerRes = await productService.getBySeller(sellerId, product.value._id)
      if (sellerRes.data.success) {
        sellerProducts.value = sellerRes.data.result
      }
    } catch (error) {
      console.error('取得賣家其他商品失敗:', error)
    }

    try {
      // 取得相關推薦
      const relatedRes = await productService.getRelated(product.value._id)
      if (relatedRes.data.success) {
        relatedProducts.value = relatedRes.data.result
      }
    } catch (error) {
      console.error('取得相關推薦失敗:', error)
    }
  }

  onMounted(() => {
    fetchProduct()
    fetchReviews()
    // 初始化商品詢問
    questionSection.value?.fetchQuestions()
  })

  // --- Swiper & Lightgallery --- //
  const mainSwiperRef = ref(null)
  const thumbsSwiper = ref(null)
  const gallery = ref(null)

  const onThumbsSwiper = (swiper) => {
    thumbsSwiper.value = swiper
  }

  // 點圖片開燈箱
  const galleryContainer = ref(null)

  const openGallery = async (index = 0) => {
    await nextTick()

    if (!product.value || !product.value.images?.length) return

    // 銷毀舊的 gallery
    if (gallery.value) {
      gallery.value.destroy()
      gallery.value = null
    }

    gallery.value = lightgallery(galleryContainer.value, {
      dynamic: true,
      dynamicEl: product.value.images.map((img) => ({
        src: img,
        thumb: img,
      })),
      index,
      plugins: [lgZoom, lgThumbnail],
      download: false,
    })
    gallery.value.openGallery(index)
  }

  // 元件卸載時清除
  onBeforeUnmount(() => {
    if (gallery.value) {
      gallery.value.destroy()
      gallery.value = null
    }
  })

  // --- 購物車 ---
  const quantity = ref(1)

  const handleAddToCart = async () => {
    try {
      const { data } = await apiService.apiAuth.patch('/user/cart', {
        product: route.params.id,
        quantity: quantity.value,
      })
      if (data.success) {
        userStore.cartTotal = data.result
        createSnackbar({
          text: '加入購物車成功',
          snackbarProps: { color: 'success' },
        })
      }
    } catch (error) {
      console.error('加入購物車失敗:', error)
      const errorMessage = '請先登入' || error?.response?.data?.message
      createSnackbar({
        text: errorMessage,
        snackbarProps: { color: 'error' },
      })
    }
  }

  const handleBuyNow = async () => {
    try {
      const { data } = await apiService.apiAuth.patch('/user/cart', {
        product: route.params.id,
        quantity: quantity.value,
      })
      if (data.success) {
        userStore.cartTotal = data.result
        router.push('/cart')
      }
    } catch (error) {
      console.error('操作失敗:', error)
      const errorMessage = '請先登入' || error.response?.data?.message
      createSnackbar({
        text: errorMessage,
        snackbarProps: { color: 'error' },
      })
    }
  }
</script>

<style scoped>
  .swiper-container {
    width: 100%;
  }
  /* 主圖 Swiper */
  .main-swiper {
    width: 100%;
    /* 強制主 Swiper 容器為正方形 */
    aspect-ratio: 1 / 1;
  }

  .main-swiper .swiper-slide {
    /* 確保幻燈片填滿其正方形父容器 */
    width: 100%;
    height: 100%;
    /* 使用 flexbox 進行內容置中 */
    display: flex;
    justify-content: center;
    align-items: center;
    /* 隱藏超出容器的內容 */
    overflow: hidden;
  }

  .main-swiper .swiper-zoom-container {
    /* 確保 zoom 容器填滿 slide 空間 */
    width: 100%;
    height: 100%;
    /* 再次使用 flexbox 確保 v-img 在 zoom 容器內置中 */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* 確保 v-img 填滿其父容器 */
  .main-swiper .swiper-zoom-container .v-img {
    width: 100%;
    height: 100%;
  }

  /* 縮圖 Swiper 樣式 */
  .thumb-swiper {
    width: 100%;
  }

  .thumb-swiper .swiper-slide {
    opacity: 0.4;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.3s;
  }

  .thumb-swiper .swiper-slide-thumb-active {
    opacity: 1;
    border-color: var(--v-theme-highlight1);
  }

  .gallery-item {
    cursor: pointer;
  }

  @media (max-width: 960px) {
    .swiper-container {
      /* 讓 swiper-container 成為 flex 容器，以便置中 main-swiper */
      display: flex;
      flex-direction: column;
      align-items: center; /* 水平置中 main-swiper */
      /* 移除 max-height，因為我們將在 main-swiper 上控制尺寸 */
      max-height: unset;
    }
    .main-swiper {
      flex: 1;
      min-height: 0;
      /* 強制主 Swiper 容器為正方形 */
      aspect-ratio: 1 / 1;
      /* 限制最大寬度為 50vh，這樣高度也會是 50vh，保持正方形 */
      max-width: 50vh;
      /* 限制最大高度為 50vh */
      max-height: 50vh;
    }
    .thumb-swiper {
      height: auto;
      flex-shrink: 0;
    }
  }
</style>

<style scoped>
  .product-media-display {
    width: 100%;
    aspect-ratio: 16/9;
    margin: 0;
  }
</style>
