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
      <h1>Bénéficiaires <span class="count">({{ total }})</span></h1>
      <router-link to="/children/new">
        <AppButton>Enregistrer un enfant</AppButton>
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
    <div v-if="loading && !children.length" class="loading">Chargement...</div>

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
  margin-bottom: 1.5rem;
}
.page-header h1 { font-size: 1.5rem; margin: 0; }
.count { color: #6b7280; font-weight: 400; }

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.form-group { display: flex; flex-direction: column; gap: 0.25rem; }
.form-label { font-size: 0.875rem; font-weight: 500; color: #374151; }
.form-input, .form-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.children-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.child-card {
  display: flex;
  gap: 1rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: box-shadow 0.2s;
}
.child-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.12); }

.card-photo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}
.card-photo img { width: 100%; height: 100%; object-fit: cover; }
.photo-placeholder {
  width: 100%; height: 100%;
  background: #1a56db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.card-info h3 { font-size: 0.95rem; margin: 0 0 0.25rem; }
.card-detail { font-size: 0.8rem; color: #6b7280; margin: 0; }

.badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  margin-top: 0.35rem;
}
.badge-pending { background: #fef3c7; color: #92400e; }
.badge-sponsored { background: #dcfce7; color: #166534; }
.badge-not-eligible { background: #fee2e2; color: #991b1b; }

.load-more { text-align: center; padding: 1.5rem 0; }
.loading, .empty { text-align: center; padding: 3rem; color: #6b7280; }
</style>
