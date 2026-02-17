<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { childrenService } from '@/services/children.service'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import type { ChildListItem } from '@/types/child'

const children = ref<ChildListItem[]>([])
const loading = ref(false)
const search = ref('')
const village = ref('')
const sponsorshipStatus = ref('')
const gender = ref('')
const nextCursor = ref<string | null>(null)
const total = ref(0)

let searchTimeout: ReturnType<typeof setTimeout>

async function loadChildren(append = false) {
  loading.value = true
  try {
    const params: Record<string, string | number | undefined> = {
      take: 50,
      search: search.value || undefined,
      village: village.value || undefined,
      sponsorshipStatus: sponsorshipStatus.value || undefined,
      gender: gender.value || undefined,
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

function onSearchChange() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => loadChildren(), 400)
}

watch([village, sponsorshipStatus, gender], () => loadChildren())

onMounted(loadChildren)

function statusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: 'En attente',
    SPONSORED: 'Parrainé',
    NOT_ELIGIBLE: 'Non éligible',
  }
  return map[status] || status
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    PENDING: 'badge-pending',
    SPONSORED: 'badge-sponsored',
    NOT_ELIGIBLE: 'badge-not-eligible',
  }
  return map[status] || ''
}
</script>

<template>
  <div class="children-list-page">
    <div class="page-header">
      <div>
        <h1>Bénéficiaires</h1>
        <p class="subtitle">{{ total }} enfant{{ total > 1 ? 's' : '' }} enregistré{{ total > 1 ? 's' : '' }}</p>
      </div>
      <router-link to="/children/new">
        <AppButton>+ Enregistrer un enfant</AppButton>
      </router-link>
    </div>

    <!-- Filtres -->
    <div class="filters">
      <AppInput
        v-model="search"
        label="Rechercher"
        placeholder="Nom ou prénom..."
        @input="onSearchChange"
      />
      <div class="form-group">
        <label class="form-label">Village</label>
        <input v-model="village" class="form-input" placeholder="Filtrer par village" />
      </div>
      <div class="form-group">
        <label class="form-label">Statut parrainage</label>
        <select v-model="sponsorshipStatus" class="form-select">
          <option value="">Tous</option>
          <option value="PENDING">En attente</option>
          <option value="SPONSORED">Parrainé</option>
          <option value="NOT_ELIGIBLE">Non éligible</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Sexe</label>
        <select v-model="gender" class="form-select">
          <option value="">Tous</option>
          <option value="MALE">Masculin</option>
          <option value="FEMALE">Féminin</option>
        </select>
      </div>
    </div>

    <!-- Liste -->
    <div v-if="loading && !children.length" class="loading">
      <div class="loading-spinner"></div>
      <span>Chargement...</span>
    </div>

    <div v-else-if="!children.length" class="empty">Aucun bénéficiaire trouvé</div>

    <div v-else class="children-grid">
      <router-link
        v-for="child in children"
        :key="child.id"
        :to="`/children/${child.id}`"
        class="child-card"
      >
        <div class="card-photo">
          <img v-if="child.photoUrl" :src="child.photoUrl" alt="" />
          <div v-else class="photo-placeholder">{{ child.firstName[0] }}{{ child.lastName[0] }}</div>
        </div>
        <div class="card-info">
          <h3>{{ child.firstName }} {{ child.lastName }}</h3>
          <p class="card-detail">{{ child.village }}</p>
          <p v-if="child.school" class="card-detail">{{ child.school }}</p>
          <span class="badge" :class="statusClass(child.sponsorshipStatus)">
            {{ statusLabel(child.sponsorshipStatus) }}
          </span>
        </div>
      </router-link>
    </div>

    <!-- Charger plus -->
    <div v-if="nextCursor" class="load-more">
      <AppButton variant="secondary" :loading="loading" @click="loadChildren(true)">
        Charger plus
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.75rem;
}
.page-header h1 { font-size: 1.6rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin: 0; }
.subtitle { color: var(--text-muted); font-size: 0.85rem; margin-top: 0.15rem; }

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: var(--bg-card);
  padding: 1.25rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.form-label { font-size: 0.85rem; font-weight: 600; color: var(--text); }
.form-input, .form-select {
  padding: 0.55rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--text);
  background: white;
  transition: border-color 0.2s;
}
.form-input:focus, .form-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.children-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1rem;
}

.child-card {
  display: flex;
  gap: 1rem;
  background: var(--bg-card);
  padding: 1.15rem;
  border-radius: var(--radius);
  text-decoration: none;
  color: inherit;
  box-shadow: var(--shadow);
  transition: all 0.2s;
}
.child-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-photo {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}
.card-photo img { width: 100%; height: 100%; object-fit: cover; }
.photo-placeholder {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, var(--primary), #818cf8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.card-info h3 { font-size: 0.95rem; font-weight: 700; margin: 0 0 0.2rem; color: var(--text); }
.card-detail { font-size: 0.8rem; color: var(--text-muted); margin: 0; }

.badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-top: 0.4rem;
}
.badge-pending { background: #fef3c7; color: #92400e; }
.badge-sponsored { background: #dcfce7; color: #166534; }
.badge-not-eligible { background: #fee2e2; color: #991b1b; }

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
  .page-header { flex-direction: column; align-items: stretch; gap: 0.75rem; }
  .filters { grid-template-columns: 1fr 1fr; }
  .children-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .filters { grid-template-columns: 1fr; }
  .page-header h1 { font-size: 1.3rem; }
}
</style>
