<template>
  <v-footer class="bg-section text-text pa-8" padless>
    <v-container>
      <v-row class="flex-wrap">
        <!-- 多欄位選單 -->
        <v-col class="order-2 order-lg-1" cols="12" md="6">
          <v-row>
            <v-col
              v-for="(section, i) in footerLinks"
              :key="i"
              class="text-center text-lg-left"
              cols="4"
            >
              <h3 class="text-subtitle-2 font-weight-bold mb-2">
                {{ section.title }}
              </h3>
              <div v-for="(link, j) in section.links" :key="j">
                <a class="text-nav text-body-2 d-block mb-1" :href="link.href" style="opacity: 0.7">
                  {{ link.text }}
                </a>
              </div>
            </v-col>
          </v-row>
        </v-col>

        <!-- 訂閱電子報 -->
        <v-col class="order-1 order-lg-2" cols="12" md="6">
          <h3 class="text-subtitle-2 font-weight-bold mb-2">成為第一個知道的人！</h3>
          <p class="text-body-2 mb-3" style="opacity: 0.7">
            訂閱最新消息，讓每一分感受，都能被看見。
          </p>
          <v-text-field
            append-inner-icon="mdi-arrow-right"
            class="bg-white rounded"
            density="comfortable"
            hide-details
            placeholder="輸入您的電子郵件"
            variant="solo"
          />
        </v-col>
      </v-row>

      <!-- 底部版權 -->
      <v-divider class="my-6 d-flex align-center justify-center bg-divider" />
      <v-row>
        <v-col cols="12">
          <p class="text-body-2 text-center" style="opacity: 0.6">
            © 2025 Sanvia. All rights reserved.
          </p>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup>
  const footerLinks = [
    {
      title: '關於我們',
      links: [
        { text: '聯絡信箱', href: '#' },
        { text: '加入團隊', href: '#' },
        { text: '提供贊助', href: '#' },
      ],
    },
    {
      title: '申訴管道',
      links: [
        { text: '商品檢舉', href: '#' },
        { text: '用戶檢舉', href: '#' },
        { text: '網站問題', href: '#' },
      ],
    },
    {
      title: '用戶服務',
      links: [
        { text: '常見問題', href: '#' },
        { text: '使用條款', href: '#' },
        { text: '隱私政策', href: '#' },
      ],
    },
  ]
</script>
