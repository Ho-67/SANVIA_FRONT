<template>
  <v-app>
    <NavbarsManage />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
  import NavbarsManage from '@/components/navbars/manage.vue'
</script>
