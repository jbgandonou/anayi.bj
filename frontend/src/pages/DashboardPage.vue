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
    <div class="page-title">
      <h1>Tableau de bord</h1>
      <p class="subtitle">Vue d'ensemble du programme Anayi</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>Chargement des données...</span>
    </div>

    <template v-else-if="stats">
      <!-- Stat cards -->
      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-icon">👦</div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.totalChildren }}</span>
            <span class="stat-label">Bénéficiaires</span>
          </div>
        </div>
        <div class="stat-card stat-pending">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.sponsorship.pending }}</span>
            <span class="stat-label">En attente</span>
          </div>
        </div>
        <div class="stat-card stat-sponsored">
          <div class="stat-icon">🤝</div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.sponsorship.sponsored }}</span>
            <span class="stat-label">Parrainés</span>
          </div>
        </div>
        <div class="stat-card stat-not-eligible">
          <div class="stat-icon">⛔</div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.sponsorship.notEligible }}</span>
            <span class="stat-label">Non éligibles</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📄</div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.totalDocuments }}</span>
            <span class="stat-label">Documents</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.totalSurveys }}</span>
            <span class="stat-label">Enquêtes</span>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Derniers enfants enregistrés -->
        <section class="card">
          <div class="card-header">
            <h2>Derniers enregistrements</h2>
            <router-link to="/children" class="card-link">Voir tout</router-link>
          </div>
          <div v-if="!stats.recentChildren.length" class="empty">Aucun enregistrement</div>
          <div v-else class="recent-list">
            <router-link
              v-for="child in stats.recentChildren"
              :key="child.id"
              :to="`/children/${child.id}`"
              class="recent-item"
            >
              <div class="recent-avatar">{{ child.firstName[0] }}{{ child.lastName[0] }}</div>
              <div class="recent-info">
                <strong>{{ child.firstName }} {{ child.lastName }}</strong>
                <span class="recent-meta">{{ child.village }} · {{ child.reference }}</span>
              </div>
              <span class="badge" :class="statusClass(child.sponsorshipStatus)">
                {{ statusLabel(child.sponsorshipStatus) }}
              </span>
            </router-link>
          </div>
        </section>

        <!-- Répartition par village -->
        <section class="card">
          <div class="card-header">
            <h2>Répartition par village</h2>
          </div>
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
.page-title { margin-bottom: 1.75rem; }
.page-title h1 { font-size: 1.6rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin-bottom: 0.15rem; }
.subtitle { color: var(--text-muted); font-size: 0.9rem; }

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.stat-card {
  background: var(--bg-card);
  padding: 1.25rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid var(--primary);
  transition: all 0.2s;
}
.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.stat-pending { border-left-color: var(--accent); }
.stat-sponsored { border-left-color: var(--success); }
.stat-not-eligible { border-left-color: var(--danger); }

.stat-icon { font-size: 1.5rem; }
.stat-content { display: flex; flex-direction: column; }
.stat-value { font-size: 1.6rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
.stat-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 1.25rem;
}

.card {
  background: var(--bg-card);
  padding: 1.5rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.card-header h2 { font-size: 1rem; font-weight: 700; color: var(--text); margin: 0; }
.card-link { font-size: 0.8rem; color: var(--primary); text-decoration: none; font-weight: 600; }
.card-link:hover { text-decoration: underline; }

.recent-list { display: flex; flex-direction: column; }
.recent-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid var(--border);
  text-decoration: none;
  color: inherit;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
}
.recent-item:last-child { border-bottom: none; }
.recent-item:hover { background: var(--bg); }

.recent-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  flex-shrink: 0;
}
.recent-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.recent-info strong { font-size: 0.875rem; color: var(--text); }
.recent-meta { font-size: 0.75rem; color: var(--text-muted); }

.badge { padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600; white-space: nowrap; }
.badge-pending { background: #fef3c7; color: #92400e; }
.badge-sponsored { background: #dcfce7; color: #166534; }
.badge-not-eligible { background: #fee2e2; color: #991b1b; }

.village-list { display: flex; flex-direction: column; gap: 0.65rem; }
.village-item { display: flex; align-items: center; gap: 0.75rem; }
.village-name { font-size: 0.85rem; min-width: 100px; color: var(--text); font-weight: 500; }
.village-bar-wrapper { flex: 1; background: var(--bg); border-radius: 20px; height: 10px; }
.village-bar { height: 100%; background: linear-gradient(90deg, var(--primary), #818cf8); border-radius: 20px; min-width: 6px; transition: width 0.5s ease; }
.village-count { font-size: 0.85rem; font-weight: 700; color: var(--text); min-width: 30px; text-align: right; }

.loading { text-align: center; padding: 3rem; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
.loading-spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.empty { text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.9rem; }

@media (max-width: 768px) {
  .stat-cards { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
  .stat-value { font-size: 1.3rem; }
  .stat-card { padding: 1rem; gap: 0.75rem; }
  .stat-icon { font-size: 1.2rem; }
  .dashboard-grid { grid-template-columns: 1fr; }
  .recent-item { flex-wrap: wrap; }
}

@media (max-width: 480px) {
  .stat-cards { grid-template-columns: repeat(2, 1fr); }
  .page-title h1 { font-size: 1.3rem; }
}
</style>
