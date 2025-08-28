<template>
  <div class="d-flex flex-column pa-6 overflow-y-auto text-text">
    <v-card class="mb-6 pa-4">
      <v-overlay class="align-center justify-center" :model-value="isLoading">
        <v-progress-circular indeterminate />
      </v-overlay>

      <v-card-title class="d-flex justify-space-between align-center">
        <span>基本資料</span>
        <v-btn color="primary" flat size="small" @click="handleEditToggle">
          {{ isEditing ? '取消' : '編輯' }}
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-row class="d-flex align-center" no-gutters>
          <v-col class="d-flex flex-column align-center pa-4" cols="12" md="2">
            <v-avatar size="96">
              <v-img :src="user.user?.avatar || 'https://picsum.photos/200/200/?random=10'" />
            </v-avatar>
            <v-btn class="mt-2" color="primary" density="compact" size="small"> 編輯頭像 </v-btn>
          </v-col>

          <v-col class="px-4 pb-4 pt-10" cols="12" md="6">
            <v-text-field
              v-model="account.value.value"
              class="text-subtitle-1"
              density="comfortable"
              :error-messages="account.errorMessage.value"
              hide-details="auto"
              label="帳戶"
              :readonly="!isEditing"
              variant="outlined"
            />

            <v-text-field
              v-model="email.value.value"
              class="text-subtitle-1 mt-4"
              density="comfortable"
              :error-messages="email.errorMessage.value"
              hide-details="auto"
              label="信箱"
              :readonly="!isEditing"
              variant="outlined"
            />
          </v-col>

          <v-col class="pa-4" cols="12" md="4">
            <v-card class="pa-4" variant="outlined">
              <div class="d-flex align-center flex-wrap-nowrap mb-2">
                <span class="text-subtitle-1 text-grey-darken-1 me-4">當前身分</span>
                <span class="text-subtitle-1 text-grey-darken-1">買家</span>
                <v-switch
                  v-model="isSeller"
                  class="mx-2"
                  color="primary"
                  density="compact"
                  hide-details
                />
                <span class="text-subtitle-1 text-grey-darken-1">賣家</span>
              </div>

              <div class="d-flex align-center flex-wrap-nowrap">
                <span class="text-subtitle-1 text-grey-darken-1 me-4">當前主題</span>
                <span class="text-subtitle-1 text-grey-darken-1">明</span>
                <v-switch
                  v-model="isDarkTheme"
                  class="mx-2"
                  color="primary"
                  density="compact"
                  hide-details
                />
                <span class="text-subtitle-1 text-grey-darken-1">暗</span>
              </div>
            </v-card>
          </v-col>
        </v-row>
        <div class="pa-4">
          <v-textarea
            v-model="bio.value.value"
            label="個人介紹"
            :readonly="!isEditing"
            variant="outlined"
          />
        </div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="primary" :disabled="!isEditing" @click="saveChanges">儲存</v-btn>
      </v-card-actions>
    </v-card>

    <v-row>
      <v-col cols="12" md="3" sm="6">
        <v-card class="pa-4 text-center">
          <div class="text-h5 font-weight-bold">{{ emotionData.emotions }}</div>
          <div class="text-subtitle-1 text-grey">當前情緒幣</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3" sm="6">
        <v-card class="pa-4 text-center">
          <div class="text-h5 font-weight-bold">{{ emotionData.resonances }}</div>
          <div class="text-subtitle-1 text-grey">個人頁面</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3" sm="6">
        <v-card class="pa-4 text-center">
          <div class="text-h5 font-weight-bold">{{ emotionData.dailyTask }}</div>
          <div class="text-subtitle-1 text-grey">每日任務</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3" sm="6">
        <v-card class="pa-4 text-center">
          <div class="text-h5 font-weight-bold">{{ emotionData.messages }}</div>
          <div class="text-subtitle-1 text-grey">聊天通知</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-if="isSeller" class="mt-6 pa-4">
      <v-card-title class="mb-4">數據分析</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-card class="pa-4" variant="outlined">
              <div class="d-flex align-center mb-2">
                <div class="text-h6 me-4">總收益</div>
                <v-select
                  density="compact"
                  hide-details
                  :items="['圖表', '明細']"
                  label="切換顯示內容"
                  variant="outlined"
                />
              </div>
              <div class="bg-grey-lighten-2 rounded" style="height: 250px" />
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="pa-4" variant="outlined">
              <div class="d-flex align-center mb-2">
                <div class="text-h6 me-4">商品收益</div>
                <v-select
                  density="compact"
                  hide-details
                  :items="['商品一', '商品二', '商品三']"
                  label="選擇商品分析"
                  variant="outlined"
                />
              </div>
              <div class="bg-grey-lighten-2 rounded" style="height: 250px" />
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
  import validator from 'validator'
  import { useField, useForm } from 'vee-validate'
  import { computed, onMounted, ref, watch } from 'vue'
  import { useTheme } from 'vuetify'

  import { useSnackbar } from 'vuetify-use-dialog'
  import * as yup from 'yup'
  import apiService from '@/services/api'
  import { useUserStore } from '@/stores/user'

  const user = useUserStore()
  const theme = useTheme()
  const createSnackbar = useSnackbar()

  // 個人偏好主題綁定帳號
  const isDarkTheme = computed({
    get: () => user.theme === 'dark',
    set: async (val) => {
      const newTheme = val ? 'dark' : 'light'
      if (user.theme !== newTheme) {
        await user.setTheme(newTheme)
        theme.global.name.value = newTheme
      }
    },
  })

  // 雙向綁定身分切換
  const isSeller = computed({
    get: () => user.role === 'seller',
    set: async (val) => {
      const newRole = val ? 'seller' : 'buyer'
      if (user.role !== newRole) {
        try {
          // 先發送更新請求到後端
          const response = await apiService.apiAuth.patch('/user/profile', {
            role: newRole,
          })

          if (response.data.success) {
            // 更新成功後，更新前端的狀態
            await user.setRole(newRole)
          } else {
            throw new Error(response.data.message || '身分切換失敗')
          }
        } catch (error) {
          console.error(error)
          createSnackbar({
            text: error?.response?.data?.message || '身分切換失敗，請稍後再試！',
            snackbarProps: { color: 'error' },
          })
        }
      }
    },
  })

  // 資料載入狀態
  const isLoading = ref(true)

  // 編輯模式
  const isEditing = ref(false)

  // 處理編輯模式切換
  const handleEditToggle = () => {
    if (isEditing.value) {
      // 如果是從編輯模式切換到非編輯模式（取消編輯），重置表單資料
      account.value.value = user.account
      email.value.value = user.email
      bio.value.value = user.bio
    }
    isEditing.value = !isEditing.value
  }

  // 賣家情緒數據
  const emotionData = ref({
    emotions: '100',
    resonances: '35',
    dailyTask: '5',
    messages: '2',
  })

  // 在元件掛載時，從後端取得使用者資料
  onMounted(async () => {
    isLoading.value = true
    // console.log('onMounted hook is running. Calling user.fetchUser()...')
    try {
      const success = await user.fetchUser()
      if (!success) {
        createSnackbar({
          text: '無法取得用戶資料，請重新登入',
          snackbarProps: { color: 'error' },
        })
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      createSnackbar({
        text: '取得用戶資料時發生錯誤',
        snackbarProps: { color: 'red' },
      })
    } finally {
      isLoading.value = false
    }
  })

  // 驗證修改基本資料
  const profileForm = useForm({
    validationSchema: yup.object({
      account: yup
        .string()
        .required('帳號必填')
        .min(4, '帳號至少4個字')
        .max(20, '帳號最多20個字')
        .test('isAlphanumeric', '帳號只能包含英文字母和數字', (value) =>
          validator.isAlphanumeric(value || '')
        ),
      email: yup
        .string()
        .required('信箱必填')
        .test('isEmail', '請輸入有效的信箱', (value) => validator.isEmail(value || '')),
      bio: yup.string(),
    }),
  })

  const account = useField('account')
  const email = useField('email')
  const bio = useField('bio')

  // 監聽 user store 的資料變動，並更新 editableAccount
  watch(
    () => ({
      account: user.account,
      email: user.email,
      bio: user.bio,
      theme: user.theme,
      isLoggedIn: user.isLoggedIn,
      isSeller: user.isSeller,
    }),
    (newValues) => {
      if (newValues.isLoggedIn && !isEditing.value) {
        account.value.value = newValues.account || ''
        email.value.value = newValues.email || ''
        bio.value.value = newValues.bio || ''
      }
      // 主題色始終同步，不受編輯狀態影響
      if (newValues.theme && theme.global.name.value !== newValues.theme) {
        theme.global.name.value = newValues.theme
      }
    },
    { immediate: true, deep: true }
  )

  // 儲存變更的函式
  async function saveChanges() {
    const isValid = await profileForm.validate()
    if (!isValid.valid) {
      createSnackbar({
        text: '請修正表單錯誤',
        snackbarProps: { color: 'red' },
      })
      return
    }

    try {
      const updatedData = {
        account: account.value.value,
        email: email.value.value,
        bio: bio.value.value,
        theme: isDarkTheme.value ? 'dark' : 'light',
        role: isSeller.value ? 'seller' : 'buyer',
      }

      // 先發送更新請求到後端
      const response = await apiService.apiAuth.patch('/user/profile', updatedData)

      if (response.data.success) {
        // 更新成功後，更新前端的狀態
        user.setAccountInfo(updatedData)
        isEditing.value = false
        createSnackbar({
          text: '儲存成功！',
          snackbarProps: { color: 'green' },
        })
      } else {
        throw new Error(response.data.message || '儲存失敗')
      }
    } catch (error) {
      console.error(error)
      createSnackbar({
        text: error?.response?.data?.message || '儲存失敗，請稍後再試！',
        snackbarProps: { color: 'red' },
      })
    }
  }
</script>
