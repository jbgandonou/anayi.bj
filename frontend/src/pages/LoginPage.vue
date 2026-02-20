<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useGoogleSignIn } from '@/composables/useGoogleSignIn'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import { Heart, Mail, Lock } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const googleLoading = ref(false)
const googleBtnRef = ref<HTMLElement | null>(null)

const { tryInit } = useGoogleSignIn(handleGoogleToken)

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

async function handleGoogleToken(idToken: string) {
  error.value = ''
  googleLoading.value = true
  try {
    await authStore.loginWithGoogle(idToken)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Erreur de connexion avec Google'
  } finally {
    googleLoading.value = false
  }
}

onMounted(() => {
  if (googleBtnRef.value) {
    tryInit(googleBtnRef.value)
  }
})
</script>

<template>
  <div class="login-page">
    <div class="login-left">
      <div class="login-pattern">
        <div class="pattern-dot" v-for="i in 80" :key="i"></div>
      </div>
      <div class="login-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
      <div class="login-branding">
        <div class="login-logo">
          <Heart :size="32" :stroke-width="2" />
        </div>
        <h1>Anayi.bj</h1>
        <p>Plateforme de suivi des enfants bénéficiaires du programme Anayi au Bénin</p>
      </div>
    </div>
    <div class="login-right">
      <div class="login-card">
        <h2>Connexion</h2>
        <p class="login-subtitle">Accédez à votre espace de gestion</p>

        <div ref="googleBtnRef" class="google-btn-wrapper"></div>
        <p v-if="googleLoading" class="google-loading">Connexion avec Google...</p>

        <div class="separator">
          <span>ou</span>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <AppInput v-model="email" label="Email" type="email" placeholder="admin@anayi.bj" required :icon="Mail" />
          <AppInput v-model="password" label="Mot de passe" type="password" placeholder="Votre mot de passe" required :icon="Lock" />
          <p v-if="error" class="error-message">{{ error }}</p>
          <AppButton variant="primary" size="lg" :loading="loading" class="login-btn">
            Se connecter
          </AppButton>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, var(--primary-900) 0%, var(--primary) 50%, var(--primary-400) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  position: relative;
  overflow: hidden;
}

.login-pattern {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 2rem;
  padding: 2rem;
  opacity: 0.08;
}
.pattern-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: white;
}

.login-shapes {
  position: absolute;
  inset: 0;
}
.shape {
  position: absolute;
  border-radius: 50%;
}
.shape-1 {
  top: -10%;
  right: -15%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
}
.shape-2 {
  bottom: -20%;
  left: 5%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);
}
.shape-3 {
  top: 40%;
  left: -10%;
  width: 200px;
  height: 200px;
  border: 1px solid rgba(255,255,255,0.08);
}

.login-branding {
  color: white;
  max-width: 400px;
  text-align: center;
  position: relative;
  z-index: 1;
}
.login-logo {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  border: 1px solid rgba(255,255,255,0.2);
}
.login-branding h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; letter-spacing: -0.03em; }
.login-branding p { font-size: 1.1rem; color: rgba(255,255,255,0.8); line-height: 1.7; }

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--bg);
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 2.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
}
.login-card h2 { font-size: 1.5rem; font-weight: 800; color: var(--text); margin-bottom: 0.25rem; letter-spacing: -0.02em; }
.login-subtitle { color: var(--text-muted); margin-bottom: 2rem; font-size: 0.9rem; }

.google-btn-wrapper { display: flex; justify-content: center; }
.google-loading { text-align: center; color: var(--text-muted); font-size: 0.85rem; margin: 0.5rem 0 0; }

.separator {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}
.separator::before,
.separator::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.login-form { display: flex; flex-direction: column; gap: 1.25rem; }
.error-message { color: var(--danger); font-size: 0.875rem; text-align: center; margin: 0; }
.login-btn { width: 100%; justify-content: center; margin-top: 0.5rem; }

@media (max-width: 768px) {
  .login-page { flex-direction: column; }
  .login-left { padding: 2rem 1.5rem; min-height: auto; }
  .login-branding h1 { font-size: 1.75rem; }
  .login-branding p { font-size: 0.95rem; }
  .login-card { padding: 1.75rem; }
  .login-pattern { display: none; }
}
</style>
