<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { dashboardService } from '@/services/dashboard.service'
import { useAuthStore } from '@/stores/auth.store'
import AppButton from '@/components/common/AppButton.vue'

const authStore = useAuthStore()

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
const error = ref('')

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
})

const maxVillageCount = computed(() => {
  if (!stats.value?.childrenByVillage.length) return 1
  return Math.max(...stats.value.childrenByVillage.map(v => v.count))
})

onMounted(async () => {
  try {
    const res = await dashboardService.getStats()
    stats.value = res.data
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Impossible de charger les statistiques'
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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `il y a ${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}
</script>

<template>
  <div class="dashboard">
    <!-- Hero header -->
    <div class="hero">
      <div class="hero-content">
        <h1>{{ greeting }}, {{ authStore.user?.firstName }} 👋</h1>
        <p>Bienvenue sur la plateforme de suivi du programme Anayi au Bénin</p>
      </div>
      <div class="hero-actions">
        <router-link to="/children/new">
          <AppButton size="lg">+ Enregistrer un enfant</AppButton>
        </router-link>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="loading-grid">
        <div v-for="i in 4" :key="i" class="skeleton-card"></div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <AppButton variant="secondary" @click="$router.go(0)">Réessayer</AppButton>
    </div>

    <!-- Stats -->
    <template v-else-if="stats">
      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-total">
          <div class="kpi-visual">
            <div class="kpi-icon-wrapper total">
              <span class="kpi-icon">👦</span>
            </div>
          </div>
          <div class="kpi-data">
            <span class="kpi-number">{{ stats.totalChildren }}</span>
            <span class="kpi-label">Bénéficiaires</span>
          </div>
          <div class="kpi-trend">Total enregistrés</div>
        </div>

        <div class="kpi-card kpi-pending">
          <div class="kpi-visual">
            <div class="kpi-icon-wrapper pending">
              <span class="kpi-icon">⏳</span>
            </div>
          </div>
          <div class="kpi-data">
            <span class="kpi-number">{{ stats.sponsorship.pending }}</span>
            <span class="kpi-label">En attente</span>
          </div>
          <div class="kpi-trend">De parrainage</div>
        </div>

        <div class="kpi-card kpi-sponsored">
          <div class="kpi-visual">
            <div class="kpi-icon-wrapper sponsored">
              <span class="kpi-icon">🤝</span>
            </div>
          </div>
          <div class="kpi-data">
            <span class="kpi-number">{{ stats.sponsorship.sponsored }}</span>
            <span class="kpi-label">Parrainés</span>
          </div>
          <div class="kpi-trend">Enfants soutenus</div>
        </div>

        <div class="kpi-card kpi-docs">
          <div class="kpi-visual">
            <div class="kpi-icon-wrapper docs">
              <span class="kpi-icon">📄</span>
            </div>
          </div>
          <div class="kpi-data">
            <span class="kpi-number">{{ stats.totalDocuments + stats.totalSurveys }}</span>
            <span class="kpi-label">Documents & Enquêtes</span>
          </div>
          <div class="kpi-trend">{{ stats.totalDocuments }} docs · {{ stats.totalSurveys }} enquêtes</div>
        </div>
      </div>

      <!-- Bottom grid: Recent + Village -->
      <div class="bottom-grid">
        <!-- Recent registrations -->
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>Derniers enregistrements</h2>
              <p class="panel-desc">Les enfants récemment ajoutés au programme</p>
            </div>
            <router-link to="/children" class="panel-link">Voir tout →</router-link>
          </div>

          <div v-if="!stats.recentChildren.length" class="empty-state">
            <div class="empty-illustration">📋</div>
            <h3>Aucun enregistrement</h3>
            <p>Commencez par enregistrer votre premier enfant bénéficiaire</p>
            <router-link to="/children/new">
              <AppButton size="sm">Enregistrer un enfant</AppButton>
            </router-link>
          </div>

          <div v-else class="recent-list">
            <router-link
              v-for="child in stats.recentChildren"
              :key="child.id"
              :to="`/children/${child.id}`"
              class="recent-row"
            >
              <div class="recent-avatar">
                {{ child.firstName[0] }}{{ child.lastName[0] }}
              </div>
              <div class="recent-info">
                <span class="recent-name">{{ child.firstName }} {{ child.lastName }}</span>
                <span class="recent-detail">{{ child.village }} · {{ child.reference }}</span>
              </div>
              <div class="recent-right">
                <span class="badge" :class="statusClass(child.sponsorshipStatus)">
                  {{ statusLabel(child.sponsorshipStatus) }}
                </span>
                <span class="recent-time">{{ timeAgo(child.createdAt) }}</span>
              </div>
            </router-link>
          </div>
        </section>

        <!-- Village distribution -->
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>Répartition géographique</h2>
              <p class="panel-desc">Distribution des bénéficiaires par village</p>
            </div>
          </div>

          <div v-if="!stats.childrenByVillage.length" class="empty-state">
            <div class="empty-illustration">🗺️</div>
            <h3>Aucune donnée géographique</h3>
            <p>Les statistiques apparaîtront après les premiers enregistrements</p>
          </div>

          <div v-else class="village-chart">
            <div v-for="(v, index) in stats.childrenByVillage" :key="v.village" class="village-row">
              <span class="village-rank">{{ index + 1 }}</span>
              <div class="village-info">
                <div class="village-top">
                  <span class="village-name">{{ v.village }}</span>
                  <span class="village-count">{{ v.count }} enfant{{ v.count > 1 ? 's' : '' }}</span>
                </div>
                <div class="village-bar-track">
                  <div
                    class="village-bar-fill"
                    :style="{
                      width: `${(v.count / maxVillageCount) * 100}%`,
                      animationDelay: `${index * 0.1}s`
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Quick access -->
      <div class="quick-access">
        <h3>Accès rapide</h3>
        <div class="quick-grid">
          <router-link to="/children/new" class="quick-card">
            <span class="quick-icon">➕</span>
            <span class="quick-label">Enregistrer</span>
            <span class="quick-desc">Nouvel enfant</span>
          </router-link>
          <router-link to="/children" class="quick-card">
            <span class="quick-icon">👦</span>
            <span class="quick-label">Bénéficiaires</span>
            <span class="quick-desc">Liste complète</span>
          </router-link>
          <router-link to="/sponsorship" v-if="authStore.isAdmin" class="quick-card">
            <span class="quick-icon">🤝</span>
            <span class="quick-label">Parrainage</span>
            <span class="quick-desc">Gérer les statuts</span>
          </router-link>
          <router-link to="/users" v-if="authStore.isAdmin" class="quick-card">
            <span class="quick-icon">👥</span>
            <span class="quick-label">Utilisateurs</span>
            <span class="quick-desc">Gérer l'équipe</span>
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Hero */
.hero {
  background: linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #818cf8 100%);
  border-radius: var(--radius);
  padding: 2rem 2.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.75rem;
  position: relative;
  overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
  border-radius: 50%;
}
.hero::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: 10%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
  border-radius: 50%;
}
.hero-content { position: relative; z-index: 1; }
.hero h1 {
  color: white;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 0.35rem;
}
.hero p { color: rgba(255,255,255,0.75); font-size: 0.9rem; }
.hero-actions { position: relative; z-index: 1; }
.hero-actions .app-btn {
  background: white !important;
  color: var(--primary) !important;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(0,0,0,0.15);
}
.hero-actions .app-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.kpi-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 1.35rem;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.25s;
  position: relative;
  overflow: hidden;
}
.kpi-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}
.kpi-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
}
.kpi-total::after { background: linear-gradient(90deg, #4f46e5, #818cf8); }
.kpi-pending::after { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.kpi-sponsored::after { background: linear-gradient(90deg, #10b981, #34d399); }
.kpi-docs::after { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }

.kpi-visual { display: flex; }
.kpi-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}
.kpi-icon-wrapper.total { background: #e0e7ff; }
.kpi-icon-wrapper.pending { background: #fef3c7; }
.kpi-icon-wrapper.sponsored { background: #d1fae5; }
.kpi-icon-wrapper.docs { background: #ede9fe; }

.kpi-data { display: flex; flex-direction: column; }
.kpi-number {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.03em;
  line-height: 1;
}
.kpi-label { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; margin-top: 0.15rem; }
.kpi-trend { font-size: 0.75rem; color: var(--text-muted); }

/* Bottom grid */
.bottom-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.75rem;
}

.panel {
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}
.panel-header h2 { font-size: 1.05rem; font-weight: 700; color: var(--text); margin: 0; }
.panel-desc { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.15rem; }
.panel-link { font-size: 0.8rem; color: var(--primary); text-decoration: none; font-weight: 600; white-space: nowrap; }
.panel-link:hover { text-decoration: underline; }

/* Recent list */
.recent-list { display: flex; flex-direction: column; }
.recent-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 0.65rem;
  text-decoration: none;
  color: inherit;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
  border-bottom: 1px solid var(--border);
}
.recent-row:last-child { border-bottom: none; }
.recent-row:hover { background: var(--bg); }

.recent-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #818cf8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
}
.recent-info { flex: 1; min-width: 0; }
.recent-name { display: block; font-size: 0.9rem; font-weight: 600; color: var(--text); }
.recent-detail { display: block; font-size: 0.75rem; color: var(--text-muted); }
.recent-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
.recent-time { font-size: 0.7rem; color: var(--text-muted); }

/* Badges */
.badge { padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.68rem; font-weight: 600; white-space: nowrap; }
.badge-pending { background: #fef3c7; color: #92400e; }
.badge-sponsored { background: #dcfce7; color: #166534; }
.badge-not-eligible { background: #fee2e2; color: #991b1b; }

/* Village chart */
.village-chart { display: flex; flex-direction: column; gap: 0.85rem; }
.village-row { display: flex; align-items: center; gap: 0.75rem; }
.village-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  flex-shrink: 0;
}
.village-info { flex: 1; }
.village-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; }
.village-name { font-size: 0.85rem; font-weight: 600; color: var(--text); }
.village-count { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }
.village-bar-track { height: 8px; background: var(--bg); border-radius: 20px; overflow: hidden; }
.village-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #818cf8);
  border-radius: 20px;
  min-width: 6px;
  animation: growBar 0.8s ease forwards;
  transform-origin: left;
}
@keyframes growBar {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 2.5rem 1rem;
}
.empty-illustration { font-size: 3rem; margin-bottom: 0.75rem; }
.empty-state h3 { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 0.25rem; }
.empty-state p { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; }

/* Quick access */
.quick-access { margin-bottom: 1rem; }
.quick-access h3 { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 1rem; }
.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.85rem;
}
.quick-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  text-decoration: none;
  text-align: center;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}
.quick-card:hover {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08);
  transform: translateY(-2px);
}
.quick-icon { font-size: 1.75rem; margin-bottom: 0.25rem; }
.quick-label { font-size: 0.9rem; font-weight: 700; color: var(--text); }
.quick-desc { font-size: 0.75rem; color: var(--text-muted); }

/* Loading */
.loading-state { margin-bottom: 1.75rem; }
.loading-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
.skeleton-card {
  height: 140px;
  background: linear-gradient(110deg, var(--border) 8%, #f5f5f5 18%, var(--border) 33%);
  border-radius: var(--radius);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  to { background-position-x: -200%; }
}

/* Error */
.error-state {
  text-align: center;
  padding: 3rem;
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.error-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
.error-state p { color: var(--text-muted); margin-bottom: 1rem; }

/* Responsive */
@media (max-width: 1024px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .bottom-grid { grid-template-columns: 1fr; }
  .loading-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1.5rem;
  }
  .hero h1 { font-size: 1.3rem; }
  .kpi-number { font-size: 1.5rem; }
  .kpi-card { padding: 1rem; }
  .quick-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .kpi-grid { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .hero h1 { font-size: 1.15rem; }
  .quick-grid { grid-template-columns: 1fr 1fr; gap: 0.65rem; }
}
</style>
