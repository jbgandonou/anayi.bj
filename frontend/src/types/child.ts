export interface Child {
  id: string
  reference: string
  firstName: string
  lastName: string
  gender: 'MALE' | 'FEMALE'
  dateOfBirth: string | null
  approximateAge: number | null
  placeOfBirth: string | null
  village: string
  nationality: string
  familyStatus: string | null
  siblingsCount: number
  school: string | null
  currentGrade: string | null
  attendanceFrequency: string | null
  educationalNeeds: string | null
  generalHealth: string | null
  vaccinationsUpToDate: boolean
  healthIssues: string | null
  housingType: string | null
  accessToWater: boolean
  accessToElectricity: boolean
  sufficientFood: boolean
  guardianActivity: string | null
  wantsSponsorship: boolean
  guardianConsent: boolean
  sponsorshipComments: string | null
  sponsorshipStatus: 'PENDING' | 'SPONSORED' | 'NOT_ELIGIBLE'
  sponsorshipStatusDate: string | null
  photoUrl: string | null
  documents?: DocumentInfo[]
  surveys?: SurveyInfo[]
  createdAt: string
  updatedAt: string
}

export interface ChildListItem {
  id: string
  reference: string
  firstName: string
  lastName: string
  gender: 'MALE' | 'FEMALE'
  village: string
  school: string | null
  sponsorshipStatus: 'PENDING' | 'SPONSORED' | 'NOT_ELIGIBLE'
  photoUrl: string | null
  createdAt: string
}

export interface DocumentInfo {
  id: string
  type: 'BIRTH_CERTIFICATE' | 'SCHOOL_CERTIFICATE' | 'RECENT_PHOTO' | 'OTHER'
  fileName: string
  mimeType: string
  fileSize: number
  uploadedAt: string
}

export interface SurveyInfo {
  id: string
  volunteerName: string
  volunteerPhone: string
  surveyDate: string
}

export interface DuplicateWarning {
  warning: string
  duplicates: Array<{
    id: string
    reference: string
    firstName: string
    lastName: string
    village: string
  }>
  confirmationRequired: boolean
}
