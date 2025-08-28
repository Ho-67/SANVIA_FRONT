<template>
  <v-app>
    <NavbarsHome />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
  import NavbarsHome from '@/components/navbars/home.vue'
</script>
