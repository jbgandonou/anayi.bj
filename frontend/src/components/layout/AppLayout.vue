<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <div class="app-layout">
    <header class="header">
      <div class="header-top">
        <h1 class="logo">Anayi.bj</h1>
        <button class="menu-toggle" @click="menuOpen = !menuOpen" aria-label="Menu">
          <span class="bar" :class="{ open: menuOpen }"></span>
        </button>
        <div class="header-right-desktop">
          <span class="user-info">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</span>
          <button class="btn-logout" @click="handleLogout">Déconnexion</button>
        </div>
      </div>
      <nav class="nav" :class="{ open: menuOpen }">
        <router-link to="/dashboard" class="nav-link" @click="closeMenu">Tableau de bord</router-link>
        <router-link to="/children" class="nav-link" @click="closeMenu">Bénéficiaires</router-link>
        <router-link to="/children/new" class="nav-link" @click="closeMenu">Enregistrer</router-link>
        <router-link v-if="authStore.isAdmin" to="/sponsorship" class="nav-link" @click="closeMenu">Parrainage</router-link>
        <router-link v-if="authStore.isAdmin" to="/users" class="nav-link" @click="closeMenu">Utilisateurs</router-link>
        <div class="nav-mobile-footer">
          <span class="user-info">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</span>
          <button class="btn-logout" @click="handleLogout">Déconnexion</button>
        </div>
      </nav>
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
  background: #1a56db;
  color: white;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 60px;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

/* Hamburger */
.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}
.bar, .bar::before, .bar::after {
  display: block;
  width: 22px;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: transform 0.3s;
  position: relative;
}
.bar::before, .bar::after {
  content: '';
  position: absolute;
  left: 0;
  width: 22px;
}
.bar::before { top: -7px; }
.bar::after { top: 7px; }
.bar.open { background: transparent; }
.bar.open::before { top: 0; transform: rotate(45deg); }
.bar.open::after { top: 0; transform: rotate(-45deg); }

/* Nav desktop */
.nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 1.5rem 0.5rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  white-space: nowrap;
}
.nav-link:hover,
.nav-link.router-link-active {
  color: white;
  background: rgba(255, 255, 255, 0.15);
}

.nav-mobile-footer {
  display: none;
}

.header-right-desktop {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info { font-size: 0.875rem; }

.btn-logout {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: none;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}
.btn-logout:hover { background: rgba(255, 255, 255, 0.25); }

.main-content {
  flex: 1;
  padding: 1.5rem;
  background: #f3f4f6;
}

/* Mobile */
@media (max-width: 768px) {
  .menu-toggle { display: block; }
  .header-right-desktop { display: none; }

  .nav {
    display: none;
    flex-direction: column;
    padding: 0;
  }
  .nav.open {
    display: flex;
    border-top: 1px solid rgba(255,255,255,0.15);
  }
  .nav-link {
    padding: 0.75rem 1.5rem;
    border-radius: 0;
    font-size: 1rem;
  }
  .nav-link:hover,
  .nav-link.router-link-active {
    background: rgba(255, 255, 255, 0.1);
  }

  .nav-mobile-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.5rem;
    border-top: 1px solid rgba(255,255,255,0.15);
  }

  .main-content { padding: 1rem; }
}
</style>
