<template>
  <v-app>
    <NavbarsProduct />

    <v-main class="d-flex flex-column">
      <div class="flex-grow-1">
        <router-view :key="$route.params.id" />
      </div>
      <div class="fixed h-100">
        <home-footer />
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
  import homeFooter from '@/components/footer.vue'
  import NavbarsProduct from '@/components/navbars/product.vue'
</script>

<style scoped>
  .v-main {
    min-height: 100vh;
  }

  /* 確保 router-view 的內容不會被 footer 覆蓋 */
  .flex-grow-1 {
    display: flex;
    flex-direction: column;
  }

  .fixed {
    display: flex;
    align-items: end;
  }
</style>
