<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const authStore = useAuthStore()
</script>

<template>
  <AppLayout v-if="authStore.isAuthenticated && !route.meta.public">
    <router-view />
  </AppLayout>
  <router-view v-else />
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1f2937;
  background: #f3f4f6;
  -webkit-font-smoothing: antialiased;
}
</style>
