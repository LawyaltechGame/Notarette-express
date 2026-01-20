import { databases, ID } from '../lib/appwrite'
import { Query } from 'appwrite'
import { ENVObj } from '../lib/constant'

const TABLE_ID = ENVObj.VITE_FORM_SUBMISSIONS_TABLE_ID

export interface FormSubmission {
  $id?: string
  clientEmail: string
  fullName: string
  email: string
  documentTitle?: string
  documentType: 'personal' | 'corporate' | 'legal' | 'others'
  documentDescription?: string
  uploadedFiles: string // Single JSON string containing array of file objects
  additionalNotes?: string
  currentStep: 'form_submitted' | 'service_selected' | 'addons_selected' | 'checkout' | 'completed'
  serviceId?: string
  serviceSlug?: string
  selectedAddOns?: string // JSON string containing array of addon IDs
  selectedOptions?: string // JSON string containing array of option keys
  extraCopies?: number
  courierAddress?: string
  sessionId?: string
  orderId?: string
  totalAmountCents?: number
  currency?: string
  totalAmount?: number
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled'
  notarizationStatus?: 'started' | 'pending' | 'completed'
  meetingStatus?: 'started' | 'pending' | 'completed'
  createdAt: string
  updatedAt: string
}


export type UploadedFile = { fileId: string; name: string; size?: number; type?: string }

export const getUploadedFilesFromSubmission = (submissionOrValue: FormSubmission | string | any): UploadedFile[] => {
  try {
    if (!submissionOrValue) return []
    if (typeof submissionOrValue === 'string') return parseUploadedFiles(submissionOrValue) as UploadedFile[]
    if (submissionOrValue && typeof submissionOrValue === 'object') {
      // attempt various shapes
      if (Array.isArray(submissionOrValue.uploadedFiles)) return submissionOrValue.uploadedFiles as UploadedFile[]
      if (typeof submissionOrValue.uploadedFiles === 'string') return parseUploadedFiles(submissionOrValue.uploadedFiles) as UploadedFile[]
      // or it may be already the array
      return parseUploadedFiles(JSON.stringify(submissionOrValue)) as UploadedFile[]
    }
    return []
  } catch (err) {
    console.warn('getUploadedFilesFromSubmission error', err)
    return []
  }
}

// Helper functions to parse JSON strings back to arrays
export const parseUploadedFiles = (uploadedFiles: string) => {
  try {
    console.log('Raw uploadedFiles string:', uploadedFiles)
    
    const parsed = JSON.parse(uploadedFiles)
    console.log('First parse result:', parsed)
    
    // If it's an array, check if elements are JSON strings that need parsing
    if (Array.isArray(parsed)) {
      const result = parsed.map(item => {
        if (typeof item === 'string') {
          try {
            const parsedItem = JSON.parse(item)
            console.log('Parsed item:', parsedItem)
            return parsedItem
          } catch (parseError) {
            console.warn('Failed to parse item:', item, parseError)
            return item
          }
        }
        return item
      })
      console.log('Final parsed result:', result)
      return result
    }
    
    // If it's a single object, wrap it in an array
    if (typeof parsed === 'object' && parsed !== null) {
      return [parsed]
    }
    
    return []
  } catch (error) {
    console.error('Error parsing uploadedFiles:', error)
    return []
  }
}

export const parseSelectedOptions = (selectedOptions: string) => {
  try {
    const options = JSON.parse(selectedOptions)
    return Array.isArray(options) ? options : []
  } catch {
    return []
  }
}

export const parseSelectedAddOns = (selectedAddOns: string) => {
  try {
    const addons = JSON.parse(selectedAddOns)
    return Array.isArray(addons) ? addons : []
  } catch {
    return []
  }
}

export const formService = {
  // Create initial form submission
  async createSubmission(data: Omit<FormSubmission, '$id' | 'createdAt' | 'updatedAt'>): Promise<FormSubmission> {
    const databaseId = ENVObj.VITE_FORM_SUBMISSIONS_DATABASE_ID
    const collectionId = TABLE_ID
    
    if (!databaseId) {
      throw new Error('Form submissions database ID not configured. Please set VITE_FORM_SUBMISSIONS_DATABASE_ID in your .env file.')
    }
    
    if (!collectionId) {
      throw new Error('Form submissions collection ID not configured. Please set VITE_FORM_SUBMISSIONS_TABLE_ID in your .env file.')
    }
    
    if (databaseId === collectionId) {
      throw new Error(
        'Configuration Error: Database ID and Collection ID cannot be the same. ' +
        `Both are set to "${databaseId}". ` +
        'Please check your .env file:\n' +
        '- VITE_FORM_SUBMISSIONS_DATABASE_ID should be the Database ID\n' +
        '- VITE_FORM_SUBMISSIONS_TABLE_ID should be the Collection ID within that database\n' +
        'Get these IDs from Appwrite Console -> Databases -> [Your Database] -> [Your Collection]'
      )
    }
  
    console.log('Form Database ID:', databaseId)
    console.log('Collection ID:', collectionId)
    console.log('Submission data:', data)
  
    const now = new Date().toISOString()
  
    // Ensure uploadedFiles is stored as a JSON string (array)
    const sanitized = {
      ...data,
      uploadedFiles: typeof data.uploadedFiles === 'string' && data.uploadedFiles.trim() !== ''
        ? data.uploadedFiles
        : JSON.stringify([]),
    }
  
    try {
      const submission = await databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        {
          ...sanitized,
          createdAt: now,
          updatedAt: now,
        }
      )

      return submission as unknown as FormSubmission
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error'
      const errorCode = error?.code || error?.response?.status || 'unknown'
      
      if (errorCode === 404 || errorMessage.includes('could not be found')) {
        throw new Error(
          `Collection not found: "${collectionId}" in database "${databaseId}".\n\n` +
          'Please verify in Appwrite Console:\n' +
          '1. Go to Databases -> Find your database\n' +
          '2. Check that the Collection ID matches VITE_FORM_SUBMISSIONS_TABLE_ID\n' +
          '3. Ensure the Database ID matches VITE_FORM_SUBMISSIONS_DATABASE_ID\n' +
          `Current values: Database="${databaseId}", Collection="${collectionId}"`
        )
      }
      
      throw error
    }
  },

  // Update form submission
  async updateSubmission(
    submissionId: string, 
    updates: Partial<Omit<FormSubmission, '$id' | 'createdAt' | 'updatedAt'>>
  ): Promise<FormSubmission> {
    const databaseId = ENVObj.VITE_FORM_SUBMISSIONS_DATABASE_ID
    const collectionId = TABLE_ID
    
    if (!databaseId || !collectionId) {
      throw new Error('Form submissions database or collection ID not configured')
    }

    try {
      const updatedSubmission = await databases.updateDocument(
        databaseId,
        collectionId,
        submissionId,
        {
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      )

      return updatedSubmission as unknown as FormSubmission
    } catch (error: any) {
      if (error?.code === 404 || error?.message?.includes('could not be found')) {
        throw new Error(`Collection "${collectionId}" not found in database "${databaseId}". Please check your Appwrite configuration.`)
      }
      throw error
    }
  },

  // Get submission by ID
  async getSubmission(submissionId: string): Promise<FormSubmission> {
    const databaseId = ENVObj.VITE_FORM_SUBMISSIONS_DATABASE_ID
    const collectionId = TABLE_ID
    
    if (!databaseId || !collectionId) {
      throw new Error('Form submissions database or collection ID not configured')
    }

    const submission = await databases.getDocument(
      databaseId,
      collectionId,
      submissionId
    )

    return submission as unknown as FormSubmission
  },

  // Get submissions by client email
  async getSubmissionsByEmail(clientEmail: string): Promise<FormSubmission[]> {
    const databaseId = ENVObj.VITE_FORM_SUBMISSIONS_DATABASE_ID
    const collectionId = TABLE_ID
    
    if (!databaseId || !collectionId) {
      throw new Error('Form submissions database or collection ID not configured')
    }

    const response = await databases.listDocuments(
      databaseId,
      collectionId,
      [
        Query.equal('clientEmail', clientEmail),
        Query.orderDesc('$createdAt')
      ]
    )

    return response.documents as unknown as FormSubmission[]
  },

  // Delete submission
  async deleteSubmission(submissionId: string): Promise<void> {
    const databaseId = ENVObj.VITE_FORM_SUBMISSIONS_DATABASE_ID
    const collectionId = TABLE_ID
    
    if (!databaseId || !collectionId) {
      throw new Error('Form submissions database or collection ID not configured')
    }

    await databases.deleteDocument(
      databaseId,
      collectionId,
      submissionId
    )
  }
}

