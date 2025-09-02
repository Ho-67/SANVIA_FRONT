<template>
  <v-app-bar app class="px-6" flat>
    <!-- 手機板 Logo (左側) -->
    <div class="d-flex d-md-none align-center">
      <router-link class="text-decoration-none" exact to="/">
        <img alt="LOGO" height="50" :src="logo" />
      </router-link>
    </div>

    <!-- 桌面板 情緒幣餘額 (左側) -->
    <div class="d-none d-md-flex" style="flex-basis: 33.33%">
      <v-btn style="pointer-events: none">
        <router-link class="d-flex align-center text-decoration-none" exact to="/myAccount">
          <Icon
            class="mr-2"
            icon="streamline-plump:money-cash-bill-1-solid"
            style="font-size: 24px; color: #c6b3c9"
          />
          <span class="text-subtitle-1 text-primary">情緒幣餘額$</span>
        </router-link>
      </v-btn>
    </div>

    <v-spacer />

    <!-- 桌面板 Logo (中間) -->
    <div class="d-none d-md-flex">
      <v-app-bar-title>
        <router-link class="text-decoration-none" exact to="/">
          <div class="d-flex align-center justify-center">
            <img alt="LOGO" height="50" :src="logo" />
          </div>
        </router-link>
      </v-app-bar-title>
    </div>

    <v-spacer />

    <!-- 右側按鈕 -->
    <div class="d-flex align-center justify-end" style="flex-basis: 33.33%">
      <v-btn v-if="isSmAndDown" icon="mdi-menu" @click="onMenuClick" />
      <template v-else>
        <v-btn icon="mdi-magnify" @click="onSearch" />
        <v-btn exact icon router :to="isLoggedIn ? '/favorite' : '/register'">
          <Icon height="24" icon="tabler:mood-heart" width="24" />
        </v-btn>
        <v-btn exact icon router :to="isLoggedIn ? '/cart' : '/register'">
          <v-badge
            color="accent"
            :content="cartBadgeContent"
            location="top right"
            :model-value="user.cartTotal > 0"
          >
            <v-icon>mdi-shopping-outline</v-icon>
          </v-badge>
        </v-btn>

        <template v-if="!isLoggedIn">
          <v-btn exact icon router to="/register">
            <v-icon>mdi-account-circle-outline</v-icon>
          </v-btn>
        </template>
        <template v-else>
          <v-menu offset-y>
            <template #activator="{ props }">
              <v-btn v-bind="props" icon>
                <v-avatar size="32" variant="text">
                  <v-icon>mdi-account-circle-outline</v-icon>
                </v-avatar>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="myAccount">
                <div class="d-flex align-center">
                  <v-icon class="mr-2">mdi-account-cog-outline</v-icon>
                  <v-list-item-title>我的帳戶</v-list-item-title>
                </div>
              </v-list-item>
              <v-list-item @click="logout">
                <div class="d-flex align-center">
                  <v-icon class="mr-2">mdi-logout</v-icon>
                  <v-list-item-title>登出</v-list-item-title>
                </div>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </template>
    </div>
  </v-app-bar>

  <SearchDrawerFloating v-if="showSearchDrawer && !menu" v-model="showSearchDrawer" />

  <template v-if="isSmAndDown">
    <v-navigation-drawer
      v-if="!showSearchDrawer"
      v-model="menu"
      class="px-8 pt-6 text-text"
      :close-on-click="false"
      location="top"
      :scrim="false"
      :scrim-clickable="false"
      style="height: 220px"
      temporary
    >
      <v-list class="pa-0">
        <v-row no-gutters>
          <v-col cols="12">
            <v-btn block class="menu-link" @click="onSearchDrawer">
              <v-icon>mdi-magnify</v-icon>
              <span>搜尋</span>
            </v-btn>
          </v-col>
          <v-col cols="12">
            <v-btn block class="menu-link" @click="onFavorite">
              <Icon height="18" icon="tabler:mood-heart" width="18" />
              <span>心選好物</span>
            </v-btn>
          </v-col>
          <v-col cols="12">
            <v-btn block class="menu-link" @click="handleNavClick('/cart')">
              <v-badge
                color="accent"
                :content="cartBadgeContent"
                inline
                :model-value="user.cartTotal > 0"
              >
                <v-icon>mdi-shopping-outline</v-icon>
              </v-badge>
              <span>購物車</span>
            </v-btn>
          </v-col>
          <v-col cols="12">
            <v-btn block class="menu-link" @click="handleNavClick('/myAccount')">
              <v-icon>mdi-account-cog-outline</v-icon>
              <span>我的帳戶</span>
            </v-btn>
          </v-col>

          <!-- 判斷是否已經登錄 -->
          <v-col cols="12">
            <template v-if="!isLoggedIn">
              <!-- 未登錄顯示註冊/登入 -->
              <v-btn block class="menu-link" @click="handleNavClick('/register')">
                <v-icon>mdi-login</v-icon>
                <span>註冊與登入</span>
              </v-btn>
            </template>
            <template v-else>
              <!-- 登錄後顯示登出 -->
              <v-btn block class="menu-link" @click="logout">
                <v-icon>mdi-logout</v-icon>
                <span>登出</span>
              </v-btn>
            </template>
          </v-col>
        </v-row>
      </v-list>
    </v-navigation-drawer>
  </template>

  <div v-if="menu || showSearchDrawer" class="custom-scrim text-text" @click="closeAllDrawers" />
</template>

<script setup>
  import { Icon } from '@iconify/vue'
  import { computed, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useDisplay, useTheme } from 'vuetify'
  import { useSnackbar } from 'vuetify-use-dialog'
  import logo from '@/assets/logo.svg'
  import SearchDrawerFloating from '@/components/searchDrawerFloating.vue'
  import userService from '@/services/user'
  import { useUserStore } from '@/stores/user'

  const theme = useTheme()

  // Vuetify 響應式偵測
  const display = useDisplay()
  const isSmAndDown = computed(() => display.smAndDown.value)

  // 使用者狀態與 Router
  const user = useUserStore()
  const isLoggedIn = computed(() => user.isLoggedIn)
  const cartBadgeContent = computed(() => {
    return user.cartTotal > 99 ? '99+' : user.cartTotal
  })
  const router = useRouter()
  const createSnackbar = useSnackbar()

  // 搜尋 Drawer 控制
  const showSearchDrawer = ref(false)

  function onSearch() {
    closeAllDrawers()
    showSearchDrawer.value = !showSearchDrawer.value
  }
  function onSearchDrawer() {
    closeAllDrawers()
    showSearchDrawer.value = true
  }

  // 我的帳戶
  function myAccount() {
    closeAllDrawers()
    router.push('/myAccount')
  }

  // 心選好物
  const onFavorite = () => {
    // 點擊後先關閉所有抽屜
    closeAllDrawers()
    // 檢查使用者是否登入
    if (isLoggedIn.value) {
      // 若已登入，則導向心選好物頁面
      router.push('/favorite')
    } else {
      // 若未登入，則導向註冊頁面
      router.push('/register')
    }
  }

  // 登出邏輯
  const logout = async () => {
    try {
      await userService.logout()
    } catch (error) {
      console.error(error)
    }
    user.logout()
    closeAllDrawers()
    createSnackbar({
      text: '登出成功！',
      snackbarProps: {
        color: 'green',
      },
    })
  }

  // 手機選單 menu 開關
  const menu = ref(false)

  // 新增此函式來處理選單點擊
  function onMenuClick() {
    // 點擊選單時，先關閉搜尋框
    showSearchDrawer.value = false
    // 再切換選單的開關狀態
    menu.value = !menu.value
  }

  // 尺寸改變時關閉所有抽屜
  watch(isSmAndDown, (val) => {
    if (!val) {
      closeAllDrawers()
    }
  })

  // 手動關閉所有抽屜
  function closeAllDrawers() {
    menu.value = false
    showSearchDrawer.value = false
  }

  function handleNavClick(to) {
    closeAllDrawers() // 在這裡關閉所有抽屜
    if ((to === '/myAccount' || to === '/cart') && !user.isLoggedIn) {
      router.push('/register') // 如果沒登錄，跳轉到註冊頁
    } else {
      router.push(to) // 如果登錄，直接跳轉到目標頁面
    }
  }

  watch([menu, showSearchDrawer], ([menuOpen, searchDrawerOpen]) => {
    if (menuOpen && searchDrawerOpen) {
      // 如果選單和搜尋抽屜同時開啟，關閉其中一個
      if (menuOpen) {
        showSearchDrawer.value = false // 關閉搜尋抽屜
      } else {
        menu.value = false // 關閉選單抽屜
      }
    }
  })
</script>

<style scoped>
  .custom-scrim {
    position: fixed;
    inset: 0;
    background-color: transparent; /* 將背景顏色改為透明 */
    z-index: 5;
  }
</style>
