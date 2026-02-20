<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { childrenService } from '@/services/children.service'
import { useLocalStorage } from '@/composables/useLocalStorage'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppModal from '@/components/common/AppModal.vue'
import type { DuplicateWarning } from '@/types/child'
import {
  Check, User, GraduationCap, Heart, Home, Handshake, FileText,
  Upload, ChevronLeft, ChevronRight, UserPlus, CheckCircle, XCircle,
  Camera, X, Save
} from 'lucide-vue-next'

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

const stepTitles = ['Identité', 'Scolarité', 'Santé', 'Conditions de vie', 'Parrainage', 'Documents']
const stepIcons = [User, GraduationCap, Heart, Home, Handshake, FileText]
const stepSubtitles = [
  'Informations personnelles de l\'enfant',
  'Parcours et besoins scolaires',
  'État de santé et vaccinations',
  'Logement, accès aux ressources',
  'Inscription au programme',
  'Photos, actes et enquête'
]

const progressPercent = computed(() => ((step.value - 1) / (totalSteps - 1)) * 100)

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

function removeFile(field: 'photo' | 'birthCertificate' | 'schoolCertificate') {
  if (field === 'photo') photo.value = null
  else if (field === 'birthCertificate') birthCertificate.value = null
  else schoolCertificate.value = null
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' o'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko'
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo'
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
    <!-- Header enrichi -->
    <div class="page-header">
      <div class="page-header-top">
        <div class="page-header-title">
          <div class="page-header-icon">
            <UserPlus :size="22" :stroke-width="1.8" />
          </div>
          <div>
            <h1>Enregistrer un enfant bénéficiaire</h1>
            <p class="subtitle">Étape {{ step }} sur {{ totalSteps }} — {{ stepTitles[step - 1] }}</p>
          </div>
        </div>
        <div class="autosave-badge">
          <Save :size="13" :stroke-width="2" />
          Sauvegarde auto
        </div>
      </div>
      <div class="progress-bar-track">
        <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>

    <!-- Stepper redesigné -->
    <div class="stepper">
      <template v-for="i in totalSteps" :key="i">
        <div class="stepper-step" :class="{ active: step === i, completed: step > i }" @click="step = i">
          <div class="stepper-circle">
            <Check v-if="step > i" :size="15" :stroke-width="3" />
            <span v-else>{{ i }}</span>
          </div>
          <span class="stepper-label">{{ stepTitles[i - 1] }}</span>
        </div>
        <div v-if="i < totalSteps" class="stepper-line" :class="{ filled: step > i }"></div>
      </template>
    </div>

    <form @submit.prevent="submit()" class="form-card">
      <!-- Étape 1 : Identité -->
      <div v-show="step === 1" class="form-step fade-step">
        <div class="section-block section-indigo">
          <div class="step-header">
            <div class="step-header-icon"><User :size="20" :stroke-width="1.8" /></div>
            <div>
              <h2>Identité de l'enfant</h2>
              <p class="step-subtitle">{{ stepSubtitles[0] }}</p>
            </div>
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
      </div>

      <!-- Étape 2 : Scolarité -->
      <div v-show="step === 2" class="form-step fade-step">
        <div class="section-block section-amber">
          <div class="step-header">
            <div class="step-header-icon shi-amber"><GraduationCap :size="20" :stroke-width="1.8" /></div>
            <div>
              <h2>Situation scolaire</h2>
              <p class="step-subtitle">{{ stepSubtitles[1] }}</p>
            </div>
          </div>
          <div class="form-grid">
            <AppInput v-model="form.school" label="École fréquentée" />
            <AppInput v-model="form.currentGrade" label="Niveau / Classe actuelle" />
            <AppInput v-model="form.attendanceFrequency" label="Fréquence de présence" />
            <div class="form-group full-width">
              <label class="form-label">Besoins scolaires identifiés</label>
              <textarea v-model="form.educationalNeeds" class="form-textarea" rows="3" placeholder="Décrivez les besoins scolaires identifiés..."></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Étape 3 : Santé -->
      <div v-show="step === 3" class="form-step fade-step">
        <div class="section-block section-rose">
          <div class="step-header">
            <div class="step-header-icon shi-rose"><Heart :size="20" :stroke-width="1.8" /></div>
            <div>
              <h2>Situation sanitaire</h2>
              <p class="step-subtitle">{{ stepSubtitles[2] }}</p>
            </div>
          </div>
          <div class="form-grid">
            <AppInput v-model="form.generalHealth" label="État de santé général" />
            <div class="form-group">
              <label class="form-label">Vaccinations principales à jour ?</label>
              <div class="toggle-cards">
                <button type="button" class="toggle-card" :class="{ 'toggle-yes': form.vaccinationsUpToDate === 'true' }" @click="form.vaccinationsUpToDate = 'true'">
                  <CheckCircle :size="18" :stroke-width="2" />
                  Oui
                </button>
                <button type="button" class="toggle-card" :class="{ 'toggle-no': form.vaccinationsUpToDate === 'false' }" @click="form.vaccinationsUpToDate = 'false'">
                  <XCircle :size="18" :stroke-width="2" />
                  Non
                </button>
              </div>
            </div>
            <div class="form-group full-width">
              <label class="form-label">Problèmes de santé spécifiques (facultatif)</label>
              <textarea v-model="form.healthIssues" class="form-textarea" rows="3" placeholder="Décrivez les problèmes de santé éventuels..."></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Étape 4 : Conditions de vie -->
      <div v-show="step === 4" class="form-step fade-step">
        <div class="section-block section-emerald">
          <div class="step-header">
            <div class="step-header-icon shi-emerald"><Home :size="20" :stroke-width="1.8" /></div>
            <div>
              <h2>Conditions de vie</h2>
              <p class="step-subtitle">{{ stepSubtitles[3] }}</p>
            </div>
          </div>
          <div class="form-grid">
            <AppInput v-model="form.housingType" label="Type de logement" />
            <div class="form-group">
              <label class="form-label">Accès à l'eau potable ?</label>
              <div class="toggle-cards">
                <button type="button" class="toggle-card" :class="{ 'toggle-yes': form.accessToWater === 'true' }" @click="form.accessToWater = 'true'">
                  <CheckCircle :size="18" :stroke-width="2" />
                  Oui
                </button>
                <button type="button" class="toggle-card" :class="{ 'toggle-no': form.accessToWater === 'false' }" @click="form.accessToWater = 'false'">
                  <XCircle :size="18" :stroke-width="2" />
                  Non
                </button>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Accès à l'électricité ?</label>
              <div class="toggle-cards">
                <button type="button" class="toggle-card" :class="{ 'toggle-yes': form.accessToElectricity === 'true' }" @click="form.accessToElectricity = 'true'">
                  <CheckCircle :size="18" :stroke-width="2" />
                  Oui
                </button>
                <button type="button" class="toggle-card" :class="{ 'toggle-no': form.accessToElectricity === 'false' }" @click="form.accessToElectricity = 'false'">
                  <XCircle :size="18" :stroke-width="2" />
                  Non
                </button>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Alimentation suffisante ?</label>
              <div class="toggle-cards">
                <button type="button" class="toggle-card" :class="{ 'toggle-yes': form.sufficientFood === 'true' }" @click="form.sufficientFood = 'true'">
                  <CheckCircle :size="18" :stroke-width="2" />
                  Oui
                </button>
                <button type="button" class="toggle-card" :class="{ 'toggle-no': form.sufficientFood === 'false' }" @click="form.sufficientFood = 'false'">
                  <XCircle :size="18" :stroke-width="2" />
                  Non
                </button>
              </div>
            </div>
            <AppInput v-model="form.guardianActivity" label="Activité de la personne en charge" />
          </div>
        </div>
      </div>

      <!-- Étape 5 : Parrainage -->
      <div v-show="step === 5" class="form-step fade-step">
        <div class="section-block section-violet">
          <div class="step-header">
            <div class="step-header-icon shi-violet"><Handshake :size="20" :stroke-width="1.8" /></div>
            <div>
              <h2>Parrainage</h2>
              <p class="step-subtitle">{{ stepSubtitles[4] }}</p>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Souhaite être inscrit(e) au programme ?</label>
              <div class="toggle-cards">
                <button type="button" class="toggle-card" :class="{ 'toggle-yes': form.wantsSponsorship === 'true' }" @click="form.wantsSponsorship = 'true'">
                  <CheckCircle :size="18" :stroke-width="2" />
                  Oui
                </button>
                <button type="button" class="toggle-card" :class="{ 'toggle-no': form.wantsSponsorship === 'false' }" @click="form.wantsSponsorship = 'false'">
                  <XCircle :size="18" :stroke-width="2" />
                  Non
                </button>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Consentement du responsable ?</label>
              <div class="toggle-cards">
                <button type="button" class="toggle-card" :class="{ 'toggle-yes': form.guardianConsent === 'true' }" @click="form.guardianConsent = 'true'">
                  <CheckCircle :size="18" :stroke-width="2" />
                  Oui
                </button>
                <button type="button" class="toggle-card" :class="{ 'toggle-no': form.guardianConsent === 'false' }" @click="form.guardianConsent = 'false'">
                  <XCircle :size="18" :stroke-width="2" />
                  Non
                </button>
              </div>
            </div>
            <div class="form-group full-width">
              <label class="form-label">Commentaires / Besoins spécifiques</label>
              <textarea v-model="form.sponsorshipComments" class="form-textarea" rows="3" placeholder="Précisez les besoins spécifiques ou commentaires..."></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Étape 6 : Documents & Enquête -->
      <div v-show="step === 6" class="form-step fade-step">
        <div class="section-block section-blue">
          <div class="step-header">
            <div class="step-header-icon shi-blue"><FileText :size="20" :stroke-width="1.8" /></div>
            <div>
              <h2>Documents et informations de l'enquête</h2>
              <p class="step-subtitle">{{ stepSubtitles[5] }}</p>
            </div>
          </div>
          <div class="form-grid">
            <!-- Photo upload -->
            <div class="form-group">
              <label class="form-label">Photo récente de l'enfant</label>
              <div v-if="!photo" class="file-drop-zone" @click="($refs.photoInput as HTMLInputElement)?.click()">
                <Camera :size="28" :stroke-width="1.5" class="upload-icon" />
                <span class="file-drop-text">Glisser-déposer ou cliquer pour sélectionner</span>
                <span class="file-hint">Image uniquement</span>
                <input ref="photoInput" type="file" accept="image/*" @change="onFileChange('photo', $event)" class="file-hidden" />
              </div>
              <div v-else class="file-selected">
                <Camera :size="18" :stroke-width="1.8" />
                <div class="file-selected-info">
                  <span class="file-selected-name">{{ photo.name }}</span>
                  <span class="file-selected-size">{{ formatFileSize(photo.size) }}</span>
                </div>
                <button type="button" class="file-remove" @click="removeFile('photo')">
                  <X :size="16" :stroke-width="2.5" />
                </button>
              </div>
            </div>

            <!-- Acte de naissance upload -->
            <div class="form-group">
              <label class="form-label">Acte de naissance</label>
              <div v-if="!birthCertificate" class="file-drop-zone" @click="($refs.birthInput as HTMLInputElement)?.click()">
                <FileText :size="28" :stroke-width="1.5" class="upload-icon" />
                <span class="file-drop-text">Glisser-déposer ou cliquer pour sélectionner</span>
                <span class="file-hint">Image ou PDF</span>
                <input ref="birthInput" type="file" accept="image/*,.pdf" @change="onFileChange('birthCertificate', $event)" class="file-hidden" />
              </div>
              <div v-else class="file-selected">
                <FileText :size="18" :stroke-width="1.8" />
                <div class="file-selected-info">
                  <span class="file-selected-name">{{ birthCertificate.name }}</span>
                  <span class="file-selected-size">{{ formatFileSize(birthCertificate.size) }}</span>
                </div>
                <button type="button" class="file-remove" @click="removeFile('birthCertificate')">
                  <X :size="16" :stroke-width="2.5" />
                </button>
              </div>
            </div>

            <!-- Certificat de scolarité upload -->
            <div class="form-group">
              <label class="form-label">Certificat de scolarité</label>
              <div v-if="!schoolCertificate" class="file-drop-zone" @click="($refs.schoolInput as HTMLInputElement)?.click()">
                <GraduationCap :size="28" :stroke-width="1.5" class="upload-icon" />
                <span class="file-drop-text">Glisser-déposer ou cliquer pour sélectionner</span>
                <span class="file-hint">Image ou PDF</span>
                <input ref="schoolInput" type="file" accept="image/*,.pdf" @change="onFileChange('schoolCertificate', $event)" class="file-hidden" />
              </div>
              <div v-else class="file-selected">
                <GraduationCap :size="18" :stroke-width="1.8" />
                <div class="file-selected-info">
                  <span class="file-selected-name">{{ schoolCertificate.name }}</span>
                  <span class="file-selected-size">{{ formatFileSize(schoolCertificate.size) }}</span>
                </div>
                <button type="button" class="file-remove" @click="removeFile('schoolCertificate')">
                  <X :size="16" :stroke-width="2.5" />
                </button>
              </div>
            </div>

            <AppInput v-model="form.volunteerName" label="Nom du volontaire" required />
            <AppInput v-model="form.volunteerPhone" label="Contact (Téléphone/WhatsApp)" required />
            <AppInput v-model="form.surveyDate" label="Date de l'enquête" type="date" required />
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <p v-if="error" class="error-text">{{ error }}</p>

      <div class="form-actions">
        <AppButton v-if="step > 1" variant="secondary" type="button" @click="prevStep">
          <template #icon><ChevronLeft :size="16" :stroke-width="2" /></template>
          Précédent
        </AppButton>
        <div class="spacer">
          <span class="nav-step-indicator">{{ step }} / {{ totalSteps }}</span>
        </div>
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
/* ========== Header ========== */
.page-header {
  margin-bottom: 1.75rem;
}

.page-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}

.page-header-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.page-header-title h1 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.02em;
  margin: 0 0 0.1rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 0;
}

.autosave-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  background: var(--bg);
  border: 1px solid var(--border-light);
  border-radius: 20px;
  padding: 0.3rem 0.7rem;
  white-space: nowrap;
}

.progress-bar-track {
  height: 3px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ========== Stepper ========== */
.stepper {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  margin-bottom: 1.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.stepper-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  min-width: 64px;
}

.stepper-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  background: var(--bg);
  color: var(--text-muted);
  border: 2px solid var(--border);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.stepper-step.active .stepper-circle {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15), 0 2px 8px rgba(79, 70, 229, 0.3);
}

.stepper-step.completed .stepper-circle {
  background: #059669;
  color: white;
  border-color: #059669;
}

.stepper-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  text-align: center;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.stepper-step.active .stepper-label {
  color: var(--primary);
}

.stepper-step.completed .stepper-label {
  color: #059669;
}

.stepper-line {
  flex: 1;
  height: 2px;
  background: var(--border);
  margin-top: 18px;
  min-width: 20px;
  max-width: 60px;
  transition: background 0.5s ease;
}

.stepper-line.filled {
  background: #059669;
}

/* ========== Form card ========== */
.form-card {
  background: var(--bg-card);
  padding: 2rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 1px solid var(--border-light);
}

/* ========== Section blocks with colored left border ========== */
.section-block {
  border-left: 4px solid var(--primary);
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
}

.section-indigo { border-left-color: #6366f1; }
.section-amber { border-left-color: #f59e0b; }
.section-rose { border-left-color: #f43f5e; }
.section-emerald { border-left-color: #10b981; }
.section-violet { border-left-color: #8b5cf6; }
.section-blue { border-left-color: #3b82f6; }

/* ========== Step header ========== */
.step-header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1.5rem;
}

.step-header-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
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

.step-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0.1rem 0 0;
}

/* ========== Form grid ========== */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.15rem;
}

.full-width { grid-column: 1 / -1; }

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}

.form-select,
.form-textarea {
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--text);
  background: white;
  transition: all 0.2s ease;
  appearance: none;
}

.form-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.25rem;
}

.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* ========== Toggle cards (Oui/Non) ========== */
.toggle-cards {
  display: flex;
  gap: 0.5rem;
}

.toggle-card {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 0.85rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  background: white;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-card:hover {
  border-color: var(--text-muted);
}

.toggle-card.toggle-yes {
  background: #ecfdf5;
  border-color: #10b981;
  color: #047857;
}

.toggle-card.toggle-no {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: #4b5563;
}

/* ========== File upload ========== */
.file-drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.75rem 1.25rem;
  border: 2px dashed var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  cursor: pointer;
  transition: all 0.25s ease;
  text-align: center;
}

.file-drop-zone:hover {
  border-color: var(--primary);
  background: var(--primary-50);
  border-style: dashed;
  animation: dash-move 0.6s linear;
}

.upload-icon {
  color: var(--text-muted);
  transition: color 0.25s ease;
}

.file-drop-zone:hover .upload-icon {
  color: var(--primary);
}

.file-drop-text {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text);
}

.file-hint {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.file-hidden {
  display: none;
}

/* File selected state */
.file-selected {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid #a7f3d0;
  border-radius: var(--radius-sm);
  background: #ecfdf5;
  color: #047857;
}

.file-selected-info {
  flex: 1;
  min-width: 0;
}

.file-selected-name {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #047857;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-selected-size {
  font-size: 0.72rem;
  color: #059669;
}

.file-remove {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(4, 120, 87, 0.1);
  color: #047857;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.file-remove:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* ========== Navigation ========== */
.form-actions {
  display: flex;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border);
  background: linear-gradient(to top, rgba(79, 70, 229, 0.02), transparent);
  border-radius: 0 0 var(--radius) var(--radius);
}

.spacer {
  flex: 1;
  text-align: center;
}

.nav-step-indicator {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg);
  padding: 0.25rem 0.65rem;
  border-radius: 12px;
  border: 1px solid var(--border-light);
}

.error-text {
  color: var(--danger);
  font-size: 0.875rem;
  margin-top: 1rem;
}

/* ========== Modal doublon ========== */
.duplicate-list {
  margin: 0.75rem 0;
  padding-left: 1.25rem;
}

.duplicate-list li { margin-bottom: 0.25rem; }

/* ========== Transitions ========== */
.fade-step {
  animation: fadeIn 0.35s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ========== Responsive ========== */
@media (max-width: 768px) {
  .stepper { justify-content: flex-start; }
  .stepper-label { display: none; }
  .stepper-line { min-width: 12px; }
  .stepper-circle { width: 32px; height: 32px; font-size: 0.8rem; }
  .stepper-line { margin-top: 16px; }
  .form-grid { grid-template-columns: 1fr; }
  .form-card { padding: 1.25rem; }
  .page-header-title h1 { font-size: 1.25rem; }
  .page-header-top { flex-direction: column; gap: 0.5rem; }
  .section-block { padding-left: 0.85rem; }
  .toggle-cards { flex-direction: row; }
}
</style>
