<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { childrenService } from '@/services/children.service'
import { useLocalStorage } from '@/composables/useLocalStorage'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppModal from '@/components/common/AppModal.vue'
import type { DuplicateWarning } from '@/types/child'
import { Check, User, GraduationCap, Heart, Home, Handshake, FileText, Upload, ChevronLeft, ChevronRight } from 'lucide-vue-next'

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
const stepIcons = [User, GraduationCap, Heart, Home, Handshake, FileText]

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
      <template v-for="i in totalSteps" :key="i">
        <div
          class="step-item"
          :class="{ active: step === i, completed: step > i }"
          @click="step = i"
        >
          <span class="step-number">
            <Check v-if="step > i" :size="14" :stroke-width="3" />
            <component v-else :is="stepIcons[i - 1]" :size="14" :stroke-width="2" />
          </span>
          <span class="step-label">{{ stepTitles[i - 1] }}</span>
        </div>
        <div v-if="i < totalSteps" class="step-connector" :class="{ filled: step > i }"></div>
      </template>
    </div>

    <form @submit.prevent="submit()" class="form-card">
      <!-- Étape 1 : Identité -->
      <div v-show="step === 1" class="form-step">
        <div class="step-header">
          <div class="step-header-icon"><User :size="20" :stroke-width="1.8" /></div>
          <h2>Identité de l'enfant</h2>
        </div>
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
        <div class="step-header">
          <div class="step-header-icon shi-amber"><GraduationCap :size="20" :stroke-width="1.8" /></div>
          <h2>Situation scolaire</h2>
        </div>
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
        <div class="step-header">
          <div class="step-header-icon shi-rose"><Heart :size="20" :stroke-width="1.8" /></div>
          <h2>Situation sanitaire</h2>
        </div>
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
        <div class="step-header">
          <div class="step-header-icon shi-emerald"><Home :size="20" :stroke-width="1.8" /></div>
          <h2>Conditions de vie</h2>
        </div>
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
        <div class="step-header">
          <div class="step-header-icon shi-violet"><Handshake :size="20" :stroke-width="1.8" /></div>
          <h2>Parrainage</h2>
        </div>
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
        <div class="step-header">
          <div class="step-header-icon shi-blue"><FileText :size="20" :stroke-width="1.8" /></div>
          <h2>Documents et informations de l'enquête</h2>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Photo récente de l'enfant</label>
            <div class="file-drop-zone" @click="($refs.photoInput as HTMLInputElement)?.click()">
              <Upload :size="24" :stroke-width="1.5" class="upload-icon" />
              <span class="file-label">{{ photo ? photo.name : 'Choisir un fichier' }}</span>
              <span class="file-hint">Image uniquement</span>
              <input ref="photoInput" type="file" accept="image/*" @change="onFileChange('photo', $event)" class="file-hidden" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Acte de naissance</label>
            <div class="file-drop-zone" @click="($refs.birthInput as HTMLInputElement)?.click()">
              <Upload :size="24" :stroke-width="1.5" class="upload-icon" />
              <span class="file-label">{{ birthCertificate ? birthCertificate.name : 'Choisir un fichier' }}</span>
              <span class="file-hint">Image ou PDF</span>
              <input ref="birthInput" type="file" accept="image/*,.pdf" @change="onFileChange('birthCertificate', $event)" class="file-hidden" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Certificat de scolarité</label>
            <div class="file-drop-zone" @click="($refs.schoolInput as HTMLInputElement)?.click()">
              <Upload :size="24" :stroke-width="1.5" class="upload-icon" />
              <span class="file-label">{{ schoolCertificate ? schoolCertificate.name : 'Choisir un fichier' }}</span>
              <span class="file-hint">Image ou PDF</span>
              <input ref="schoolInput" type="file" accept="image/*,.pdf" @change="onFileChange('schoolCertificate', $event)" class="file-hidden" />
            </div>
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
          <template #icon><ChevronLeft :size="16" :stroke-width="2" /></template>
          Précédent
        </AppButton>
        <div class="spacer"></div>
        <AppButton v-if="step < totalSteps" type="button" :disabled="!canGoNext" @click="nextStep">
          Suivant
          <ChevronRight :size="16" :stroke-width="2" />
        </AppButton>
        <AppButton v-if="step === totalSteps" :loading="loading" type="submit">
          <template #icon><Check :size="16" :stroke-width="2.5" /></template>
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
  align-items: center;
  gap: 0;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.step-connector {
  flex: 0 0 20px;
  height: 2px;
  background: var(--border);
  transition: background var(--transition);
}
.step-connector.filled {
  background: var(--success);
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
  transition: all var(--transition);
  font-weight: 500;
}

.step-item.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
}
.step-item.completed {
  background: var(--success-light);
  color: #047857;
  border-color: #a7f3d0;
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
  border: 1px solid var(--border-light);
}

.step-header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
}
.step-header-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--primary-50);
  color: var(--primary-600);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.shi-amber { background: #fef3c7; color: #b45309; }
.shi-rose { background: #ffe4e6; color: #e11d48; }
.shi-emerald { background: #d1fae5; color: #047857; }
.shi-violet { background: #ede9fe; color: #7c3aed; }
.shi-blue { background: #dbeafe; color: #2563eb; }

.form-step h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
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

.form-select, .form-textarea {
  padding: 0.55rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--text);
  background: white;
  transition: all var(--transition);
}
.form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08);
}

.form-textarea { resize: vertical; }

/* File upload drop zone */
.file-drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 1.25rem;
  border: 2px dashed var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  cursor: pointer;
  transition: all var(--transition);
  text-align: center;
}
.file-drop-zone:hover {
  border-color: var(--primary-300);
  background: var(--primary-50);
}
.upload-icon {
  color: var(--text-muted);
}
.file-drop-zone:hover .upload-icon {
  color: var(--primary);
}
.file-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}
.file-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.file-hidden {
  display: none;
}

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
  .stepper { gap: 0; }
  .step-label { display: none; }
  .step-connector { flex: 0 0 12px; }
  .form-grid { grid-template-columns: 1fr; }
  .form-card { padding: 1.25rem; }
  .page-title h1 { font-size: 1.3rem; }
}
</style>
