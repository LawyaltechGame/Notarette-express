import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Upload, Download, Clock, CheckCircle, AlertCircle, Eye, Shield, CreditCard, Globe, Building, UserCheck, Plus, ArrowRight, Sparkles } from 'lucide-react'
import { useAppSelector } from '../hooks/useAppSelector'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { databases } from '../lib/appwrite'
import { Query } from 'appwrite'
import { ENVObj } from '../lib/constant'
import { FileService, FileMetadata } from '../services/fileService'
import { formService, FormSubmission, parseUploadedFiles } from '../services/formService'

const Portal: React.FC = () => {
  const orders = useAppSelector(state => state.order.orders)
  const navigate = useNavigate()
  const user = useAppSelector(s => s.user.user)
  // Notarized Documents section removed; keep placeholders if needed in future
  const [notarizedFiles, setNotarizedFiles] = React.useState<FileMetadata[]>([])
  const [loadingNotarizedFiles, setLoadingNotarizedFiles] = React.useState(false)
  const [notarizationStatus, setNotarizationStatus] = React.useState<string>('')
  const [notaryUploads, setNotaryUploads] = React.useState<any[]>([])
  const [submissions, setSubmissions] = React.useState<FormSubmission[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = React.useState(false)
  const [clientUploads, setClientUploads] = React.useState<FileMetadata[]>([])
  const [loadingClientUploads, setLoadingClientUploads] = React.useState(false)
  const [totalOrders, setTotalOrders] = React.useState(0)
  const [completedCount, setCompletedCount] = React.useState(0)
  const [inProgressCount, setInProgressCount] = React.useState(0)
  const [showRetentionNotice, setShowRetentionNotice] = React.useState(false)

  const normalizeNotarizationStatus = (val: any): 'started' | 'pending' | 'completed' | '' => {
    const s = String(val || '').toLowerCase().trim()
    if (!s) return ''
    if (s.includes('complete')) return 'completed'
    if (s.includes('start')) return 'started'
    if (s.includes('pend')) return 'pending'
    if (s === 'completed' || s === 'started' || s === 'pending') return s as any
    return ''
  }

  // Fetch notarized files for the current client
  const fetchNotarizedFiles = async () => {
    if (!user?.email) return
    
    setLoadingNotarizedFiles(true)
    try {
      console.log(`Fetching notarized files for client: ${user.email}`)
      // Primary: fetch from storage by client prefix
      const filesFromStorage = await FileService.getNotarizedFiles(user.email)
      if (filesFromStorage.length > 0) {
        setNotarizedFiles(filesFromStorage)
        console.log(`Found ${filesFromStorage.length} notarized files (storage)`)
        return
      }

      // Fallback: derive from database docs (files JSON stored when notary uploaded)
      if (ENVObj.VITE_APPWRITE_DATABASE_ID && ENVObj.VITE_APPWRITE_COLLECTION_ID) {
        console.log('Storage returned 0. Falling back to database records...')
        const res = await databases.listDocuments(
          ENVObj.VITE_APPWRITE_DATABASE_ID,
          ENVObj.VITE_APPWRITE_COLLECTION_ID,
          [Query.equal('clientEmail', (user.email || '').toLowerCase())]
        )
        const rows = res.documents || []
        const collected: FileMetadata[] = []
        for (const row of rows) {
          let arr: any[] = []
          try {
            arr = Array.isArray(row.files) ? row.files : JSON.parse(row.files || '[]')
          } catch {}
          for (const item of arr) {
            if (item && item.fileId) {
              collected.push({
                fileId: item.fileId,
                name: item.name || 'notarized.pdf',
                size: item.size || 0,
                type: item.type || undefined,
                folderPath: item.folderPath || undefined,
                uploadedAt: row.createdAt || row.$createdAt
              })
            }
          }
        }
        console.log(`Found ${collected.length} notarized files (database fallback)`)
        setNotarizedFiles(collected)
      } else {
        setNotarizedFiles([])
      }
    } catch (error) {
      console.error('Error fetching notarized files:', error)
      setNotarizedFiles([])
    } finally {
      setLoadingNotarizedFiles(false)
    }
  }

  // Fetch submissions (transactions/history) for the current client
  const fetchClientSubmissions = async () => {
    if (!user?.email) return
    setLoadingSubmissions(true)
    try {
      const rows = await formService.getSubmissionsByEmail((user.email || '').toLowerCase())
      setSubmissions(rows)
    } catch (e) {
      console.warn('Fetching client submissions failed', e)
      setSubmissions([])
    } finally {
      setLoadingSubmissions(false)
    }
  }

  // Fetch client's own uploaded files
  const fetchClientUploadedFiles = async () => {
    if (!user?.email) return
    setLoadingClientUploads(true)
    try {
      const files = await FileService.getClientUploadedFiles(user.email)
      // Sort newest first
      const sorted = [...files].sort((a, b) => {
        const ta = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0
        const tb = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0
        return tb - ta
      })
      setClientUploads(sorted)
    } catch (e) {
      console.warn('Fetching client uploads failed', e)
      setClientUploads([])
    } finally {
      setLoadingClientUploads(false)
    }
  }

  // Fetch latest notarization status from notary uploads collection
  const fetchNotarizationStatus = async () => {
    if (!user?.email) return
    try {
      if (!ENVObj.VITE_APPWRITE_DATABASE_ID || !ENVObj.VITE_APPWRITE_COLLECTION_ID) return
      const res = await databases.listDocuments(
        ENVObj.VITE_APPWRITE_DATABASE_ID,
        ENVObj.VITE_APPWRITE_COLLECTION_ID,
        [
          Query.equal('clientEmail', (user.email || '').toLowerCase()),
          Query.orderDesc('$createdAt'),
          Query.limit(1)
        ]
      )
      const latest = res.documents?.[0]
      if (latest && latest.notarizationStatus) {
        setNotarizationStatus(normalizeNotarizationStatus(latest.notarizationStatus))
      } else {
        setNotarizationStatus('')
      }
    } catch (e) {
      console.warn('Fetch notarization status failed', e)
      setNotarizationStatus('')
    }
  }

  // Fetch all notary uploads to compute counts
  const fetchNotaryUploadCounts = async () => {
    if (!user?.email) return
    try {
      if (!ENVObj.VITE_APPWRITE_DATABASE_ID || !ENVObj.VITE_APPWRITE_COLLECTION_ID) return
      const res = await databases.listDocuments(
        ENVObj.VITE_APPWRITE_DATABASE_ID,
        ENVObj.VITE_APPWRITE_COLLECTION_ID,
        [Query.equal('clientEmail', (user.email || '').toLowerCase())]
      )
      const docs = res.documents || []
      let completed = 0
      let inProg = 0
      docs.forEach(d => {
        const s = normalizeNotarizationStatus((d as any).notarizationStatus)
        if (s === 'completed') completed += 1
        else if (s === 'pending' || s === 'started') inProg += 1
      })
      setCompletedCount(completed)
      setInProgressCount(inProg)
    } catch (e) {
      console.warn('Fetch notary upload counts failed', e)
      setCompletedCount(0)
      setInProgressCount(0)
    }
  }

  // Fetch notary uploads list for per-order status matching
  const fetchNotaryUploads = async () => {
    if (!user?.email) return
    try {
      if (!ENVObj.VITE_APPWRITE_DATABASE_ID || !ENVObj.VITE_APPWRITE_COLLECTION_ID) return
      const res = await databases.listDocuments(
        ENVObj.VITE_APPWRITE_DATABASE_ID,
        ENVObj.VITE_APPWRITE_COLLECTION_ID,
        [
          Query.equal('clientEmail', (user.email || '').toLowerCase()),
          Query.orderDesc('$createdAt')
        ]
      )
      setNotaryUploads(res.documents || [])
    } catch (e) {
      console.warn('Fetch notary uploads failed', e)
      setNotaryUploads([])
    }
  }

  // Download notarized file
  const downloadNotarizedFile = async (file: FileMetadata) => {
    try {
      console.log(`Downloading notarized file: ${file.name}`)
      await FileService.downloadFile(file.fileId, file.name)
    } catch (error) {
      console.error('Error downloading notarized file:', error)
      alert('Failed to download file. Please try again.')
    }
  }

  // Download all notarized files as ZIP
  const downloadAllNotarizedFiles = async () => {
    if (notarizedFiles.length === 0) {
      alert('No notarized files available for download')
      return
    }

    try {
      console.log(`Downloading ${notarizedFiles.length} notarized files as ZIP`)
      await FileService.downloadFilesAsZip(notarizedFiles, `${user?.email || 'client'}_notarized_documents.zip`)
    } catch (error) {
      console.error('Error downloading notarized files ZIP:', error)
      alert('Failed to download ZIP file. Please try again.')
    }
  }

  // handleDownload no longer used (direct download via FileService)


  // Check if user has any real orders
  const hasOrders = orders && orders.length > 0

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      case 'processing':
        return <Badge variant="info">Processing</Badge>
      case 'paid':
        return <Badge variant="warning">Pending Action</Badge>
      case 'pending':
        return <Badge variant="default">Pending</Badge>
      case 'failed':
        return <Badge variant="error">Failed</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const getKYCStatusBadge = (kycStatus: string) => {
    switch (kycStatus) {
      case 'verified':
        return <Badge variant="success">Verified</Badge>
      case 'started':
        return <Badge variant="info">In Progress</Badge>
      case 'required':
        return <Badge variant="warning">Required</Badge>
      case 'failed':
        return <Badge variant="error">Failed</Badge>
      default:
        return <Badge variant="default">{kycStatus}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'paid':
        return <CreditCard className="w-5 h-5 text-amber-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-600" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  // Formatting helpers for notarized files
  const formatDateDDMMYY = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yy = String(date.getFullYear()).slice(-2)
    return `${dd}-${mm}-${yy}`
  }

  const formatTime12h = (date: Date) => {
    let hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    return `${hours}:${minutes} ${ampm}`
  }

  React.useEffect(() => {
    // Only fetch notarized files now
    fetchNotarizedFiles()
    fetchNotarizationStatus()
    fetchClientUploadedFiles()
    fetchClientSubmissions()
    fetchNotaryUploadCounts()
    fetchNotaryUploads()
  }, [user?.email])

  // Derive total orders and your uploads from submissions
  React.useEffect(() => {
    if (!submissions || submissions.length === 0) {
      setTotalOrders(0)
      return
    }
    // Total orders: payment completed and at least one uploaded file in submission
    const total = submissions.filter(s => {
      const paid = s.status === 'completed'
      let hasFiles = false
      try {
        const arr = parseUploadedFiles(s.uploadedFiles || '[]') as any[]
        hasFiles = Array.isArray(arr) && arr.length > 0
      } catch {}
      return paid && hasFiles
    }).length
    setTotalOrders(total)
  }, [submissions])

  React.useEffect(() => {
    const dismissed = localStorage.getItem('portalRetentionNoticeDismissed') === 'true'
    if (!dismissed) {
      setShowRetentionNotice(true)
    }
  }, [])

  const dismissRetentionNotice = () => {
    localStorage.setItem('portalRetentionNoticeDismissed', 'true')
    setShowRetentionNotice(false)
  }

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.includes('Power of Attorney')) return <Shield className="w-5 h-5 text-blue-600" />
    if (serviceName.includes('Certified Copy')) return <FileText className="w-5 h-5 text-green-600" />
    if (serviceName.includes('Passport') || serviceName.includes('ID')) return <UserCheck className="w-5 h-5 text-purple-600" />
    if (serviceName.includes('Online Content')) return <Globe className="w-5 h-5 text-teal-600" />
    if (serviceName.includes('Signature')) return <FileText className="w-5 h-5 text-orange-600" />
    if (serviceName.includes('Apostille')) return <Globe className="w-5 h-5 text-indigo-600" />
    if (serviceName.includes('Contract')) return <Building className="w-5 h-5 text-red-600" />
    return <FileText className="w-5 h-5 text-gray-600" />
  }

  const getPerOrderNotarizationStatus = (submission: FormSubmission): 'started' | 'pending' | 'completed' => {
    try {
      if (!notaryUploads || notaryUploads.length === 0) return 'pending'
      const subTime = new Date((submission as any).createdAt || (submission as any).$createdAt).getTime()
      // Find the first upload on or after submission time; if none, fallback to the latest before
      let candidate: any | null = null
      for (const u of notaryUploads) {
        const t = new Date((u as any).createdAt || (u as any).$createdAt).getTime()
        if (t >= subTime) { candidate = u; break }
      }
      if (!candidate) {
        // fallback: closest before
        candidate = notaryUploads.reduce((best: any, u: any) => {
          const t = new Date(u.createdAt || u.$createdAt).getTime()
          if (t <= subTime) {
            if (!best) return u
            const bt = new Date(best.createdAt || best.$createdAt).getTime()
            return Math.abs(subTime - t) < Math.abs(subTime - bt) ? u : best
          }
          return best
        }, null as any)
      }
      const normalized = candidate && candidate.notarizationStatus
        ? normalizeNotarizationStatus(candidate.notarizationStatus)
        : ''
      return (normalized || 'pending') as 'started' | 'pending' | 'completed'
    } catch {
      return 'pending'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {showRetentionNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={dismissRetentionNotice} />
            <div className="relative z-10 w-full max-w-lg">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Important: 7-Day File Retention</h3>
                </div>
                <div className="px-6 py-5 space-y-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    For security and compliance, your uploaded and notarized documents are stored on our servers for <span className="font-semibold">7 days</span> after they are available.
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Please download your completed documents as soon as they appear in your portal. After 7 days, files are automatically removed and cannot be recovered.
                  </p>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                  <Button variant="secondary" onClick={dismissRetentionNotice}>Got it</Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Your Client Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {hasOrders 
              ? 'Manage your notarization orders, track progress, and download completed documents.'
              : 'Get started with your first notarization service. We\'re here to help with all your document needs.'
            }
          </p>
        </motion.div>

        {/* Persistent retention reminder (hidden only while modal is open) */}
        {!showRetentionNotice && (
          <div className="mb-6">
            <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <p className="text-sm">
                For security and compliance, client uploaded and their notarized documents are stored for <span className="font-semibold">7 days</span>. Please download your completed documents promptly.
              </p>
            </div>
          </div>
        )}

        {/* History-first experience */}
        {true ? (
          // Existing User Experience - Show Orders
          <>
            {/* Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transactions</h2>
                  {orders.length > 0 && (
                    <Badge variant="info">{orders.length} total</Badge>
                  )}
                </div>
                {loadingSubmissions ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400">Loading transactions...</div>
                ) : submissions.length === 0 ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400">No transactions yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600 dark:text-gray-400">
                          <th className="py-2 pr-4">Submission</th>
                          <th className="py-2 pr-4">Service</th>
                          <th className="py-2 pr-4">Amount</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2 pr-4">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {submissions.map(s => (
                          <tr key={s.$id} className="text-gray-900 dark:text-gray-100">
                            <td className="py-2 pr-4 whitespace-nowrap">{s.$id?.slice(0, 8)}</td>
                            <td className="py-2 pr-4">{s.serviceSlug || '-'}</td>
                            <td className="py-2 pr-4">
                              {typeof s.totalAmount === 'number' && s.currency
                                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: s.currency }).format(s.totalAmount)
                                : (typeof s.totalAmountCents === 'number' && s.currency
                                  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: s.currency }).format((s.totalAmountCents || 0) / 100)
                                  : '-')}
                            </td>
                            <td className="py-2 pr-4">{getStatusBadge(s.status)}</td>
                            <td className="py-2 pr-4 whitespace-nowrap">{formatDate(s.createdAt || (s as any).$createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </motion.div>
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            >
              <Card>
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-teal-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {totalOrders}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Orders</div>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {completedCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {inProgressCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Orders List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Your Orders
                  </h2>
                </div>

                <div className="space-y-4">
                  {submissions.length === 0 ? (
                    <div className="text-sm text-gray-600 dark:text-gray-400">No orders yet.</div>
                  ) : (
                    submissions.slice(0, 10).map((s, index) => {
                      const options = s.selectedOptions ? ((): string[] => { try { return JSON.parse(s.selectedOptions) } catch { return [] } })() : []
                      const addons = s.selectedAddOns ? ((): string[] => { try { return JSON.parse(s.selectedAddOns) } catch { return [] } })() : []
                      const amount = typeof s.totalAmount === 'number' && s.currency
                        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: s.currency }).format(s.totalAmount)
                        : (typeof s.totalAmountCents === 'number' && s.currency
                          ? new Intl.NumberFormat('en-US', { style: 'currency', currency: s.currency }).format((s.totalAmountCents || 0) / 100)
                          : '-')
                      return (
                        <motion.div
                          key={s.$id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(s.status === 'completed' ? 'completed' : 'processing')}
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{s.$id}</h3>
                                <div className="flex items-center space-x-2">
                                  {getServiceIcon(s.serviceSlug || '')}
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{s.serviceSlug || '-'}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900 dark:text-white">{amount}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">{formatDate(s.createdAt || (s as any).$createdAt)}</div>
                            </div>
                          </div>

                          {(options.length > 0 || addons.length > 0) && (
                            <div className="mb-4 flex flex-wrap gap-2">
                              {options.map((op: string, i: number) => (
                                <span key={`opt-${i}`} className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">{op}</span>
                              ))}
                              {addons.map((ad: string, i: number) => (
                                <span key={`ad-${i}`} className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">{ad}</span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                              {getStatusBadge(s.status)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Notarization:</span>
                              {(() => { const per = getPerOrderNotarizationStatus(s); return (
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  per === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                  per === 'started' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                }`}>
                                  {per}
                                </span>
                              ) })()}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </Card>
            </motion.div>
            {/* Client Uploads */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Uploads</h2>
                </div>
                {loadingClientUploads ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400">Loading your uploads...</div>
                ) : (() => {
                  // Prefer latest submission's uploadedFiles
                  const latest = submissions[0]
                  if (!latest || !latest.uploadedFiles) {
                    return <div className="text-sm text-gray-600 dark:text-gray-400">No uploads found.</div>
                  }
                  let uploaded: any[] = []
                  try { uploaded = parseUploadedFiles(latest.uploadedFiles) as any[] } catch {}
                  if (!uploaded || uploaded.length === 0) {
                    return <div className="text-sm text-gray-600 dark:text-gray-400">No uploads found.</div>
                  }
                  const dateKey = formatDateDDMMYY(new Date(latest.createdAt || (latest as any).$createdAt))
                  return (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{dateKey}</h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Latest</span>
                        </div>
                        {uploaded.map((u, index) => (
                          <div key={`client-upload-${index}`} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                            <div className="flex items-center space-x-3">
                              <Upload className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">Uploaded Document</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">From service form</p>
                              </div>
                            </div>
                            {u?.fileId ? (
                              <Button
                                onClick={() => FileService.downloadFile(u.fileId, u.name || 'document.pdf')}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </Card>
            </motion.div>

          </>
        ) : null}

        

        {/* Notarized Documents section removed per request; using Notarized Files only */}

        {/* Notarized Files from Storage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notarized Files</h2>
              </div>
            </div>
            {loadingNotarizedFiles ? (
              <div className="text-sm text-gray-600 dark:text-gray-400">Loading notarized files...</div>
            ) : notarizedFiles.length === 0 ? (
              <div className="text-sm text-gray-600 dark:text-gray-400">No notarized files available yet.</div>
            ) : (
              (() => {
                // Sort newest first
                const sorted = [...notarizedFiles].sort((a, b) => {
                  const ta = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0
                  const tb = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0
                  return tb - ta
                })

                // Compute latest upload timestamp to mark individual latest files
                const latestTs = sorted.length > 0
                  ? Math.max(...sorted.map(f => (f.uploadedAt ? new Date(f.uploadedAt).getTime() : 0)))
                  : 0

                // Group by date string (dd-mm-yy)
                const groups: Record<string, typeof sorted> = {}
                sorted.forEach((f) => {
                  const d = f.uploadedAt ? new Date(f.uploadedAt) : new Date()
                  const key = formatDateDDMMYY(d)
                  if (!groups[key]) groups[key] = []
                  groups[key].push(f)
                })

                const dateKeys = Object.keys(groups)

                return (
                  <div className="space-y-6">
                    {dateKeys.map((dateKey, groupIdx) => (
                      <div key={dateKey} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {dateKey}
                          </h4>
                        </div>
                        {groups[dateKey].map((file, index) => (
                          <div key={`${dateKey}-${index}`} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">Notarized Document</p>
                                {file.uploadedAt && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Uploaded at {formatTime12h(new Date(file.uploadedAt))}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => downloadNotarizedFile(file)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                {`Download File ${index + 1}`}
                              </Button>
                              {(file.uploadedAt && new Date(file.uploadedAt).getTime() === latestTs) && (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/15 to-emerald-400/15 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-500/30 shadow-sm">
                                  <Sparkles className="w-3 h-3" />
                                  Latest
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )
              })()
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Portal