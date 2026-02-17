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
