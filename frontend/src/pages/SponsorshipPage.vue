<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { childrenService } from '@/services/children.service'
import AppButton from '@/components/common/AppButton.vue'
import AppModal from '@/components/common/AppModal.vue'
import type { ChildListItem } from '@/types/child'

const children = ref<ChildListItem[]>([])
const loading = ref(false)
const statusFilter = ref('PENDING')
const nextCursor = ref<string | null>(null)
const total = ref(0)

const selectedChild = ref<ChildListItem | null>(null)
const newStatus = ref('')
const updating = ref(false)

async function loadChildren(append = false) {
  loading.value = true
  try {
    const params: Record<string, string | number | undefined> = {
      take: 50,
      sponsorshipStatus: statusFilter.value || undefined,
    }
    if (append && nextCursor.value) params.cursor = nextCursor.value

    const res = await childrenService.getAll(params)
    if (append) {
      children.value.push(...res.data.data)
    } else {
      children.value = res.data.data
    }
    nextCursor.value = res.data.nextCursor
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

watch(statusFilter, () => loadChildren())
onMounted(loadChildren)

function statusLabel(status: string) {
  const map: Record<string, string> = { PENDING: 'En attente', SPONSORED: 'Parrainé', NOT_ELIGIBLE: 'Non éligible' }
  return map[status] || status
}

function statusClass(status: string) {
  const map: Record<string, string> = { PENDING: 'badge-pending', SPONSORED: 'badge-sponsored', NOT_ELIGIBLE: 'badge-not-eligible' }
  return map[status] || ''
}

function openStatusModal(child: ChildListItem) {
  selectedChild.value = child
  newStatus.value = child.sponsorshipStatus === 'PENDING' ? 'SPONSORED' : 'PENDING'
}

async function updateStatus() {
  if (!selectedChild.value) return
  updating.value = true
  try {
    await childrenService.updateSponsorship(selectedChild.value.id, newStatus.value)
    selectedChild.value = null
    await loadChildren()
  } finally {
    updating.value = false
  }
}
</script>

<template>
  <div class="sponsorship-page">
    <div class="page-header">
      <h1>Gestion du parrainage <span class="count">({{ total }})</span></h1>
    </div>

    <!-- Filtres -->
    <div class="filters">
      <div class="filter-group">
        <label class="filter-label">Statut</label>
        <select v-model="statusFilter" class="filter-select">
          <option value="">Tous</option>
          <option value="PENDING">En attente</option>
          <option value="SPONSORED">Parrainé</option>
          <option value="NOT_ELIGIBLE">Non éligible</option>
        </select>
      </div>
    </div>

    <!-- Tableau -->
    <div v-if="loading && !children.length" class="loading">Chargement...</div>
    <div v-else-if="!children.length" class="empty">Aucun bénéficiaire trouvé</div>

    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Référence</th>
            <th>Nom complet</th>
            <th>Village</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="child in children" :key="child.id">
            <td class="ref-cell">{{ child.reference }}</td>
            <td>
              <router-link :to="`/children/${child.id}`" class="name-link">
                {{ child.firstName }} {{ child.lastName }}
              </router-link>
            </td>
            <td>{{ child.village }}</td>
            <td>
              <span class="badge" :class="statusClass(child.sponsorshipStatus)">
                {{ statusLabel(child.sponsorshipStatus) }}
              </span>
            </td>
            <td>
              <AppButton variant="secondary" size="sm" @click="openStatusModal(child)">
                Modifier statut
              </AppButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Charger plus -->
    <div v-if="nextCursor" class="load-more">
      <AppButton variant="secondary" :loading="loading" @click="loadChildren(true)">
        Charger plus
      </AppButton>
    </div>

    <!-- Modal changement statut -->
    <AppModal v-if="selectedChild" title="Modifier le statut de parrainage" @close="selectedChild = null">
      <p>
        Enfant : <strong>{{ selectedChild.firstName }} {{ selectedChild.lastName }}</strong>
      </p>
      <p>
        Statut actuel :
        <span class="badge" :class="statusClass(selectedChild.sponsorshipStatus)">
          {{ statusLabel(selectedChild.sponsorshipStatus) }}
        </span>
      </p>
      <div class="modal-field">
        <label class="filter-label">Nouveau statut</label>
        <select v-model="newStatus" class="filter-select">
          <option value="PENDING">En attente</option>
          <option value="SPONSORED">Parrainé</option>
          <option value="NOT_ELIGIBLE">Non éligible</option>
        </select>
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="selectedChild = null">Annuler</AppButton>
        <AppButton :loading="updating" @click="updateStatus">Confirmer</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.5rem; margin: 0; }
.count { color: #6b7280; font-weight: 400; }

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.filter-group { display: flex; flex-direction: column; gap: 0.25rem; }
.filter-label { font-size: 0.875rem; font-weight: 500; color: #374151; }
.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
}

.data-table tbody tr:hover { background: #f9fafb; }

.ref-cell { font-family: monospace; font-size: 0.8rem; color: #6b7280; }
.name-link { color: #1a56db; text-decoration: none; font-weight: 500; }
.name-link:hover { text-decoration: underline; }

.badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 500; }
.badge-pending { background: #fef3c7; color: #92400e; }
.badge-sponsored { background: #dcfce7; color: #166534; }
.badge-not-eligible { background: #fee2e2; color: #991b1b; }

.modal-field { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.25rem; }

.load-more { text-align: center; padding: 1.5rem 0; }
.loading, .empty { text-align: center; padding: 3rem; color: #6b7280; }

@media (max-width: 768px) {
  .data-table th, .data-table td { padding: 0.5rem; font-size: 0.8rem; }
  .ref-cell { display: none; }
}
</style>
