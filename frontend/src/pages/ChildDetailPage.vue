<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { childrenService } from '@/services/children.service'
import AppButton from '@/components/common/AppButton.vue'
import type { Child } from '@/types/child'
import { User, GraduationCap, Heart, Home, Handshake, FileText, ClipboardList, Paperclip, Pencil, ArrowLeft } from 'lucide-vue-next'

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
            <AppButton variant="secondary">
              <template #icon><Pencil :size="15" :stroke-width="2" /></template>
              Modifier
            </AppButton>
          </router-link>
          <AppButton variant="secondary" @click="router.back()">
            <template #icon><ArrowLeft :size="15" :stroke-width="2" /></template>
            Retour
          </AppButton>
        </div>
      </div>

      <div class="sections">
        <!-- Identité -->
        <section class="card">
          <div class="card-header">
            <div class="section-icon"><User :size="18" :stroke-width="1.8" /></div>
            <h2>Identité</h2>
          </div>
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
          <div class="card-header">
            <div class="section-icon si-amber"><GraduationCap :size="18" :stroke-width="1.8" /></div>
            <h2>Scolarité</h2>
          </div>
          <div class="info-grid">
            <div class="info-item"><span class="label">École</span><span class="value">{{ child.school || '-' }}</span></div>
            <div class="info-item"><span class="label">Classe</span><span class="value">{{ child.currentGrade || '-' }}</span></div>
            <div class="info-item"><span class="label">Fréquence</span><span class="value">{{ child.attendanceFrequency || '-' }}</span></div>
            <div class="info-item"><span class="label">Besoins</span><span class="value">{{ child.educationalNeeds || '-' }}</span></div>
          </div>
        </section>

        <!-- Santé -->
        <section class="card">
          <div class="card-header">
            <div class="section-icon si-rose"><Heart :size="18" :stroke-width="1.8" /></div>
            <h2>Santé</h2>
          </div>
          <div class="info-grid">
            <div class="info-item"><span class="label">État général</span><span class="value">{{ child.generalHealth || '-' }}</span></div>
            <div class="info-item"><span class="label">Vaccinations à jour</span><span class="value">{{ child.vaccinationsUpToDate ? 'Oui' : 'Non' }}</span></div>
            <div class="info-item"><span class="label">Problèmes</span><span class="value">{{ child.healthIssues || '-' }}</span></div>
          </div>
        </section>

        <!-- Conditions de vie -->
        <section class="card">
          <div class="card-header">
            <div class="section-icon si-emerald"><Home :size="18" :stroke-width="1.8" /></div>
            <h2>Conditions de vie</h2>
          </div>
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
          <div class="card-header">
            <div class="section-icon si-violet"><Handshake :size="18" :stroke-width="1.8" /></div>
            <h2>Parrainage</h2>
          </div>
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
          <div class="card-header">
            <div class="section-icon si-blue"><FileText :size="18" :stroke-width="1.8" /></div>
            <h2>Documents</h2>
          </div>
          <div class="docs-list">
            <a
              v-for="doc in child.documents"
              :key="doc.id"
              :href="downloadUrl(doc.id)"
              target="_blank"
              class="doc-item"
            >
              <div class="doc-icon-wrapper">
                <Paperclip :size="16" :stroke-width="2" />
              </div>
              <div class="doc-info">
                <span class="doc-type">{{ docTypeLabel(doc.type) }}</span>
                <span class="doc-name">{{ doc.fileName }}</span>
              </div>
            </a>
          </div>
        </section>

        <!-- Enquêtes -->
        <section v-if="child.surveys?.length" class="card">
          <div class="card-header">
            <div class="section-icon"><ClipboardList :size="18" :stroke-width="1.8" /></div>
            <h2>Enquêtes</h2>
          </div>
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
  background: linear-gradient(135deg, var(--primary), var(--primary-400));
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
  border: 1px solid var(--border-light);
}
.card-header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1.15rem;
}
.section-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--primary-50);
  color: var(--primary-600);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.si-amber { background: #fef3c7; color: #b45309; }
.si-rose { background: #ffe4e6; color: #e11d48; }
.si-emerald { background: #d1fae5; color: #047857; }
.si-violet { background: #ede9fe; color: #7c3aed; }
.si-blue { background: #dbeafe; color: #2563eb; }
.card-header h2 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
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
  transition: all var(--transition);
  border: 1px solid transparent;
}
.doc-item:hover {
  background: var(--primary-50);
  border-color: var(--primary-200);
}
.doc-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--primary-100);
  color: var(--primary-600);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.doc-info { display: flex; flex-direction: column; }
.doc-type { font-weight: 600; font-size: 0.85rem; color: var(--text); }
.doc-name { color: var(--text-muted); font-size: 0.8rem; }

.survey-item { padding: 0.65rem 0; border-bottom: 1px solid var(--border-light); font-size: 0.9rem; }
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
