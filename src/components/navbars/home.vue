<template>
  <searchDrawer v-model="isSearchDrawer" />

  <v-navigation-drawer
    v-if="isDesktop"
    app
    class="slim-drawer d-flex flex-column align-center text-text"
    permanent
    width="90"
  >
    <div class="d-flex flex-column align-center">
      <v-list class="pt-6">
        <v-list-item-title>
          <router-link class="text-decoration-none" exact to="/">
            <img alt="LOGO" height="60" :src="logo" width="60" />
          </router-link>
        </v-list-item-title>
      </v-list>

      <v-list class="my-3">
        <!-- 沒登入時顯示登入 -->
        <v-btn v-if="!user.isLoggedIn" icon="mdi-login-variant" @click="dialog = true" />
        <!-- 已登入時顯示登出 -->
        <v-btn v-else color="secondary" icon="mdi-logout-variant" @click="logout" />
      </v-list>
    </div>

    <div class="flex-grow-1 d-flex flex-column justify-end h-50 mt-6">
      <v-list class="d-flex flex-column align-center" density="compact" nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          class="nav-btn"
          link
          @click="handleNavClick(item.to)"
        >
          <v-list-item-title class="vertical-text">
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </div>

    <template #append>
      <div class="pb-6">
        <v-btn icon="mdi-magnify" @click="isSearchDrawer = !isSearchDrawer" />
      </div>
    </template>
  </v-navigation-drawer>

  <v-app-bar v-else app class="px-6 py-2 position-fixed text-text" flat>
    <v-app-bar-title>
      <router-link class="text-decoration-none" exact to="/">
        <img alt="LOGO" height="50px" :src="logo" width="50px" />
      </router-link>
    </v-app-bar-title>

    <template v-for="item in navItems" :key="item.to">
      <v-btn class="d-none d-sm-flex" :to="item.to" @click="handleNavClick(item.to)">
        {{ item.title }}
      </v-btn>
    </template>

    <v-spacer />

    <v-btn icon="mdi-magnify" @click="isSearchDrawer = !isSearchDrawer" />
    <div>
      <!-- sm ~ md 顯示登入/登出按鈕 -->
      <template v-if="isSmToMd">
        <v-btn v-if="!user.isLoggedIn" icon="mdi-login-variant" @click="dialog = true" />
        <v-btn v-else color="secondary" icon="mdi-logout-variant" @click="logout" />
      </template>

      <v-spacer />

      <!-- xs 顯示 menu 按鈕 -->
      <v-btn v-if="isXs" icon="mdi-dots-vertical" @click="onMenuClick" />
    </div>
  </v-app-bar>

  <LoginDialog v-model="dialog" :persistent="true" />

  <template v-if="isXs">
    <v-navigation-drawer
      v-model="menu"
      class="px-8 pt-6 text-text"
      :close-on-click="false"
      location="top"
      :scrim="false"
      :scrim-clickable="false"
      style="height: 180px"
      temporary
    >
      <v-list class="pa-0">
        <v-row no-gutters>
          <v-col cols="12">
            <v-btn block class="menu-link" @click="handleMenuNavClick('/myAccount')">
              <v-icon>mdi-account-cog-outline</v-icon> 我的帳戶
            </v-btn>
          </v-col>
          <v-col cols="12">
            <v-btn block class="menu-link" @click="handleMenuNavClick('/cart')">
              <v-icon>mdi-shopping-outline</v-icon>購物車
            </v-btn>
          </v-col>
          <v-col cols="12">
            <v-btn block class="menu-link" @click="handleMenuNavClick('/product')">
              <v-icon>mdi-storefront-outline</v-icon>商品列表
            </v-btn>
          </v-col>
          <v-col cols="12">
            <template v-if="!user.isLoggedIn">
              <v-btn block class="menu-link" @click="handleMenuNavClick('/register')">
                <v-icon>mdi-login</v-icon> 註冊與登入
              </v-btn>
            </template>
            <template v-else>
              <v-btn block class="menu-link" @click="logoutAndCloseMenu">
                <v-icon>mdi-logout</v-icon> 登出
              </v-btn>
            </template>
          </v-col>
        </v-row>
      </v-list>
    </v-navigation-drawer>
    <div v-if="menu" class="custom-scrim" @click="menu = false" />
  </template>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useDisplay } from 'vuetify'
  import { useSnackbar } from 'vuetify-use-dialog'
  import LoginDialog from '@/components/login.vue'
  import searchDrawer from '@/components/searchDrawerSide.vue'
  import userService from '@/services/user'
  import { useUserStore } from '@/stores/user'
  import logo from '/favicon.svg'

  // Vuetify 響應式偵測
  const display = useDisplay()
  const isXs = computed(() => display.xs.value)
  const isSmToMd = computed(() => display.sm.value || display.md.value)
  const isDesktop = computed(() => display.lgAndUp.value)

  // Drawer 和 Dialog 狀態
  const dialog = ref(false)
  const isSearchDrawer = ref(false)
  const menu = ref(false)

  // User Store 和 Router
  const user = useUserStore()
  const createSnackbar = useSnackbar()
  const router = useRouter()

  // 桌面版導覽列項目
  const navItems = [
    { title: 'account', to: '/myAccount' },
    { title: 'cart', to: '/cart' },
    { title: 'product', to: '/product' },
  ]

  /** * 函式 ***/

  // 處理桌面版的導覽列點擊
  function handleNavClick(to) {
    // 如果是 account 或 cart，且沒登入，跳到註冊頁
    if ((to === '/myAccount' || to === '/cart') && !user.isLoggedIn) {
      router.push('/register')
    } else {
      router.push(to)
    }
  }

  // 處理手機選單的導覽列點擊
  function handleMenuNavClick(to) {
    // 關閉選單
    menu.value = false
    // 執行導覽列跳轉邏輯
    handleNavClick(to)
  }

  // 處理手機版選單點擊
  function onMenuClick() {
    // 點擊選單時，先關閉搜尋框
    isSearchDrawer.value = false
    // 再切換選單的開關狀態
    menu.value = !menu.value
  }

  // 登出
  const logout = async () => {
    try {
      await userService.logout()
    } catch (error) {
      console.error(error)
    }
    user.logout()
    createSnackbar({
      text: '登出成功！',
      snackbarProps: {
        color: 'green',
      },
    })
  }

  // 登出並關閉手機選單
  const logoutAndCloseMenu = async () => {
    await logout()
    menu.value = false
  }

  // 偵測視窗大小，大於 xs 時關閉手機選單和搜尋抽屜
  watch(isXs, (val) => {
    if (!val) {
      menu.value = false
      isSearchDrawer.value = false
    }
  })
</script>

<style scoped>
  /*** Brook‑style 垂直文字 ***/
  .slim-drawer {
    position: fixed !important;
    top: 0;
    left: 0;
    height: 100vh;
    max-height: 100vh;
    overflow: hidden;
    padding: 0; /* 去掉預設 24px 內距 */
  }

  .vertical-text {
    writing-mode: vertical-rl; /* 垂直排列 */
    white-space: nowrap;
    text-transform: uppercase;
    transition: color 0.2s ease;
  }

  .vertical-text:hover {
    color: var(--v-primary-base);
  }

  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 80px;
    width: 50%;
    padding: 10px;
  }

  .nav-btn:hover,
  .nav-btn.router-link-exact-active {
    background-color: var(--v-theme-surface-variant);
  }

  .custom-scrim {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 5; /* 要比抽屜低(抽屜通常是6或7) */
  }
</style>
