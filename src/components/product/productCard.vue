<template>
  <v-card
    :key="_id"
    class="mx-auto position-relative text-text"
    :to="`/product/${_id}`"
    @mouseleave="handleNameMouseLeave"
    @mouseover="handleNameMouseOver"
  >
    <!-- 卡片圖片 -->
    <v-img
      :aspect-ratio="1 / 1"
      class="align-end"
      cover
      gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
      :src="image"
    >
      <FavoriteButton class="position-absolute top-0 right-0" :product-id="_id" />

      <!-- 商品描述內容 -->
      <v-fade-transition>
        <v-card
          v-if="reveal"
          class="mt-0 description-overlay position-absolute top-0 left-0 right-0 bottom-0 pa-2 overflow-y-auto rounded-0"
          elevation="0"
          flat
        >
          <FavoriteButton class="position-absolute top-0 right-0" :product-id="_id" />
          <v-card-text class="pb-0">
            <v-row
              class="align-center"
              :class="{ 'flex-column': $vuetify.display.mdAndDown }"
              no-gutters
            >
              <!-- Chips 區域 -->
              <v-col
                class="d-flex flex-column flex-sm-row align-start align-lg-center mb-2"
                cols="12"
              >
                <v-chip class="me-1 mb-1" size="small">
                  {{ emotions }}
                </v-chip>
                <v-chip size="small">
                  {{ category }}
                </v-chip>
              </v-col>
            </v-row>
            <!-- 描述文字 -->
            <p class="text-medium-emphasis">{{ description }}</p>
          </v-card-text>
        </v-card>
      </v-fade-transition>
    </v-img>

    <!-- 卡片文字 -->
    <v-card-actions class="d-flex flex-column pa-2 position-relative">
      <v-row class="d-flex w-100 align-center mt-2 px-2" no-gutters>
        <v-col class="text-left mb-0 py-0 name-container" cols="8">
          <span ref="nameEl" class="name-text text-h6">{{ name }}</span>
        </v-col>
        <v-col class="text-right py-0 price-container" cols="4">
          <span ref="priceEl" class="price-text">{{ formattedPrice }}</span>
        </v-col>
      </v-row>
      <v-row class="w-100 d-flex justify-center pb-4">
        <v-btn
          class="no-swipe-click"
          color="accent"
          variant="outlined"
          @click.stop.prevent="toggleReveal"
        >
          {{ reveal ? '關閉描述' : '看商品描述' }}
        </v-btn>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script setup>
  import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
  import FavoriteButton from './favoriteButton.vue'

  const props = defineProps({
    _id: { type: String, required: true },
    image: { type: String, required: true },
    emotions: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: [Number, String], required: true },
  })

  const formattedPrice = computed(() => {
    const priceValue = Number(props.price)
    if (isNaN(priceValue)) return props.price

    if (priceValue >= 100_000) {
      const tenThousands = Math.floor(priceValue / 10_000)
      const displayValue = Math.min(tenThousands, 99)
      return `$${displayValue}萬+`
    }
    return `$${new Intl.NumberFormat('en-US').format(priceValue)}`
  })

  const reveal = ref(false)

  const nameEl = ref(null)
  const priceEl = ref(null)

  let priceObserver = null

  const handleNameMouseOver = () => {
    const el = nameEl.value
    const container = el?.parentElement
    if (el && container && el.scrollWidth > container.clientWidth) {
      const overflowAmount = el.scrollWidth - container.clientWidth
      el.style.transform = `translateX(-${overflowAmount}px)`
    }
  }

  const handleNameMouseLeave = () => {
    if (nameEl.value) {
      nameEl.value.style.transform = 'translateX(0)'
    }
  }

  const fitPriceText = () => {
    nextTick(() => {
      const container = priceEl.value?.parentElement
      const el = priceEl.value
      if (!container || !el) return

      el.style.fontSize = '1rem' // Reset font size to base
      const initialFontSize = Number.parseFloat(window.getComputedStyle(el).fontSize)

      if (el.scrollWidth > container.clientWidth) {
        const scale = container.clientWidth / el.scrollWidth
        const newSize = Math.max(8, initialFontSize * scale) // Don't let font size be too small
        el.style.fontSize = `${newSize}px`
      }
    })
  }

  onMounted(() => {
    const priceContainer = priceEl.value?.parentElement
    if (priceContainer) {
      priceObserver = new ResizeObserver(fitPriceText)
      priceObserver.observe(priceContainer)
    }
    fitPriceText()
  })

  onBeforeUnmount(() => {
    if (priceObserver) priceObserver.disconnect()
  })

  const toggleReveal = () => {
    reveal.value = !reveal.value
  }
</script>

<style scoped>
  .name-container {
    overflow: hidden;
    white-space: nowrap;
  }

  .name-text {
    display: inline-block;
    white-space: nowrap;
    transform: translateX(0);
    transition: transform 3s ease-in-out;
    transition-delay: 0.3s;
  }

  .price-container {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    overflow: hidden;
  }

  .price-text {
    white-space: nowrap;
    line-height: 1.2;
  }
</style>
