<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const authStore = useAuthStore()
const ready = ref(false)

onMounted(async () => {
  await authStore.init()
  ready.value = true
})
</script>

<template>
  <div v-if="!ready" class="app-loading">
    <div class="app-loading-spinner"></div>
  </div>
  <template v-else>
    <AppLayout v-if="authStore.isAuthenticated && !route.meta.public">
      <router-view />
    </AppLayout>
    <router-view v-else />
  </template>
</template>

<style>
.app-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}
.app-loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border, #e2e8f0);
  border-top-color: var(--primary, #4f46e5);
  border-radius: 50%;
  animation: app-spin 0.7s linear infinite;
}
@keyframes app-spin {
  to { transform: rotate(360deg); }
}
</style>
