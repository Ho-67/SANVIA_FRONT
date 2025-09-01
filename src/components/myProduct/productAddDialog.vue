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
                    :allow-image-preview="true"
                    :allow-multiple="true"
                    :allow-remove="true"
                    :credits="''"
                    :files="fileRecords"
                    :image-preview-height="200"
                    :label-idle="'拖曳或點選 上傳圖片（第一張為封面圖）'"
                    :label-max-file-size="'最大允許大小：{filesize}'"
                    :max-file-size="'1MB'"
                    :max-files="5"
                    :server="filePondServer"
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
              <div v-for="(feature, index) in features.value.value" :key="feature.tempId">
                <v-row class="mt-2" no-gutters>
                  <v-col cols="12" md="4">
                    <v-select
                      v-model="feature.type"
                      density="compact"
                      hide-details
                      :items="['文字說明', '圖片說明', '影音說明']"
                      label="內容類型"
                      variant="outlined"
                      @update:model-value="handleContentTypeChange(feature)"
                    />
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-text-field
                      v-if="feature.type === '文字說明'"
                      v-model="feature.content[0]"
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
                      :allow-audio-preview="true"
                      :allow-image-preview="true"
                      :allow-media-preview="true"
                      :allow-multiple="true"
                      :allow-remove="true"
                      :allow-video-preview="true"
                      :class="'pl-md-2'"
                      :credits="''"
                      :files="dynamicFiles['feature' + feature.tempId]"
                      :image-preview-height="200"
                      :label-idle="
                        '拖曳或點選 上傳 ' + (feature.type === '圖片說明' ? '圖片說明' : '影音說明')
                      "
                      :max-file-size="'20MB'"
                      :max-files="10"
                      :server="filePondServer"
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
              <div v-for="(spec, index) in specifications.value.value" :key="spec.tempId">
                <v-row class="mt-2" no-gutters>
                  <v-col cols="12" md="4">
                    <v-select
                      v-model="spec.type"
                      density="compact"
                      hide-details
                      :items="['文字說明', '圖片說明']"
                      label="內容類型"
                      variant="outlined"
                      @update:model-value="handleContentTypeChange(spec)"
                    />
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-text-field
                      v-if="spec.type === '文字說明'"
                      v-model="spec.content[0]"
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
                      :allow-image-preview="true"
                      :allow-multiple="true"
                      :allow-remove="true"
                      :class="'pl-md-2'"
                      :credits="''"
                      :files="dynamicFiles['spec' + spec.tempId]"
                      :image-preview-height="200"
                      :label-idle="'拖曳或點選 上傳 圖片'"
                      :max-file-size="'20MB'"
                      :max-files="5"
                      :server="filePondServer"
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
  import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
  import FilePondPluginMediaPreview from 'filepond-plugin-media-preview'
  import { v4 as uuid } from 'uuid'
  import { useField, useForm } from 'vee-validate'
  import { computed, ref, watch } from 'vue'
  import vueFilePond from 'vue-filepond'
  import { useSnackbar } from 'vuetify-use-dialog'
  import * as yup from 'yup'
  import productService from '@/services/product'
  import 'filepond/dist/filepond.min.css'
  import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css'
  import 'filepond-plugin-media-preview/dist/filepond-plugin-media-preview.min.css'

  // Create a FilePond component with plugins registered
  const FilePond = vueFilePond(FilePondPluginImagePreview, FilePondPluginMediaPreview)

  const filePondServer = {
    // 讀取檔案的處理方法
    load: (source, load, error, progress, abort) => {
      const request = new XMLHttpRequest()
      request.open('GET', source)
      request.responseType = 'blob'

      request.addEventListener('load', () => {
        if (request.status >= 200 && request.status < 300) {
          const contentType = request.getResponseHeader('Content-Type')
          const blob = new Blob([request.response], { type: contentType })
          load(blob)
        } else {
          error('載入失敗')
        }
      })

      request.addEventListener('error', () => error('載入錯誤'))

      request.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          progress(true, e.loaded, e.total)
        }
      })

      request.withCredentials = false // 允許跨域請求
      request.send()

      return {
        abort: () => {
          request.abort()
          abort()
        },
      }
    },

    // 處理回應的方法
    process: (fieldName, file, metadata, load, error, progress, abort) => {
      progress(true, 0, 1)
      load()
    },
  }

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
  const createSnackbar = useSnackbar()

  const fileAgent = ref(null)
  const fileRecords = ref([])
  const dynamicFiles = ref({})

  const emotionsOptions = ['正面', '中立', '負面', '其他']
  const categoryOptions = ['文字', '圖片', '音樂', '語音', '影片', '物品', '其他']

  const contentSchema = yup.array().of(yup.string()).min(1, '內容不可為空').required('內容不可為空')

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
          content: contentSchema,
          tempId: yup.string(),
        })
      ),
      specifications: yup.array().of(
        yup.object({
          type: yup.string().oneOf(['文字說明', '圖片說明']),
          content: contentSchema,
          tempId: yup.string(),
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

  const closeDialog = () => {
    dialog.value = false
  }

  const updateCoverImage = (files) => {
    fileRecords.value = files
    images.value.value = files
  }

  const isFeaturesFull = computed(() => (features.value.value || []).length >= 10)
  const isSpecificationsFull = computed(() => (specifications.value.value || []).length >= 5)

  const addContent = (type) => {
    const targetArray = type === 'features' ? features.value.value : specifications.value.value
    const limit = type === 'features' ? 10 : 5
    if (targetArray.length >= limit) {
      createSnackbar({ text: `最多只能新增 ${limit} 個`, snackbarProps: { color: 'red' } })
      return
    }
    targetArray.push({
      type: '文字說明',
      content: [''],
      tempId: uuid(),
    })
  }

  const removeContent = (type, index) => {
    const targetArray = type === 'features' ? features.value.value : specifications.value.value
    const itemToRemove = targetArray[index]
    if (itemToRemove && itemToRemove.tempId) {
      const key = `${type}${itemToRemove.tempId}`
      if (dynamicFiles.value[key]) {
        delete dynamicFiles.value[key]
      }
    }
    targetArray.splice(index, 1)
  }

  const handleContentTypeChange = (item) => {
    const key = `feature${item.tempId}`
    const specKey = `spec${item.tempId}`
    if (dynamicFiles.value[key]) delete dynamicFiles.value[key]
    if (dynamicFiles.value[specKey]) delete dynamicFiles.value[specKey]

    item.content = item.type === '文字說明' ? [''] : []
  }

  const handleFileUpload = (item, type, files) => {
    const key = `${type}${item.tempId}`
    dynamicFiles.value[key] = files
    item.content = files
      .map((file) => {
        if (file.file instanceof File) return '__HAS_FILE__'
        if (typeof file.source === 'string') return file.source
        return ''
      })
      .filter(Boolean)
  }

  const submit = handleSubmit(async (values) => {
    if (!isEditing.value && fileRecords.value.length === 0) {
      createSnackbar({ text: '請至少上傳一張商品圖片', snackbarProps: { color: 'red' } })
      return
    }
    for (const item of [...values.features, ...values.specifications]) {
      if (!item.content || item.content.length === 0) {
        createSnackbar({ text: '內容不能為空', snackbarProps: { color: 'red' } })
        return
      }
      if (item.type === '文字說明' && item.content[0].trim() === '') {
        createSnackbar({ text: '文字說明內容不能為空', snackbarProps: { color: 'red' } })
        return
      }
    }

    try {
      const fd = new FormData()
      fd.append('emotions', values.emotions)
      fd.append('category', values.category)
      fd.append('details', values.details)
      fd.append('name', values.name)
      fd.append('price', values.price)
      fd.append('description', values.description)
      fd.append('sell', values.sell)
      fd.append('roll', values.roll)

      if (isEditing.value) {
        const keptImages = fileRecords.value
          .filter((record) => typeof record.source === 'string' && !(record.file instanceof File))
          .map((record) => record.source)
        fd.append('existingImages', JSON.stringify(keptImages))
      }
      const newImages = fileRecords.value.filter((record) => record.file instanceof File)
      for (const image of newImages) {
        fd.append('images', image.file)
      }

      const newDynamicFiles = []
      const processItems = (items, type) => {
        return items.map((item) => {
          if (item.type === '文字說明') {
            return { type: item.type, content: item.content }
          }
          const fileKey = `${type}${item.tempId}`
          const files = dynamicFiles.value[fileKey] || []
          const content = []
          for (const file of files) {
            if (file.file instanceof File) {
              newDynamicFiles.push(file.file)
              content.push('__HAS_FILE__')
            } else if (typeof file.source === 'string') {
              content.push(file.source)
            }
          }
          return { type: item.type, content }
        })
      }

      const processedFeatures = processItems(values.features, 'feature')
      const processedSpecifications = processItems(values.specifications, 'spec')

      for (const file of newDynamicFiles) {
        fd.append('dynamicMedia', file)
      }

      fd.append('features', JSON.stringify(processedFeatures))
      fd.append('specifications', JSON.stringify(processedSpecifications))

      await (isEditing.value
        ? productService.update(props.product._id, fd)
        : productService.create(fd))

      createSnackbar({ text: '操作成功！', snackbarProps: { color: 'green' } })
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
          name.value.value = props.product.name
          price.value.value = props.product.price
          emotions.value.value = props.product.emotions
          category.value.value = props.product.category
          details.value.value = props.product.details
          description.value.value = props.product.description
          sell.value.value = props.product.sell
          roll.value.value = props.product.roll || false

          dynamicFiles.value = {}

          const getMimeType = (url) => {
            const extension = url.split('.').pop().toLowerCase().split('?')[0]
            const mimeTypes = {
              // 圖片
              jpg: 'image/jpeg',
              jpeg: 'image/jpeg',
              png: 'image/png',
              gif: 'image/gif',
              // 音訊
              mp3: 'audio/mpeg',
              wav: 'audio/wav',
              // 影片
              mp4: 'video/mp4',
            }
            return mimeTypes[extension] || 'application/octet-stream'
          }

          const createFilePondObject = (url) => {
            const cleanUrl = url.replaceAll('\\', '/')
            const mimeType = getMimeType(cleanUrl)
            const isVideo = mimeType.startsWith('video/')
            const isAudio = mimeType.startsWith('audio/')
            const isImage = mimeType.startsWith('image/')

            return {
              source: cleanUrl,
              options: {
                type: 'local',
                file: {
                  name: cleanUrl.split('/').pop().split('?')[0],
                  size: 0, // Use 0 for existing files
                  type: mimeType,
                },
                metadata: {
                  // Provide poster for all types, simplifies logic
                  poster: cleanUrl,
                  // Explicitly set mediaType for the preview plugin
                  mediaType: isVideo ? 'video' : isAudio ? 'audio' : isImage ? 'image' : null,
                },
              },
            }
          }

          const populateDynamicItems = (sourceItems, type) => {
            if (!sourceItems) return []
            return JSON.parse(JSON.stringify(sourceItems)).map((item) => {
              const tempId = uuid()
              const key = `${type}${tempId}`
              if (item.type !== '文字說明' && Array.isArray(item.content)) {
                dynamicFiles.value[key] = item.content
                  .map((url) => (url === '__HAS_FILE__' ? null : createFilePondObject(url)))
                  .filter(Boolean)
              }
              return { ...item, tempId }
            })
          }

          features.value.value = populateDynamicItems(props.product.features, 'feature')
          specifications.value.value = populateDynamicItems(props.product.specifications, 'spec')

          // 處理商品圖片 (now using the unified function)
          fileRecords.value = props.product.images?.map(createFilePondObject) || []
        } else {
          resetForm()
          fileRecords.value = []
          dynamicFiles.value = {}
        }
      }
    },
    { immediate: true }
  )
</script>
