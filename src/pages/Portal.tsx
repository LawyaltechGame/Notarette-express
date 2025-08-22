import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Upload, Download, Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react'
import { useAppSelector } from '../hooks/useAppSelector'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

const Portal: React.FC = () => {
  const orders = useAppSelector(state => state.order.orders)
  const user = useAppSelector(state => state.user.user)

  // Mock orders for demonstration
  const mockOrders = [
    {
      id: 'order_123456789',
      items: [{ name: 'Certified Signature', quantity: 1 }],
      amountCents: 2500,
      status: 'completed' as const,
      kycStatus: 'verified' as const,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T14:30:00Z',
      completedFiles: ['contract_notarized.pdf'],
    },
    {
      id: 'order_123456790',
      items: [{ name: 'Document Witnessing', quantity: 1 }],
      amountCents: 3000,
      status: 'processing' as const,
      kycStatus: 'verified' as const,
      createdAt: '2024-01-14T09:15:00Z',
      updatedAt: '2024-01-14T16:45:00Z',
      uploadedFiles: ['agreement_signed.pdf'],
    },
    {
      id: 'order_123456791',
      items: [{ name: 'Apostille Services', quantity: 1 }],
      amountCents: 5000,
      status: 'paid' as const,
      kycStatus: 'required' as const,
      createdAt: '2024-01-13T14:20:00Z',
      updatedAt: '2024-01-13T14:20:00Z',
    },
  ]

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
        return <Badge variant="warning">Pending KYC</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const getKYCStatusBadge = (kycStatus: string) => {
    switch (kycStatus) {
      case 'verified':
        return <Badge variant="success">Verified</Badge>
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
      default:
        return <AlertCircle className="w-5 h-5 text-amber-600" />
    }
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
            Client Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your orders, track progress, and download completed documents.
          </p>
        </motion.div>

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
                  {mockOrders.length}
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
                  {mockOrders.filter(o => o.status === 'completed').length}
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
                  {mockOrders.filter(o => o.status === 'processing').length}
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
                  {mockOrders.filter(o => o.kycStatus === 'required').length}
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
              {mockOrders.map((order, index) => (
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
                          Order #{order.id}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(order.amountCents)}
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
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.status === 'paid' && order.kycStatus === 'required' && (
                      <Button variant="primary" size="sm">
                        Complete Identity Verification
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
                        <div className="flex items-center space-x-2 text-sm">
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

            {mockOrders.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No orders yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start by placing your first notarization order.
                </p>
                <Button variant="primary">
                  Browse Services
                </Button>
              </div>
            )}
          </Card>
        </motion.div>

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
              <Button variant="primary" className="w-full">
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
              <Button variant="secondary" className="w-full">
                Upload Files
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
              <Button variant="secondary" className="w-full">
                View Downloads
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Portal