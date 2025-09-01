<template>
  <v-navigation-drawer
    v-model="internalModel"
    class="h-100 position-fixed text-text"
    :close-on-click="false"
    location="left"
    :scrim="false"
    :scrim-clickable="false"
    temporary
    width="400"
  >
    <v-container class="pa-4 d-flex flex-column h-100" fluid>
      <!-- 頂部：不受拉伸影響 -->
      <v-row class="flex-grow-0" dense>
        <v-col cols="2">
          <router-link class="text-decoration-none" to="/">
            <img alt="LOGO" height="50" src="@/assets/logo.svg" />
          </router-link>
        </v-col>
        <v-col class="d-flex justify-end" cols="10">
          <v-btn icon="mdi-close" @click="internalModel = false" />
        </v-col>
      </v-row>

      <v-divider />

      <!-- 中間內容 -->
      <v-col class="d-flex flex-column flex-grow-1">
        <!-- 搜尋 -->
        <v-row class="flex-grow-0">
          <v-col class="d-flex align-start" cols="12">
            <v-text-field
              v-model="searchQuery"
              clearable
              hide-details
              label="輸入商品關鍵字"
              prepend-inner-icon="mdi-magnify"
              single-line
              variant="outlined"
              @keydown.enter="performSearch()"
            />
            <v-btn class="ml-4" color="secondary" height="56" @click="performSearch()">
              搜尋
            </v-btn>
          </v-col>
        </v-row>

        <!-- 最近搜尋 -->
        <v-row class="flex-grow-1 mt-4">
          <v-col cols="12">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-subtitle-1">最近搜尋</span>
              <v-btn
                v-if="recentSearches.length > 0"
                size="small"
                variant="text"
                @click="clearHistory"
                >清除紀錄</v-btn
              >
            </div>
            <v-list bg-color="transparent" lines="one">
              <v-list-item
                v-for="(item, i) in displayedSearches"
                :key="i"
                :title="item"
                @click="performSearch(item)"
              >
                <template #prepend>
                  <v-icon icon="mdi-history" />
                </template>
                <template #append>
                  <v-btn
                    icon="mdi-close"
                    size="x-small"
                    variant="text"
                    @click.stop="removeSearchItem(item)"
                  />
                </template>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>

        <!-- 底部歷史紀錄 -->
        <v-row class="flex-grow-0">
          <v-col class="d-flex justify-center align-end" cols="12">
            <v-btn text="完整歷史搜尋記錄" />
          </v-col>
        </v-row>
      </v-col>
    </v-container>
  </v-navigation-drawer>

  <!-- 自己的遮罩 -->
  <div v-if="internalModel" class="custom-scrim" @click.stop />
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const props = defineProps({
    modelValue: Boolean,
  })

  const emit = defineEmits(['update:modelValue'])

  const internalModel = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  })

  const searchQuery = ref('')
  const recentSearches = ref([])

  const displayedSearches = computed(() => {
    return recentSearches.value.slice(0, 10)
  })

  const loadRecentSearches = () => {
    const searches = localStorage.getItem('recentSearches')
    if (searches) {
      recentSearches.value = JSON.parse(searches)
    }
  }

  const saveRecentSearch = (keyword) => {
    const index = recentSearches.value.indexOf(keyword)
    if (index !== -1) {
      recentSearches.value.splice(index, 1)
    }
    recentSearches.value.unshift(keyword)
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value))
  }

  const performSearch = (keyword = '') => {
    const query = keyword || searchQuery.value
    if (!query.trim()) return

    saveRecentSearch(query)
    internalModel.value = false
    router.push({ path: '/product', query: { search: query } })
    searchQuery.value = ''
  }

  const removeSearchItem = (item) => {
    const index = recentSearches.value.indexOf(item)
    if (index !== -1) {
      recentSearches.value.splice(index, 1)
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value))
    }
  }

  const clearHistory = () => {
    recentSearches.value = []
    localStorage.removeItem('recentSearches')
  }

  onMounted(() => {
    loadRecentSearches()
  })
</script>

<style scoped>
  .custom-scrim {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 5; /* 要比抽屜低(抽屜通常是6或7) */
  }
</style>
