<template>
  <div class="sticky-top">
    <v-row no-gutters>
      <v-col class="pa-4" cols="12" lg="2" md="3">
        <v-btn block color="primary" variant="outlined" @click="$emit('openDialog', null)">
          <v-icon left>mdi-plus</v-icon>
          新增商品
        </v-btn>
      </v-col>

      <v-col class="pa-4" cols="12" lg="5" md="9">
        <div class="d-flex align-center">
          <v-menu
            v-model="startMenu"
            :close-on-content-click="false"
            location="bottom left"
            transition="scale-transition"
          >
            <template #activator="{ props }">
              <v-text-field
                v-model="startDateFormatted"
                density="compact"
                v-bind="props"
                :error-messages="dateRangeError"
                hide-details
                label="開始日期"
                prepend-inner-icon="mdi-calendar"
                readonly
                variant="outlined"
              />
            </template>
            <v-date-picker
              v-model="tempStartDate"
              :first-day-of-week="1"
              :max="tempEndDate"
              @update:model-value="onStartDateUpdate"
            />
          </v-menu>
          <span class="mx-2">~</span>
          <v-menu
            v-model="endMenu"
            :close-on-content-click="false"
            location="bottom left"
            transition="scale-transition"
          >
            <template #activator="{ props }">
              <v-text-field
                v-model="endDateFormatted"
                density="compact"
                v-bind="props"
                :error-messages="dateRangeError"
                hide-details
                label="結束日期"
                prepend-inner-icon="mdi-calendar"
                readonly
                variant="outlined"
              />
            </template>
            <v-date-picker
              v-model="tempEndDate"
              :first-day-of-week="1"
              :min="tempStartDate"
              @update:model-value="onEndDateUpdate"
            />
          </v-menu>
        </div>
      </v-col>

      <v-col class="pa-4" cols="6" lg="3" md="9" sm="8">
        <v-text-field
          v-model="searchValue"
          density="compact"
          flat
          hide-details
          placeholder="搜尋商品"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
        />
      </v-col>

      <v-col class="pa-4 d-flex justify-end align-center" cols="6" lg="2" md="3" sm="4">
        <v-btn color="primary" variant="outlined" @click="resetFilters">
          <v-icon left>mdi-refresh</v-icon>
          重設條件
        </v-btn>
      </v-col>
    </v-row>
    <v-divider />
  </div>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'

  const props = defineProps({
    search: {
      type: String,
      default: '',
    },
  })

  const emit = defineEmits(['update:search', 'openDialog', 'resetFilters', 'search'])

  const startMenu = ref(false)
  const endMenu = ref(false)
  const startDate = ref(null)
  const endDate = ref(null)
  const searchValue = ref(props.search)

  // 新增臨時變數，用於日期選擇器的 v-model
  const tempStartDate = ref(null)
  const tempEndDate = ref(null)

  // 監聽並同步日期變數
  watch(
    startDate,
    (newVal) => {
      tempStartDate.value = newVal
    },
    { immediate: true }
  )
  watch(
    endDate,
    (newVal) => {
      tempEndDate.value = newVal
    },
    { immediate: true }
  )

  // 驗證日期範圍
  const dateRangeError = computed(() => {
    if (startDate.value && endDate.value && new Date(startDate.value) > new Date(endDate.value)) {
      return ['開始日期不能晚於結束日期']
    }
    return []
  })

  // 當開始日期更新時的處理邏輯
  const onStartDateUpdate = (newVal) => {
    startDate.value = newVal
    startMenu.value = false
    performSearch()
  }

  // 當結束日期更新時的處理邏輯
  const onEndDateUpdate = (newVal) => {
    endDate.value = newVal
    endMenu.value = false
    performSearch()
  }

  // 監聽搜尋值變化
  watch(
    () => searchValue.value,
    () => performSearch()
  )

  // 監聽主要日期變數的變化，以觸發搜尋
  watch(
    () => [startDate.value, endDate.value],
    () => performSearch()
  )

  // 格式化日期顯示
  const startDateFormatted = computed(() => {
    if (!startDate.value) return ''
    return new Date(startDate.value).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  })

  const endDateFormatted = computed(() => {
    if (!endDate.value) return ''
    return new Date(endDate.value).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  })

  // 重置所有過濾條件
  const resetFilters = () => {
    startDate.value = null
    endDate.value = null
    searchValue.value = ''
    emit('resetFilters')
  }

  // 執行搜尋
  const performSearch = () => {
    // 如果日期範圍有錯誤，就不執行搜尋
    if (dateRangeError.value.length > 0) {
      return
    }
    emit('search', {
      search: searchValue.value,
      startDate: startDate.value ? new Date(startDate.value) : null,
      endDate: endDate.value ? new Date(endDate.value) : null,
    })
  }
</script>

<style scoped>
  .sticky-top {
    background: rgb(var(--v-theme-surface));
    position: sticky;
    top: 0;
    z-index: 100;
  }
</style>
