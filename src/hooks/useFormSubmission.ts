import { useState, useEffect } from 'react'
import { formService, FormSubmission } from '../services/formService'

export const useFormSubmission = () => {
  const [submission, setSubmission] = useState<FormSubmission | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get current submission ID from session storage
  const getCurrentSubmissionId = (): string | null => {
    try {
      return sessionStorage.getItem('current_submission_id')
    } catch {
      return null
    }
  }

  // Load current submission
  const loadCurrentSubmission = async () => {
    const submissionId = getCurrentSubmissionId()
    if (!submissionId) return

    try {
      setLoading(true)
      setError(null)
      const currentSubmission = await formService.getSubmission(submissionId)
      setSubmission(currentSubmission)
    } catch (err) {
      console.error('Error loading submission:', err)
      setError(err instanceof Error ? err.message : 'Failed to load submission')
    } finally {
      setLoading(false)
    }
  }

  // Update submission
  const updateSubmission = async (updates: Partial<Omit<FormSubmission, '$id' | 'createdAt' | 'updatedAt'>>) => {
    const submissionId = getCurrentSubmissionId()
    console.log('useFormSubmission - Current submission ID:', submissionId)
    console.log('useFormSubmission - Updates:', updates)
    
    if (!submissionId) {
      throw new Error('No active submission found')
    }

    try {
      setLoading(true)
      setError(null)
      console.log('useFormSubmission - Calling formService.updateSubmission...')
      const updatedSubmission = await formService.updateSubmission(submissionId, updates)
      console.log('useFormSubmission - Update successful:', updatedSubmission)
      setSubmission(updatedSubmission)
      return updatedSubmission
    } catch (err) {
      console.error('Error updating submission:', err)
      setError(err instanceof Error ? err.message : 'Failed to update submission')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Clear current submission
  const clearSubmission = () => {
    try {
      sessionStorage.removeItem('current_submission_id')
      sessionStorage.removeItem('notary_manual_form')
      setSubmission(null)
      setError(null)
    } catch (err) {
      console.error('Error clearing submission:', err)
    }
  }

  // Load submission on mount
  useEffect(() => {
    loadCurrentSubmission()
  }, [])

  return {
    submission,
    loading,
    error,
    loadCurrentSubmission,
    updateSubmission,
    clearSubmission,
    getCurrentSubmissionId
  }
}

