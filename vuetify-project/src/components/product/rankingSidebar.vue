<template>
  <v-card class="w-100 text-text">
    <v-list>
      <v-list-item-title class="text-h6 d-flex align-center text-secondary">
        <v-icon class="ml-4 mr-6" color="secondary" icon="iconify:ix:trophy-filled" size="24" />
        打賞商品排名
      </v-list-item-title>

      <v-list-item
        v-for="(item, i) in items"
        :key="i"
        color="primary"
        rounded="shaped"
        :value="item"
      >
        <template #prepend>
          <v-icon color="onSecondary" :icon="item.icon" />
        </template>

        <v-list-item-title v-text="item.text" />
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>
  const items = [
    { text: '商品1', icon: 'mdi-medal' },
    { text: '商品2', icon: 'mdi-medal' },
    { text: '商品3', icon: 'mdi-medal' },
  ]
</script>
