<template>
  <div class="register-wrapper">
    <v-container class="fill-height pa-0 text-text" fluid>
      <v-row class="fill-height" no-gutters>
        <!-- 左側背景圖，桌機顯示 -->
        <v-col class="d-none d-md-block left-image" cols="6" />

        <!-- 右側卡片區 -->
        <v-col class="right-col d-flex align-center justify-center pr-lg-16" cols="12" md="6">
          <v-card class="register-card pa-6 text-text" elevation="5" max-width="500" width="100%">
            <v-card-title class="mb-4">新用戶註冊</v-card-title>
            <v-card-text class="flex-grow-1 overflow-y-auto">
              <v-form :disabled="form.isSubmitting.value" @submit.prevent="submit">
                <v-text-field
                  v-model="account.value.value"
                  class="my-3"
                  counter
                  density="comfortable"
                  :error-messages="account.errorMessage.value"
                  label="請輸入帳號"
                  maxlength="20"
                  minlength="4"
                  required
                  variant="outlined"
                />
                <v-text-field
                  v-model="email.value.value"
                  class="my-3"
                  density="comfortable"
                  :error-messages="email.errorMessage.value"
                  label="請輸入信箱"
                  required
                  variant="outlined"
                />
                <v-text-field
                  v-model="password.value.value"
                  class="my-3"
                  counter
                  density="comfortable"
                  :error-messages="password.errorMessage.value"
                  label="請輸入密碼"
                  maxlength="20"
                  minlength="4"
                  required
                  type="password"
                  variant="outlined"
                />
                <v-text-field
                  v-model="confirmPassword.value.value"
                  class="my-3"
                  counter
                  density="comfortable"
                  :error-messages="confirmPassword.errorMessage.value"
                  label="請再次確認密碼"
                  maxlength="20"
                  minlength="4"
                  required
                  type="password"
                  variant="outlined"
                />
                <v-checkbox
                  class="mt-0 mx-2"
                  density="compact"
                  hide-details
                  label="訂閱電子報，看最新感受"
                />
                <v-card-actions class="d-flex justify-center mt-6">
                  <v-row>
                    <v-col cols="12">
                      <v-btn
                        block
                        color="highlight1"
                        :loading="form.isSubmitting.value"
                        size="large"
                        type="submit"
                        variant="flat"
                      >
                        註冊
                      </v-btn>
                    </v-col>
                    <v-col cols="12">
                      <v-btn
                        block
                        color="highlight1"
                        size="large"
                        variant="tonal"
                        @click="dialog = true"
                      >
                        已有帳號登入
                      </v-btn>
                      <!-- 登入 Dialog 元件 -->
                      <LoginDialog v-model="dialog" :persistent="true" />
                    </v-col>
                  </v-row>
                </v-card-actions>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
  // 字串驗證
  import validator from 'validator'
  // 表單驗證
  // useForm() 是用來建立整個表單驗證環境的 Hook，它會管理驗證 schema、提交狀態、驗證錯誤等
  // useField('fieldName') 是用來在 Composition API 中綁定單一欄位，它會回傳欄位的 value、錯誤訊息、是否有效等響應式資料，方便綁定 UI 元件
  import { useField, useForm } from 'vee-validate'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useSnackbar } from 'vuetify-use-dialog'
  // JavaScript schema 驗證函式庫，通常用來定義資料格式和驗證規則
  import * as yup from 'yup'
  import LoginDialog from '@/components/login.vue'
  import userService from '@/services/user'

  const createSnackbar = useSnackbar()
  const router = useRouter()
  const dialog = ref(false)

  // 建立 vee-validate 的表單
  const form = useForm({
    // 用 yup 定義表單驗證格式
    // https://github.com/jquense/yup
    validationSchema: yup.object({
      account: yup
        // 資料型態是文字
        .string()
        .required('帳號必填')
        .min(4, '帳號至少4個字')
        .max(20, '帳號最多20個字')
        // 自訂驗證(驗證名稱, 錯誤訊息, 驗證function)
        .test('isAlphanumeric', '帳號只能包含英文字母和數字', (value) => {
          return validator.isAlphanumeric(value)
        }),
      email: yup
        .string()
        .required('電子郵件必填')
        .test('isEmail', '請輸入有效的電子郵件地址', (value) => {
          return validator.isEmail(value)
        }),
      password: yup.string().required('密碼必填').min(4, '密碼至少4個字').max(20, '密碼最多20個字'),
      confirmPassword: yup
        .string()
        .required('確認密碼必填')
        // .oneOf(陣列, 訊息)   欄位的值必須是陣列內的其中一個
        // .ref(欄位)          取得欄位的值
        // .ref(password)     password 欄位的值
        .oneOf([yup.ref('password')], '密碼和確認密碼必須相同'),
    }),
  })

  // 建立 vee-validate 的表單欄位
  // 一定要在 useForm 後面
  // useField(欄位名稱)
  const account = useField('account')
  const email = useField('email')
  const password = useField('password')
  const confirmPassword = useField('confirmPassword')

  // vee-validate 的表單送出
  // handleSubmit(處理function)
  // values 表單所有欄位的值
  const submit = form.handleSubmit(async (values) => {
    try {
      await userService.create({
        account: values.account,
        email: values.email,
        password: values.password,
      })
      createSnackbar({
        text: '註冊成功！',
        snackbarProps: {
          color: 'success',
        },
      })

      // 註冊成功後，導向首頁
      router.push('/')
    } catch (error) {
      console.error(error)
      createSnackbar({
        text: error?.response?.data?.message || '註冊失敗，請稍後再試！',
        snackbarProps: {
          color: 'error',
        },
      })
    }
  })
</script>

<style scoped>
  .register-wrapper {
    height: 100%;
    width: 100vw;
    overflow: hidden;

    background-image: url('../assets/register.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .left-image {
    background-image: url('../assets/register.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .right-col {
    height: 100%;
    background-color: rgba(255, 255, 255, 0.6);

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .register-card {
    width: 100%;
    max-width: 500px;
    backdrop-filter: blur(4px);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 959px) {
    .right-col {
      background-color: transparent;
    }
  }
</style>
