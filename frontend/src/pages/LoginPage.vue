<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Erreur de connexion'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">Anayi.bj</h1>
      <p class="login-subtitle">Suivi des enfants bénéficiaires</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <AppInput v-model="email" label="Email" type="email" placeholder="admin@anayi.bj" required />

        <AppInput
          v-model="password"
          label="Mot de passe"
          type="password"
          placeholder="Votre mot de passe"
          required
        />

        <p v-if="error" class="error-message">{{ error }}</p>

        <AppButton variant="primary" size="lg" :loading="loading" class="login-btn">
          Se connecter
        </AppButton>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
}

.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 400px;
}

.login-title {
  text-align: center;
  font-size: 1.75rem;
  color: #1a56db;
  margin: 0 0 0.25rem;
}

.login-subtitle {
  text-align: center;
  color: #6b7280;
  margin: 0 0 2rem;
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  text-align: center;
  margin: 0;
}

.login-btn {
  width: 100%;
  justify-content: center;
  margin-top: 0.5rem;
}
</style>
