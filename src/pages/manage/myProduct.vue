<template>
  <v-row class="text-text">
    <v-col cols="12">
      <div class="position-sticky top-0 bg-surface">
        <div class="d-flex align-center justify-space-between pa-5">
          <div class="d-flex align-center text-h6">
            <v-icon>mdi-cards-outline</v-icon>
            <div class="ml-2">我的商品</div>
          </div>
          <div class="d-flex align-center flex-wrap">
            <v-btn class="pa-4 d-flex align-center" color="secondary" variant="outlined">
              <v-icon>mdi-card-account-details-star-outline</v-icon>
              <div>個人頁面</div>
            </v-btn>
          </div>
        </div>
        <v-divider />
      </div>
      <ProductTableTop
        v-model:search="search"
        @open-dialog="openDialog(null)"
        @reset-filters="resetFilters"
        @search="performSearch"
      />
      <v-data-table
        v-if="!isMobile"
        :filter-keys="filterKeys"
        :headers="headers"
        :items="products"
        no-data-text="查無商品"
        :search="search"
      >
        <template #item.image="{ value }">
          <v-img :aspect-ratio="1" class="ma-2 rounded-0" cover :src="value" width="75" />
        </template>
        <template #item.name="{ value }">
          <v-tooltip location="bottom" :text="value">
            <template #activator="{ props }">
              <span v-bind="props">
                {{ value.length > 4 ? value.substring(0, 4) + '...' : value }}
              </span>
            </template>
          </v-tooltip>
        </template>
        <template #item.sell="{ value }">
          <v-icon v-if="value" color="green" icon="mdi-check" />
          <v-icon v-else color="red" icon="mdi-close" />
        </template>
        <template #item.roll="{ value }">
          <v-icon v-if="value" color="green" icon="mdi-check" />
          <v-icon v-else color="red" icon="mdi-close" />
        </template>
        <template #item.action="{ item }">
          <v-btn color="secondary" icon="mdi-pencil" @click="openDialog(item)" />
        </template>
      </v-data-table>

      <div v-else class="mobile-products">
        <v-card v-for="product in products" :key="product._id" class="mb-1 rounded-0 mobile-products-card">
          <v-card-text>
            <v-row no-gutters>
              <v-col cols="4">
                <v-img :aspect-ratio="1" class="rounded-0" cover :src="product.image" />
              </v-col>
              <v-col class="pl-4" cols="8">
                <div class="d-flex justify-space-between align-center">
                  <div class="font-weight-bold text-caption product-id">ID: {{ product._id }}</div>
                  <v-btn color="secondary" icon="mdi-pencil" @click="openDialog(product)" />
                </div>
                <div class="font-weight-bold text-h6">{{ truncate(product.name, 10) }}</div>
                <div class="mt-2">分類: {{ product.category }}</div>
                <div>情緒價值: {{ product.price }}</div>
                <div>
                  是否上架:
                  <v-icon
                    :color="product.sell ? 'green' : 'red'"
                    :icon="product.sell ? 'mdi-check' : 'mdi-close'"
                  />
                </div>
                <div>
                  骰點交易:
                  <v-icon
                    :color="product.roll ? 'green' : 'red'"
                    :icon="product.roll ? 'mdi-check' : 'mdi-close'"
                  />
                </div>
                <div class="text-caption text-medium-emphasis mt-2">
                  更新日期: {{ new Date(product.updatedAt).toLocaleString() }}
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>
    </v-col>
  </v-row>
  <AddProductDialog
    v-model="dialogOpen"
    :product="selectedProduct"
    @submit-success="handleSubmitSuccess"
  />
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useDisplay } from 'vuetify'
  import { useSnackbar } from 'vuetify-use-dialog'
  import AddProductDialog from '@/components/myProduct/productAddDialog.vue'
  import ProductTableTop from '@/components/myProduct/productTop.vue'
  import productService from '@/services/product'

  // 建立 snackbar 方便顯示訊息
  const createSnackbar = useSnackbar()

  // 判斷是否為行動裝置
  const { mobile } = useDisplay()
  const isMobile = computed(() => mobile.value)

  const truncate = (text, length) => {
    if (text && text.length > length) {
      return text.substring(0, length) + '...';
    }
    return text;
  };

  // 商品列表資料
  const products = ref([])

  // ******************
  // ****** 表格 ******
  // ******************

  // 頁面表格欄位設定
  const headers = [
    { title: '商品ID', key: '_id' },
    { title: '封面圖', key: 'image', sortable: false },
    { title: '商品名稱', key: 'name' },
    { title: '類別分類', key: 'category' },
    { title: '情緒分類', key: 'emotions' },
    { title: '情緒價值', key: 'price' },
    { title: '是否上架', key: 'sell' },
    { title: '骰點交易', key: 'roll' },
    {
      title: '建立日期',
      key: 'createdAt',
      value: (item) => new Date(item.createdAt).toLocaleString(),
    },
    {
      title: '更新日期',
      key: 'updatedAt',
      value: (item) => new Date(item.updatedAt).toLocaleString(),
    },
    { title: '操作', key: 'action', sortable: false },
  ]

  // 表格中要被搜尋的欄位名稱
  const filterKeys = [
    '_id',
    'name',
    'emotions',
    'category',
    'price',
    'description',
    'createdAt',
    'updatedAt',
  ]

  // 取得商品列表
  const getProducts = async (filters = {}) => {
    try {
      const apiFilters = {
        ...filters,
        startDate: filters.startDate ? filters.startDate.toISOString() : undefined,
        endDate: filters.endDate ? filters.endDate.toISOString() : undefined,
      }

      const { data } = await productService.getAll(apiFilters)

      products.value = data.products
    } catch (error) {
      console.error('Error fetching products:', error)
      createSnackbar({
        text: '無法載入商品資料',
        snackbarProps: { color: 'red' },
      })
    }
  }

  // 頁面載入時取得商品列表
  getProducts()

  // ******************
  // ****** 對話框 ******
  // ******************

  const dialogOpen = ref(false)
  const selectedProduct = ref(null)

  const openDialog = (product) => {
    selectedProduct.value = product
    dialogOpen.value = true
  }

  const handleSubmitSuccess = () => {
    dialogOpen.value = false
    getProducts()
  }

  // ******************
  // ****** 篩選 ******
  // ******************

  // 搜尋文字，透過 v-model 與子元件同步
  const search = ref('')

  /**
   * 執行搜尋
   * @param {object} filters - 來自 ProductTableTop 元件的篩選條件
   */
  const performSearch = (filters) => {
    getProducts(filters)
  }

  // 重設搜尋條件
  const resetFilters = () => {
    // 實際的 input 清除由子元件處理
    getProducts()
  }
</script>

<style scoped>
  .mobile-products-card {
    border: 1px solid rgba(0, 0, 0, 0.12);
  }

  .product-id {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
  }
</style>