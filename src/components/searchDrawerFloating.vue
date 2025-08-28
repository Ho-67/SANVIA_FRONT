<template>
  <!-- 統一的頂部抽屜 -->
  <v-navigation-drawer
    v-model="modelValue"
    class="px-8 pt-6 text-text"
    location="top"
    permanent
    :scrim="false"
    style="height: auto"
  >
    <!-- 主要搜尋面板 -->
    <v-row no-gutters>
      <!-- 搜尋框與按鈕 -->
      <v-col class="d-flex" cols="12">
        <v-text-field
          v-model="search"
          clearable
          hide-details
          label="輸入商品關鍵字"
          prepend-inner-icon="mdi-magnify"
          single-line
          variant="outlined"
          @keydown.enter="updateSearchQuery"
        />
        <v-btn class="ml-4" color="secondary" height="56" @click="updateSearchQuery"> 搜尋 </v-btn>
      </v-col>

      <!-- 動態顯示隱藏開始 -->
      <template v-if="activeTab">
        <v-col class="my-1" cols="8">
          <p class="text-secondary">搜尋：{{ searchPath }}</p>
        </v-col>
        <v-col class="d-flex justify-end my-1" cols="4">
          <p>共 {{ totalProducts }} 筆資料</p>
        </v-col>
      </template>
      <!-- 動態顯示隱藏結束 -->
      <v-col class="d-flex align-center" cols="auto">
        <span class="text-body-2 mr-2 text-no-wrap">情緒：</span>
        <v-tabs v-model="tab" height="36" show-arrows>
          <v-tab
            v-for="emotion in emotions"
            :key="emotion"
            color="secondary"
            style="min-width: 24px; transition-duration: 0.01s"
            :value="emotion"
            @click="toggleExpand(emotion)"
          >
            {{ emotion }}
          </v-tab>
        </v-tabs>
      </v-col>
      <v-col class="d-flex justify-end align-center">
        <v-menu offset-y>
          <template #activator="{ props }">
            <v-btn v-bind="props" color="secondary" variant="tonal">
              排序
              <v-icon end icon="mdi-chevron-down" />
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="(option, i) in sortOptions"
              :key="option.text"
              link
              @click="selectedSort = i"
            >
              <v-list-item-title>{{ option.text }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>

    <!-- 可展開的子選項區域 -->
    <v-expand-transition>
      <div v-show="isExpanded">
        <v-divider class="my-2" />
        <v-row no-gutters>
          <v-col class="d-flex align-center" cols="auto">
            <span class="text-body-2 mr-2 text-no-wrap">型態：</span>
            <v-tabs v-model="selectedCategory" height="36" show-arrows>
              <v-tab
                v-for="category in categories"
                :key="category"
                color="secondary"
                style="min-width: 24px; transition-duration: 0.01s"
                :value="category"
              >
                {{ category }}
              </v-tab>
            </v-tabs>
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>
  </v-navigation-drawer>
</template>

<script setup>
  import { storeToRefs } from 'pinia'
  import { computed, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useProductStore } from '@/stores/product'

  const props = defineProps({
    modelValue: Boolean,
  })

  const emit = defineEmits(['update:modelValue'])
  const router = useRouter()
  const route = useRoute()
  const productStore = useProductStore()

  const { totalProducts } = storeToRefs(productStore)

  const modelValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  })

  // --- 搜尋與篩選狀態 ---
  const search = ref(route.query.search || '')
  const tab = ref(route.query.emotions || null)
  const activeTab = ref(route.query.emotions || null)
  const selectedCategory = ref(route.query.category || '全部')

  // --- UI 控制 ---
  const isExpanded = ref(!!activeTab.value)

  // --- 分類選項 ---
  const emotions = ['正面', '中立', '負面', '其他']
  const categories = ['全部', '文字', '圖片', '音樂', '語音', '影片', '物品']

  // --- 排序選項 ---
  const sortOptions = [
    { text: '日期：最新', key: 'createdAt', order: -1 },
    { text: '日期：最舊', key: 'createdAt', order: 1 },
    { text: '費用：低到高', key: 'price', order: 1 },
    { text: '費用：高到低', key: 'price', order: -1 },
  ]

  // 找到與路由查詢匹配的排序索引，如果沒有則為預設值 0
  const findSortIndex = () => {
    const { sortBy, sortOrder } = route.query
    if (!sortBy) return 0 // 預設為最新
    const orderNum = Number.parseInt(sortOrder)
    return sortOptions.findIndex((o) => o.key === sortBy && o.order === orderNum) || 0
  }
  const selectedSort = ref(findSortIndex())

  // --- 路由更新 ---
  const updateSearchQuery = () => {
    const sortOption = sortOptions[selectedSort.value]
    const query = {
      search: search.value || undefined,
      emotions: activeTab.value || undefined,
      category: selectedCategory.value === '全部' ? undefined : selectedCategory.value,
      sortBy: sortOption.key,
      sortOrder: sortOption.order,
    }

    // 移除值為 undefined 的鍵
    for (const key of Object.keys(query)) query[key] === undefined && delete query[key]

    // 僅當查詢參數有變化時才更新路由，避免不必要的導航
    if (JSON.stringify(query) !== JSON.stringify(route.query)) {
      router.replace({ path: '/product', query })
      // 確保抽屜在路由更新後保持開啟狀態
      emit('update:modelValue', true)
    }
  }

  // --- Computed 屬性 ---
  const searchPath = computed(() => {
    let path = activeTab.value || ''
    if (selectedCategory.value && selectedCategory.value !== '全部') {
      path += ` > ${selectedCategory.value}`
    }
    if (search.value) {
      path += ` > ${search.value}`
    }
    return path
  })

  // --- UI 互動函式 ---
  const toggleExpand = (clickedTab) => {
    if (isExpanded.value && activeTab.value === clickedTab) {
      isExpanded.value = false
      activeTab.value = null
      tab.value = null
      selectedCategory.value = '全部'
    } else {
      isExpanded.value = true
      activeTab.value = clickedTab
      tab.value = clickedTab
      selectedCategory.value = '全部'
    }
  }

  // --- Watchers ---
  // 監聽篩選和排序條件的變化，立即更新
  watch(
    [activeTab, selectedCategory, selectedSort],
    () => {
      updateSearchQuery()
    },
    { deep: true }
  )

  // 當抽屜開啟時，從當前路由同步狀態，確保顯示正確的篩選條件
  watch(modelValue, (isOpen) => {
    if (isOpen) {
      search.value = route.query.search || ''
      activeTab.value = route.query.emotions || null
      tab.value = route.query.emotions || null
      selectedCategory.value = route.query.category || '全部'
      selectedSort.value = findSortIndex()
      isExpanded.value = !!activeTab.value
    }
  })
</script>
