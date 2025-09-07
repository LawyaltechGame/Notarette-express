import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Upload, Download, Clock, CheckCircle, AlertCircle, Eye, Shield, CreditCard, Globe, Building, UserCheck, Plus, ArrowRight } from 'lucide-react'
import { useAppSelector } from '../hooks/useAppSelector'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { databases } from '../lib/appwrite'
import { Query } from 'appwrite'
import { ENVObj } from '../lib/constant'
import { FileService, FileMetadata } from '../services/fileService'

const Portal: React.FC = () => {
  const orders = useAppSelector(state => state.order.orders)
  const navigate = useNavigate()
  const user = useAppSelector(s => s.user.user)
  // Notarized Documents section removed; keep placeholders if needed in future
  const [notarizedFiles, setNotarizedFiles] = React.useState<FileMetadata[]>([])
  const [loadingNotarizedFiles, setLoadingNotarizedFiles] = React.useState(false)
  const [notarizationStatus, setNotarizationStatus] = React.useState<string>('')

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
  }, [user?.email])

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {!hasOrders ? (
          // Empty State - New User Experience
          <>
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <Card className="text-center py-12">
                <div className="w-24 h-24 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                  Welcome to Notarette Express! We provide professional notarization services for all your document needs. 
                  From power of attorney to apostille services, we've got you covered with secure, fast, and reliable service.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={() => navigate('/services')}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Browse Services
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={() => navigate('/how-it-works')}
                  >
                    Learn How It Works
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Service Categories Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                Popular Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card hover className="text-center p-6">
                  <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Power of Attorney</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Legally binding power of attorney notarization
                  </p>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/services/power-of-attorney')}
                  >
                    Learn More
                  </Button>
                </Card>

                <Card hover className="text-center p-6">
                  <FileText className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Document Certification</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Official certified copies of original documents
                  </p>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/services/certified-copy-document')}
                  >
                    Learn More
                  </Button>
                </Card>

                <Card hover className="text-center p-6">
                  <Globe className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Online Content</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Notarization of digital content and websites
                  </p>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/services/online-content-notarization')}
                  >
                    Learn More
                  </Button>
                </Card>
              </div>
            </motion.div>

            {/* How It Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <Card>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                  How Notarette Express Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-blue-600 text-xl font-bold">1</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Choose Service</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Select from our range of notarization services
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-green-600 text-xl font-bold">2</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Complete KYC</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Verify your identity securely online
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-purple-600 text-xl font-bold">3</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Get Notarized</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive your notarized documents quickly
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        ) : (
          // Existing User Experience - Show Orders
          <>
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            >
              <Card>
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-teal-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {orders.length}
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
                      {orders.filter(o => o.status === 'completed').length}
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
                      {orders.filter(o => o.status === 'processing').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {orders.filter(o => o.kycStatus === 'required' || o.kycStatus === 'started').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Action Required</div>
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
                  <Button variant="secondary" size="sm">
                    Export History
                  </Button>
                </div>

                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(order.status)}
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {order.id}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {getServiceIcon(order.items[0].name)}
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {order.items[0].name}
                                {order.items[0].addOns?.extraPages && (
                                  <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                    +{order.items[0].addOns.extraPages} pages
                                  </span>
                                )}
                                {order.items[0].addOns?.rushService && (
                                  <span className="ml-2 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                                    Rush Service
                                  </span>
                                )}
                                {order.items[0].addOns?.courier && (
                                  <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                                    Courier Delivery
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {formatPrice(order.amountCents, order.currency)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">KYC:</span>
                          {getKYCStatusBadge(order.kycStatus)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Delivery:</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {order.deliveryMethod}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {order.status === 'paid' && order.kycStatus === 'required' && (
                          <Button variant="primary" size="sm">
                            <Shield className="w-4 h-4 mr-1" />
                            Complete Identity Verification
                          </Button>
                        )}
                        
                        {order.kycStatus === 'started' && (
                          <Button variant="primary" size="sm">
                            <Shield className="w-4 h-4 mr-1" />
                            Continue KYC Process
                          </Button>
                        )}
                        
                        {order.kycStatus === 'verified' && !order.uploadedFiles && (
                          <Button variant="primary" size="sm">
                            <Upload className="w-4 h-4 mr-1" />
                            Upload Documents
                          </Button>
                        )}
                        
                        {order.completedFiles && order.completedFiles.length > 0 && (
                          <Button variant="secondary" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Download Results
                          </Button>
                        )}
                        
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>

                      {/* File Status */}
                      {(order.uploadedFiles || order.completedFiles) && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Files:</div>
                          {order.uploadedFiles && (
                            <div className="flex items-center space-x-2 text-sm mb-2">
                              <Upload className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-900 dark:text-white">
                                Uploaded: {order.uploadedFiles.join(', ')}
                              </span>
                            </div>
                          )}
                          {order.completedFiles && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Download className="w-4 h-4 text-green-600" />
                              <span className="text-gray-900 dark:text-white">
                                Ready: {order.completedFiles.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <Card hover>
            <div className="text-center">
              <FileText className="w-12 h-12 text-teal-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                New Order
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Start a new notarization request
              </p>
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => navigate('/services')}
              >
                Browse Services
              </Button>
            </div>
          </Card>

          <Card hover>
            <div className="text-center">
              <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Upload Documents
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Upload documents for pending orders
              </p>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => navigate('/services')}
              >
                Get Started
              </Button>
            </div>
          </Card>

          <Card hover>
            <div className="text-center">
              <Download className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Download Center
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Access all completed documents
              </p>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => navigate('/services')}
              >
                Browse Services
              </Button>
            </div>
          </Card>
        </motion.div>

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
                {notarizationStatus && (
                  <span className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                    notarizationStatus === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    notarizationStatus === 'started' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}>
                    <span>{notarizationStatus === 'completed' ? '✅' : notarizationStatus === 'started' ? '▶' : '⏳'}</span>
                    <span>{`Notarization: ${notarizationStatus}`}</span>
                  </span>
                )}
              </div>
              {notarizedFiles.length > 0 && (
                <Button
                  onClick={downloadAllNotarizedFiles}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All as ZIP
                </Button>
              )}
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
                          {groupIdx === 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                              Latest
                            </span>
                          )}
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
                            <Button
                              onClick={() => downloadNotarizedFile(file)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {`Download File ${index + 1}`}
                            </Button>
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