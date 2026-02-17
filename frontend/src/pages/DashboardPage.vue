<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { dashboardService } from '@/services/dashboard.service'

interface Stats {
  totalChildren: number
  sponsorship: { pending: number; sponsored: number; notEligible: number }
  totalDocuments: number
  totalSurveys: number
  recentChildren: Array<{
    id: string
    reference: string
    firstName: string
    lastName: string
    village: string
    sponsorshipStatus: string
    createdAt: string
  }>
  childrenByVillage: Array<{ village: string; count: number }>
}

const stats = ref<Stats | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await dashboardService.getStats()
    stats.value = res.data
  } finally {
    loading.value = false
  }
})

function statusLabel(status: string) {
  const map: Record<string, string> = { PENDING: 'En attente', SPONSORED: 'Parrainé', NOT_ELIGIBLE: 'Non éligible' }
  return map[status] || status
}

function statusClass(status: string) {
  const map: Record<string, string> = { PENDING: 'badge-pending', SPONSORED: 'badge-sponsored', NOT_ELIGIBLE: 'badge-not-eligible' }
  return map[status] || ''
}
</script>

<template>
  <div class="dashboard-page">
    <h1>Tableau de bord</h1>

    <div v-if="loading" class="loading">Chargement...</div>

    <template v-else-if="stats">
      <!-- Stat cards -->
      <div class="stat-cards">
        <div class="stat-card">
          <span class="stat-value">{{ stats.totalChildren }}</span>
          <span class="stat-label">Bénéficiaires</span>
        </div>
        <div class="stat-card stat-pending">
          <span class="stat-value">{{ stats.sponsorship.pending }}</span>
          <span class="stat-label">En attente</span>
        </div>
        <div class="stat-card stat-sponsored">
          <span class="stat-value">{{ stats.sponsorship.sponsored }}</span>
          <span class="stat-label">Parrainés</span>
        </div>
        <div class="stat-card stat-not-eligible">
          <span class="stat-value">{{ stats.sponsorship.notEligible }}</span>
          <span class="stat-label">Non éligibles</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.totalDocuments }}</span>
          <span class="stat-label">Documents</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.totalSurveys }}</span>
          <span class="stat-label">Enquêtes</span>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Derniers enfants enregistrés -->
        <section class="card">
          <h2>Derniers enregistrements</h2>
          <div v-if="!stats.recentChildren.length" class="empty">Aucun enregistrement</div>
          <div v-else class="recent-list">
            <router-link
              v-for="child in stats.recentChildren"
              :key="child.id"
              :to="`/children/${child.id}`"
              class="recent-item"
            >
              <div>
                <strong>{{ child.firstName }} {{ child.lastName }}</strong>
                <span class="recent-ref">{{ child.reference }}</span>
              </div>
              <div class="recent-meta">
                <span>{{ child.village }}</span>
                <span class="badge" :class="statusClass(child.sponsorshipStatus)">
                  {{ statusLabel(child.sponsorshipStatus) }}
                </span>
              </div>
            </router-link>
          </div>
        </section>

        <!-- Répartition par village -->
        <section class="card">
          <h2>Répartition par village</h2>
          <div v-if="!stats.childrenByVillage.length" class="empty">Aucune donnée</div>
          <div v-else class="village-list">
            <div v-for="v in stats.childrenByVillage" :key="v.village" class="village-item">
              <span class="village-name">{{ v.village }}</span>
              <div class="village-bar-wrapper">
                <div
                  class="village-bar"
                  :style="{ width: `${(v.count / stats!.totalChildren) * 100}%` }"
                ></div>
              </div>
              <span class="village-count">{{ v.count }}</span>
            </div>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard-page h1 { font-size: 1.5rem; margin-bottom: 1.5rem; }

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.25rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-top: 3px solid #1a56db;
}

.stat-pending { border-top-color: #f59e0b; }
.stat-sponsored { border-top-color: #10b981; }
.stat-not-eligible { border-top-color: #ef4444; }

.stat-value { font-size: 1.75rem; font-weight: 700; color: #111827; }
.stat-label { font-size: 0.8rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
}

.card {
  background: white;
  padding: 1.25rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.card h2 { font-size: 1rem; margin: 0 0 0.75rem; color: #1a56db; }

.recent-list { display: flex; flex-direction: column; }
.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0;
  border-bottom: 1px solid #f3f4f6;
  text-decoration: none;
  color: inherit;
}
.recent-item:last-child { border-bottom: none; }
.recent-item:hover { background: #f9fafb; margin: 0 -0.5rem; padding-left: 0.5rem; padding-right: 0.5rem; border-radius: 4px; }
.recent-ref { font-size: 0.75rem; color: #6b7280; margin-left: 0.5rem; }
.recent-meta { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #6b7280; }

.badge { padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 500; }
.badge-pending { background: #fef3c7; color: #92400e; }
.badge-sponsored { background: #dcfce7; color: #166534; }
.badge-not-eligible { background: #fee2e2; color: #991b1b; }

.village-list { display: flex; flex-direction: column; gap: 0.5rem; }
.village-item { display: flex; align-items: center; gap: 0.75rem; }
.village-name { font-size: 0.875rem; min-width: 100px; }
.village-bar-wrapper { flex: 1; background: #f3f4f6; border-radius: 4px; height: 8px; }
.village-bar { height: 100%; background: #1a56db; border-radius: 4px; min-width: 4px; }
.village-count { font-size: 0.875rem; font-weight: 600; color: #374151; min-width: 30px; text-align: right; }

.loading, .empty { text-align: center; padding: 2rem; color: #6b7280; }

@media (max-width: 768px) {
  .stat-cards { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
  .stat-value { font-size: 1.35rem; }
  .stat-card { padding: 1rem; }
  .dashboard-grid { grid-template-columns: 1fr; }
  .recent-item { flex-direction: column; align-items: flex-start; gap: 0.25rem; }
  .recent-meta { margin-top: 0.15rem; }
}

@media (max-width: 480px) {
  .stat-cards { grid-template-columns: repeat(2, 1fr); }
  .dashboard-page h1 { font-size: 1.25rem; }
}
</style>
