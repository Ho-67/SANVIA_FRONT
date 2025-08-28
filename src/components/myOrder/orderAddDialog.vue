<template>
  <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition">
    <v-form class="h-100" :disabled="isSubmitting" @submit.prevent="submit">
      <v-card class="text-text">
        <div class="full-width d-flex justify-space-between align-center px-4 mt-4">
          <v-card-title class="text-accent"> 訂單評價 </v-card-title>
          <v-card-subtitle class="text-nav">訂單編號</v-card-subtitle>
        </div>
        <v-card-text>
          <v-row class="px-4 mt-0" no-gutters>
            <v-col cols="12">
              <div v-for="item in orderProducts" :key="item.product._id" class="mb-6">
                <div
                  class="d-flex align-items-start mb-2 cursor-pointer"
                  @click="item?.product && $router.push('/product/' + item.product._id)"
                >
                  <v-avatar class="mr-4" rounded="0" size="80">
                    <v-img cover :src="item?.product?.image || ''" />
                  </v-avatar>
                  <div class="flex-grow-1">
                    <h3 class="text-h6">{{ item.product.name }}</h3>
                    <p class="text-subtitle-2 text-medium-emphasis">
                      {{ item.product.description }}
                    </p>
                  </div>
                </div>

                <div class="mt-4">
                  <span class="text-body-1 font-weight-bold mb-2 d-block">情感滿意度</span>
                  <span class="text-caption text-no-wrap d-block mb-2">一星最低五星最高</span>
                  <v-rating
                    v-model="productReviews[item.product._id].rating"
                    color="highlight1"
                    :error-messages="getErrorMessage(item.product._id, 'rating')"
                    hover
                    size="40"
                  />
                </div>

                <v-textarea
                  v-model="productReviews[item.product._id].review"
                  class="mt-4"
                  counter="500"
                  :error-messages="getErrorMessage(item.product._id, 'review')"
                  label="分享您對此商品的感受"
                  rows="3"
                  :rules="[(v) => v.length <= 500 || '評論最多500字']"
                  variant="outlined"
                />
              </div>
            </v-col>
            <v-col cols="12">
              <p class="text-h6 mb-2">額外選項</p>
              <div class="d-flex align-center flex-wrap">
                <v-btn
                  class="mr-2 mb-2"
                  :color="isMonetaryTip ? 'primary' : 'grey'"
                  variant="outlined"
                  @click="toggleTip('monetary')"
                >
                  金錢打賞
                </v-btn>
                <v-btn
                  class="mr-2 mb-2"
                  :color="isEmotionalComp ? 'primary' : 'grey'"
                  variant="outlined"
                  @click="toggleTip('emotional')"
                >
                  精神賠償
                </v-btn>
                <v-card-text v-if="isEmotionalComp">
                  <p class="text-body-2 text-error">購買後發現不符自己需求，僅退回部分情緒幣</p>
                </v-card-text>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-row class="px-3 mb-4" no-gutters>
            <v-col class="d-flex justify-end pt-1" cols="12">
              <v-btn class="text-primary" :disabled="isSubmitting" @click="closeDialog">
                取消
              </v-btn>
              <v-btn class="text-accent" :loading="isSubmitting" type="submit" variant="flat">
                確認
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'
  import { useSnackbar } from 'vuetify-use-dialog'
  import reviewService from '@/services/review'
  import { useUserStore } from '@/stores/user' // Add this line

  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    orderProducts: {
      type: Array,
      required: true,
    },
  })

  const emit = defineEmits(['update:modelValue', 'submit-success'])

  const dialog = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  })

  const createSnackbar = useSnackbar()
  const user = useUserStore() // Add this line
  const isMonetaryTip = ref(false)
  const isEmotionalComp = ref(false)
  const isSubmitting = ref(false)

  // 每個商品的評價資料
  const productReviews = ref({})
  const errors = ref({})

  // 初始化每個商品的評價資料
  const initializeProductReviews = () => {
    for (const item of props.orderProducts) {
      productReviews.value[item.product._id] = {
        rating: 0,
        review: '',
        reviewId: null, // Added to store existing review ID
        isReviewed: false // Added to indicate if already reviewed
      }
    }
  }

  // 獲取錯誤訊息
  const getErrorMessage = (productId, field) => errors.value[productId]?.[field] || []

  // 驗證評價
  const validateReviews = () => {
    const newErrors = {}
    let isValid = true

    for (const [productId, review] of Object.entries(productReviews.value)) {
      newErrors[productId] = {}

      if (review.review.length > 500) {
        newErrors[productId].review = ['評論最多500字']
        isValid = false
      }
    }

    errors.value = newErrors
    return isValid
  }

  // 關閉對話框並重置
  const resetReviews = () => {
    initializeProductReviews()
    errors.value = {}
    isMonetaryTip.value = false
    isEmotionalComp.value = false
  }

  const closeDialog = () => {
    dialog.value = false
    resetReviews()
  }

  const toggleTip = (type) => {
    if (type === 'monetary') {
      isMonetaryTip.value = !isMonetaryTip.value
      isEmotionalComp.value = false
    } else if (type === 'emotional') {
      isEmotionalComp.value = !isEmotionalComp.value
      isMonetaryTip.value = false
    }
  }

  // 監聽對話框開啟和 orderProducts 變化
  watch(
    [() => props.modelValue, () => props.orderProducts],
    async ([isOpen, products]) => {
      if (isOpen && products.length > 0) {
        initializeProductReviews(); // Call initializeProductReviews here

        // Fetch existing reviews for each product
        for (const item of products) {
          try {
            const { data } = await reviewService.getReviewsByProductId(item.product._id);
            const existingReview = data.result.find(
              (r) => r.userId._id === user.id
            );

            if (existingReview) {
              productReviews.value[item.product._id].rating = existingReview.rating;
              productReviews.value[item.product._id].review = existingReview.content;
              productReviews.value[item.product._id].reviewId = existingReview._id;
              productReviews.value[item.product._id].isReviewed = true;
            }
          } catch (error) {
            console.error(`Error fetching review for product ${item.product._id}:`, error);
            // Optionally, show a snackbar for error
          }
        }
      }
    },
    { immediate: true }
  )

  // 表單送出
  const submit = async () => {
    if (!validateReviews()) {
      createSnackbar({
        text: '請檢查評論內容',
        snackbarProps: { color: 'warning' },
      })
      return
    }

    isSubmitting.value = true
    try {
      const reviewPromises = Object.entries(productReviews.value).map(([productId, review]) => {
        const payload = {
          rating: review.rating,
          content: review.review, // Changed from review.review to review.content
          orderId: props.orderId,
          monetaryTip: isMonetaryTip.value,
          emotionalCompensation: isEmotionalComp.value,
        }

        if (review.reviewId) {
          // Update existing review
          return reviewService.updateReview(productId, review.reviewId, payload)
        } else {
          // Add new review
          return reviewService.addReview(productId, payload)
        }
      })

      await Promise.all(reviewPromises)

      createSnackbar({
        text: '評價成功！',
        snackbarProps: { color: 'success' },
      })
      closeDialog()
      emit('submit-success')
    } catch (error) {
      console.error('Error submitting reviews:', error)
      createSnackbar({
        text: error.response?.data?.message || '評價失敗，請稍後再試',
        snackbarProps: { color: 'error' },
      })
    } finally {
      isSubmitting.value = false
    }
  }
</script>
