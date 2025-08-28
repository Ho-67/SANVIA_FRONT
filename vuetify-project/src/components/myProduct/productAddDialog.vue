<template>
  <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition">
    <v-form class="h-100" :disabled="isSubmitting" @submit.prevent="submit">
      <v-card>
        <v-card-title class="text-accent px-6 mt-4">
          {{ isEditing ? '編輯商品' : '新增商品' }}
        </v-card-title>
        <v-card-text>
          <v-row no-gutters>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="name.value.value"
                class="mb-4 pr-md-1"
                :error-messages="name.errorMessage.value"
                label="商品名稱"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="price.value.value"
                class="mb-4 pl-md-1"
                :error-messages="price.errorMessage.value"
                label="情緒價值"
                min="0"
                type="number"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="emotions.value.value"
                class="mb-4 pr-md-1"
                :error-messages="emotions.errorMessage.value"
                :items="emotionsOptions"
                label="情緒分類"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="category.value.value"
                class="mb-4 px-md-1"
                :error-messages="category.errorMessage.value"
                :items="categoryOptions"
                label="商品類別"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="details.value.value"
                class="mb-4 pl-md-1"
                :error-messages="details.errorMessage.value"
                label="細項說明(選填)"
                variant="outlined"
              />
            </v-col>
            <v-col class="my-4" cols="12">
              <v-row>
                <v-col cols="12" sm="auto">
                  <span class="text-body-1 text-nav mb-0">上傳商品圖</span>
                  <br />
                  <span class="text-body-2 text-nav mb-0">（最多5張）</span>
                </v-col>
                <v-col>
                  <FilePond
                    ref="fileAgent"
                    v-model="fileRecords"
                    accepted-file-types="image/jpeg, image/png, image/gif"
                    :allow-multiple="true"
                    :credits="''"
                    :files="fileRecords"
                    :label-idle="'拖曳或點選 上傳圖片（第一張為封面圖）'"
                    :label-max-file-size="'最大允許大小：{filesize}'"
                    :max-file-size="'1MB'"
                    :max-files="5"
                    @updatefiles="updateCoverImage"
                  />
                </v-col>
              </v-row>
            </v-col>

            <v-col class="mt-4" cols="12">
              <v-textarea
                v-model="description.value.value"
                class="mb-4"
                :error-messages="description.errorMessage.value"
                label="商品描述(簡介)"
                variant="outlined"
              />
            </v-col>

            <v-col class="my-4" cols="12">
              <div class="d-flex align-center">
                <span class="text-body-1 text-nav mb-0">商品特色(主要內容)</span>
                <v-btn
                  class="ml-auto"
                  color="primary"
                  density="compact"
                  :disabled="isFeaturesFull"
                  variant="outlined"
                  @click="addContent('features')"
                >
                  新增特色
                </v-btn>
                <p v-if="isFeaturesFull" class="text-accent text-error ml-2">最多新增 10 個</p>
              </div>
              <v-divider class="my-2" />
              <div v-for="(feature, index) in features.value.value" :key="index">
                <v-row class="mt-2" no-gutters>
                  <v-col cols="12" md="4">
                    <v-select
                      v-model="feature.type"
                      density="compact"
                      hide-details
                      :items="['文字說明', '圖片說明', '影音說明']"
                      label="內容類型"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-text-field
                      v-if="feature.type === '文字說明'"
                      v-model="feature.content"
                      class="pl-md-2"
                      density="compact"
                      hide-details
                      :label="'內容 ' + (index + 1)"
                      variant="outlined"
                    />
                    <FilePond
                      v-else
                      :id="'featurePond' + index"
                      :ref="'featurePond' + index"
                      :accepted-file-types="
                        feature.type === '圖片說明'
                          ? 'image/jpeg, image/png, image/gif'
                          : 'audio/mpeg, audio/wav, video/mp4'
                      "
                      :allow-multiple="true"
                      :class="'pl-md-2'"
                      :credits="''"
                      :files="dynamicFiles['feature' + feature.tempId]"
                      :label-idle="
                        '拖曳或點選 上傳 ' + (feature.type === '圖片說明' ? '圖片說明' : '影音說明')
                      "
                      :max-file-size="'20MB'"
                      @updatefiles="handleFileUpload(feature, 'feature', $event)"
                    />
                  </v-col>
                  <v-col class="d-flex justify-end mt-2" cols="12">
                    <v-btn
                      color="red"
                      density="compact"
                      variant="text"
                      @click="removeContent('features', index)"
                    >
                      刪除
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
            </v-col>
            <v-col class="my-4" cols="12">
              <div class="d-flex align-center">
                <span class="text-body-1 text-nav mb-0">商品規格</span>
                <v-btn
                  class="ml-auto"
                  color="primary"
                  density="compact"
                  :disabled="isSpecificationsFull"
                  variant="outlined"
                  @click="addContent('specifications')"
                >
                  新增規格
                </v-btn>
                <p v-if="isSpecificationsFull" class="text-accent text-error ml-2">最多新增 5 個</p>
              </div>
              <v-divider class="my-2" />
              <div v-for="(spec, index) in specifications.value.value" :key="index">
                <v-row class="mt-2" no-gutters>
                  <v-col cols="12" md="4">
                    <v-select
                      v-model="spec.type"
                      density="compact"
                      hide-details
                      :items="['文字說明', '圖片說明']"
                      label="內容類型"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-text-field
                      v-if="spec.type === '文字說明'"
                      v-model="spec.content"
                      class="pl-md-2"
                      density="compact"
                      hide-details
                      :label="'內容 ' + (index + 1)"
                      variant="outlined"
                    />
                    <FilePond
                      v-else
                      :id="'specPond' + index"
                      :ref="'specPond' + index"
                      :accepted-file-types="'image/jpeg, image/png, image/gif'"
                      :allow-multiple="true"
                      :class="'pl-md-2'"
                      :credits="''"
                      :files="dynamicFiles['spec' + spec.tempId]"
                      :label-idle="'拖曳或點選 上傳 圖片'"
                      :max-file-size="'20MB'"
                      @updatefiles="handleFileUpload(spec, 'spec', $event)"
                    />
                  </v-col>
                  <v-col class="d-flex justify-end mt-2" cols="12">
                    <v-btn
                      color="red"
                      density="compact"
                      variant="text"
                      @click="removeContent('specifications', index)"
                    >
                      刪除
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-row class="px-3" no-gutters>
            <v-col class="d-flex no-wrap" cols="12" sm="6">
              <v-checkbox
                v-model="sell.value.value"
                :error-messages="sell.errorMessage.value"
                hide-details
                label="上架"
              />
              <v-checkbox
                v-model="roll.value.value"
                :error-messages="roll.errorMessage.value"
                hide-details
                label="開放骰點交易"
              />
            </v-col>
            <v-col class="d-flex justify-end pt-1" cols="12" sm="6">
              <v-btn class="text-primary" :disabled="isSubmitting" @click="closeDialog">
                取消
              </v-btn>

              <v-btn class="text-accent" :loading="isSubmitting" type="submit" variant="flat">
                {{ isEditing ? '編輯' : '新增' }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
  import { v4 as uuid } from 'uuid'
  import { useField, useForm } from 'vee-validate'
  import { computed, ref, watch } from 'vue'
  import { useSnackbar } from 'vuetify-use-dialog'
  import * as yup from 'yup'
  import productService from '@/services/product'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true,
    },
    product: {
      type: Object,
      default: null,
    },
  })

  const emit = defineEmits(['update:modelValue', 'submitSuccess'])

  const dialog = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  })

  const isEditing = computed(() => !!props.product)

  // 建立 snackbar 方便顯示訊息
  const createSnackbar = useSnackbar()

  // 檔案上傳元件 ref
  const fileAgent = ref(null)
  const fileRecords = ref([])

  // 新增 ref 來儲存動態上傳的檔案
  const dynamicFiles = ref({})

  // 情緒分類與商品類別選項
  const emotionsOptions = ['正面', '中立', '負面', '其他']
  const categoryOptions = ['文字', '圖片', '音樂', '語音', '影片', '物品', '其他']

  // vee-validate useForm 設定驗證規則與初始值
  const { handleSubmit, resetForm, isSubmitting } = useForm({
    validationSchema: yup.object({
      name: yup.string().required('商品名稱必填').max(50, '商品名稱最多50個字'),
      price: yup
        .number()
        .typeError('情緒價值必填')
        .required('情緒價值必填')
        .min(0, '情緒價值不得為負數'),
      emotions: yup.string().required('情緒分類必填').oneOf(emotionsOptions, '請選擇有效的分類'),
      category: yup.string().required('商品類別必填').oneOf(categoryOptions, '請選擇有效的分類'),
      details: yup.string().max(20, '細項說明最多20字'),
      description: yup.string().required('商品簡介必填').max(200, '商品簡介最多200字'),
      images: yup
        .array()
        .min(1, '至少需要一張商品圖片')
        .max(5, '最多只能上傳5張圖片')
        .required('至少需要一張商品圖片'),
      features: yup.array().of(
        yup.object({
          type: yup.string().oneOf(['文字說明', '圖片說明', '影音說明']),
          content: yup.string(),
        })
      ),
      specifications: yup.array().of(
        yup.object({
          type: yup.string().oneOf(['文字說明', '圖片說明']),
          content: yup.string(),
        })
      ),
      sell: yup.boolean().required(),
      roll: yup.boolean().required(),
    }),

    initialValues: {
      name: '',
      price: 0,
      emotions: '',
      category: '',
      details: '',
      description: '',
      sell: false,
      features: [],
      specifications: [],
      roll: false,
      images: [],
    },
  })

  // vee-validate useField 管理表單欄位
  const name = useField('name')
  const price = useField('price')
  const emotions = useField('emotions')
  const category = useField('category')
  const details = useField('details')
  const description = useField('description')
  const features = useField('features')
  const specifications = useField('specifications')
  const sell = useField('sell')
  const roll = useField('roll')
  const images = useField('images')

  // 關閉對話框並重置
  const closeDialog = () => {
    dialog.value = false
  }

  // 處理封面圖上傳
  const updateCoverImage = (files) => {
    fileRecords.value = files
    images.value.value = files
  }

  // 檢查是否達到數量上限
  const isFeaturesFull = computed(() => (features.value.value || []).length >= 10)
  const isSpecificationsFull = computed(() => (specifications.value.value || []).length >= 5)

  // 處理動態表單內容新增與移除
  const addContent = (type) => {
    if (type === 'features') {
      if (!Array.isArray(features.value.value)) {
        features.value.value = []
      }
      if (features.value.value.length >= 10) {
        createSnackbar({
          text: '商品特色最多只能新增 10 個',

          snackbarProps: { color: 'red' },
        })
        return
      }

      features.value.value.push({
        type: '文字說明',
        content: '',
        tempId: uuid(), // 新增了 uuid() 來確保每個新增項都有唯一的 ID
      })
    } else if (type === 'specifications') {
      if (!Array.isArray(specifications.value.value)) {
        specifications.value.value = []
      } else if (specifications.value.value.length >= 5) {
        createSnackbar({
          text: '商品規格最多只能新增 5 個',

          snackbarProps: { color: 'red' },
        })
        return
      }

      specifications.value.value.push({
        type: '文字說明',
        content: '',
        tempId: uuid(), // 新增了 uuid()
      })
    }
  }

  const removeContent = (type, index) => {
    const targetArray = type === 'features' ? features.value.value : specifications.value.value
    const itemToRemove = targetArray[index]

    // 移除檔案時，也從 dynamicFiles 中移除對應的檔案
    if (itemToRemove && itemToRemove.tempId) {
      const key =
        type === 'features' ? `feature${itemToRemove.tempId}` : `spec${itemToRemove.tempId}`
      if (dynamicFiles.value[key]) {
        delete dynamicFiles.value[key]
      }
    }

    // 移除陣列中的項目
    targetArray.splice(index, 1)
  }

  // 處理動態檔案上傳
  const handleFileUpload = (item, type, files) => {
    const key = `${type}${item.tempId}`

    // 修正：確保 files 是一個有效的陣列，並且有檔案

    if (files && files.length > 0) {
      // 檢查是否有新上傳的檔案
      const hasNewFile = files.some((file) => file.file instanceof File)
      if (hasNewFile) {
        // 有新檔案，將其添加到 dynamicFiles
        dynamicFiles.value[key] = files
        // 將 item.content 設置為一個標記，表示有檔案上傳
        item.content = '__HAS_FILE__'
      } else if (files[0].source) {
        // 如果是既有的檔案（編輯模式），保留原始路徑
        item.content = files[0].source
      }
    } else {
      // 如果沒有檔案 (被刪除)，清空 dynamicFiles
      delete dynamicFiles.value[key]
      item.content = ''
    }
  }

  // 表單送出
  const submit = handleSubmit(async (values) => {
    // 新增模式下，檢查是否有至少一張圖片
    if (!isEditing.value && fileRecords.value.length === 0) {
      createSnackbar({
        text: '請至少上傳一張商品圖片',
        snackbarProps: { color: 'red' },
      })
      return
    } // 檢查動態檔案是否有選擇但沒有上傳
    for (const item of [...values.features, ...values.specifications]) {
      if (item.type !== '文字說明' && !item.content) {
        createSnackbar({
          text: '圖片或影音內容不能為空',
          snackbarProps: { color: 'red' },
        })
        return
      }
    }

    try {
      const fd = new FormData()
      // 1. 處理基本欄位
      fd.append('emotions', values.emotions)
      fd.append('category', values.category)
      fd.append('details', values.details)
      fd.append('name', values.name)
      fd.append('price', values.price)
      fd.append('description', values.description)
      fd.append('sell', values.sell)
      fd.append('roll', values.roll)

      // 2. 處理商品圖片
      if (isEditing.value) {
        // 編輯模式：找出被保留的舊圖片 URL
        const keptImages = fileRecords.value
          .filter((record) => typeof record.source === 'string' && !(record.file instanceof File))
          .map((record) => record.source)
        fd.append('existingImages', JSON.stringify(keptImages))
      }
      // 找出新上傳的圖片檔案
      const newImages = fileRecords.value.filter((record) => record.file instanceof File)
      for (const image of newImages) {
        fd.append('images', image.file)
      }

      // 3. 處理動態檔案與陣列內容
      const newDynamicFiles = []
      const processedFeatures = []
      const processedSpecifications = []

      // 遍歷 features
      for (const feature of values.features) {
        if (feature.type === '文字說明') {
          processedFeatures.push(feature)
        } else {
          const fileKey = `feature${feature.tempId}`
          const files = dynamicFiles.value[fileKey] || []
          const newFile = files.find((file) => file.file instanceof File)

          if (newFile) {
            newDynamicFiles.push(newFile.file)
            processedFeatures.push({ type: feature.type, content: '__HAS_FILE__' })
          } else if (feature.content && feature.content !== '__HAS_FILE__') {
            // 沒有新檔案，但有舊檔案的 URL，直接傳送
            processedFeatures.push({ type: feature.type, content: feature.content })
          }
        }
      }

      // 遍歷 specifications
      for (const spec of values.specifications) {
        if (spec.type === '文字說明') {
          processedSpecifications.push(spec)
        } else {
          const fileKey = `spec${spec.tempId}`
          const files = dynamicFiles.value[fileKey] || []
          const newFile = files.find((file) => file.file instanceof File)
          if (newFile) {
            newDynamicFiles.push(newFile.file)
            processedSpecifications.push({ type: spec.type, content: '__HAS_FILE__' })
          } else if (spec.content && spec.content !== '__HAS_FILE__') {
            processedSpecifications.push({ type: spec.type, content: spec.content })
          }
        }
      }

      // 將新上傳的動態檔案一次性 append 到 FormData
      for (const file of newDynamicFiles) {
        fd.append('dynamicMedia', file)
      }

      // 將處理後的陣列轉換為 JSON 字串並 append
      fd.append('features', JSON.stringify(processedFeatures))
      fd.append('specifications', JSON.stringify(processedSpecifications))

      // 呼叫 API
      await (isEditing.value
        ? productService.update(props.product._id, fd)
        : productService.create(fd))

      createSnackbar({
        text: '操作成功！',
        snackbarProps: { color: 'green' },
      })

      closeDialog()
      emit('submitSuccess')
    } catch (error) {
      console.error('Error submitting form:', error)
      createSnackbar({
        text: error.response?.data?.message || '操作失敗，請稍後再試',
        snackbarProps: { color: 'red' },
      })
    }
  })

  watch(
    () => dialog.value,
    (isOpen) => {
      if (isOpen) {
        if (isEditing.value) {
          // 編輯模式
          name.value.value = props.product.name
          price.value.value = props.product.price
          emotions.value.value = props.product.emotions
          category.value.value = props.product.category
          details.value.value = props.product.details
          description.value.value = props.product.description
          sell.value.value = props.product.sell
          roll.value.value = props.product.roll || false

          // 使用深拷貝以避免直接修改原始資料
          features.value.value = props.product.features
            ? JSON.parse(JSON.stringify(props.product.features))
            : []
          specifications.value.value = props.product.specifications
            ? JSON.parse(JSON.stringify(props.product.specifications))
            : []

          // 處理封面圖
          fileRecords.value =
            props.product.images?.map((imgPath) => ({
              source: imgPath.replaceAll('\\', '/'),
              options: {
                type: 'local',
                file: {
                  name: imgPath.split('/').pop(),
                  size: 0,
                  type: 'image/jpeg, image/png, image/gif',
                },
              },
            })) || []

          // 處理動態檔案
          dynamicFiles.value = {} // 清空舊的 dynamicFiles，避免殘留

          // 處理商品特色
          for (const [index, feature] of features.value.value.entries()) {
            // 假設你後端回傳的 content 就是 URL
            if (feature.type !== '文字說明' && feature.content) {
              // 修正：賦予每個動態項目一個唯一的臨時 ID
              const tempId = uuid()
              feature.tempId = tempId
              const key = `feature${tempId}`

              // 將既有的 URL 包裝成 FilePond 期待的陣列格式
              dynamicFiles.value[key] = [
                {
                  source: feature.content,
                  options: { type: 'local' },
                },
              ]

              // 修正：將 item.content 設置為一個標記，表示有檔案上傳
              feature.content = '__HAS_FILE__'
            }
          }

          // 處理商品規格
          for (const [index, spec] of specifications.value.value.entries()) {
            if (spec.type === '圖片說明' && spec.content) {
              const tempId = uuid()
              spec.tempId = tempId
              const key = `spec${tempId}`
              dynamicFiles.value[key] = [
                {
                  source: spec.content,
                  options: { type: 'local' },
                },
              ]
              spec.content = '__HAS_FILE__'
            }
          }
        } else {
          // 新增模式
          resetForm()
          fileRecords.value = []
          dynamicFiles.value = {} // 關閉時清空
        }
      }
    },
    { immediate: true }
  )
</script>
