<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter, useRoute } from 'vue-router'
import { LayoutDashboard, Users, UserPlus, Handshake, UsersRound, Heart, LogOut, ChevronRight } from 'lucide-vue-next'
import { markRaw } from 'vue'

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
  { to: '/dashboard', label: 'Tableau de bord', icon: markRaw(LayoutDashboard) },
  { to: '/children', label: 'Bénéficiaires', icon: markRaw(Users) },
  { to: '/children/new', label: 'Enregistrer', icon: markRaw(UserPlus) },
  { to: '/sponsorship', label: 'Parrainage', icon: markRaw(Handshake), admin: true },
  { to: '/users', label: 'Utilisateurs', icon: markRaw(UsersRound), admin: true },
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
          <div class="brand-logo">
            <Heart :size="20" :stroke-width="2.5" />
          </div>
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
          <component :is="item.icon" class="nav-icon" :size="19" :stroke-width="1.8" />
          <span class="nav-label">{{ item.label }}</span>
          <ChevronRight v-if="route.path === item.to || (item.to !== '/' && route.path.startsWith(item.to) && item.to !== '/children/new')" class="nav-arrow" :size="14" />
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
        <button class="btn-logout" @click="handleLogout">
          <LogOut :size="15" :stroke-width="2" />
          <span>Déconnexion</span>
        </button>
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
        <div class="topbar-brand">
          <Heart :size="16" :stroke-width="2.5" class="topbar-logo" />
          <h2 class="page-title-mobile">Anayi.bj</h2>
        </div>
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
  background: var(--bg-card);
  color: var(--text);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  transition: transform var(--transition-slow);
  border-right: 1px solid var(--border);
}

.sidebar-header {
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid var(--border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text);
}
.brand-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--primary), var(--primary-400));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}
.brand-text { font-size: 1.3rem; font-weight: 800; letter-spacing: -0.03em; color: var(--text); }

/* Nav */
.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all var(--transition);
  position: relative;
}
.nav-item:hover {
  background: var(--primary-50);
  color: var(--primary-700);
}
.nav-item:hover .nav-icon {
  color: var(--primary-600);
}
.nav-item.active {
  background: var(--primary-50);
  color: var(--primary-700);
  font-weight: 600;
}
.nav-item.active::before {
  content: '';
  position: absolute;
  left: -0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: var(--primary);
  border-radius: 0 3px 3px 0;
}
.nav-icon {
  flex-shrink: 0;
  color: var(--text-muted);
  transition: color var(--transition);
}
.nav-item.active .nav-icon {
  color: var(--primary-600);
}
.nav-arrow {
  margin-left: auto;
  color: var(--primary-400);
}

/* Sidebar footer */
.sidebar-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border);
}

.user-card {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  background: var(--bg);
}
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-400));
  color: white;
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
.user-name { font-size: 0.85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text); }
.user-role { font-size: 0.7rem; color: var(--text-muted); }

.btn-logout {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.8rem;
  transition: all var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: inherit;
}
.btn-logout:hover {
  background: var(--danger-light);
  border-color: var(--danger);
  color: var(--danger);
}

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
    box-shadow: var(--shadow-xl);
  }

  .overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.4);
    z-index: 99;
    backdrop-filter: blur(4px);
  }

  .main-wrapper { margin-left: 0; }

  .topbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0 1rem;
    height: 56px;
    background: white;
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .topbar-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .topbar-logo {
    color: var(--primary);
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
    transition: all var(--transition);
  }

  .page-title-mobile {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.02em;
  }

  .main-content { padding: 1rem; }
}
</style>
