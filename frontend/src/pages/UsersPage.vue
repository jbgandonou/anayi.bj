<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usersService, type CreateUserPayload } from '@/services/users.service'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppModal from '@/components/common/AppModal.vue'

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
      <h1>Gestion des utilisateurs</h1>
      <AppButton @click="showCreateModal = true">Créer un utilisateur</AppButton>
    </div>

    <div v-if="loading" class="loading">Chargement...</div>

    <table v-else class="users-table">
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
          <td>{{ user.firstName }} {{ user.lastName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.phone || '-' }}</td>
          <td>
            <span class="badge" :class="user.role === 'ADMIN' ? 'badge-admin' : 'badge-volunteer'">
              {{ user.role === 'ADMIN' ? 'Admin' : 'Volontaire' }}
            </span>
          </td>
          <td>
            <span class="badge" :class="user.isActive ? 'badge-active' : 'badge-inactive'">
              {{ user.isActive ? 'Actif' : 'Inactif' }}
            </span>
          </td>
          <td>
            <AppButton
              :variant="user.isActive ? 'danger' : 'secondary'"
              size="sm"
              @click="toggleActive(user)"
            >
              {{ user.isActive ? 'Désactiver' : 'Activer' }}
            </AppButton>
          </td>
        </tr>
      </tbody>
    </table>

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
  margin-bottom: 1.5rem;
}

.page-header h1 {
  font-size: 1.5rem;
  margin: 0;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.users-table th,
.users-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.users-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.badge {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-admin { background: #dbeafe; color: #1e40af; }
.badge-volunteer { background: #f3e8ff; color: #7c3aed; }
.badge-active { background: #dcfce7; color: #166534; }
.badge-inactive { background: #fee2e2; color: #991b1b; }

.create-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.error-text {
  color: #dc2626;
  font-size: 0.875rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}
</style>
