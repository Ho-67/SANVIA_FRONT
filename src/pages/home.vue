<template>
  <v-container class="pa-0 bg-surface text-text d-flex flex-column h-screen" fluid>
    <!-- GSAP爆炸動畫 -->
    <div ref="explosionLayer" class="explosion-layer" />

    <!-- 大螢幕 -->
    <div v-if="lgAndUp" ref="desktopReff" class="d-flex w-100 flex-grow-1 h-screen scroll-hidden">
      <v-row class="flex-grow-1" no-gutters>
        <!-- 左邊的內容 -->
        <v-col class="d-flex flex-column py-10 px-16 justify-space-between bg-img" cols="6">
          <div class="d-flex align-top justify-space-between">
            <img alt="LOGO" height="80%" :src="logo" />
          </div>

          <template v-if="displayedProduct">
            <div class="mx-auto mt-n8 w-100" style="max-width: 350px">
              <productCard v-bind="displayedProduct" />
            </div>
          </template>
          <template v-else>
            <div class="ma-auto w-100" style="max-width: 450px; aspect-ratio: 1/1">
              <v-card
                class="h-100 d-flex flex-column align-center justify-center bg-divider pa-4"
                flat
              >
                <Icon
                  class="text-primary"
                  height="100"
                  icon="line-md:emoji-cry-filled"
                  width="100"
                />
                <span
                  ref="noProductTextRef"
                  class="text-accent text-body-2 mt-4"
                  style="overflow: hidden"
                >
                  <span
                    v-for="(char, index) in '目前可能還沒有符合條件的商品'.split('')"
                    :key="index"
                    style="display: inline-block"
                  >
                    {{ char }}
                  </span>
                </span>
              </v-card>
            </div>
          </template>

          <v-btn class="rounded-pill my-2 w-25" color="primary" variant="flat" @click="showHint">
            探索社群
            <v-icon right>mdi-arrow-right</v-icon>
          </v-btn>
        </v-col>
        <!-- 中間的內容 -->
        <v-col class="d-flex align-center justify-center py-10" cols="2">
          <div class="h-100 w-100 d-flex flex-column justify-space-between align-center my-auto">
            <div class="d-flex flex-column justify-space-around align-center">
              <v-btn
                icon="mdi-emoticon-happy-outline"
                value="正面"
                @click="selectEmotion('正面')"
              />
              <v-btn
                icon="mdi-emoticon-neutral-outline"
                value="中立"
                @click="selectEmotion('中立')"
              />
              <v-btn icon="mdi-emoticon-sad-outline" value="負面" @click="selectEmotion('負面')" />
              <v-btn
                icon="mdi-dots-horizontal-circle-outline"
                value="其他"
                @click="selectEmotion('其他')"
              />
            </div>
            <div class="d-flex align-center justify-center">
              <div
                ref="animatedTextRef"
                class="vertical-text text-h4 font-weight-medium text-primary"
              >
                <span v-for="(char, i) in '— SHOP & SOCIAL —'" :key="i">{{ char }}</span>
              </div>
            </div>
            <div style="width: 50px; aspect-ratio: 1/1">
              <Echart />
            </div>
          </div>
        </v-col>
        <!-- 右邊的內容 -->
        <v-col class="d-flex pa-4 justify-center h-100 w-100" cols="4">
          <Vue3Marquee :clone="true" :duration="10" :pause-on-hover="true" :vertical="true">
            <div
              v-for="product in products"
              :key="product._id"
              class="product-scroll-item"
              style="overflow: hidden"
            >
              <img
                class="product-scroll-img"
                :src="product.image"
                @click="goToProduct(product._id)"
              />
            </div>
          </Vue3Marquee>
        </v-col>
      </v-row>
    </div>

    <!-- 小螢幕 -->
    <div
      v-else
      ref="heroRef"
      class="d-flex flex-column align-center justify-center w-100 scroll-hidden h-screen"
    >
      <!-- 主內容 -->
      <div class="flex-grow-1 w-100 pa-4" style="min-height: 0">
        <div class="d-flex align-start flex-column px-4 py-8 px-sm-8 py-sm-16">
          <img alt="LOGO" height="60px" :src="logo" />
          <div class="d-flex flex-wrap justify-start my-4">
            <span
              ref="subtitle1Ref"
              class="text-no-wrap text-body-2 text-accent font-weight-medium"
            >
              <span
                v-for="(char, index) in '情緒是一種語言，也是一種商品。'.split('')"
                :key="index"
                style="display: inline-block"
              >
                {{ char }}
              </span>
            </span>
            <span
              ref="subtitle2Ref"
              class="text-no-wrap text-body-2 text-accent font-weight-medium"
            >
              <span
                v-for="(char, index) in '我們讓感受被理解，被保存，甚至被交易。'.split('')"
                :key="index"
                style="display: inline-block"
              >
                {{ char }}
              </span>
            </span>
          </div>
          <v-btn
            class="rounded-pill w-25"
            color="primary"
            height="48"
            variant="flat"
            @click="showHint"
          >
            探索社群
            <v-icon right>mdi-arrow-right</v-icon>
          </v-btn>
        </div>

        <div class="d-flex justify-end px-4 py-8 px-sm-8 py-sm-16 w-100">
          <div v-show="mdAndUp" class="w-50 bg-img" />

          <div class="d-flex flex-column justify-space-around mx-4">
            <v-btn icon="mdi-emoticon-happy-outline" value="正面" @click="selectEmotion('正面')" />
            <v-btn
              icon="mdi-emoticon-neutral-outline"
              value="中立"
              @click="selectEmotion('中立')"
            />
            <v-btn icon="mdi-emoticon-sad-outline" value="負面" @click="selectEmotion('負面')" />
            <v-btn
              icon="mdi-dots-horizontal-circle-outline"
              value="其他"
              @click="selectEmotion('其他')"
            />
          </div>
          <template v-if="displayedProduct">
            <div class="w-100" style="max-width: 300px">
              <productCard v-bind="displayedProduct" />
            </div>
          </template>
          <template v-else>
            <div class="w-100" style="max-width: 350px; aspect-ratio: 1/1">
              <v-card
                class="h-100 d-flex flex-column align-center justify-center bg-divider pa-4"
                flat
              >
                <Icon
                  class="text-primary"
                  height="100"
                  icon="line-md:emoji-cry-filled"
                  width="100"
                />
                <span
                  ref="noProductTextRef"
                  class="text-accent text-body-2 mt-4"
                  style="overflow: hidden"
                >
                  <span
                    v-for="(char, index) in '目前可能還沒有符合條件的商品'.split('')"
                    :key="index"
                    style="display: inline-block"
                  >
                    {{ char }}
                  </span>
                </span>
              </v-card>
            </div>
          </template>
        </div>
      </div>
    </div>
    <v-snackbar v-model="snackbar" color="accent" :timeout="2000"> 開發中，敬請期待！ </v-snackbar>
  </v-container>
</template>

<script setup>
  import { Icon } from '@iconify/vue'
  import { gsap } from 'gsap'
  import { Physics2DPlugin } from 'gsap/Physics2DPlugin'
  import { nextTick, onMounted, onUnmounted, ref } from 'vue'
  import { Vue3Marquee } from 'vue3-marquee'
  import { useRouter } from 'vue-router'
  import { useDisplay, useTheme } from 'vuetify'
  import logo from '@/assets/logo.svg'
  import Echart from '@/components/echarts/EchartsDynamic.vue'
  import productCard from '@/components/product/productCard.vue'
  import productService from '@/services/product'

  const { lgAndUp, mdAndUp } = useDisplay()
  const theme = useTheme()
  const router = useRouter()

  const desktopReff = ref(null) // For explosion effect
  const products = ref([])
  const selectedEmotion = ref(null)
  const displayedProduct = ref(null)
  const noProductTextRef = ref(null)
  const animatedTextRef = ref(null)
  const subtitle1Ref = ref(null)
  const subtitle2Ref = ref(null)
  const snackbar = ref(false)

  const showHint = () => {
    snackbar.value = true
  }

  const goToProduct = (id) => {
    router.push(`/product/${id}`)
  }

  const fetchProducts = async () => {
    try {
      const { data } = await productService.get()
      products.value = Array.isArray(data.products) ? data.products : []
      if (products.value.length > 0) {
        const randomIndex = Math.floor(Math.random() * products.value.length)
        const product = products.value[randomIndex]
        displayedProduct.value = product && product._id ? product : null
        if (!displayedProduct.value) {
          animateNoProductText()
        }
      } else {
        displayedProduct.value = null
        animateNoProductText()
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      products.value = []
      displayedProduct.value = null
      animateNoProductText()
    }
  }

  const selectEmotion = (emotion) => {
    selectedEmotion.value = emotion
    const filteredProducts = (products.value || []).filter((p) => {
      return p.emotions === emotion
    })

    if (filteredProducts.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredProducts.length)
      displayedProduct.value = filteredProducts[randomIndex]
    } else {
      displayedProduct.value = null
      animateNoProductText()
    }
  }

  // GSAP螢幕點擊
  gsap.registerPlugin(Physics2DPlugin)
  const heroRef = ref(null)
  const explosionLayer = ref(null)

  const createExplosion = (x, y) => {
    const container = explosionLayer.value
    if (!container) return

    const currentColors = theme.themes.value[theme.global.name.value].colors
    const colorChoices = [
      currentColors.primary,
      currentColors.secondary,
      currentColors.accent,
    ].filter(Boolean)

    const count = 4
    const explosion = gsap.timeline()

    // 光暈效果
    const glow = document.createElement('div')
    glow.style.position = 'absolute'
    glow.style.left = `${x}px`
    glow.style.top = `${y}px`
    glow.style.transform = 'translate(-50%, -50%)'
    glow.style.width = '60px'
    glow.style.height = '60px'
    glow.style.borderRadius = '50%'
    glow.style.background = 'radial-gradient(circle, #C6B3C900 0%, #C6B3C9 80%, #C6B3C900 0%)'
    glow.style.filter = 'blur(4px)'
    glow.style.mixBlendMode = 'screen'
    glow.style.pointerEvents = 'none'
    glow.style.zIndex = '1000'
    container.append(glow)

    gsap.fromTo(
      glow,
      { scale: 0.5, opacity: 0.8 },
      {
        scale: 2,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => glow.remove(),
      }
    )

    for (let i = 0; i < count; i++) {
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      icon.setAttribute('viewBox', '0 0 24 24')
      const size = gsap.utils.random(10, 30)
      icon.setAttribute('width', size)
      icon.setAttribute('height', size)
      icon.style.position = 'absolute'
      icon.style.pointerEvents = 'none'
      icon.style.left = `${x}px`
      icon.style.top = `${y}px`
      icon.style.transform = 'translate(-50%, -50%)'
      icon.innerHTML = `<circle cx="12" cy="12" r="0" fill="currentColor"><animate id="SVGHRb9bJhy" fill="freeze" attributeName="r" begin="0;SVGUoIUme6Z.begin+0.4s" calcMode="spline" dur="1.2s" keySplines=".52,.6,.25,.99" values="0;11" /><animate fill="freeze" attributeName="opacity" begin="0;SVGUoIUme6Z.begin+0.4s" calcMode="spline" dur="1.2s" keySplines=".52,.6,.25,.99" values="1;0" /></circle><circle cx="12" cy="12" r="0" fill="currentColor"><animate id="SVGaun8abat" fill="freeze" attributeName="r" begin="SVGHRb9bJhy.begin+0.4s" calcMode="spline" dur="1.2s" keySplines=".52,.6,.25,.99" values="0;11" /><animate fill="freeze" attributeName="opacity" begin="SVGHRb9bJhy.begin+0.4s" calcMode="spline" dur="1.2s" keySplines=".52,.6,.25,.99" values="1;0" /></circle><circle cx="12" cy="12" r="0" fill="currentColor"><animate id="SVGUoIUme6Z" fill="freeze" attributeName="r" begin="SVGHRb9bJhy.begin+0.8s" calcMode="spline" dur="1.2s" keySplines=".52,.6,.25,.99" values="0;11" /><animate fill="freeze" attributeName="opacity" begin="SVGHRb9bJhy.begin+0.8s" calcMode="spline" dur="1.2s" keySplines=".52,.6,.25,.99" values="1;0" /></circle>`
      icon.style.color = gsap.utils.random(colorChoices)

      container.append(icon)

      explosion
        .to(
          icon,
          {
            physics2D: {
              angle: gsap.utils.random(60, 120),
              velocity: gsap.utils.random(150, 300),
              gravity: 800,
              bounds: container,
            },
            rotation: gsap.utils.random(-90, 90),
            duration: gsap.utils.random(1.5, 2),
          },
          0
        )
        .to(
          icon,
          {
            opacity: 0,
            duration: 0.5,
            ease: 'power1.in',
            onComplete: () => icon.remove(),
          },
          '-=0.5'
        )
    }

    return explosion
  }

  // 沒有商品
  const animateNoProductText = async () => {
    await nextTick()
    if (noProductTextRef.value) {
      const chars = noProductTextRef.value.children
      gsap.from(chars, {
        y: '100%',
        opacity: 0,
        duration: 0.4,
        ease: 'power1.out',
        stagger: 0.03,
      })
    }
  }

  // — SHOP & SOCIAL —
  const setupMouseInteraction = () => {
    const container = animatedTextRef.value
    if (!container) return
    const chars = Array.from(container.children)

    const quickToX = chars.map((char) => gsap.quickTo(char, 'x', { duration: 0.5, ease: 'power3' }))
    const quickToY = chars.map((char) => gsap.quickTo(char, 'y', { duration: 0.5, ease: 'power3' }))

    const containerRect = container.getBoundingClientRect()
    const charData = chars.map((char) => ({
      el: char,
      x: char.getBoundingClientRect().left - containerRect.left + char.offsetWidth / 2,
      y: char.getBoundingClientRect().top - containerRect.top + char.offsetHeight / 2,
    }))

    const radius = 80
    const strength = 40

    container.addEventListener('mousemove', (e) => {
      const mouseX = e.clientX - containerRect.left
      const mouseY = e.clientY - containerRect.top

      for (const [index, data] of charData.entries()) {
        const dx = data.x - mouseX
        const dy = data.y - mouseY
        const distance = Math.hypot(dx, dy)

        if (distance < radius) {
          const angle = Math.atan2(dy, dx)
          const force = (1 - distance / radius) * strength
          const moveX = Math.cos(angle) * force
          const moveY = Math.sin(angle) * force
          quickToX[index](moveX)
          quickToY[index](moveY)
        } else {
          quickToX[index](0)
          quickToY[index](0)
        }
      }
    })

    container.addEventListener('mouseleave', () => {
      for (const [index, char] of chars.entries()) {
        quickToX[index](0)
        quickToY[index](0)
      }
    })
  }

  const animateShopSocial = async () => {
    await nextTick()
    if (!animatedTextRef.value) return

    const chars = Array.from(animatedTextRef.value.children)
    const tl = gsap.timeline({ onComplete: setupMouseInteraction })

    // Fly-in animation
    tl.from(chars, {
      opacity: 0,
      x: () => gsap.utils.random(-100, 100),
      y: () => gsap.utils.random(-200, 200),
      rotation: () => gsap.utils.random(-360, 360),
      scale: 0.1,
      duration: 1.2,
      ease: 'power2.out',
      stagger: 0.05,
    })
  }

  const animateSubtitle = (subtitleRef) => {
    if (!subtitleRef.value) return gsap.timeline()
    const chars = subtitleRef.value.children
    const tl = gsap.timeline()
    // Animate from opacity 0 and y: 20 to their natural state (opacity 1, y: 0)
    tl.fromTo(
      chars,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        ease: 'power3.out',
        stagger: 0.05,
      }
    )
    return tl
  }

  onMounted(() => {
    // 卡片顯示
    fetchProducts()

    // 標題動畫
    animateShopSocial()

    nextTick(() => {
      // 副標題動畫
      if (subtitle1Ref.value && subtitle2Ref.value) {
        // 確保 subtitle2 初始為隱藏狀態
        gsap.set(subtitle2Ref.value.children, { opacity: 0 })

        // 創建一個主時間軸來依序播放兩個副標題的動畫
        const masterTimeline = gsap.timeline()
        masterTimeline.add(animateSubtitle(subtitle1Ref)).add(animateSubtitle(subtitle2Ref))
      }

      // --- Setup Explosion Listeners for both large and small screens ---
      const largeEl = desktopReff.value
      const smallEl = heroRef.value

      const explosionHandler = (e) => {
        const pointer = e.touches ? e.touches[0] : e

        // 避免在可互動元素上觸發
        // if (e.target.closest('button, a, input, .v-card, .product-scroll-item')) {
        //   return
        // }

        // Use viewport coordinates directly
        createExplosion(pointer.clientX, pointer.clientY)
      }

      if (largeEl) {
        largeEl.addEventListener('mousedown', explosionHandler)
        largeEl.addEventListener('touchstart', explosionHandler, { passive: true })
      }
      if (smallEl) {
        smallEl.addEventListener('mousedown', explosionHandler)
        smallEl.addEventListener('touchstart', explosionHandler, { passive: true })
      }

      onUnmounted(() => {
        if (largeEl) {
          largeEl.removeEventListener('mousedown', explosionHandler)
          largeEl.removeEventListener('touchstart', explosionHandler)
        }
        if (smallEl) {
          smallEl.removeEventListener('mousedown', explosionHandler)
          smallEl.removeEventListener('touchstart', explosionHandler)
        }
      })
    })
  })
</script>

<style scoped>
  .bg-img {
    position: relative;
    overflow: hidden;
  }

  .bg-img::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('@/assets/favicon_frame.svg') no-repeat;
    background-size: contain;
    background-position: center;
    opacity: 0.4;
    z-index: 0;

    /* 持續旋轉動畫 */
    animation: spin linear infinite;
    animation-duration: 120s;

    opacity: 0.2;
    transition: opacity 0.8s ease-in-out; /* 平滑變亮變暗 */
  }

  .bg-img:hover::before {
    opacity: 0.1;
  }

  .bg-img > * {
    position: relative;
    z-index: 1;
  }

  /* 單一旋轉動畫 */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .big-screen-text {
    padding-top: 24px;
    margin-left: 12px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
  }

  @media (min-width: 1600px) {
    .big-screen-text {
      padding-top: 4px;
      margin: 0;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      justify-content: end;
    }
  }

  .vertical-text {
    writing-mode: vertical-rl;
  }
  .vertical-text span {
    margin-bottom: 0.5rem;
    display: inline-block; /* 確保 GSAP 的 transform 生效 */
  }
  .product-scroll-item {
    margin: 8px 0;
    cursor: pointer;
  }

  .product-scroll-img {
    width: 250px;
    height: 250px;
    object-fit: cover;
    border-radius: 8px;
    transition: transform 0.3s ease;
    will-change: transform; /* 提前優化 GPU 渲染 */
  }

  .product-scroll-item:hover .product-scroll-img {
    transform: scale(1.05);
  }

  .explosion-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
    overflow: visible;
    z-index: 999;
  }

  /* 對可滾動元素隱藏滾動條，但保留滾動功能 */
  .scroll-hidden {
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
  }

  .scroll-hidden::-webkit-scrollbar {
    display: none; /* Chrome, Safari */
  }
</style>
