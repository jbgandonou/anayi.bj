<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usersService, type CreateUserPayload } from '@/services/users.service'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppModal from '@/components/common/AppModal.vue'
import { UsersRound, UserPlus, ShieldCheck, ShieldOff } from 'lucide-vue-next'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  role: 'ADMIN' | 'VOLUNTEER'
  isActive: boolean
  createdAt: string
}

const users = ref<User[]>([])
const loading = ref(false)
const showCreateModal = ref(false)
const createLoading = ref(false)
const createError = ref('')

const newUser = ref<CreateUserPayload>({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  role: 'VOLUNTEER',
})

async function loadUsers() {
  loading.value = true
  try {
    const response = await usersService.getAll()
    users.value = response.data.data
  } finally {
    loading.value = false
  }
}

async function createUser() {
  createError.value = ''
  createLoading.value = true
  try {
    await usersService.create(newUser.value)
    showCreateModal.value = false
    newUser.value = { firstName: '', lastName: '', email: '', password: '', phone: '', role: 'VOLUNTEER' }
    await loadUsers()
  } catch (e: any) {
    createError.value = e.response?.data?.message || 'Erreur lors de la création'
  } finally {
    createLoading.value = false
  }
}

async function toggleActive(user: User) {
  await usersService.update(user.id, { isActive: !user.isActive })
  await loadUsers()
}

onMounted(loadUsers)
</script>

<template>
  <div class="users-page">
    <div class="page-header">
      <div class="page-title-group">
        <div class="page-icon">
          <UsersRound :size="22" :stroke-width="1.8" />
        </div>
        <div>
          <h1>Gestion des utilisateurs</h1>
          <p class="subtitle">{{ users.length }} utilisateur{{ users.length > 1 ? 's' : '' }}</p>
        </div>
      </div>
      <AppButton @click="showCreateModal = true">
        <template #icon><UserPlus :size="16" :stroke-width="2" /></template>
        Créer un utilisateur
      </AppButton>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>Chargement...</span>
    </div>

    <div v-else class="table-wrapper">
      <table class="users-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td class="name-cell">{{ user.firstName }} {{ user.lastName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.phone || '-' }}</td>
            <td>
              <span class="badge" :class="user.role === 'ADMIN' ? 'badge-admin' : 'badge-volunteer'">
                <span class="badge-dot" :class="user.role === 'ADMIN' ? 'dot-admin' : 'dot-volunteer'"></span>
                {{ user.role === 'ADMIN' ? 'Admin' : 'Volontaire' }}
              </span>
            </td>
            <td>
              <span class="badge" :class="user.isActive ? 'badge-active' : 'badge-inactive'">
                <span class="badge-dot" :class="user.isActive ? 'dot-active' : 'dot-inactive'"></span>
                {{ user.isActive ? 'Actif' : 'Inactif' }}
              </span>
            </td>
            <td>
              <AppButton
                :variant="user.isActive ? 'danger' : 'secondary'"
                size="sm"
                @click="toggleActive(user)"
              >
                <template #icon>
                  <ShieldOff v-if="user.isActive" :size="13" :stroke-width="2" />
                  <ShieldCheck v-else :size="13" :stroke-width="2" />
                </template>
                {{ user.isActive ? 'Désactiver' : 'Activer' }}
              </AppButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppModal v-if="showCreateModal" title="Créer un utilisateur" @close="showCreateModal = false">
      <form @submit.prevent="createUser" class="create-form">
        <AppInput v-model="newUser.firstName" label="Prénom" required />
        <AppInput v-model="newUser.lastName" label="Nom" required />
        <AppInput v-model="newUser.email" label="Email" type="email" required />
        <AppInput v-model="newUser.password" label="Mot de passe" type="password" required />
        <AppInput v-model="newUser.phone" label="Téléphone" />

        <div class="form-group">
          <label class="form-label">Rôle</label>
          <select v-model="newUser.role" class="form-select">
            <option value="VOLUNTEER">Volontaire</option>
            <option value="ADMIN">Administrateur</option>
          </select>
        </div>

        <p v-if="createError" class="error-text">{{ createError }}</p>
      </form>

      <template #footer>
        <AppButton variant="secondary" @click="showCreateModal = false">Annuler</AppButton>
        <AppButton :loading="createLoading" @click="createUser">Créer</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.75rem;
}
.page-title-group {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.page-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius);
  background: var(--primary-50);
  color: var(--primary-600);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.page-header h1 { font-size: 1.6rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin: 0; }
.subtitle { color: var(--text-muted); font-size: 0.85rem; margin-top: 0.15rem; }

.table-wrapper {
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow-x: auto;
  border: 1px solid var(--border-light);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  text-align: left;
  padding: 0.85rem 1.25rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  font-weight: 700;
  border-bottom: 2px solid var(--border);
  background: var(--bg);
}

.users-table td {
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--border-light);
  font-size: 0.875rem;
}

.users-table tbody tr { transition: background var(--transition); }
.users-table tbody tr:hover { background: var(--primary-50); }

.name-cell { font-weight: 600; color: var(--text); }

.badge {
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.badge-admin { background: #dbeafe; color: #1e40af; }
.dot-admin { background: #3b82f6; }
.badge-volunteer { background: #f3e8ff; color: #7c3aed; }
.dot-volunteer { background: #8b5cf6; }
.badge-active { background: #dcfce7; color: #166534; }
.dot-active { background: #10b981; }
.badge-inactive { background: #fee2e2; color: #991b1b; }
.dot-inactive { background: #ef4444; }

.create-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.form-label { font-size: 0.85rem; font-weight: 600; color: var(--text); }
.form-select {
  width: 100%;
  padding: 0.55rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--text);
  background: white;
  transition: all var(--transition);
}
.form-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08);
}

.error-text {
  color: var(--danger);
  font-size: 0.875rem;
}

.loading {
  text-align: center; padding: 3rem; color: var(--text-muted);
  display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
}
.loading-spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: stretch; gap: 0.75rem; }
  .users-table th, .users-table td { padding: 0.6rem 0.75rem; font-size: 0.8rem; }
  .page-header h1 { font-size: 1.3rem; }
}
</style>
