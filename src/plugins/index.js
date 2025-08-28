/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import vueFilePond from 'vue-filepond'
import VuetifyUseDialog from 'vuetify-use-dialog'
import router from '@/router'
import pinia from '@/stores'
// Plugins
import vuetify from './vuetify'

// Import FilePond styles
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css'

// 建立 FilePond 元件
const FilePond = vueFilePond(FilePondPluginFileValidateType, FilePondPluginImagePreview)

export function registerPlugins(app) {
  app
    .use(vuetify)
    .use(VuetifyUseDialog, {
      snackbar: {
        showCloseButton: false,
        snackbarProps: {
          timeout: 4000,
        },
      },
    })
    // vueFilePond 註冊用法: .component('元件名稱', 元件本身)
    .component('FilePond', FilePond)
    .use(router)
    .use(pinia)
}
