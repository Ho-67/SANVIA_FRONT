<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card class="text-text">
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <span class="text-h5 font-weight-bold text-accent px-2 pt-3">情緒價值挑戰</span>

          <!-- Tooltip 區域 -->
          <v-tooltip
            content-class="bg-info "
            location="bottom"
            open-on-click
            :open-on-hover="false"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="ml-1 pt-2 text-primary"
                density="compact"
                icon="mdi-help-circle"
                style="border-radius: 50%"
              />
            </template>

            <!-- Tooltip 內容 -->
            <p class="text-body-1 font-weight-medium mt-1">賭價規則說明：</p>
            <v-table class="my-2 h-25" dense>
              <thead>
                <tr>
                  <th class="text-left">骰值</th>
                  <th class="text-left">結果</th>
                  <th class="text-left">價格乘數</th>
                  <th class="text-left">機率</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>大失敗</td>
                  <td>×1.25</td>
                  <td>5%</td>
                </tr>
                <tr>
                  <td>2–5</td>
                  <td>失敗</td>
                  <td>×1.10</td>
                  <td>20%</td>
                </tr>
                <tr>
                  <td>6–14</td>
                  <td>無變化</td>
                  <td>×1.00</td>
                  <td>45%</td>
                </tr>
                <tr>
                  <td>15–17</td>
                  <td>成功</td>
                  <td>×0.95</td>
                  <td>15%</td>
                </tr>
                <tr>
                  <td>18–19</td>
                  <td>高成功</td>
                  <td>×0.85</td>
                  <td>10%</td>
                </tr>
                <tr>
                  <td>20</td>
                  <td>大成功</td>
                  <td>×0.60</td>
                  <td>5%</td>
                </tr>
              </tbody>
            </v-table>
          </v-tooltip>
        </div>

        <!-- 關閉按鈕 -->
        <v-btn icon @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="text-center">
        <div class="position-relative" style="user-select: none">
          <img
            class="dice-img"
            :class="{ rolling: rolling }"
            src="@/assets/dice-d20.png"
            width="100%"
          />
          <div class="dice-text text-primary">
            <span class="font-weight-bold text-h2">{{ result ? `${currentFace}` : '?' }}</span>
          </div>
        </div>
        <div v-if="result" class="mt-4">
          <p class="text-h6">{{ result }}</p>
          <p class="text-subtitle-1">價格 × {{ multiplier }}</p>
        </div>
        <p class="mt-2 text-body-1">定義的價值是感受的回聲，擲骰，讓你的選擇也成為情緒的一部分。</p>
        <p class="text-secondary text-body-2">
          擲骰有機率改變你所承擔的情緒強度，有人得以減輕，有人更深感受。
        </p>
      </v-card-text>

      <v-card-actions class="justify-center mb-2">
        <v-btn color="accent" :disabled="rolling || !!result" variant="flat" @click="handleRoll">
          {{ result ? `${result} (${multiplier}倍)` : '骰點' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'
  import { useSnackbar } from 'vuetify-use-dialog'
  import apiService from '@/services/api'
  import { useUserStore } from '@/stores/user'

  const props = defineProps({
    modelValue: Boolean,
    productId: {
      type: String,
      required: true,
    },
  })

  const emit = defineEmits(['update:modelValue', 'roll-complete'])
  const userStore = useUserStore()
  const createSnackbar = useSnackbar()

  const dialog = computed({
    get() {
      return props.modelValue
    },
    set(value) {
      emit('update:modelValue', value)
    },
  })

  const currentFace = ref(1)
  const rolling = ref(false)
  const result = ref('')
  const multiplier = ref(1)
  let rollInterval = null

  const resetState = () => {
    currentFace.value = 1
    rolling.value = false
    result.value = ''
    multiplier.value = 1
    if (rollInterval) {
      clearInterval(rollInterval)
      rollInterval = null
    }
  }

  watch(
    () => props.modelValue,
    (newValue) => {
      if (newValue) {
        resetState()
      }
    }
  )

  const calculateMultiplier = (face) => {
    if (face === 1) return { text: '大失敗', multiplier: 1.25 }
    if (face >= 2 && face <= 5) return { text: '失敗', multiplier: 1.1 }
    if (face >= 6 && face <= 14) return { text: '無變化', multiplier: 1 }
    if (face >= 15 && face <= 17) return { text: '成功', multiplier: 0.95 }
    if (face >= 18 && face <= 19) return { text: '高成功', multiplier: 0.85 }
    if (face === 20) return { text: '大成功', multiplier: 0.6 }
  }

  async function handleRoll() {
    if (rolling.value || !!result.value) return
    if (!userStore.isLoggedIn) {
      createSnackbar({
        text: '請先登入',
        snackbarProps: { color: 'error' },
      })
      return
    }

    rolling.value = true
    let count = 0

    rollInterval = setInterval(() => {
      currentFace.value = Math.floor(Math.random() * 20) + 1
      count++

      if (count > 15) {
        clearInterval(rollInterval)
        rollInterval = null
        const finalResult = calculateMultiplier(currentFace.value)
        result.value = finalResult.text
        multiplier.value = finalResult.multiplier

        apiService.apiAuth
          .post('/diceRolls', {
            productId: props.productId,
            roll: currentFace.value,
            multiplier: finalResult.multiplier,
          })
          .then(() => {
            emit('roll-complete', finalResult.multiplier)
            createSnackbar({
              text: `擲骰結果: ${finalResult.text}`,
              snackbarProps: { color: 'success' },
            })
          })
          .catch((error) => {
            console.error('儲存擲骰結果失敗:', error)
            let errorMessage = '儲存擲骰結果失敗'
            if (error?.response?.status === 403) {
              errorMessage = '此商品未開放賭價'
            } else if (error?.response?.data?.message) {
              errorMessage = error.response.data.message
            }
            createSnackbar({
              text: errorMessage,
              snackbarProps: { color: 'error' },
            })
            closeDialog()
          })
          .finally(() => {
            rolling.value = false
          })
      }
    }, 100)
  }

  function closeDialog() {
    dialog.value = false
  }
</script>

<style scoped>
  .dice-img {
    transition: transform 0.1s;
    filter: brightness(0) saturate(100%) invert(89%) sepia(6%) saturate(373%) hue-rotate(235deg)
      brightness(97%) contrast(93%);
  }
  .dice-text {
    position: absolute;
    top: calc(50% + 24px);
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .dice-img.rolling {
    animation: shake 0.3s infinite;
  }
  @keyframes shake {
    0%,
    100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(10deg);
    }
    75% {
      transform: rotate(-10deg);
    }
  }
</style>
