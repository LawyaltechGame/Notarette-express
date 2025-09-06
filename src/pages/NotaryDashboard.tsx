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

const NotaryDashboard: React.FC = () => {
  const user = useAppSelector(s => s.user.user)
  const [clientEmail, setClientEmail] = React.useState('')
  const [sessionId, setSessionId] = React.useState('')
  const [files, setFiles] = React.useState<File[]>([])
  const [folderName, setFolderName] = React.useState('')
  const [uploadType, setUploadType] = React.useState<'single' | 'folder'>('single')
  const [submitting, setSubmitting] = React.useState(false)
  const [requests, setRequests] = React.useState<any[]>([])
  const [loadingRequests, setLoadingRequests] = React.useState(false)
  const [formSubmissions, setFormSubmissions] = React.useState<any[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = React.useState(false)
  const [selectedSubmission, setSelectedSubmission] = React.useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const MAX_FILES = 5

  // Fetch all requests from the database
  const fetchRequests = async () => {
    if (!ENVObj.VITE_APPWRITE_DATABASE_ID || !ENVObj.VITE_APPWRITE_COLLECTION_ID) return
    
    try {
      setLoadingRequests(true)
      const response = await databases.listDocuments(
        ENVObj.VITE_APPWRITE_DATABASE_ID,
        ENVObj.VITE_APPWRITE_COLLECTION_ID,
        [Query.orderDesc('$createdAt')]
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
      const response = await databases.listDocuments(
        ENVObj.VITE_FORM_SUBMISSIONS_DATABASE_ID,
        ENVObj.VITE_FORM_SUBMISSIONS_TABLE_ID,
        [Query.orderDesc('$createdAt')]
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

  // Download all client files as folder (individual downloads for now)
  const downloadClientFilesAsZip = async (uploadedFiles: any[], clientName: string) => {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      alert('No files to download')
      return
    }

    try {
      console.log(`Downloading ${uploadedFiles.length} files from ${clientName} individually`)
      
      if (uploadedFiles.length === 1) {
        // If only one file, download it directly
        await downloadIndividualFile(uploadedFiles[0].fileId, uploadedFiles[0].name)
        return
      }

      // For multiple files, download them individually (no ZIP for now)
      console.log(`Downloading ${uploadedFiles.length} files individually...`)
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]
        if (file.fileId) {
          console.log(`Downloading file ${i + 1}/${uploadedFiles.length}: ${file.name}`)
          // Add a small delay between downloads to prevent browser blocking
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
          await downloadIndividualFile(file.fileId, file.name)
        }
      }
      
      console.log(`Successfully downloaded all ${uploadedFiles.length} files individually`)
    } catch (err) {
      console.error('Error downloading files:', err)
      alert(`Failed to download files: ${err instanceof Error ? err.message : String(err)}`)
    }
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

  // Clear files when switching upload types
  React.useEffect(() => {
    setFiles([])
  }, [uploadType])

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const newFiles = Array.from(e.target.files || [])
    console.log('New files selected:', newFiles.length, 'files')
    console.log('New file names:', newFiles.map(f => f.name))
    
    if (uploadType === 'folder') {
      // For multiple files mode, add to existing files (up to MAX_FILES)
      setFiles(prevFiles => {
        const combined = [...prevFiles, ...newFiles]
        return combined.slice(0, MAX_FILES)
      })
    } else {
      // For single file mode, replace
      setFiles(newFiles.slice(0, 1))
    }
    
    // Clear the input so the same files can be selected again
    e.target.value = ''
  }

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    console.log('Form submitted!')
    console.log('Client email:', clientEmail)
    console.log('Files count:', files.length)
    console.log('Upload type:', uploadType)
    console.log('Folder name:', folderName)
    
    if (!clientEmail.trim()) {
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
      
      let uploadBatchId = sessionId || ID.unique()
      let folderDocId: string | null = null
      
      // Auto-generate folder name if not provided and uploading multiple files
      const finalFolderName = folderName || (files.length > 1 ? `Notarized_Documents_${new Date().toISOString().split('T')[0]}` : '')
      console.log('Final folder name:', finalFolderName)
      
      if (dbId && colId) {
        console.log('Creating database document...')
        const doc = await databases.createDocument(dbId, colId, ID.unique(), {
          type: 'notarized_upload',
          uploadBatchId,
          clientEmail,
          folderName: finalFolderName,
          uploadedBy: user?.email || null,
          createdAt: new Date().toISOString(),
          files: '[]',
          uploadType: uploadType
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
      
      const folderNameValue = folderName.trim() || `session_${sessionId}`
      const folderPath = `notarized-docs/${clientEmail}/${sessionId}/${folderNameValue}`
      
      const uploaded: Array<{ fileId: string; name: string; folderPath: string }> = []
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        console.log(`Uploading file ${i + 1}/${files.length}:`, f.name, 'Size:', f.size)
        try {
          const res = await storage.createFile(
            String(bucketId), 
            ID.unique(), 
            f,
            [
              Permission.read(Role.users())
            ]
          )
          console.log(`File uploaded successfully to ${folderPath}:`, res.$id)
          uploaded.push({ 
            fileId: res.$id, 
            name: f.name,
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
      alert(`Documents uploaded successfully as ${uploadType === 'folder' ? 'multiple files batch' : 'single file'}`)
      setFiles([])
      setFolderName('')
      setClientEmail('')
      setSessionId('')
      setUploadType('single')
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={clientEmail} onChange={e=>setClientEmail(e.target.value)} type="email" placeholder="Client Email" className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                <input value={sessionId} onChange={e=>setSessionId(e.target.value)} type="text" placeholder="Order / Session ID (optional)" className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              </div>
              
              {/* Upload Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="single"
                      checked={uploadType === 'single'}
                      onChange={(e) => {
                        setUploadType(e.target.value as 'single' | 'folder')
                        setFiles([]) // Clear files when switching types
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Single File</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="folder"
                      checked={uploadType === 'folder'}
                      onChange={(e) => {
                        setUploadType(e.target.value as 'single' | 'folder')
                        setFiles([]) // Clear files when switching types
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Multiple Files (Batch)</span>
                  </label>
                </div>
                {uploadType === 'folder' && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      📁 Multiple Files Upload Mode
                    </p>
                    <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">
                      Select multiple files at once. They will be uploaded as a batch and downloaded as a ZIP file by the client.
                    </p>
                  </div>
                )}
              </div>

              {/* Folder Name Input - only show for folder uploads or when multiple files */}
              {(uploadType === 'folder' || files.length > 1) && (
                <input 
                  value={folderName} 
                  onChange={e=>setFolderName(e.target.value)} 
                  type="text" 
                  placeholder={uploadType === 'folder' ? "Folder Name (required)" : "Folder Name (optional)"} 
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" 
                />
              )}

              {/* File Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {uploadType === 'folder' ? 'Select Multiple Files' : 'Select File'} 
                  {uploadType === 'folder' && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({files.length}/{MAX_FILES} selected)
                    </span>
                  )}
                </label>
                <input 
                  ref={fileInputRef}
                  onChange={onFileChange} 
                  type="file" 
                  multiple={uploadType === 'folder'}
                  disabled={uploadType === 'folder' && files.length >= MAX_FILES}
                  className="block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed" 
                />
                {uploadType === 'folder' && files.length >= MAX_FILES && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Maximum {MAX_FILES} files reached. Remove some files to add more.
                  </p>
                )}
                {files.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Selected {files.length} file(s)
                    </p>
                    {uploadType === 'folder' && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        📁 These files will be downloaded as a ZIP by the client
                      </p>
                    )}
                    <div className="max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded p-2 text-xs mt-2">
                      {files.map((f, index) => (
                        <div key={index} className="flex items-center justify-between text-gray-700 dark:text-gray-300 py-1">
                          <span className="truncate flex-1">{f.name}</span>
                          {uploadType === 'folder' && (
                            <button
                              type="button"
                              onClick={() => {
                                setFiles(prev => prev.filter((_, i) => i !== index))
                              }}
                              className="ml-2 text-red-500 hover:text-red-700 text-xs"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {uploadType === 'folder' && files.length > 0 && (
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

              <Button type="submit" disabled={submitting || (uploadType === 'folder' && !folderName.trim())}>
                {submitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading {files.length} file(s)...
                  </div>
                ) : (
                  `Upload ${uploadType === 'folder' ? 'Multiple Files' : 'File'}`
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
            <Button onClick={fetchFormSubmissions} disabled={loadingSubmissions} className="text-sm">
              {loadingSubmissions ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          
          {loadingSubmissions ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading submissions...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400">
                    <th className="py-3 pr-4 font-medium">Client Name</th>
                    <th className="py-3 pr-4 font-medium">Email</th>
                    <th className="py-3 pr-4 font-medium">Document Type</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Current Step</th>
                    <th className="py-3 pr-4 font-medium">Services</th>
                    <th className="py-3 pr-4 font-medium">Date</th>
                    <th className="py-3 pr-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800 dark:text-gray-200">
                  {formSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No form submissions found
                      </td>
                    </tr>
                  ) : (
                    formSubmissions.map((submission) => {
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
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Request Management Section */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Request Management</h2>
            <Button onClick={fetchRequests} disabled={loadingRequests} className="text-sm">
              {loadingRequests ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          
          {loadingRequests ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading requests...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400">
                    <th className="py-3 pr-4 font-medium">Client Email</th>
                    <th className="py-3 pr-4 font-medium">Session ID</th>
                    <th className="py-3 pr-4 font-medium">Type</th>
                    <th className="py-3 pr-4 font-medium">Folder</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Files</th>
                    <th className="py-3 pr-4 font-medium">Uploaded By(Notary)</th>
                    <th className="py-3 pr-4 font-medium">Date</th>
                    <th className="py-3 pr-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800 dark:text-gray-200">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No requests found
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => {
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
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              request.uploadType === 'folder' 
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}>
                              {request.uploadType === 'folder' ? 'Folder' : 'Single Files'}
                            </span>
                          </td>
                          <td className="py-3 pr-4">{request.folderName || 'Default'}</td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              status === 'Current' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {status}
                            </span>
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
                    })
                  )}
                </tbody>
              </table>
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
                      <p className="text-gray-900 dark:text-white">{selectedSubmission.description || 'N/A'}</p>
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
                          if (files.length === 1) {
                            return (
                              <button
                                onClick={() => downloadIndividualFile(files[0].fileId, files[0].name)}
                                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors flex items-center justify-center space-x-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Download File</span>
                              </button>
                            )
                          } else if (files.length > 1) {
                            return (
                              <div className="space-y-3">
                                <button
                                  onClick={() => downloadClientFilesAsZip(files, selectedSubmission.fullName || 'Client')}
                                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors flex items-center justify-center space-x-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                  </svg>
                                  <span>Download All Files</span>
                                </button>
                                <button
                                  onClick={() => {
                                    files.forEach(file => {
                                      if (file.fileId) {
                                        downloadIndividualFile(file.fileId, file.name)
                                      }
                                    })
                                  }}
                                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md transition-colors flex items-center justify-center space-x-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  <span>Download Individually</span>
                                </button>
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
