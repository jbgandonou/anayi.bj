<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { childrenService } from '@/services/children.service'
import AppButton from '@/components/common/AppButton.vue'
import type { Child } from '@/types/child'

const route = useRoute()
const router = useRouter()
const child = ref<Child | null>(null)
const loading = ref(true)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

onMounted(async () => {
  try {
    const res = await childrenService.getById(route.params.id as string)
    child.value = res.data
  } finally {
    loading.value = false
  }
})

function statusLabel(status: string) {
  const map: Record<string, string> = { PENDING: 'En attente', SPONSORED: 'Parrainé', NOT_ELIGIBLE: 'Non éligible' }
  return map[status] || status
}

function docTypeLabel(type: string) {
  const map: Record<string, string> = {
    BIRTH_CERTIFICATE: 'Acte de naissance',
    SCHOOL_CERTIFICATE: 'Certificat de scolarité',
    RECENT_PHOTO: 'Photo récente',
    OTHER: 'Autre',
  }
  return map[type] || type
}

function downloadUrl(docId: string) {
  return `${API_URL}/documents/${docId}/download`
}
</script>

<template>
  <div class="detail-page">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>Chargement...</span>
    </div>

    <template v-else-if="child">
      <div class="page-header">
        <div class="header-info">
          <div class="child-avatar">{{ child.firstName[0] }}{{ child.lastName[0] }}</div>
          <div>
            <h1>{{ child.firstName }} {{ child.lastName }}</h1>
            <p class="reference">{{ child.reference }}</p>
          </div>
        </div>
        <div class="header-actions">
          <router-link :to="`/children/${child.id}/edit`">
            <AppButton variant="secondary">Modifier</AppButton>
          </router-link>
          <AppButton variant="secondary" @click="router.back()">Retour</AppButton>
        </div>
      </div>

      <div class="sections">
        <!-- Identité -->
        <section class="card">
          <h2>Identité</h2>
          <div class="info-grid">
            <div class="info-item"><span class="label">Sexe</span><span class="value">{{ child.gender === 'MALE' ? 'Masculin' : 'Féminin' }}</span></div>
            <div class="info-item"><span class="label">Date de naissance</span><span class="value">{{ child.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString('fr-FR') : '-' }}</span></div>
            <div class="info-item"><span class="label">Âge approximatif</span><span class="value">{{ child.approximateAge ?? '-' }}</span></div>
            <div class="info-item"><span class="label">Lieu de naissance</span><span class="value">{{ child.placeOfBirth || '-' }}</span></div>
            <div class="info-item"><span class="label">Village</span><span class="value">{{ child.village }}</span></div>
            <div class="info-item"><span class="label">Nationalité</span><span class="value">{{ child.nationality }}</span></div>
            <div class="info-item"><span class="label">Statut familial</span><span class="value">{{ child.familyStatus || '-' }}</span></div>
            <div class="info-item"><span class="label">Frères/soeurs</span><span class="value">{{ child.siblingsCount }}</span></div>
          </div>
        </section>

        <!-- Scolarité -->
        <section class="card">
          <h2>Scolarité</h2>
          <div class="info-grid">
            <div class="info-item"><span class="label">École</span><span class="value">{{ child.school || '-' }}</span></div>
            <div class="info-item"><span class="label">Classe</span><span class="value">{{ child.currentGrade || '-' }}</span></div>
            <div class="info-item"><span class="label">Fréquence</span><span class="value">{{ child.attendanceFrequency || '-' }}</span></div>
            <div class="info-item"><span class="label">Besoins</span><span class="value">{{ child.educationalNeeds || '-' }}</span></div>
          </div>
        </section>

        <!-- Santé -->
        <section class="card">
          <h2>Santé</h2>
          <div class="info-grid">
            <div class="info-item"><span class="label">État général</span><span class="value">{{ child.generalHealth || '-' }}</span></div>
            <div class="info-item"><span class="label">Vaccinations à jour</span><span class="value">{{ child.vaccinationsUpToDate ? 'Oui' : 'Non' }}</span></div>
            <div class="info-item"><span class="label">Problèmes</span><span class="value">{{ child.healthIssues || '-' }}</span></div>
          </div>
        </section>

        <!-- Conditions de vie -->
        <section class="card">
          <h2>Conditions de vie</h2>
          <div class="info-grid">
            <div class="info-item"><span class="label">Logement</span><span class="value">{{ child.housingType || '-' }}</span></div>
            <div class="info-item"><span class="label">Eau potable</span><span class="value">{{ child.accessToWater ? 'Oui' : 'Non' }}</span></div>
            <div class="info-item"><span class="label">Électricité</span><span class="value">{{ child.accessToElectricity ? 'Oui' : 'Non' }}</span></div>
            <div class="info-item"><span class="label">Alimentation</span><span class="value">{{ child.sufficientFood ? 'Oui' : 'Non' }}</span></div>
            <div class="info-item"><span class="label">Activité du responsable</span><span class="value">{{ child.guardianActivity || '-' }}</span></div>
          </div>
        </section>

        <!-- Parrainage -->
        <section class="card">
          <h2>Parrainage</h2>
          <div class="info-grid">
            <div class="info-item"><span class="label">Souhaite le parrainage</span><span class="value">{{ child.wantsSponsorship ? 'Oui' : 'Non' }}</span></div>
            <div class="info-item"><span class="label">Consentement</span><span class="value">{{ child.guardianConsent ? 'Oui' : 'Non' }}</span></div>
            <div class="info-item">
              <span class="label">Statut</span>
              <span class="badge" :class="`badge-${child.sponsorshipStatus.toLowerCase().replace('_', '-')}`">{{ statusLabel(child.sponsorshipStatus) }}</span>
            </div>
            <div class="info-item"><span class="label">Commentaires</span><span class="value">{{ child.sponsorshipComments || '-' }}</span></div>
          </div>
        </section>

        <!-- Documents -->
        <section v-if="child.documents?.length" class="card">
          <h2>Documents</h2>
          <div class="docs-list">
            <a
              v-for="doc in child.documents"
              :key="doc.id"
              :href="downloadUrl(doc.id)"
              target="_blank"
              class="doc-item"
            >
              <span class="doc-icon">📎</span>
              <div class="doc-info">
                <span class="doc-type">{{ docTypeLabel(doc.type) }}</span>
                <span class="doc-name">{{ doc.fileName }}</span>
              </div>
            </a>
          </div>
        </section>

        <!-- Enquêtes -->
        <section v-if="child.surveys?.length" class="card">
          <h2>Enquêtes</h2>
          <div v-for="s in child.surveys" :key="s.id" class="survey-item">
            <strong>{{ s.volunteerName }}</strong> — {{ s.volunteerPhone }}
            <br />
            <small>{{ new Date(s.surveyDate).toLocaleDateString('fr-FR') }}</small>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.75rem;
}
.header-info { display: flex; align-items: center; gap: 1rem; }
.child-avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), #818cf8);
  color: white;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 1.1rem;
  flex-shrink: 0;
}
.page-header h1 { font-size: 1.5rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin: 0; }
.reference { color: var(--text-muted); font-size: 0.85rem; margin: 0.15rem 0 0; }
.header-actions { display: flex; gap: 0.5rem; }

.sections { display: flex; flex-direction: column; gap: 1.25rem; }

.card {
  background: var(--bg-card);
  padding: 1.5rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.card h2 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0 0 1rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}
.info-item { display: flex; flex-direction: column; gap: 0.2rem; }
.label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
.value { font-size: 0.9rem; color: var(--text); font-weight: 500; }

.badge { padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
.badge-pending { background: #fef3c7; color: #92400e; }
.badge-sponsored { background: #dcfce7; color: #166534; }
.badge-not-eligible { background: #fee2e2; color: #991b1b; }

.docs-list { display: flex; flex-direction: column; gap: 0.5rem; }
.doc-item {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem; background: var(--bg);
  border-radius: var(--radius-sm); text-decoration: none; color: inherit;
  transition: background 0.15s;
}
.doc-item:hover { background: var(--border); }
.doc-icon { font-size: 1.2rem; }
.doc-info { display: flex; flex-direction: column; }
.doc-type { font-weight: 600; font-size: 0.85rem; color: var(--text); }
.doc-name { color: var(--text-muted); font-size: 0.8rem; }

.survey-item { padding: 0.65rem 0; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
.survey-item:last-child { border-bottom: none; }

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
  .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .info-grid { grid-template-columns: 1fr; }
  .page-header h1 { font-size: 1.3rem; }
}
</style>
