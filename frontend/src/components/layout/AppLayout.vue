<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-layout">
    <header class="header">
      <div class="header-left">
        <h1 class="logo">Anayi.bj</h1>
      </div>
      <nav class="nav">
        <router-link to="/dashboard" class="nav-link">Tableau de bord</router-link>
        <router-link to="/children" class="nav-link">Bénéficiaires</router-link>
        <router-link to="/children/new" class="nav-link">Enregistrer</router-link>
        <router-link v-if="authStore.isAdmin" to="/sponsorship" class="nav-link"
          >Parrainage</router-link
        >
        <router-link v-if="authStore.isAdmin" to="/users" class="nav-link"
          >Utilisateurs</router-link
        >
      </nav>
      <div class="header-right">
        <span class="user-info">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</span>
        <button class="btn-logout" @click="handleLogout">Déconnexion</button>
      </div>
    </header>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 60px;
  background: #1a56db;
  color: white;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.nav {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: white;
  background: rgba(255, 255, 255, 0.15);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  font-size: 0.875rem;
}

.btn-logout {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: none;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.25);
}

.main-content {
  flex: 1;
  padding: 1.5rem;
  background: #f3f4f6;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    height: auto;
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .nav {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
