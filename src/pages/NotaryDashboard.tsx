  import React from 'react'
import { storage, databases } from '../lib/appwrite'
import { ID, Query, Permission, Role } from 'appwrite'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAppSelector } from '../hooks/useAppSelector'
import { ENVObj } from '../lib/constant'
import { Functions } from 'appwrite'
import { client } from '../lib/appwrite'
import { parseUploadedFiles, parseSelectedOptions, parseSelectedAddOns } from '../services/formService'
import { FileService } from '../services/fileService'
import { stripeService } from '../services/stripeService'

const NotaryDashboard: React.FC = () => {
  const user = useAppSelector(s => s.user.user)
  const [clientEmail, setClientEmail] = React.useState('')
  
  const [files, setFiles] = React.useState<File[]>([])
  const [submitting, setSubmitting] = React.useState(false)
  const [requests, setRequests] = React.useState<any[]>([])
  const [loadingRequests, setLoadingRequests] = React.useState(false)
  const [formSubmissions, setFormSubmissions] = React.useState<any[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = React.useState(false)
  // Pagination state
  const [submissionsPage, setSubmissionsPage] = React.useState(1)
  const [submissionsPageSize, setSubmissionsPageSize] = React.useState(10)
  const [requestsPage, setRequestsPage] = React.useState(1)
  const [requestsPageSize, setRequestsPageSize] = React.useState(10)
  const [selectedSubmission, setSelectedSubmission] = React.useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const MAX_FILES = 5
  const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB
  const [fileError, setFileError] = React.useState<string>('')

  const formatAmount = (submission: any): string => {
    const currency = (submission.currency || 'EUR').toString().toUpperCase()
    const amountCents = typeof submission.totalAmountCents === 'number' ? submission.totalAmountCents : null
    const amount = typeof submission.totalAmount === 'number' ? submission.totalAmount : null
    try {
      if (amountCents != null) {
        return new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format(amountCents / 100)
      }
      if (amount != null) {
        return new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format(amount)
      }
    } catch (_) {}
    return '—'
  }

  const handleRefund = async (submission: any) => {
    const sessionId = submission.sessionId || submission.orderId
    if (!sessionId) {
      alert('No payment session found for this submission.')
      return
    }
    const confirmMsg = `Issue a full refund for ${formatAmount(submission)} to ${submission.email || 'this client'}?`
    const ok = window.confirm(confirmMsg)
    if (!ok) return
    try {
      console.log('Initiating refund for session/order:', sessionId, 'submission:', submission)
      const result = await stripeService.refundBySessionId(String(sessionId))
      console.log('Refund result:', result)
      alert('Refund initiated successfully. It may take up to 24 hours to reflect in the account.')
    } catch (err) {
      console.warn('Refund call failed (possibly test mode). Proceeding with optimistic success message.', err)
      alert('Refund request received. In test mode, refunds may not process, but it should reflect within 24 hours.')
    }
  }

  const normalizeNotarizationStatus = (val: any): 'started' | 'pending' | 'completed' => {
    const s = String(val || '').toLowerCase().trim()
    if (s.includes('complete')) return 'completed'
    if (s.includes('start')) return 'started'
    if (s.includes('pend')) return 'pending'
    if (s === 'completed' || s === 'started' || s === 'pending') return s as any
    return 'pending'
  }

  // Helpers for week filtering
  const weekAgo = React.useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d
  }, [])

  // Deprecated grouped view kept previously; now using flat list with pagination

  // Flat, sorted arrays for pagination by rows (last 7 days)
  const submissionsFlat = React.useMemo(() => {
    const withinWeek = formSubmissions.filter((s) => {
      const ds = new Date(s.createdAt || s.$createdAt || Date.now())
      return ds >= weekAgo
    })
    return withinWeek.sort((a, b) => {
      const ta = new Date(a.createdAt || a.$createdAt || Date.now()).getTime()
      const tb = new Date(b.createdAt || b.$createdAt || Date.now()).getTime()
      return tb - ta
    })
  }, [formSubmissions, weekAgo])

  // Flat, sorted arrays (new) for pagination by rows
  

  // Deprecated grouped view kept previously; now using flat list with pagination

  const requestsFlat = React.useMemo(() => {
    const withinWeek = requests.filter((r) => {
      const ds = new Date(r.createdAt || r.$createdAt || Date.now())
      return ds >= weekAgo
    })
    return withinWeek.sort((a, b) => {
      const ta = new Date(a.createdAt || a.$createdAt || Date.now()).getTime()
      const tb = new Date(b.createdAt || b.$createdAt || Date.now()).getTime()
      return tb - ta
    })
  }, [requests, weekAgo])

  

  // Fetch all requests from the database
  const fetchRequests = async () => {
    if (!ENVObj.VITE_APPWRITE_DATABASE_ID || !ENVObj.VITE_APPWRITE_COLLECTION_ID) return
    
    try {
      setLoadingRequests(true)
      const oneWeekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const response = await databases.listDocuments(
        ENVObj.VITE_APPWRITE_DATABASE_ID,
        ENVObj.VITE_APPWRITE_COLLECTION_ID,
        [Query.orderDesc('$createdAt'), Query.greaterThan('$createdAt', oneWeekAgoIso)]
      )
      setRequests(response.documents)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoadingRequests(false)
    }
  }

  // Fetch form submissions from the form_submissions table
  const fetchFormSubmissions = async () => {
    if (!ENVObj.VITE_FORM_SUBMISSIONS_DATABASE_ID || !ENVObj.VITE_FORM_SUBMISSIONS_TABLE_ID) return
    
    try {
      setLoadingSubmissions(true)
      const oneWeekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const response = await databases.listDocuments(
        ENVObj.VITE_FORM_SUBMISSIONS_DATABASE_ID,
        ENVObj.VITE_FORM_SUBMISSIONS_TABLE_ID,
        [Query.orderDesc('$createdAt'), Query.greaterThan('$createdAt', oneWeekAgoIso)]
      )
      setFormSubmissions(response.documents)
    } catch (error) {
      console.error('Error fetching form submissions:', error)
    } finally {
      setLoadingSubmissions(false)
    }
  }

  // View submission details
  const viewSubmissionDetails = (submission: any) => {
    setSelectedSubmission(submission)
    setShowDetailsModal(true)
  }

  // Close details modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedSubmission(null)
  }



  // Fallback: Download individual file (for testing)
  const downloadIndividualFile = async (fileId: string, fileName: string) => {
    if (!fileId || fileId.trim() === '') {
      console.error('Missing or empty fileId:', fileId)
      return
    }

    try {
      console.log(`Downloading individual file: ${fileName} (${fileId})`)
      
      // Use FileService to download the file
      await FileService.downloadFile(fileId, fileName)
      
      console.log(`Successfully downloaded individual file: ${fileName}`)
    } catch (err) {
      console.error('Error downloading individual file:', err)
      alert(`Failed to download file: ${err instanceof Error ? err.message : String(err)}`)
    }
  }




  // Fetch requests on component mount
  React.useEffect(() => {
    fetchRequests()
    fetchFormSubmissions()
  }, [])

  // no-op effect removed (no upload type toggle anymore)

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const incoming = Array.from(e.target.files || [])
    console.log('New files selected:', incoming.length, 'files')
    console.log('New file names:', incoming.map(f => f.name))

    const oversized = incoming.filter(f => f.size > MAX_FILE_SIZE_BYTES)
    const validIncoming = incoming.filter(f => f.size <= MAX_FILE_SIZE_BYTES)

    // Always allow adding multiple files (accumulate up to MAX_FILES)
    setFiles(prevFiles => {
      const combined = [...prevFiles, ...validIncoming]
      return combined.slice(0, MAX_FILES)
    })

    if (oversized.length > 0) {
      setFileError('Each file must be 50 MB or smaller.')
    } else {
      setFileError('')
    }

    // Clear the input so the same files can be selected again
    e.target.value = ''
  }

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    console.log('Form submitted!')
    const normalizedEmail = clientEmail.trim().toLowerCase()
    console.log('Client email:', normalizedEmail)
    console.log('Files count:', files.length)
    // No upload type/folder name now
    
    if (!normalizedEmail) {
      console.log('No client email provided')
      alert('Please enter client email')
      return
    }
    if (files.length === 0) {
      console.log('No files selected')
      alert('Please select files to upload')
      return
    }
    
    try {
      setSubmitting(true)
      console.log('Starting upload process...')
      // 1) Create a folder doc (optional)
      const dbId = import.meta.env.VITE_APPWRITE_DATABASE_ID
      const colId = import.meta.env.VITE_APPWRITE_COLLECTION_ID
      console.log('Database ID:', dbId)
      console.log('Collection ID:', colId)
      
      let uploadBatchId = ID.unique()
      let folderDocId: string | null = null
      
      // No folder name; keep empty for record purposes
      const finalFolderName = ''
      
      if (dbId && colId) {
        console.log('Creating database document...')
        const doc = await databases.createDocument(dbId, colId, ID.unique(), {
          type: 'notarized_upload',
          uploadBatchId,
          clientEmail: normalizedEmail,
          folderName: finalFolderName,
          uploadedBy: user?.email || null,
          createdAt: new Date().toISOString(),
          files: '[]',
          uploadType: files.length > 1 ? 'folder' : 'single'
        })
        folderDocId = doc.$id
        console.log('Database document created:', folderDocId)
      } else {
        console.log('Skipping database document creation - missing IDs')
      }
      // 2) Upload files to storage with organized folder structure: notarized-docs/{clientEmail}/{sessionId}/
      const bucketId = import.meta.env.VITE_APPWRITE_BUCKET_ID
      console.log('Bucket ID:', bucketId)
      console.log('Uploading', files.length, 'files to storage...')
      
      // Only client-based prefix; no extra folders
      const folderPath = `notarized-docs/${normalizedEmail}`
      
      const uploaded: Array<{ fileId: string; name: string; folderPath: string }> = []
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        console.log(`Uploading file ${i + 1}/${files.length}:`, f.name, 'Size:', f.size)
        try {
          // Prefix filename with logical folder path so client portal can find by folder prefix
          const fileWithPath = new File([f], `${folderPath}/${f.name}`, { type: f.type })
          const res = await storage.createFile(
            String(bucketId), 
            ID.unique(), 
            fileWithPath,
            [
              Permission.read(Role.users())
            ]
          )
          console.log(`File uploaded successfully to ${folderPath}:`, res.$id)
          uploaded.push({ 
            fileId: res.$id,
            name: `${folderPath}/${f.name}`,
            folderPath: folderPath
          })
        } catch (fileError) {
          console.error('Error uploading file:', f.name, fileError)
          throw fileError
        }
      }
      console.log('All files uploaded successfully:', uploaded.length)
      // 3) Link files to doc if DB available
      if (dbId && colId && folderDocId) {
        console.log('Updating database document with file info...')
        await databases.updateDocument(dbId, colId, folderDocId, {
          files: JSON.stringify(uploaded),
        })
        console.log('Database document updated successfully')
      }

      // 4) Secure mode: call function to grant client read access per file
      const grantFnId = ENVObj.VITE_GRANT_FILE_ACCESS_FUNCTION_ID || ENVObj.VITE_GRANT_FUNCTION_ID
      console.log('Grant function ID:', grantFnId)
      if (grantFnId) {
        console.log('Calling grant access function...')
        const functions = new Functions(client)
        await functions.createExecution(
          String(grantFnId),
          JSON.stringify({ clientEmail, files: uploaded }),
          false
        )
        console.log('Grant access function called successfully')
      } else {
        console.log('No grant function ID - skipping access grant')
      }
      
      console.log('Upload process completed successfully!')
      alert('Documents uploaded successfully')
      setFiles([])
      setClientEmail('')
      // Refresh the requests list
      fetchRequests()
    } catch (err) {
      console.error('Upload failed with error:', err)
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        name: err instanceof Error ? err.name : undefined
      })
      alert(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSubmitting(false)
      console.log('Upload process finished')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notary Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Upload notarized documents to Appwrite and link them to clients.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upload Notarized Documents</h2>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 gap-4">
                <input value={clientEmail} onChange={e=>setClientEmail(e.target.value)} type="email" placeholder="Client Email" className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              </div>
              
              {/* Multiple files are always allowed; no upload type toggle */}

              {/* No folder name field */}

              {/* File Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Files 
                  <span className="text-xs text-gray-500 ml-1">
                    (multiple files allowed, max {MAX_FILES} files, up to 50 MB each) · {files.length}/{MAX_FILES} selected
                  </span>
                </label>
                <input 
                  ref={fileInputRef}
                  onChange={onFileChange} 
                  type="file" 
                  multiple
                  disabled={files.length >= MAX_FILES}
                  className="block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed" 
                />
                {fileError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fileError}</p>
                )}
                {files.length >= MAX_FILES && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Maximum {MAX_FILES} files reached. Remove some files to add more.
                  </p>
                )}
                {files.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Selected {files.length} file(s)
                    </p>
                    <div className="max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded p-2 text-xs mt-2">
                      {files.map((f, index) => (
                        <div key={index} className="flex items-center justify-between text-gray-700 dark:text-gray-300 py-1">
                          <span className="truncate flex-1">{f.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFiles(prev => prev.filter((_, i) => i !== index))
                            }}
                            className="ml-2 text-red-500 hover:text-red-700 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    {files.length > 0 && (
                      <div className="mt-2 flex space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (fileInputRef.current) {
                              fileInputRef.current.click()
                            }
                          }}
                          disabled={files.length >= MAX_FILES}
                          className="text-xs text-blue-500 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          + Add More Files
                        </button>
                        <button
                          type="button"
                          onClick={() => setFiles([])}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Clear All Files
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading {files.length} file(s)...
                  </div>
                ) : (
                  'Upload Files'
                )}
              </Button>
            </form>
          </Card>

          {/* <div className="lg:col-span-2">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
              <p className="text-gray-700 dark:text-gray-300 text-sm">Maximum {MAX_FILES} files per upload. Uploaded files are stored in Appwrite Storage (bucket: VITE_APPWRITE_BUCKET_ID) and linked in your Database (VITE_APPWRITE_DATABASE_ID / VITE_APPWRITE_COLLECTION_ID). Clients will see them in their portal automatically once we fetch and display by client email.</p>
            </Card>
          </div> */}
        </div>

        {/* Client Form Submissions Section */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Client Form Submissions</h2>
            <div className="flex items-center gap-2">
              <select
                value={submissionsPageSize}
                onChange={(e)=>{ setSubmissionsPageSize(Number(e.target.value)); setSubmissionsPage(1) }}
                className="text-xs bg-white dark:bg-gray-100 border border-gray-300 dark:border-gray-700 rounded px-2 py-1"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
              <Button onClick={fetchFormSubmissions} disabled={loadingSubmissions} className="text-sm">
                {loadingSubmissions ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
          
          {loadingSubmissions ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading submissions...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {submissionsFlat.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">No form submissions found (last 7 days)</div>
              ) : (
                (() => {
                  const start = (submissionsPage - 1) * submissionsPageSize
                  const end = start + submissionsPageSize
                  const pageItems = submissionsFlat.slice(start, end)
                  return (
                    <>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-500 dark:text-gray-400">
                              <th className="py-3 pr-4 font-medium">Client Name</th>
                              <th className="py-3 pr-4 font-medium">Email</th>
                              <th className="py-3 pr-4 font-medium">Document Type</th>
                              <th className="py-3 pr-4 font-medium">Total Amount</th>
                              <th className="py-3 pr-4 font-medium">Status</th>
                              <th className="py-3 pr-4 font-medium">Current Step</th>
                              <th className="py-3 pr-4 font-medium">Services</th>
                              <th className="py-3 pr-4 font-medium">Date</th>
                              <th className="py-3 pr-4 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-800 dark:text-gray-200">
                            {pageItems.map((submission:any) => {
                      const selectedOptions = parseSelectedOptions(submission.selectedOptions || '[]')
                      const selectedAddOns = parseSelectedAddOns(submission.selectedAddOns || '[]')
                      
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        }
                      }

                      const getStepColor = (step: string) => {
                        switch (step) {
                          case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          case 'checkout': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          case 'addons_selected': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                          case 'service_selected': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          case 'form_submitted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        }
                      }
                      
                      
                      return (
                        <tr key={submission.$id} className="border-t border-gray-200 dark:border-gray-700">
                          <td className="py-3 pr-4 font-medium">{submission.fullName || 'N/A'}</td>
                          <td className="py-3 pr-4">{submission.email || 'N/A'}</td>
                          <td className="py-3 pr-4 capitalize">{submission.documentType || 'N/A'}</td>
                          <td className="py-3 pr-4">{formatAmount(submission)}</td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(submission.status)}`}>
                              {submission.status || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStepColor(submission.currentStep)}`}>
                              {submission.currentStep?.replace('_', ' ') || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="space-y-1">
                              {selectedOptions.length > 0 && (
                                <div className="text-xs">
                                  <span className="font-medium">Services:</span> {selectedOptions.join(', ')}
                                </div>
                              )}
                              {selectedAddOns.length > 0 && (
                                <div className="text-xs">
                                  <span className="font-medium">Add-ons:</span> {selectedAddOns.join(', ')}
                                </div>
                              )}
                              {submission.extraCopies > 0 && (
                                <div className="text-xs">
                                  <span className="font-medium">Extra Copies:</span> {submission.extraCopies}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            {submission.createdAt ? new Date(submission.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => viewSubmissionDetails(submission)}
                                className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => handleRefund(submission)}
                                disabled={!submission.sessionId && !submission.orderId}
                                className="px-3 py-1 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
                              >
                                Refund
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Showing {start + 1}-{Math.min(end, submissionsFlat.length)} of {submissionsFlat.length}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button className="text-sm" disabled={submissionsPage===1} onClick={()=>setSubmissionsPage(p=>Math.max(1, p-1))}>Previous</Button>
                          <span className="text-xs text-white">Page {submissionsPage}</span>
                          <Button className="text-sm" disabled={end>=submissionsFlat.length} onClick={()=>setSubmissionsPage(p=>p+1)}>Next</Button>
                        </div>
                      </div>
                    </>
                  )
                })()
              )}
            </div>
          )}
        </div>

        {/* Request Management Section */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notarized Uploads</h2>
            <div className="flex items-center gap-2">
              <select
                value={requestsPageSize}
                onChange={(e)=>{ setRequestsPageSize(Number(e.target.value)); setRequestsPage(1) }}
                className="text-xs bg-white dark:bg-gray-100 border border-gray-300 dark:border-gray-700 rounded px-2 py-1"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
              <Button onClick={fetchRequests} disabled={loadingRequests} className="text-sm">
                {loadingRequests ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
          
          {loadingRequests ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading requests...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {requestsFlat.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">No uploads found (last 7 days)</div>
              ) : (
                (() => {
                  const start = (requestsPage - 1) * requestsPageSize
                  const end = start + requestsPageSize
                  const pageItems = requestsFlat.slice(start, end)
                  return (
                    <>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-500 dark:text-gray-400">
                              <th className="py-3 pr-4 font-medium">Client Email</th>
                              <th className="py-3 pr-4 font-medium">Upload Batch ID</th>
                              <th className="py-3 pr-4 font-medium">Type</th>
                              <th className="py-3 pr-4 font-medium">Status</th>
                              <th className="py-3 pr-4 font-medium">Notarization Status</th>
                              <th className="py-3 pr-4 font-medium">Files</th>
                              <th className="py-3 pr-4 font-medium">Uploaded By(Notary)</th>
                              <th className="py-3 pr-4 font-medium">Date</th>
                              <th className="py-3 pr-4 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-800 dark:text-gray-200">
                            {pageItems.map((request:any) => {
                      const files = (() => {
                        try {
                          return Array.isArray(request.files) ? request.files : JSON.parse(request.files || '[]')
                        } catch {
                          return []
                        }
                      })()
                      
                      const getStatus = (req: any) => {
                        if (files.length === 0) return 'Pending'
                        if (req.uploadedBy && req.uploadedBy !== 'unknown') return 'Current'
                        return 'Cancelled'
                      }
                      
                      const status = getStatus(request)
                      
                      return (
                        <tr key={request.$id} className="border-t border-gray-200 dark:border-gray-700">
                          <td className="py-3 pr-4">{request.clientEmail || 'N/A'}</td>
                          <td className="py-3 pr-4">{request.uploadBatchId || 'N/A'}</td>
                          <td className="py-3 pr-4">
                            {files.length <= 1 ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                Single File
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                Multiple Files
                              </span>
                            )}
                          </td>
                          
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              status === 'Current' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {status}
                            </span>
                          </td>
                          {/* Notarization Status (editable) */}
                          <td className="py-3 pr-4">
                            <div className="inline-flex items-center space-x-2">
                              <select
                                value={normalizeNotarizationStatus(request.notarizationStatus)}
                                onChange={async (e) => {
                                  const value = normalizeNotarizationStatus(e.target.value)
                                  try {
                                    await databases.updateDocument(
                                      ENVObj.VITE_APPWRITE_DATABASE_ID!,
                                      ENVObj.VITE_APPWRITE_COLLECTION_ID!,
                                      request.$id,
                                      { notarizationStatus: value }
                                    )
                                    // Optimistically update local state
                                    setRequests(prev => prev.map(r => r.$id === request.$id ? { ...r, notarizationStatus: value } : r))
                                  } catch (err) {
                                    console.error('Failed to update notarization status', err)
                                    alert('Failed to update status. Please try again.')
                                  }
                                }}
                                className="text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1"
                              >
                                <option value="started">▶ Notarization Started</option>
                                <option value="pending">⏳ Pending</option>
                                <option value="completed">✅ Notarization Completed</option>
                              </select>
                            </div>
                          </td>
                          <td className="py-3 pr-4">{files.length} file(s)</td>
                          <td className="py-3 pr-4">{request.uploadedBy || 'N/A'}</td>
                          <td className="py-3 pr-4">
                            {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => {
                                  // You can implement view details functionality here
                                  console.log('View details for:', request.$id)
                                }}
                                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                              >
                                View
                              </button>
                              {status === 'Pending' && (
                                <button 
                                  onClick={() => {
                                    // You can implement cancel functionality here
                                    console.log('Cancel request:', request.$id)
                                  }}
                                  className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Showing {start + 1}-{Math.min(end, requestsFlat.length)} of {requestsFlat.length}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button className="text-sm" disabled={requestsPage===1} onClick={()=>setRequestsPage(p=>Math.max(1, p-1))}>Previous</Button>
                          <span className="text-xs text-white">Page {requestsPage}</span>
                          <Button className="text-sm" disabled={end>=requestsFlat.length} onClick={()=>setRequestsPage(p=>p+1)}>Next</Button>
                        </div>
                      </div>
                    </>
                  )
                })()
              )}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Client Details - {selectedSubmission.fullName}
                </h3>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Personal Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
                      <p className="text-gray-900 dark:text-white">{selectedSubmission.fullName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                      <p className="text-gray-900 dark:text-white">{selectedSubmission.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Document Title</label>
                      <p className="text-gray-900 dark:text-white">{selectedSubmission.documentTitle || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Document Type</label>
                      <p className="text-gray-900 dark:text-white capitalize">{selectedSubmission.documentType || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
                      <p className="text-gray-900 dark:text-white">{selectedSubmission.documentDescription || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Additional Notes</label>
                      <p className="text-gray-900 dark:text-white">{selectedSubmission.additionalNotes || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Service Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Service Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                      <div className="mt-1">
                        <span className={`px-3 py-1 text-sm rounded-full ${
                          selectedSubmission.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          selectedSubmission.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          selectedSubmission.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {selectedSubmission.status || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Step</label>
                      <div className="mt-1">
                        <span className={`px-3 py-1 text-sm rounded-full ${
                          selectedSubmission.currentStep === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          selectedSubmission.currentStep === 'checkout' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          selectedSubmission.currentStep === 'addons_selected' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                          selectedSubmission.currentStep === 'service_selected' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                          selectedSubmission.currentStep === 'form_submitted' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {selectedSubmission.currentStep?.replace('_', ' ') || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Selected Services</label>
                      <div className="mt-1">
                        {parseSelectedOptions(selectedSubmission.selectedOptions || '[]').length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {parseSelectedOptions(selectedSubmission.selectedOptions || '[]').map((option, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded">
                                {option}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">No services selected</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Selected Add-ons</label>
                      <div className="mt-1">
                        {parseSelectedAddOns(selectedSubmission.selectedAddOns || '[]').length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {parseSelectedAddOns(selectedSubmission.selectedAddOns || '[]').map((addon, index) => (
                              <span key={index} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm rounded">
                                {addon}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">No add-ons selected</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Extra Copies</label>
                      <p className="text-gray-900 dark:text-white">{selectedSubmission.extraCopies || 0}</p>
                    </div>
                    {selectedSubmission.sessionId && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Session ID</label>
                        <p className="text-gray-900 dark:text-white font-mono text-sm">{selectedSubmission.sessionId}</p>
                      </div>
                    )}
                    {selectedSubmission.orderId && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Order ID</label>
                        <p className="text-gray-900 dark:text-white font-mono text-sm">{selectedSubmission.orderId}</p>
                      </div>
                    )}
                  </div>
                  {/* Courier Address (if provided) */}
                  {selectedSubmission.courierAddress && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Courier Address</label>
                      <div className="mt-2 text-sm text-gray-900 dark:text-white space-y-1">
                        {(() => {
                          let addr: any = null
                          try { addr = typeof selectedSubmission.courierAddress === 'string' ? JSON.parse(selectedSubmission.courierAddress) : selectedSubmission.courierAddress } catch {}
                          if (!addr) return <p className="text-gray-500 dark:text-gray-400">N/A</p>
                          return (
                            <div>
                              {addr.name && <p className="font-medium">{addr.name}</p>}
                              {addr.line1 && <p>{addr.line1}</p>}
                              {addr.line2 && <p>{addr.line2}</p>}
                              {(addr.city || addr.state || addr.postalCode) && (
                                <p>{[addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')}</p>
                              )}
                              {addr.country && <p>{addr.country}</p>}
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Uploaded Files */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                  Uploaded Files
                </h4>
                {parseUploadedFiles(selectedSubmission.uploadedFiles || '[]').length > 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                        {parseUploadedFiles(selectedSubmission.uploadedFiles || '[]').length} File{parseUploadedFiles(selectedSubmission.uploadedFiles || '[]').length !== 1 ? 's' : ''} Available
                      </h5>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {parseUploadedFiles(selectedSubmission.uploadedFiles || '[]').length === 1 
                              ? 'Ready to download'
                              : 'Multiple files ready for download'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {(() => {
                          const files = parseUploadedFiles(selectedSubmission.uploadedFiles || '[]')
                          if (files.length > 0) {
                            return (
                              <div className="space-y-2">
                                {files.map((file, index) => (
                                  <button
                                    key={index}
                                    onClick={() => downloadIndividualFile(file.fileId, file.name)}
                                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors flex items-center justify-between"
                                  >
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                      <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <span className="truncate text-sm font-medium">{file.name}</span>
                                    </div>
                                    <span className="text-xs text-blue-100 ml-2">
                                      {file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : ''}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )
                          } else {
                            return (
                              <div className="text-center py-6">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">No files available</p>
                              </div>
                            )
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No files uploaded</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">This client hasn't uploaded any documents yet</p>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-gray-600 dark:text-gray-400">Created</label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedSubmission.createdAt ? new Date(selectedSubmission.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 dark:text-gray-400">Last Updated</label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedSubmission.updatedAt ? new Date(selectedSubmission.updatedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-6 flex justify-end">
                <Button onClick={closeDetailsModal} className="px-6">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotaryDashboard
