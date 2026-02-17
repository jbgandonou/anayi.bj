<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function closeSidebar() {
  sidebarOpen.value = false
}

const navItems = [
  { to: '/dashboard', label: 'Tableau de bord', icon: '📊' },
  { to: '/children', label: 'Bénéficiaires', icon: '👦' },
  { to: '/children/new', label: 'Enregistrer', icon: '➕' },
  { to: '/sponsorship', label: 'Parrainage', icon: '🤝', admin: true },
  { to: '/users', label: 'Utilisateurs', icon: '👥', admin: true },
]
</script>

<template>
  <div class="layout">
    <!-- Overlay mobile -->
    <div v-if="sidebarOpen" class="overlay" @click="closeSidebar"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <router-link to="/dashboard" class="brand" @click="closeSidebar">
          <span class="brand-icon">🇧🇯</span>
          <span class="brand-text">Anayi.bj</span>
        </router-link>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          v-show="!item.admin || authStore.isAdmin"
          class="nav-item"
          :class="{ active: route.path === item.to || (item.to !== '/' && route.path.startsWith(item.to) && item.to !== '/children/new') }"
          @click="closeSidebar"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-card">
          <img v-if="authStore.user?.avatarUrl" :src="authStore.user.avatarUrl" class="user-avatar user-avatar-img" alt="Avatar" referrerpolicy="no-referrer" />
          <div v-else class="user-avatar">{{ authStore.user?.firstName?.[0] }}{{ authStore.user?.lastName?.[0] }}</div>
          <div class="user-details">
            <span class="user-name">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</span>
            <span class="user-role">{{ authStore.user?.role === 'ADMIN' ? 'Administrateur' : 'Volontaire' }}</span>
          </div>
        </div>
        <button class="btn-logout" @click="handleLogout">Déconnexion</button>
      </div>
    </aside>

    <!-- Main -->
    <div class="main-wrapper">
      <header class="topbar">
        <button class="menu-btn" @click="sidebarOpen = !sidebarOpen" aria-label="Menu">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
        <h2 class="page-title-mobile">Anayi.bj</h2>
      </header>
      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #312e81 0%, #4f46e5 100%);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  transition: transform 0.3s ease;
}

.sidebar-header {
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: white;
}
.brand-icon { font-size: 1.5rem; }
.brand-text { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.02em; }

/* Nav */
.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.15s;
}
.nav-item:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}
.nav-item.active {
  background: rgba(255,255,255,0.2);
  color: white;
  font-weight: 600;
}
.nav-icon { font-size: 1.1rem; width: 24px; text-align: center; }

/* Sidebar footer */
.sidebar-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.user-card {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.75rem;
}
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  flex-shrink: 0;
}
.user-avatar-img {
  object-fit: cover;
}
.user-details { display: flex; flex-direction: column; min-width: 0; }
.user-name { font-size: 0.85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 0.7rem; color: rgba(255,255,255,0.5); }

.btn-logout {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  background: transparent;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.15s;
}
.btn-logout:hover { background: rgba(255,255,255,0.1); color: white; }

/* Main */
.main-wrapper {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.topbar {
  display: none;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  width: 100%;
}

.overlay { display: none; }

/* Mobile */
@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
  }
  .sidebar.open {
    transform: translateX(0);
  }

  .overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 99;
    backdrop-filter: blur(2px);
  }

  .main-wrapper { margin-left: 0; }

  .topbar {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0 1rem;
    height: 56px;
    background: white;
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .menu-btn {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
  }
  .menu-btn .bar {
    width: 20px;
    height: 2px;
    background: var(--text);
    border-radius: 2px;
  }

  .page-title-mobile {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--primary);
  }

  .main-content { padding: 1rem; }
}
</style>
