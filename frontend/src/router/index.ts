import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/DashboardPage.vue'),
    },
    {
      path: '/children',
      name: 'children',
      component: () => import('@/pages/ChildrenListPage.vue'),
    },
    {
      path: '/children/new',
      name: 'child-create',
      component: () => import('@/pages/ChildFormPage.vue'),
    },
    {
      path: '/children/:id',
      name: 'child-detail',
      component: () => import('@/pages/ChildDetailPage.vue'),
    },
    {
      path: '/children/:id/edit',
      name: 'child-edit',
      component: () => import('@/pages/ChildFormPage.vue'),
    },
    {
      path: '/sponsorship',
      name: 'sponsorship',
      component: () => import('@/pages/SponsorshipPage.vue'),
      meta: { adminOnly: true },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/pages/UsersPage.vue'),
      meta: { adminOnly: true },
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.public) return true

  if (!authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.adminOnly && !authStore.isAdmin) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
