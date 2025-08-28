<template>
  <v-dialog v-model="dialogVisible" persistent>
    <div class="d-flex justify-center text-text">
      <v-card class="pa-4 w-50 text-center" title="用戶登入">
        <v-card-text class="ma-4">
          <v-form :disabled="form.isSubmitting.value" @submit.prevent="submit">
            <v-row class="d-flex align-center" dense>
              <v-col class="d-flex justify-lg-end" cols="12" lg="2">帳號或信箱</v-col>
              <v-col cols="0" lg="1" />
              <v-col cols="12" lg="9">
                <v-text-field
                  v-model="account.value.value"
                  class="text-left"
                  :error-messages="account.errorMessage.value"
                  label="請輸入帳號或信箱"
                  required
                />
              </v-col>

              <v-col class="d-flex justify-lg-end" cols="12" lg="2">密碼</v-col>
              <v-col cols="0" lg="1" />
              <v-col cols="12" lg="9">
                <v-text-field
                  v-model="password.value.value"
                  class="text-left"
                  counter
                  :error-messages="password.errorMessage.value"
                  label="請輸入密碼"
                  maxlength="20"
                  minlength="4"
                  required
                  type="password"
                />
              </v-col>

              <v-col class="text-right text-caption text-blue" cols="12">忘記密碼?</v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <a class="text-highlight2" href="#" @click.prevent="goToRegister">
                  還沒有帳號？現在註冊
                </a>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" text="關閉" @click="emit('update:modelValue', false)" />
              <v-btn color="accent" :loading="isSubmitting" text="登入" type="submit" />
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
  </v-dialog>
</template>

<script setup>
  import { useField, useForm } from 'vee-validate'
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useTheme } from 'vuetify'
  import { useSnackbar } from 'vuetify-use-dialog'
  import * as yup from 'yup'
  import userService from '@/services/user'

  import { useUserStore } from '@/stores/user'

  const props = defineProps({
    modelValue: Boolean,
  })
  // 登入成功後關閉
  const emit = defineEmits(['update:modelValue'])

  const dialogVisible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  })

  const createSnackbar = useSnackbar()
  const router = useRouter()
  const user = useUserStore()
  const theme = useTheme()

  const goToRegister = () => {
    emit('update:modelValue', false) // 關閉對話框
    router.push('/register') // 導向註冊頁
  }

  // 建立 vee-validate 表單
  const form = useForm({
    validationSchema: yup.object({
      account: yup.string().required('帳號或電子郵件必填'),
      password: yup.string().required('密碼必填').min(4, '密碼至少4個字').max(20, '密碼最多20個字'),
    }),
  })

  // 綁定每個欄位
  const account = useField('account')
  const password = useField('password')

  // vee-validate 表單送出
  const submit = form.handleSubmit(async (values) => {
    try {
      const { data } = await userService.login({
        account: values.account,
        password: values.password,
      })

      // 登入後的資料寫入 userStore
      user.login(data.user)

      // 立即取得使用者資料，確保狀態同步
      await user.fetchUser()

      // 登入後立即套用主題
      if (user.theme) {
        theme.global.name.value = user.theme
      }

      createSnackbar({
        text: '登入成功！',
        snackbarProps: {
          color: 'success',
        },
      })
      router.push('/product')
    } catch (error) {
      console.error(error)
      createSnackbar({
        text: error?.response?.data?.message || '登入失敗，請稍後再試！',
        snackbarProps: {
          color: 'error',
        },
      })
    }
  })
</script>