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
    <div v-if="loading" class="loading">Chargement...</div>

    <template v-else-if="child">
      <div class="page-header">
        <div>
          <h1>{{ child.firstName }} {{ child.lastName }}</h1>
          <p class="reference">{{ child.reference }}</p>
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
            <div><span class="label">Sexe</span><span>{{ child.gender === 'MALE' ? 'Masculin' : 'Féminin' }}</span></div>
            <div><span class="label">Date de naissance</span><span>{{ child.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString('fr-FR') : '-' }}</span></div>
            <div><span class="label">Âge approximatif</span><span>{{ child.approximateAge ?? '-' }}</span></div>
            <div><span class="label">Lieu de naissance</span><span>{{ child.placeOfBirth || '-' }}</span></div>
            <div><span class="label">Village</span><span>{{ child.village }}</span></div>
            <div><span class="label">Nationalité</span><span>{{ child.nationality }}</span></div>
            <div><span class="label">Statut familial</span><span>{{ child.familyStatus || '-' }}</span></div>
            <div><span class="label">Frères/soeurs</span><span>{{ child.siblingsCount }}</span></div>
          </div>
        </section>

        <!-- Scolarité -->
        <section class="card">
          <h2>Scolarité</h2>
          <div class="info-grid">
            <div><span class="label">École</span><span>{{ child.school || '-' }}</span></div>
            <div><span class="label">Classe</span><span>{{ child.currentGrade || '-' }}</span></div>
            <div><span class="label">Fréquence</span><span>{{ child.attendanceFrequency || '-' }}</span></div>
            <div><span class="label">Besoins</span><span>{{ child.educationalNeeds || '-' }}</span></div>
          </div>
        </section>

        <!-- Santé -->
        <section class="card">
          <h2>Santé</h2>
          <div class="info-grid">
            <div><span class="label">État général</span><span>{{ child.generalHealth || '-' }}</span></div>
            <div><span class="label">Vaccinations à jour</span><span>{{ child.vaccinationsUpToDate ? 'Oui' : 'Non' }}</span></div>
            <div><span class="label">Problèmes</span><span>{{ child.healthIssues || '-' }}</span></div>
          </div>
        </section>

        <!-- Conditions de vie -->
        <section class="card">
          <h2>Conditions de vie</h2>
          <div class="info-grid">
            <div><span class="label">Logement</span><span>{{ child.housingType || '-' }}</span></div>
            <div><span class="label">Eau potable</span><span>{{ child.accessToWater ? 'Oui' : 'Non' }}</span></div>
            <div><span class="label">Électricité</span><span>{{ child.accessToElectricity ? 'Oui' : 'Non' }}</span></div>
            <div><span class="label">Alimentation</span><span>{{ child.sufficientFood ? 'Oui' : 'Non' }}</span></div>
            <div><span class="label">Activité du responsable</span><span>{{ child.guardianActivity || '-' }}</span></div>
          </div>
        </section>

        <!-- Parrainage -->
        <section class="card">
          <h2>Parrainage</h2>
          <div class="info-grid">
            <div><span class="label">Souhaite le parrainage</span><span>{{ child.wantsSponsorship ? 'Oui' : 'Non' }}</span></div>
            <div><span class="label">Consentement</span><span>{{ child.guardianConsent ? 'Oui' : 'Non' }}</span></div>
            <div><span class="label">Statut</span><span class="badge" :class="`badge-${child.sponsorshipStatus.toLowerCase()}`">{{ statusLabel(child.sponsorshipStatus) }}</span></div>
            <div><span class="label">Commentaires</span><span>{{ child.sponsorshipComments || '-' }}</span></div>
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
              <span class="doc-type">{{ docTypeLabel(doc.type) }}</span>
              <span class="doc-name">{{ doc.fileName }}</span>
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
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.5rem; margin: 0; }
.reference { color: #6b7280; font-size: 0.875rem; margin: 0.25rem 0 0; }
.header-actions { display: flex; gap: 0.5rem; }

.sections { display: flex; flex-direction: column; gap: 1rem; }

.card {
  background: white;
  padding: 1.25rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.card h2 { font-size: 1rem; margin: 0 0 0.75rem; color: #1a56db; }

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}
.info-grid > div { display: flex; flex-direction: column; }
.label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }

.badge { padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 500; }
.badge-pending { background: #fef3c7; color: #92400e; }
.badge-sponsored { background: #dcfce7; color: #166534; }
.badge-not_eligible { background: #fee2e2; color: #991b1b; }

.docs-list { display: flex; flex-direction: column; gap: 0.5rem; }
.doc-item {
  display: flex; gap: 0.75rem; padding: 0.5rem; background: #f9fafb;
  border-radius: 6px; text-decoration: none; color: inherit;
}
.doc-item:hover { background: #f3f4f6; }
.doc-type { font-weight: 500; font-size: 0.875rem; }
.doc-name { color: #6b7280; font-size: 0.875rem; }

.survey-item { padding: 0.5rem 0; border-bottom: 1px solid #f3f4f6; }
.loading { text-align: center; padding: 3rem; color: #6b7280; }
</style>
