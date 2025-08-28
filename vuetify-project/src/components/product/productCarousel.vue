<template>
  <swiper
    ref="swiperRef"
    :breakpoints="{
      '600': { slidesPerView: 2 },
      '960': { slidesPerView: 3 },
      '1280': { slidesPerView: 4 },
      '1920': { slidesPerView: 5 },
    }"
    class="h-100 w-100 px-10"
    :modules="modules"
    :navigation="true"
    :slides-per-view="1"
    :space-between="16"
    @click="onSwiperClick"
  >
    <swiper-slide
      v-for="item in products"
      :key="item._id"
      class="d-flex justify-center align-center"
    >
      <ProductCard v-bind="item" class="text-none-decoration w-100" />
    </swiper-slide>
  </swiper>
</template>

<script setup>
  import { Navigation } from 'swiper/modules'
  import { Swiper, SwiperSlide } from 'swiper/vue'
  import { useRouter } from 'vue-router'
  import ProductCard from '@/components/product/productCard.vue'
  import 'swiper/css'
  import 'swiper/css/navigation'

  const router = useRouter()

  const props = defineProps({
    products: {
      type: Array,
      required: true,
    },
  })

  const modules = [Navigation]

  const onSwiperClick = (swiper, event) => {
    const target = event?.target

    if (target.closest('.no-swipe-click') || target.tagName === 'BUTTON') {
      return
    }

    const clickedProduct = props.products[swiper.clickedIndex]
    if (clickedProduct) {
      router.push(`/product/${clickedProduct._id}`)
    }
  }
</script>
