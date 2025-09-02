<template>
  <v-navigation-drawer app class="d-flex flex-column text-text" permanent width="250">
    <template #prepend>
      <v-list-item
        class="mt-6"
        lines="two"
        prepend-avatar="https://picsum.photos/200/200/?random=10"
        :subtitle="user.role === 'seller' ? '當前身分：賣家' : '當前身分：買家'"
        :title="user.account || '用戶名稱'"
      />
    </template>

    <v-divider />

    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-account-cog"
        title="帳戶管理"
        to="/myAccount"
        value="account"
      />
      <v-list-item prepend-icon="mdi-archive-cog" title="訂單管理" to="/myOrder" value="order" />
      <v-list-item
        v-show="user.role === 'seller'"
        prepend-icon="mdi-store-cog"
        title="商品管理"
        to="/myProduct"
        value="product"
      />
    </v-list>

    <template #append>
      <v-btn
        class="mb-6 mx-auto d-block d-flex align-center"
        color="primary"
        to="/"
        variant="tonal"
        width="200"
      >
        <v-icon>mdi-home</v-icon>
        <span class="ml-2">回首頁</span>
      </v-btn>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  import { useUserStore } from '@/stores/user'

  const router = useRouter()
  const user = useUserStore()
</script>
