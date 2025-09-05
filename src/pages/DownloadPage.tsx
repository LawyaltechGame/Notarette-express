import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Download, AlertCircle, Loader2 } from 'lucide-react'
import { storage } from '../lib/appwrite'
import { ENVObj } from '../lib/constant'

const DownloadPage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')

  useEffect(() => {
    const handleDownload = async () => {
      console.log('DownloadPage: Starting download for fileId:', fileId)
      
      if (!fileId) {
        setError('Invalid file ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const bucketId = ENVObj.VITE_APPWRITE_BUCKET_ID as string
        console.log('DownloadPage: Using bucketId:', bucketId)
        
        if (!bucketId) {
          throw new Error('Storage bucket not configured')
        }

        // Get file info first to get the filename
        const fileInfo = await storage.getFile(bucketId, fileId)
        console.log('DownloadPage: File info:', fileInfo)
        setFileName(fileInfo.name)

        // Get the file download URL (not view URL)
        const fileUrl = storage.getFileDownload(bucketId, fileId)
        // console.log('DownloadPage: Download URL:', fileUrl.toString())
        
        // Create a temporary link and trigger download
        const link = document.createElement('a')
        link.href = fileUrl.toString()
        link.download = fileInfo.name
        link.style.display = 'none'
        
        // Append to body, click, and remove
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Redirect back to portal after a short delay
        setTimeout(() => {
          navigate('/portal')
        }, 2000)

      } catch (err: any) {
        console.error('Download failed:', err)
        setError(err.message || 'Failed to download file')
        setLoading(false)
      }
    }

    handleDownload()
  }, [fileId, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Preparing Download
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {fileName ? `Downloading ${fileName}...` : 'Getting your file ready...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Download Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/portal')}
              className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Back to Portal
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Download className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Download Started
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {fileName ? `Your file "${fileName}" is being downloaded.` : 'Your file is being downloaded.'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Redirecting you back to the portal...
        </p>
      </div>
    </div>
  )
}

export default DownloadPage
