/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { zhHant } from 'vuetify/locale'

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Iconify
import { h } from 'vue'
import { Icon } from '@iconify/vue'

const lightTheme = {
  dark: false,
  colors: {
    background: '#FFFFFF', // 頁面整體背景色
    surface: '#F9F7F3', // 區塊或卡片的背景色，比背景稍微深一點
    primary: '#C6B3C9', // 主要品牌色，用於按鈕、連結、重要元素
    secondary: '#C4A69F', // 輔助色，搭配主色增加層次感，常用在次要按鈕或標題
    accent: '#8D6E97', // 點綴色，用來強調細節或互動元素
    info: '#E0D8E8', // 資訊提示色，例如提示框背景或文字
    divider: '#E3E3E1', // 分隔線顏色，用來區隔內容的細線
    text: '#4A4A4A', // 主要內文文字顏色
    nav: '#6B6B6B', // 導覽列文字或背景色
    section: '#E1D7D0', // 頁面區塊背景，和 surface 不同層次，做區域區隔用
    highlight1: '#EFD9A1', // 點綴色1，可用於重要按鈕或標題強調
    highlight2: '#A5C3B2', // 點綴色2，和 highlight1 搭配用於細節或背景色
    onSecondary: '#B38B85', // 用在 secondary 色系上面文字或按鈕 hover 色
  },
}

const darkTheme = {
  dark: true,
  colors: {
    background: '#1E1B1D',
    surface: '#2C252A',
    primary: '#C6B3C9',
    secondary: '#B38B85',
    accent: '#D0C3DC',
    info: '#3E3740',
    divider: '#4A4046',
    text: '#E5E1E6',
    nav: '#B0A5AF',
    section: '#3B3337',
    highlight1: '#EFD9A1',
    highlight2: '#A5C3B2',
    onSecondary: '#A07B71',
  },
}

// 定義 Iconify 圖示集
const iconifySet = {
  component: (props) =>
    h(Icon, {
      icon: props.icon,
      class: props.class,
    }),
}

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  locale: {
    locale: 'zh-TW', // 修改為 'zh-TW'
    fallback: 'zh-TW', // 修改為 'zh-TW'
    messages: { 'zh-TW': zhHant }, // 修改為 'zh-TW': zhHant
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
      iconify: iconifySet, // 註冊 Iconify 圖示集
    },
  },
  defaults: {
    VBtn: {
      ripple: false,
      variant: 'text',
    },
    global: {
      style: {
        fontFamily: 'LINESeedTW, Plus Jakarta Sans, sans-serif',
      },
    },
  },
})
