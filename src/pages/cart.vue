<template>
  <v-container class="my-4 mx-0 pa-md-6 pa-2 text-text" fluid>
    <v-row no-gutters>
      <v-col cols="12">
        <v-card class="rounded-t-pill px-4 text-text" color="section" flat>
          <!-- 標題列 -->
          <div class="d-flex align-center justify-center pt-4 px-4 text-onSecondary">
            <Icon height="24" icon="streamline-freehand:e-commerce-cart-vr" />
            <span class="text-h6 ml-1 font-weight-bold">購物車商品</span>
            <Icon height="24" icon="streamline-freehand:cash-payment-bag-1" />
          </div>
          <!-- 全選 + 刪除操作列 -->
          <div class="d-flex align-center justify-space-between">
            <v-checkbox
              v-model="selectAll"
              color="onSecondary"
              hide-details
              label="全選"
              @change="toggleSelectAll"
            />
            <v-fade-transition>
              <v-btn
                v-if="selectedItems.length > 0"
                color="onSecondary"
                variant="text"
                @click="deleteSelectedItems"
              >
                刪除選取 ({{ selectedItems.length }})
              </v-btn>
            </v-fade-transition>
          </div>
        </v-card>
      </v-col>
      <!-- Cart Items -->
      <v-col cols="12">
        <template v-if="cart.length > 0">
          <template v-for="(item, i) in cart" :key="item._id">
            <div
              class="cart-item"
              :class="{
                'selected-item': selectedItems.includes(item._id),
                'disabled-item': !item?.product?.sell,
              }"
            >
              <!-- Desktop Layout -->
              <div v-if="mdAndUp" class="pa-md-4">
                <v-row align="center" justify="space-between">
                  <v-col class="d-flex align-center flex-grow-1" cols="12" md="auto">
                    <v-checkbox
                      v-model="selectedItems"
                      class="mr-md-4"
                      color="primary"
                      hide-details
                      :value="item._id"
                    />
                    <v-avatar
                      class="cursor-pointer mr-4"
                      rounded="0"
                      size="80"
                      @click="item?.product && $router.push('/product/' + item.product._id)"
                    >
                      <v-img cover :src="item?.product?.image || ''" />
                    </v-avatar>
                    <div>
                      <router-link
                        v-if="item?.product"
                        :class="[
                          'text-decoration-none font-weight-bold text-truncate d-block product-link',
                          !item?.product?.sell
                            ? 'text-grey text-decoration-line-through'
                            : 'text-text',
                        ]"
                        :to="'/product/' + item.product._id"
                      >
                        {{ item.product.name }}
                      </router-link>
                      <span v-else class="text-grey font-weight-bold">商品不存在</span>
                      <span v-if="!item?.product?.sell" class="text-caption text-red ml-2">
                        (已下架)
                      </span>
                      <div class="text-caption text-nav">
                        單價: {{ calculateItemPrice(item) }} 幣
                      </div>
                    </div>
                  </v-col>

                  <v-col class="d-flex align-center justify-end mt-4 mt-md-0" cols="12" md="auto">
                    <v-number-input
                      control-variant="split"
                      density="compact"
                      hide-details
                      :max="9999"
                      :min="0"
                      :model-value="item.quantity"
                      :rules="[(v) => v <= 9999 || '數量上限為9999']"
                      style="width: 160px"
                      variant="outlined"
                      @update:model-value="(val) => updateCart(val, item, i)"
                    />
                    <v-btn
                      aria-label="移除商品"
                      color="secondary"
                      icon="mdi-delete"
                      variant="text"
                      @click="removeItem(i)"
                    />
                  </v-col>
                </v-row>
              </div>

              <!-- Mobile Layout -->
              <div v-else class="pa-2">
                <v-row align="center" class="flex-nowrap" justify="space-between" no-gutters>
                  <v-col class="d-flex align-center" cols="auto">
                    <v-checkbox
                      v-model="selectedItems"
                      class="mr-2"
                      color="primary"
                      hide-details
                      :value="item._id"
                    />
                    <v-avatar
                      class="cursor-pointer"
                      rounded="0"
                      size="64"
                      @click="item?.product && $router.push('/product/' + item.product._id)"
                    >
                      <v-img cover :src="item?.product?.image || ''" />
                    </v-avatar>
                  </v-col>

                  <v-col class="px-1 flex-grow-1">
                    <router-link
                      v-if="item?.product"
                      :class="[
                        'text-decoration-none font-weight-bold text-truncate d-block product-link ',
                        !item?.product?.sell
                          ? 'text-grey text-decoration-line-through'
                          : 'text-text',
                      ]"
                      :to="'/product/' + item.product._id"
                    >
                      {{ item.product.name }}
                    </router-link>
                    <span
                      v-else
                      class="text-grey font-weight-bold text-subtitle-2 d-block mb-1 text-truncate"
                    >
                      商品不存在
                    </span>
                    <div class="text-caption text-nav mb-2">
                      <p>單價:</p>
                      <span class="d-flex flex-nowrap">{{ calculateItemPrice(item) }} 幣</span>
                    </div>
                  </v-col>

                  <v-col class="d-flex align-center justify-end" :style="{ maxWidth: '240px' }">
                    <v-number-input
                      control-variant="split"
                      density="compact"
                      hide-details
                      :max="9999"
                      :min="0"
                      :model-value="item.quantity"
                      :rules="[(v) => v <= 9999 || '數量上限為9999']"
                      style="width: 160px"
                      variant="outlined"
                      @update:model-value="(val) => updateCart(val, item, i)"
                    />
                    <v-btn
                      aria-label="移除商品"
                      color="secondary"
                      icon="mdi-delete"
                      @click="removeItem(i)"
                    />
                  </v-col>
                </v-row>
              </div>
            </div>
            <v-divider v-if="i < cart.length - 1" />
          </template>
        </template>
        <v-card v-else class="text-center py-12" color="transparent" flat>
          <v-img
            alt="空購物車插圖"
            class="mx-auto mb-4"
            max-width="150"
            src="https://cdn-icons-png.flaticon.com/512/1170/1170576.png"
            style="filter: sepia(0.6) saturate(0.4) hue-rotate(-15deg)"
          />
          <div class="text-h6 text-nav mt-4">您的購物車是空的</div>
          <router-link
            class="text-body-2 text-highlight2 font-weight-medium text-decoration-none"
            to="/product"
          >
            去逛逛，找到真正打動你的那一件吧！
          </router-link>
        </v-card>
      </v-col>

      <!-- Checkout Summary -->
      <v-col cols="12">
        <v-card class="pa-4" color="surface" flat>
          <v-row align="center" justify="end">
            <v-col>
              <v-btn color="primary" size="large" to="/product" variant="tonal">再逛逛</v-btn>
            </v-col>
            <v-col class="text-h6 font-weight-bold text-text" cols="auto">
              總價值 ({{ selectedItems.length }} 件):
              <span class="text-primary">{{ totalPriceSelected }} 幣</span>
            </v-col>
            <v-col cols="auto">
              <v-btn
                color="accent"
                :disabled="checkoutDisable"
                elevation="2"
                size="large"
                variant="flat"
                @click="checkout"
              >
                結帳
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { Icon } from '@iconify/vue'
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useDisplay } from 'vuetify'
  import { useSnackbar } from 'vuetify-use-dialog'
  import orderService from '@/services/order'
  import userService from '@/services/user'
  import { useUserStore } from '@/stores/user'

  const { mdAndUp } = useDisplay()
  const createSnackbar = useSnackbar()
  const user = useUserStore()
  const router = useRouter()

  const cart = ref([])

  const selectedItems = ref([]) // 被勾選的商品 _id 陣列
  const selectAll = ref(false) // 全選狀態

  const priceRefs = ref([])

  const fitAllPrices = () => {
    for (const el of priceRefs.value) {
      if (!el) continue
      const container = el.parentElement
      if (!container) continue

      // Reset font size to inherit from class
      el.style.fontSize = ''
      const initialFontSize = Number.parseFloat(window.getComputedStyle(el).fontSize)

      if (container.clientWidth > 0 && el.scrollWidth > container.clientWidth) {
        const scale = container.clientWidth / el.scrollWidth
        const newSize = Math.max(100, initialFontSize * scale)
        el.style.fontSize = `${newSize}px`
      }
    }
  }

  onMounted(() => {
    nextTick(fitAllPrices)
    window.addEventListener('resize', fitAllPrices)
  })

  watch(
    cart,
    () => {
      nextTick(fitAllPrices)
    },
    { deep: true }
  )

  onBeforeUnmount(() => {
    window.removeEventListener('resize', fitAllPrices)
  })

  // 新增一個方法來計算單個商品的顯示價格
  const calculateItemPrice = (item) => {
    if (item?.diceRollMultiplier) {
      return Math.round(item.product.price * item.diceRollMultiplier)
    }
    return item?.product?.price || '0'
  }

  // 載入購物車資料
  const getCart = async () => {
    try {
      const { data } = await userService.getCart()
      const fetchedCart = data.result || []

      // 處理每個購物車商品，檢查是否有擲骰結果
      const cartWithDiceRolls = await Promise.all(
        fetchedCart.map(async (item) => {
          if (item.product?.roll) {
            // 檢查商品是否開放擲骰
            try {
              const { data: diceRollData } = await userService.getDiceRoll(item.product._id)
              // 如果有擲骰結果，將 multiplier 附加到商品物件上
              item.diceRollMultiplier = diceRollData.result.multiplier
            } catch {
              // 如果尚未擲骰 (404) 或其他錯誤，不設定 multiplier
              // console.error(`Failed to fetch dice roll for product ${item.product._id}:`, diceRollError)
              item.diceRollMultiplier = undefined // 確保沒有舊的 multiplier 影響
            }
          } else {
            item.diceRollMultiplier = undefined // 如果商品不開放擲骰，確保沒有 multiplier
          }
          return item
        })
      )

      cart.value = cartWithDiceRolls
      selectedItems.value = [] // 預設不預選任何項目
    } catch (error) {
      console.error(error)
      createSnackbar({
        text: error?.response?.data?.message || '無法載入購物車資料，請稍後再試',
        snackbarProps: {
          color: 'error',
        },
      })
    }
  }
  getCart()

  // 更新購物車數量
  const updateCart = async (newValue, item, i) => {
    // 如果商品不存在，不允許更新
    if (!item?.product?._id) {
      createSnackbar({
        text: '此商品無法更新',
        snackbarProps: { color: 'error' },
      })
      // 將輸入框的值重設為原始數量
      if (cart.value[i]) {
        cart.value[i].quantity = item.quantity
      }
      return false
    }

    if (newValue < 0) return false

    try {
      const quantityDiff = newValue - item.quantity
      const { data } = await userService.cart({
        product: item.product._id,
        quantity: quantityDiff,
      })

      if (newValue <= 0) {
        cart.value.splice(i, 1)
        selectedItems.value = selectedItems.value.filter((id) => id !== item._id)
      } else {
        if (cart.value[i]) {
          cart.value[i].quantity = newValue
        }
      }
      user.cartTotal = data.result
      return true
    } catch (error) {
      console.error(error)
      createSnackbar({
        text: error?.response?.data?.message || '更新購物車失敗',
        snackbarProps: { color: 'error' },
      })
      return false
    }
  }

  // 刪除商品功能
  const removeItem = async (i) => {
    const item = cart.value[i]
    if (!item) return
    const success = await updateCart(0, item, i)
    if (success) {
      createSnackbar({ text: '已成功刪除商品', snackbarProps: { color: 'success' } })
    }
  }

  // 批次刪除選取商品
  const deleteSelectedItems = async () => {
    try {
      if (selectedItems.value.length === 0) return

      const itemsToDelete = selectedItems.value
        .map((itemId) => cart.value.find((cartItem) => cartItem._id === itemId))
        .filter(Boolean)

      const deletePromises = itemsToDelete.map((item) => {
        return userService.cart({
          product: item.product._id,
          quantity: -item.quantity, // 將後端數量更新為 0
        })
      })

      await Promise.all(deletePromises)

      // 操作成功後，重新從伺服器取得購物車資料，確保同步
      await getCart()

      createSnackbar({ text: '已成功刪除選取商品', snackbarProps: { color: 'success' } })
    } catch (error) {
      console.error(error)
      createSnackbar({
        text: error?.response?.data?.message || '刪除失敗，請稍後再試',
        snackbarProps: { color: 'error' },
      })
    }
  }

  // 全選切換
  const toggleSelectAll = (event) => {
    const checked = event.target.checked
    if (checked) {
      // 全選所有商品
      selectedItems.value = cart.value.map((i) => i._id)
    } else {
      selectedItems.value = []
    }
  }
  watch(selectedItems, (newVal) => {
    // 當選取數量等於購物車總數且大於0時，全選打勾
    selectAll.value = newVal.length === cart.value.length && cart.value.length > 0
  })

  // 計算選取商品總價
  const totalPriceSelected = computed(() => {
    return cart.value.reduce((total, item) => {
      if (selectedItems.value.includes(item._id) && item?.product?.sell) {
        const priceToUse = item.diceRollMultiplier
          ? Math.round(item.product.price * item.diceRollMultiplier)
          : item.product.price
        return total + priceToUse * item.quantity
      }
      return total
    }, 0)
  })

  // 結帳按鈕禁用條件：購物車沒有商品 或 沒有勾選商品 或 勾選的商品已下架/不存在
  const checkoutDisable = computed(() => {
    if (cart.value.length === 0) return true
    if (selectedItems.value.length === 0) return true
    // 如果選擇的商品中，有任何一個是無法購買的(例如已下架或不存在)，則禁用
    return selectedItems.value.some((id) => {
      const item = cart.value.find((cartItem) => cartItem._id === id)
      return !item?.product?.sell
    })
  })

  const checkout = async () => {
    try {
      const orderItems = selectedItems.value.map((itemId) => {
        const item = cart.value.find((cartItem) => cartItem._id === itemId)
        return {
          product: item.product._id,
          quantity: item.quantity,
          multiplier: item.diceRollMultiplier || 1, // Send multiplier, default to 1 if not present
        }
      })
      await orderService.create({
        cart: orderItems,
        totalPrice: totalPriceSelected.value,
      })
      user.clearCart()
      router.push('/product')
      createSnackbar({
        text: '結帳成功',
        snackbarProps: {
          color: 'success',
        },
      })
    } catch (error) {
      console.error(error)
      createSnackbar({
        text: error?.response?.data?.message || '結帳失敗',
        snackbarProps: { color: 'error' },
      })
    }
  }
</script>

<style scoped>
  .cart-item {
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }
  .selected-item {
    background-color: rgb(var(--v-theme-surface));
  }
  .disabled-item {
    opacity: 0.6;
  }

  .product-link {
    display: block;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  @media (max-width: 499px) {
    .product-link {
      max-width: 100px;
    }
  }
  @media (min-width: 500px) and (max-width: 599px) {
    .product-link {
      max-width: 130px;
    }
  }
  @media (min-width: 600px) and (max-width: 749px) {
    .product-link {
      max-width: 190px;
    }
  }
  @media (min-width: 750px) and (max-width: 960px) {
    .product-link {
      max-width: 260px;
    }
  }
  @media (min-width: 961px) {
    .product-link {
      max-width: 450px;
    }
  }
</style>
