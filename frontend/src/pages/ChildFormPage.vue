<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { childrenService } from '@/services/children.service'
import { useLocalStorage } from '@/composables/useLocalStorage'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppModal from '@/components/common/AppModal.vue'
import type { DuplicateWarning } from '@/types/child'

const router = useRouter()

const defaultForm = {
  firstName: '',
  lastName: '',
  gender: 'MALE',
  dateOfBirth: '',
  approximateAge: '',
  placeOfBirth: '',
  village: '',
  nationality: 'Béninoise',
  familyStatus: '',
  siblingsCount: '0',
  school: '',
  currentGrade: '',
  attendanceFrequency: '',
  educationalNeeds: '',
  generalHealth: '',
  vaccinationsUpToDate: 'false',
  healthIssues: '',
  housingType: '',
  accessToWater: 'false',
  accessToElectricity: 'false',
  sufficientFood: 'false',
  guardianActivity: '',
  wantsSponsorship: 'false',
  guardianConsent: 'false',
  sponsorshipComments: '',
  volunteerName: '',
  volunteerPhone: '',
  surveyDate: new Date().toISOString().split('T')[0],
}

const { data: form, clear: clearForm } = useLocalStorage('child-form', defaultForm)

const photo = ref<File | null>(null)
const birthCertificate = ref<File | null>(null)
const schoolCertificate = ref<File | null>(null)

const loading = ref(false)
const error = ref('')
const step = ref(1)
const totalSteps = 6
const duplicateWarning = ref<DuplicateWarning | null>(null)

const stepTitles = ['Identité', 'Scolarité', 'Santé', 'Conditions de vie', 'Parrainage', 'Documents & Enquête']

const canGoNext = computed(() => {
  if (step.value === 1) {
    return form.value.firstName && form.value.lastName && form.value.village
  }
  return true
})

function nextStep() {
  if (step.value < totalSteps) step.value++
}

function prevStep() {
  if (step.value > 1) step.value--
}

function onFileChange(field: 'photo' | 'birthCertificate' | 'schoolCertificate', event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.[0]) {
    if (field === 'photo') photo.value = input.files[0]
    else if (field === 'birthCertificate') birthCertificate.value = input.files[0]
    else schoolCertificate.value = input.files[0]
  }
}

async function submit(forceCreate = false) {
  error.value = ''
  loading.value = true

  try {
    const formData = new FormData()

    Object.entries(form.value).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        formData.append(key, String(value))
      }
    })

    if (forceCreate) formData.append('forceCreate', 'true')
    if (photo.value) formData.append('photo', photo.value)
    if (birthCertificate.value) formData.append('birthCertificate', birthCertificate.value)
    if (schoolCertificate.value) formData.append('schoolCertificate', schoolCertificate.value)

    const response = await childrenService.create(formData)

    if (response.data.confirmationRequired) {
      duplicateWarning.value = response.data
      return
    }

    clearForm()
    router.push(`/children/${response.data.id}`)
  } catch (e: any) {
    error.value = e.response?.data?.message || "Erreur lors de l'enregistrement"
  } finally {
    loading.value = false
  }
}

async function confirmCreate() {
  duplicateWarning.value = null
  await submit(true)
}
</script>

<template>
  <div class="child-form-page">
    <div class="page-title">
      <h1>Enregistrer un enfant bénéficiaire</h1>
      <p class="subtitle">Remplissez les informations étape par étape</p>
    </div>

    <!-- Stepper -->
    <div class="stepper">
      <div
        v-for="i in totalSteps"
        :key="i"
        class="step-item"
        :class="{ active: step === i, completed: step > i }"
        @click="step = i"
      >
        <span class="step-number">{{ step > i ? '✓' : i }}</span>
        <span class="step-label">{{ stepTitles[i - 1] }}</span>
      </div>
    </div>

    <form @submit.prevent="submit()" class="form-card">
      <!-- Étape 1 : Identité -->
      <div v-show="step === 1" class="form-step">
        <h2>Identité de l'enfant</h2>
        <div class="form-grid">
          <AppInput v-model="form.lastName" label="Nom" required />
          <AppInput v-model="form.firstName" label="Prénom(s)" required />
          <div class="form-group">
            <label class="form-label">Sexe *</label>
            <select v-model="form.gender" class="form-select">
              <option value="MALE">Masculin</option>
              <option value="FEMALE">Féminin</option>
            </select>
          </div>
          <AppInput v-model="form.dateOfBirth" label="Date de naissance" type="date" />
          <AppInput v-model="form.approximateAge" label="Âge approximatif" type="number" />
          <AppInput v-model="form.placeOfBirth" label="Lieu de naissance" />
          <AppInput v-model="form.village" label="Village de résidence" required />
          <AppInput v-model="form.nationality" label="Nationalité" />
          <AppInput v-model="form.familyStatus" label="Statut familial" />
          <AppInput v-model="form.siblingsCount" label="Frères et soeurs à charge" type="number" />
        </div>
      </div>

      <!-- Étape 2 : Scolarité -->
      <div v-show="step === 2" class="form-step">
        <h2>Situation scolaire</h2>
        <div class="form-grid">
          <AppInput v-model="form.school" label="École fréquentée" />
          <AppInput v-model="form.currentGrade" label="Niveau / Classe actuelle" />
          <AppInput v-model="form.attendanceFrequency" label="Fréquence de présence" />
          <div class="form-group full-width">
            <label class="form-label">Besoins scolaires identifiés</label>
            <textarea v-model="form.educationalNeeds" class="form-textarea" rows="3"></textarea>
          </div>
        </div>
      </div>

      <!-- Étape 3 : Santé -->
      <div v-show="step === 3" class="form-step">
        <h2>Situation sanitaire</h2>
        <div class="form-grid">
          <AppInput v-model="form.generalHealth" label="État de santé général" />
          <div class="form-group">
            <label class="form-label">Vaccinations principales à jour ?</label>
            <select v-model="form.vaccinationsUpToDate" class="form-select">
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          </div>
          <div class="form-group full-width">
            <label class="form-label">Problèmes de santé spécifiques (facultatif)</label>
            <textarea v-model="form.healthIssues" class="form-textarea" rows="3"></textarea>
          </div>
        </div>
      </div>

      <!-- Étape 4 : Conditions de vie -->
      <div v-show="step === 4" class="form-step">
        <h2>Conditions de vie</h2>
        <div class="form-grid">
          <AppInput v-model="form.housingType" label="Type de logement" />
          <div class="form-group">
            <label class="form-label">Accès à l'eau potable ?</label>
            <select v-model="form.accessToWater" class="form-select">
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Accès à l'électricité ?</label>
            <select v-model="form.accessToElectricity" class="form-select">
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Alimentation suffisante ?</label>
            <select v-model="form.sufficientFood" class="form-select">
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          </div>
          <AppInput v-model="form.guardianActivity" label="Activité de la personne en charge" />
        </div>
      </div>

      <!-- Étape 5 : Parrainage -->
      <div v-show="step === 5" class="form-step">
        <h2>Parrainage</h2>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Souhaite être inscrit(e) au programme ?</label>
            <select v-model="form.wantsSponsorship" class="form-select">
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Consentement du responsable ?</label>
            <select v-model="form.guardianConsent" class="form-select">
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          </div>
          <div class="form-group full-width">
            <label class="form-label">Commentaires / Besoins spécifiques</label>
            <textarea v-model="form.sponsorshipComments" class="form-textarea" rows="3"></textarea>
          </div>
        </div>
      </div>

      <!-- Étape 6 : Documents & Enquête -->
      <div v-show="step === 6" class="form-step">
        <h2>Documents et informations de l'enquête</h2>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Photo récente de l'enfant</label>
            <input type="file" accept="image/*" @change="onFileChange('photo', $event)" class="form-file" />
          </div>
          <div class="form-group">
            <label class="form-label">Acte de naissance</label>
            <input type="file" accept="image/*,.pdf" @change="onFileChange('birthCertificate', $event)" class="form-file" />
          </div>
          <div class="form-group">
            <label class="form-label">Certificat de scolarité</label>
            <input type="file" accept="image/*,.pdf" @change="onFileChange('schoolCertificate', $event)" class="form-file" />
          </div>
          <AppInput v-model="form.volunteerName" label="Nom du volontaire" required />
          <AppInput v-model="form.volunteerPhone" label="Contact (Téléphone/WhatsApp)" required />
          <AppInput v-model="form.surveyDate" label="Date de l'enquête" type="date" required />
        </div>
      </div>

      <!-- Navigation -->
      <p v-if="error" class="error-text">{{ error }}</p>

      <div class="form-actions">
        <AppButton v-if="step > 1" variant="secondary" type="button" @click="prevStep">
          Précédent
        </AppButton>
        <div class="spacer"></div>
        <AppButton v-if="step < totalSteps" type="button" :disabled="!canGoNext" @click="nextStep">
          Suivant
        </AppButton>
        <AppButton v-if="step === totalSteps" :loading="loading" type="submit">
          Enregistrer
        </AppButton>
      </div>
    </form>

    <!-- Modal doublon -->
    <AppModal v-if="duplicateWarning" title="Doublon potentiel détecté" @close="duplicateWarning = null">
      <p>Les enfants suivants ressemblent à celui que vous enregistrez :</p>
      <ul class="duplicate-list">
        <li v-for="d in duplicateWarning.duplicates" :key="d.id">
          <strong>{{ d.firstName }} {{ d.lastName }}</strong> — {{ d.village }} ({{ d.reference }})
        </li>
      </ul>
      <p>Voulez-vous quand même créer ce dossier ?</p>
      <template #footer>
        <AppButton variant="secondary" @click="duplicateWarning = null">Annuler</AppButton>
        <AppButton @click="confirmCreate" :loading="loading">Confirmer la création</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.page-title { margin-bottom: 1.5rem; }
.page-title h1 { font-size: 1.6rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin-bottom: 0.15rem; }
.subtitle { color: var(--text-muted); font-size: 0.9rem; }

.stepper {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  background: var(--bg);
  color: var(--text-muted);
  white-space: nowrap;
  border: 1px solid var(--border);
  transition: all 0.2s;
  font-weight: 500;
}

.step-item.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);
}
.step-item.completed {
  background: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

.step-number {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.3);
}

.form-card {
  background: var(--bg-card);
  padding: 1.75rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.form-step h2 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: var(--text);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.full-width { grid-column: 1 / -1; }

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}

.form-select, .form-textarea, .form-file {
  padding: 0.55rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--text);
  background: white;
  transition: all 0.2s;
}
.form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-textarea { resize: vertical; }

.form-actions {
  display: flex;
  align-items: center;
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border);
}

.spacer { flex: 1; }

.error-text {
  color: var(--danger);
  font-size: 0.875rem;
  margin-top: 1rem;
}

.duplicate-list {
  margin: 0.75rem 0;
  padding-left: 1.25rem;
}

.duplicate-list li { margin-bottom: 0.25rem; }

@media (max-width: 768px) {
  .stepper { gap: 0.35rem; }
  .step-label { display: none; }
  .form-grid { grid-template-columns: 1fr; }
  .form-card { padding: 1.25rem; }
  .page-title h1 { font-size: 1.3rem; }
}
</style>
