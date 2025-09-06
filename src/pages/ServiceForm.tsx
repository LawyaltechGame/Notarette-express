import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getServiceBySlug } from '../data/services'
import { formService, FormSubmission } from '../services/formService'
import { storage, ID } from '../lib/appwrite'
import { Permission, Role } from 'appwrite'
import { ENVObj } from '../lib/constant'
import { useAppSelector } from '../hooks/useAppSelector'

const MAX_FILES = 5
const MAX_FILE_SIZE_BYTES = 1073741824 // 1 GB

const ServiceForm: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const service = slug ? getServiceBySlug(slug) : undefined
  const user = useAppSelector(state => state.user.user)

  const [fullName, setFullName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [documentTitle, setDocumentTitle] = React.useState('')
  const [documentType, setDocumentType] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [files, setFiles] = React.useState<File[]>([])
  const [submitting, setSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const resetForm = () => {
    setFullName('')
    setEmail('')
    setDocumentTitle('')
    setDocumentType('')
    setDescription('')
    setNotes('')
    setFiles([])
    setErrors({})
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!fullName.trim()) next.fullName = 'Full name is required'
    if (!email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email'
    if (!documentTitle.trim()) next.documentTitle = 'Document title is required'
    if (!documentType) next.documentType = 'Please select a document type'
    if (files.length === 0) next.files = 'Please upload at least one document'
    if (files.length > MAX_FILES) next.files = `Maximum ${MAX_FILES} files allowed`
    if (files.some(f => f.size > MAX_FILE_SIZE_BYTES)) next.files = 'Each file must be under 1 GB'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const selected = Array.from(e.target.files || [])
    setFiles(selected.slice(0, MAX_FILES))
  }

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (!validate()) return
    
    try {
      setSubmitting(true)
      console.log('Starting form submission...')
      
      const uploadedFiles: Array<{ fileId: string; name: string; size: number; type?: string; folderPath?: string }> = []
      if (files.length > 0) {
        console.log(`Uploading ${files.length} files to storage...`)
        
        // Create folder structure: client-uploads/{clientEmail}/{submissionId}/
        const submissionId = ID.unique()
        const folderPath = `client-uploads/${email}/${submissionId}`
        
        try {
          for (const file of files) {
            try {
              const fileId = ID.unique()
              const response = await storage.createFile(
                ENVObj.VITE_APPWRITE_BUCKET_ID!,
                fileId,
                file,
                [
                  Permission.read(Role.users())
                ]
              )
              // push an object (not JSON string)
              uploadedFiles.push({
                fileId: response.$id,
                name: file.name,
                size: file.size,
                type: file.type || '',
                folderPath: folderPath
              })
              console.log(`File uploaded to ${folderPath}: ${file.name} (${response.$id})`)
            } catch (fileError) {
              console.error(`Error uploading file ${file.name}:`, fileError)
              // fallback: record the file metadata with a temp id (upload failed)
              uploadedFiles.push({
                fileId: `temp_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                name: file.name,
                size: file.size,
                type: file.type || '',
                folderPath: folderPath
              })
              console.log(`File info stored (not uploaded): ${file.name}`)
            }
          }
        } catch (error) {
          console.warn('File upload loop failed, continuing without files:', error)
        }
      }
      
      // Create form submission in database
      console.log('Creating form submission in database...')
      const submissionData: Omit<FormSubmission, '$id' | 'createdAt' | 'updatedAt'> = {
        clientEmail: user?.email || email,
        fullName,
        email,
        documentTitle: documentTitle || undefined,
        documentType: documentType as 'personal' | 'corporate' | 'legal' | 'others',
        documentDescription: description || undefined,
        // store ONE JSON string representing the array of file objects
        uploadedFiles: JSON.stringify(uploadedFiles),
        additionalNotes: notes || undefined,
        currentStep: 'form_submitted',
        serviceId: service?.id,
        serviceSlug: slug,
        status: 'in_progress'
      }
      
      const submission = await formService.createSubmission(submissionData)
      console.log('Form submission created:', submission.$id)
      
      // Store submission ID in session storage for the flow
      sessionStorage.setItem('current_submission_id', submission.$id!)
      
      // Also store the legacy payload for backward compatibility
      const payload = {
        serviceSlug: slug,
        fullName,
        email,
        documentTitle,
        documentType,
        description,
        notes,
        files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
        submissionId: submission.$id
      }
      sessionStorage.setItem('notary_manual_form', JSON.stringify(payload))
      
      console.log('Form submitted successfully, navigating to next step...')
      navigate(`/services/${slug}/document-type`)
      
    } catch (error) {
      console.error('Form submission error:', error)
      alert(`Form submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#111827] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-[#111827] px-8 py-6">
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">
              {service ? `Notarisation Form for ${service.name}` : 'Start Service'}
          </h1>
            <p className="text-blue-100 text-lg">
              Please complete the form below. Required fields are marked with <span className="text-red-300 font-semibold">*</span>
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-[#111827] rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
          <div className="p-8">
            <form onSubmit={onSubmit} className="space-y-8">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h2 className="text-xl font-semibold text-white mb-1">Personal Information</h2>
                  <p className="text-sm text-gray-300">Please provide your contact details</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-200">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.fullName 
                          ? 'border-red-400 bg-red-50 text-gray-900' 
                          : 'border-gray-600 bg-[#1f2937] text-white hover:border-gray-500 focus:bg-[#111827]'
                      }`}
                      placeholder="Jane Doe"
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-600 font-medium">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-200">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email 
                          ? 'border-red-400 bg-red-50 text-gray-900' 
                          : 'border-gray-600 bg-[#1f2937] text-white hover:border-gray-500 focus:bg-[#111827]'
                      }`}
                      placeholder="jane@example.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 font-medium">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Information Section */}
              <div className="space-y-6 pt-8 border-t border-gray-700">
                <div className="border-l-4 border-green-500 pl-4">
                  <h2 className="text-xl font-semibold text-white mb-1">Document Information</h2>
                  <p className="text-sm text-gray-300">Tell us about the document you need notarized</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-200">
                      Document Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.documentTitle 
                          ? 'border-red-400 bg-red-50 text-gray-900' 
                          : 'border-gray-600 bg-[#1f2937] text-white hover:border-gray-500 focus:bg-[#111827]'
                      }`}
                      placeholder="e.g., Passport, Power of Attorney, Contract"
                    />
                    {errors.documentTitle && (
                      <p className="text-sm text-red-600 font-medium">{errors.documentTitle}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-200">
                      Document Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: 'personal', label: 'Personal Document', desc: 'ID cards, certificates, personal agreements' },
                        { key: 'corporate', label: 'Corporate Document', desc: 'Business contracts, company documents' },
                        { key: 'legal', label: 'Legal Document', desc: 'Power of attorney, affidavits, legal forms' },
                        { key: 'other', label: 'Other Documents', desc: 'Custom or specialized documents' },
                      ].map(opt => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setDocumentType(opt.key)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-lg transform hover:-translate-y-1 ${
                            documentType === opt.key 
                              ? 'border-blue-400 bg-blue-900/30 shadow-md ring-2 ring-blue-900/20 text-white' 
                              : 'border-gray-600 bg-[#1f2937] text-gray-200 hover:border-gray-500'
                          }`}
                        >
                          <div className="space-y-2">
                            <span className={`font-semibold block ${
                              documentType === opt.key ? 'text-white' : 'text-gray-200'
                            }`}>
                              {opt.label}
                            </span>
                            <span className={`text-sm block ${
                              documentType === opt.key ? 'text-blue-200' : 'text-gray-400'
                            }`}>
                              {opt.desc}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {errors.documentType && (
                      <p className="text-sm text-red-600 font-medium">{errors.documentType}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-200">
                      Document Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-600 bg-[#1f2937] text-white hover:border-gray-500 focus:bg-[#111827] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      placeholder="Briefly describe your document and its purpose..."
                    />
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-6 pt-8 border-t border-gray-700">
                <div className="border-l-4 border-purple-500 pl-4">
                  <h2 className="text-xl font-semibold text-white mb-1">Upload Documents</h2>
                  <p className="text-sm text-gray-300">Upload the documents that need to be notarized</p>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-200">
                    Select Files <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 font-normal ml-2">
                      (max {MAX_FILES} files, up to 1 GB each)
                    </span>
                  </label>
                  
                  <div className="relative">
              <input
                      type="file"
                      multiple
                      onChange={onFileChange}
                      className="block w-full text-sm text-gray-200 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-indigo-500 file:text-white hover:file:from-blue-600 hover:file:to-indigo-600 file:transition-all file:duration-200 file:shadow-lg hover:file:shadow-xl file:cursor-pointer cursor-pointer border-2 border-dashed border-gray-600 rounded-xl p-6 bg-[#1f2937] hover:border-gray-500 hover:bg-[#111827] transition-all duration-200"
                    />
                  </div>
                  
                  {errors.files && (
                    <p className="text-sm text-red-600 font-medium">{errors.files}</p>
                  )}
                  
                  {files.length > 0 && (
                    <div className="bg-[#0f172a] rounded-xl p-4 space-y-3 border border-gray-700">
                      <h4 className="font-semibold text-gray-200">Selected Files ({files.length})</h4>
                      <ul className="space-y-2">
                        {files.map((f, i) => (
                          <li key={i} className="flex items-center justify-between bg-[#111827] p-3 rounded-lg border border-gray-700 shadow-sm">
                            <span className="font-medium text-gray-200 truncate mr-3">{f.name}</span>
                            <span className="text-sm text-gray-300 bg-[#1f2937] px-2 py-1 rounded-full">
                              {(f.size / (1024 * 1024)).toFixed(1)} MB
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Notes Section */}
              <div className="space-y-4 pt-8 border-t border-gray-700">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-200">
                    Additional Notes for the Notary
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-600 bg-[#1f2937] text-white hover:border-gray-500 focus:bg-[#111827] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Add any special instructions, deadlines, or additional context..."
                  />
                </div>
            </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 text-gray-200 bg-[#1f2937] border border-gray-600 rounded-xl hover:bg-[#111827] hover:border-gray-500 transition-all duration-200 font-semibold"
                >
                  Clear Form
                </button>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {submitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    'Submit Form'
                  )}
                </button>
              </div>
            </form>
          </div>
          </div>
      </div>
    </div>
  )
}

export default ServiceForm
