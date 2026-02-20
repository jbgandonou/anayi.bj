<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { childrenService } from '@/services/children.service'
import AppButton from '@/components/common/AppButton.vue'
import AppModal from '@/components/common/AppModal.vue'
import type { ChildListItem } from '@/types/child'
import { Handshake, RefreshCw } from 'lucide-vue-next'

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
      <div class="page-title-group">
        <div class="page-icon">
          <Handshake :size="22" :stroke-width="1.8" />
        </div>
        <div>
          <h1>Gestion du parrainage</h1>
          <p class="subtitle">{{ total }} bénéficiaire{{ total > 1 ? 's' : '' }}</p>
        </div>
      </div>
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
    <div v-if="loading && !children.length" class="loading">
      <div class="loading-spinner"></div>
      <span>Chargement...</span>
    </div>
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
                <span class="badge-dot" :class="`dot-${statusClass(child.sponsorshipStatus)}`"></span>
                {{ statusLabel(child.sponsorshipStatus) }}
              </span>
            </td>
            <td>
              <AppButton variant="secondary" size="sm" @click="openStatusModal(child)">
                <template #icon><RefreshCw :size="13" :stroke-width="2" /></template>
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

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: var(--bg-card);
  padding: 1.25rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 1px solid var(--border-light);
}

.filter-group { display: flex; flex-direction: column; gap: 0.35rem; }
.filter-label { font-size: 0.85rem; font-weight: 600; color: var(--text); }
.filter-select {
  padding: 0.55rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--text);
  background: white;
  transition: all var(--transition);
}
.filter-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08);
}

.table-wrapper {
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow-x: auto;
  border: 1px solid var(--border-light);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
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

.data-table td {
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--border-light);
  font-size: 0.875rem;
}

.data-table tbody tr { transition: background var(--transition); }
.data-table tbody tr:hover { background: var(--primary-50); }

.ref-cell { font-family: monospace; font-size: 0.8rem; color: var(--text-muted); }
.name-link { color: var(--primary); text-decoration: none; font-weight: 600; }
.name-link:hover { text-decoration: underline; }

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
}
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.badge-pending { background: #fef3c7; color: #92400e; }
.dot-badge-pending { background: #f59e0b; }
.badge-sponsored { background: #dcfce7; color: #166534; }
.dot-badge-sponsored { background: #10b981; }
.badge-not-eligible { background: #fee2e2; color: #991b1b; }
.dot-badge-not-eligible { background: #ef4444; }

.modal-field { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.35rem; }

.load-more { text-align: center; padding: 1.5rem 0; }

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
.empty { text-align: center; padding: 3rem; color: var(--text-muted); }

@media (max-width: 768px) {
  .data-table th, .data-table td { padding: 0.6rem 0.75rem; font-size: 0.8rem; }
  .ref-cell { display: none; }
  .page-header h1 { font-size: 1.3rem; }
}
</style>
