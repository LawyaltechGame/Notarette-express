import React from 'react'
import { storage, databases } from '../lib/appwrite'
import { ID, Query } from 'appwrite'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAppSelector } from '../hooks/useAppSelector'
import { ENVObj } from '../lib/constant'
import { Functions } from 'appwrite'
import { client } from '../lib/appwrite'

const NotaryDashboard: React.FC = () => {
  const user = useAppSelector(s => s.user.user)
  const [clientEmail, setClientEmail] = React.useState('')
  const [sessionId, setSessionId] = React.useState('')
  const [files, setFiles] = React.useState<File[]>([])
  const [folderName, setFolderName] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [requests, setRequests] = React.useState<any[]>([])
  const [loadingRequests, setLoadingRequests] = React.useState(false)

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

  // Fetch requests on component mount
  React.useEffect(() => {
    fetchRequests()
  }, [])

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const list = Array.from(e.target.files || [])
    setFiles(list.slice(0, MAX_FILES))
  }

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (!clientEmail.trim()) return
    if (files.length === 0) return
    try {
      setSubmitting(true)
      // 1) Create a folder doc (optional)
      const dbId = import.meta.env.VITE_APPWRITE_DATABASE_ID
      const colId = import.meta.env.VITE_APPWRITE_COLLECTION_ID
      let uploadBatchId = sessionId || ID.unique()
      let folderDocId: string | null = null
      if (dbId && colId) {
        const doc = await databases.createDocument(dbId, colId, ID.unique(), {
          type: 'notarized_upload',
          uploadBatchId,
          clientEmail,
          folderName,
          uploadedBy: user?.email || null,
          createdAt: new Date().toISOString(),
          files: '[]'
        })
        folderDocId = doc.$id
      }
      // 2) Upload files to storage
      const bucketId = import.meta.env.VITE_APPWRITE_BUCKET_ID
      const uploaded: Array<{ fileId: string; name: string; }> = []
      for (const f of files) {
        const res = await storage.createFile(String(bucketId), ID.unique(), f)
        uploaded.push({ fileId: res.$id, name: f.name })
      }
      // 3) Link files to doc if DB available
      if (dbId && colId && folderDocId) {
        await databases.updateDocument(dbId, colId, folderDocId, {
          files: JSON.stringify(uploaded),
        })
      }

      // 4) Secure mode: call function to grant client read access per file
      const grantFnId = ENVObj.VITE_GRANT_FILE_ACCESS_FUNCTION_ID || ENVObj.VITE_GRANT_FUNCTION_ID
      if (grantFnId) {
        const functions = new Functions(client)
        await functions.createExecution(
          String(grantFnId),
          JSON.stringify({ clientEmail, files: uploaded }),
          false
        )
      }
      alert('Documents uploaded successfully')
      setFiles([])
      setFolderName('')
      setClientEmail('')
      setSessionId('')
      // Refresh the requests list
      fetchRequests()
    } catch (err) {
      console.error(err)
      alert('Upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notary Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Upload notarized documents to Appwrite and link them to clients.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upload Notarized Documents</h2>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={clientEmail} onChange={e=>setClientEmail(e.target.value)} type="email" placeholder="Client Email" className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                <input value={sessionId} onChange={e=>setSessionId(e.target.value)} type="text" placeholder="Order / Session ID (optional)" className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              </div>
              <input value={folderName} onChange={e=>setFolderName(e.target.value)} type="text" placeholder="Folder Name (optional)" className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              <input onChange={onFileChange} type="file" multiple className="block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300" />
              <Button type="submit" disabled={submitting}>{submitting ? 'Uploading…' : 'Upload'}</Button>
            </form>
          </Card>

          {/* <div className="lg:col-span-2">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
              <p className="text-gray-700 dark:text-gray-300 text-sm">Maximum {MAX_FILES} files per upload. Uploaded files are stored in Appwrite Storage (bucket: VITE_APPWRITE_BUCKET_ID) and linked in your Database (VITE_APPWRITE_DATABASE_ID / VITE_APPWRITE_COLLECTION_ID). Clients will see them in their portal automatically once we fetch and display by client email.</p>
            </Card>
          </div> */}
        </div>

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
                      <td colSpan={8} className="py-8 text-center text-gray-500 dark:text-gray-400">
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
    </div>
  )
}

export default NotaryDashboard
