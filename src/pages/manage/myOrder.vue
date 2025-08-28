<template>
  <v-row class="text-text" no-gutters>
    <v-col cols="12">
      <div class="position-sticky top-0 bg-surface">
        <div class="d-flex align-center justify-space-between pa-5">
          <div class="d-flex align-center text-h6">
            <v-icon>mdi-cards-outline</v-icon>
            <div class="ml-2">我的訂單</div>
          </div>
          <div class="d-flex align-center flex-wrap">
            <template v-if="user.role === 'seller'">
              <v-btn
                class="pa-4 d-flex align-center mr-sm-2 mb-2 mb-sm-0"
                color="secondary"
                variant="outlined"
              >
                <v-icon>mdi-finance</v-icon>
                <div>收益明細</div>
              </v-btn>
            </template>
            <template v-else>
              <v-btn
                class="pa-4 d-flex align-center mr-sm-2 mb-2 mb-sm-0"
                color="secondary"
                variant="outlined"
              >
                <v-icon>mdi-finance</v-icon>
                <div>消費明細</div>
              </v-btn>
            </template>
            <v-btn class="pa-4 d-flex align-center" color="secondary" variant="outlined">
              <v-icon>mdi-bell-badge-outline</v-icon>
              <div>訂單通知</div>
            </v-btn>
          </div>
        </div>
        <v-divider />
      </div>

      <OrderTableTop
        v-model:search="search"
        @reset-filters="resetFilters"
        @search="performSearch"
      />
      <v-data-table
        v-if="!isMobile"
        :headers="headers"
        item-value="_id"
        :items="orders"
        :items-per-page-options="[
          { value: 10, title: '10' },
          { value: 25, title: '25' },
          { value: 50, title: '50' },
          { value: -1, title: '全部' },
        ]"
        no-data-text="查無訂單"
        :search="search"
      >
        <template #item.cart="{ value }">
          <div v-for="item in value" :key="item.product._id">
            {{ truncate(item.product.name, 10) }} x {{ item.quantity }}
          </div>
        </template>
        <template #item.totalPrice="{ value }"> $ {{ value }} </template>
        <template #item.createdAt="{ value }">
          {{ new Date(value).toLocaleString() }}
        </template>
        <template #item.action="{ item }">
          <v-btn color="secondary" icon="mdi-pencil" @click="openDialog(item)" />
        </template>
      </v-data-table>

      <div v-else class="mobile-orders">
        <v-lazy
          v-for="order in filteredOrders"
          :key="order._id"
          :min-height="100"
          :options="{ threshold: 0.5 }"
          transition="fade-transition"
        >
          <v-card class="mb-1 rounded-0">
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div class="font-weight-bold text-caption order-id">訂單ID: {{ order._id }}</div>
                <v-btn color="secondary" icon="mdi-pencil" @click="openDialog(order)" />
              </div>
              <div class="text-caption text-medium-emphasis">
                下單日期: {{ new Date(order.createdAt).toLocaleString() }}
              </div>
              <v-divider class="my-2" />
              <div
                v-for="item in order.cart"
                :key="item.product._id"
                class="d-flex justify-space-between"
              >
                <span>{{ truncate(item.product.name, 10) }}</span>
                <span>x {{ item.quantity }}</span>
              </div>
              <v-divider class="my-2" />
              <div class="d-flex justify-end font-weight-bold">
                總費用: $ {{ calculateTotalPrice(order) }}
              </div>
            </v-card-text>
          </v-card>
        </v-lazy>
        <div v-if="filteredOrders.length === 0" class="text-center pa-4 text-medium-emphasis">
          查無訂單
        </div>
      </div>
    </v-col>
  </v-row>
  <AddOrderDialog
    v-if="selectedOrder"
    v-model="dialogOpen"
    :order-id="selectedOrder._id"
    :order-products="selectedOrder.cart"
    @submit-success="handleSubmitSuccess"
  />
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useDisplay } from 'vuetify'
  import { useSnackbar } from 'vuetify-use-dialog'
  import AddOrderDialog from '@/components/myOrder/orderAddDialog.vue'
  import OrderTableTop from '@/components/myOrder/orderTop.vue'
  import orderService from '@/services/order'
  import { useUserStore } from '@/stores/user'

  // 建立 userStore 實例
  const user = useUserStore()

  // 建立 snackbar 方便顯示訊息
  const createSnackbar = useSnackbar()

  // 判斷是否為行動裝置
  const { mobile } = useDisplay()
  const isMobile = computed(() => mobile.value)

  // 訂單列表資料
  const orders = ref([])
  const search = ref('')

  const performSearch = (filters) => {
    getMyOrders(filters)
  }

  const resetFilters = () => {
    search.value = ''
    getMyOrders()
  }

  // 基礎的 headers 陣列，包含所有可能的欄位
  const allHeaders = [
    { title: '訂單ID', key: '_id', align: 'start' },
    { title: '訂單內容', key: 'cart', sortable: false, align: 'start' },
    {
      title: '總費用',
      key: 'totalPrice',
      value: (order) => order.totalPrice,
    },
    {
      title: '下單日期',
      key: 'createdAt',
    },
    { title: '買家ID', key: 'userId', align: 'start', value: (item) => item.user?.account || '' },
    {
      title: '訂單狀態',
      key: 'status',
      value: (item) => '已接單',
    },
    { title: '操作', key: 'action', sortable: false },
  ]

  // 使用 computed 屬性，根據使用者角色動態回傳不同的 headers 陣列
  const headers = computed(() => {
    if (user.role === 'seller') {
      // 賣家看到的欄位
      return allHeaders.filter((header) =>
        ['_id', 'cart', 'totalPrice', 'createdAt', 'userId', 'action'].includes(header.key)
      )
    } else {
      // 買家看到的欄位
      return allHeaders.filter((header) =>
        ['_id', 'cart', 'totalPrice', 'createdAt', 'status', 'action'].includes(header.key)
      )
    }
  })

  const truncate = (text, length) => {
    if (text && text.length > length) {
      return text.slice(0, Math.max(0, length)) + '...'
    }
    return text
  }

  // 取得我的訂單
  const getMyOrders = async () => {
    try {
      const { data } = await orderService.getMy()
      orders.value = data.result
    } catch (error) {
      console.error('載入訂單失敗:', error)
      createSnackbar({
        text: '無法載入訂單資料',
        snackbarProps: { color: 'error' },
      })
    }
  }

  const calculateTotalPrice = (order) => {
    if (!order) return 0
    return order.totalPrice;
  };

  // 行動裝置版的搜尋功能
  const filteredOrders = computed(() => {
    if (!search.value) {
      return orders.value
    }
    return orders.value.filter((order) => {
      const searchTerm = search.value.toLowerCase()
      const hasMatchingProduct = order.cart.some((item) =>
        item.product.name.toLowerCase().includes(searchTerm)
      )
      return order._id.toLowerCase().includes(searchTerm) || hasMatchingProduct
    })
  })

  // 頁面載入時取得訂單
  onMounted(() => {
    getMyOrders()
  })

  // ******************
  // ****** 對話框 ******
  // ******************

  const dialogOpen = ref(false)
  const selectedOrder = ref(null)

  const openDialog = (item) => {
    selectedOrder.value = item
    dialogOpen.value = true
  }

  const handleSubmitSuccess = () => {
    dialogOpen.value = false
    getMyOrders()
  }
</script>

<style scoped>
  .mobile-orders .v-card {
    border: 1px solid rgba(0, 0, 0, 0.12);
  }
  .order-id {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
  }
</style>
