/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHashHistory, START_LOCATION } from 'vue-router'
import userServices from '@/services/user'
import { useUserStore } from '@/stores/user'

// 用 HTML5 模式建立一個 Vue Router，並從檔案自動生成路由並套用 Layout 規則
const routes = [
  {
    path: '/',
    component: () => import('@/pages/home.vue'),
    meta: {
      layout: 'home',
      title: '首頁',
    },
  },
  {
    path: '/register',
    component: () => import('@/pages/register.vue'),
    meta: {
      layout: 'home',
      title: '註冊',
    },
  },
  {
    path: '/myAccount',
    component: () => import('@/pages/manage/myAccount.vue'),
    meta: {
      layout: 'manage',
      title: '帳戶管理',
    },
  },
  {
    path: '/product',
    component: () => import('@/pages/product.vue'),
    meta: {
      layout: 'product',
      title: '商品列表',
    },
  },
  {
    path: '/cart',
    component: () => import('@/pages/cart.vue'),
    meta: {
      layout: 'product',
      title: '購物車',
    },
  },
  {
    path: '/product/:id',
    component: () => import('@/pages/product/[id].vue'),
    meta: {
      layout: 'product',
      title: '商品',
    },
  },
  {
    path: '/myProduct',
    component: () => import('@/pages/manage/myProduct.vue'),
    meta: {
      layout: 'manage',
      title: '商品管理',
      seller: true,
    },
  },
  {
    path: '/myOrder',
    component: () => import('@/pages/manage/myOrder.vue'),
    meta: {
      layout: 'manage',
      title: '我的訂單',
    },
  },
  {
    path: '/favorite',
    component: () => import('@/pages/favorite.vue'),
    meta: {
      layout: 'product',
      title: '心選好物',
    },
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

// 更新頁面標題
router.afterEach((to) => {
  const baseTitle = 'Sanvia'
  document.title = to.meta.title ? `${to.meta.title} | ${baseTitle}` : baseTitle
})

// router.beforeEach() 在每次切換路由前先做某些檢查或動作，例如：判斷是否登入、有無權限、要不要跳轉等
router.beforeEach(async (to, from, next) => {
  const user = useUserStore()

  // 首次載入頁面時，用 token 取使用者資料
  if (from === START_LOCATION && user.isLoggedIn) {
    try {
      // userServices.profile() 用 token 查資料
      const { data } = await userServices.profile()
      user.login(data.user)
    } catch (error) {
      console.error(error)
      user.token = ''
    }
  }

  // 根據登入狀態和頁頁路徑進行導航守衛
  if (to.meta.login === 'no-login-only' && user.isLoggedIn) {
    // 去未登入限定頁面（註冊頁），且使用者已登入，強制跳回首頁
    next('/')
  } else if (to.meta.login === 'login-only' && user.isLoggedIn) {
    // 去登入限定頁面，且使用者未登入，強制跳回註冊頁
    next('/register')
  } else if (to.meta.seller === true && !user.isSeller) {
    // 去登入賣家限定頁面，且使用者不是賣家，強制跳回帳戶管理頁
    next('/myAccount')
  } else {
    // 不阻擋
    next()
  }
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(async () => {
  localStorage.removeItem('vuetify:dynamic-reload')
  const user = useUserStore()
  // Ensure user data is loaded after router is ready and persisted state is loaded
  // This helps ensure isLoggedIn and favorites are correctly populated on initial load
  if (user.token) {
    // Only fetch if a token exists (persisted or otherwise)
    await user.fetchUser()
  }
})

export default router
