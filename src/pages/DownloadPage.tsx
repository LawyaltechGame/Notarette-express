import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Download, AlertCircle, Loader2 } from 'lucide-react'
import { storage } from '../lib/appwrite'
import { ENVObj } from '../lib/constant'
import PageBackground from '../components/layout/PageBackground'

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

        // Use direct view URL method for better PDF compatibility
        const baseUrl = ENVObj.VITE_APPWRITE_ENDPOINT
        const projectId = ENVObj.VITE_APPWRITE_PROJECT_ID
        const viewUrl = `${baseUrl}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`
        
        console.log('DownloadPage: Using direct view URL:', viewUrl)
        
        // Create a temporary link with the direct view URL
        const link = document.createElement('a')
        link.href = viewUrl
        link.download = fileInfo.name
        link.target = '_blank'
        link.style.display = 'none'
        
        // Append to body, click, and remove
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        console.log(`Downloaded file using direct URL: ${fileInfo.name}`)

        // Redirect back to portal after a short delay
        setTimeout(() => {
          navigate('/portal')
        }, 2000)

      } catch (err: any) {
        console.error('Download failed, trying fallback method:', err)
        
        // Fallback: Try direct view URL method
        try {
          console.log('Attempting fallback download method...')
          
          // Get bucket ID again for fallback
          const fallbackBucketId = ENVObj.VITE_APPWRITE_BUCKET_ID as string
          
          // Construct direct view URL as fallback
          const baseUrl = ENVObj.VITE_APPWRITE_ENDPOINT
          const projectId = ENVObj.VITE_APPWRITE_PROJECT_ID
          const viewUrl = `${baseUrl}/storage/buckets/${fallbackBucketId}/files/${fileId}/view?project=${projectId}`
          
          console.log('Fallback URL:', viewUrl)
          
          // Open the direct URL in a new tab
          window.open(viewUrl, '_blank')
          
          // Redirect back to portal after a short delay
          setTimeout(() => {
            navigate('/portal')
          }, 2000)
          
        } catch (fallbackErr: any) {
          console.error('Fallback download also failed:', fallbackErr)
          setError('Both download methods failed. Please try again.')
          setLoading(false)
        }
      }
    }

    handleDownload()
  }, [fileId, navigate])

  if (loading) {
    return (
      <PageBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Preparing Download
            </h2>
            <p className="text-gray-600">
              {fileName ? `Downloading ${fileName}...` : 'Getting your file ready...'}
            </p>
          </div>
        </div>
      </PageBackground>
    )
  }

  if (error) {
    return (
      <PageBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto px-4">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Download Failed
            </h2>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/portal')}
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Back to Portal
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </PageBackground>
    )
  }

  return (
    <PageBackground>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Download className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Download Started
          </h2>
          <p className="text-gray-600 mb-4">
            {fileName ? `Your file "${fileName}" is being downloaded.` : 'Your file is being downloaded.'}
          </p>
          <p className="text-sm text-gray-500">
            Redirecting you back to the portal...
          </p>
        </div>
      </div>
    </PageBackground>
  )
}

export default DownloadPage
