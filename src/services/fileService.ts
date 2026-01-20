import { storage } from '../lib/appwrite'
import { ENVObj } from '../lib/constant'

export interface FileMetadata {
  fileId: string
  name: string
  size: number
  type?: string
  folderPath?: string
  uploadedAt?: string
}

export class FileService {
  private static bucketId = ENVObj.VITE_APPWRITE_BUCKET_ID

  /**
   * Get all files from a specific folder path
   * @param folderPath - The folder path to search in (e.g., 'client-uploads/email@example.com/submission123')
   * @returns Array of file metadata
   */
  static async getFilesByFolder(folderPath: string): Promise<FileMetadata[]> {
    if (!this.bucketId) {
      throw new Error('Storage bucket ID not configured')
    }

    try {
      const target = (folderPath || '').trim().toLowerCase()
      console.log(`Fetching files from folder: ${target}`)
      
      // List all files in the bucket
      const response = await storage.listFiles(this.bucketId)
      const files: FileMetadata[] = []

      // Filter files that match the folder path (case-insensitive)
      for (const file of response.files) {
        const fileName = (file.name || '').toLowerCase()
        if (fileName.startsWith(target) || fileName.includes(`${target}/`)) {
          files.push({
            fileId: file.$id,
            name: file.name,
            size: file.sizeOriginal,
            type: file.mimeType,
            folderPath: folderPath,
            uploadedAt: file.$createdAt
          })
        }
      }

      console.log(`Found ${files.length} files in folder: ${target}`)
      return files
    } catch (error) {
      console.error('Error fetching files by folder:', error)
      throw error
    }
  }

  /**
   * Get client uploaded files for a specific client email
   * @param clientEmail - The client's email address
   * @returns Array of client uploaded files
   */
  static async getClientUploadedFiles(clientEmail: string): Promise<FileMetadata[]> {
    const folderPath = `client-uploads/${clientEmail}`
    return this.getFilesByFolder(folderPath)
  }

  /**
   * Get notarized files for a specific client email
   * @param clientEmail - The client's email address
   * @returns Array of notarized files
   */
  static async getNotarizedFiles(clientEmail: string): Promise<FileMetadata[]> {
    const folderPath = `notarized-docs/${(clientEmail || '').trim().toLowerCase()}`
    return this.getFilesByFolder(folderPath)
  }

  /**
   * Download a file by file ID using Appwrite SDK for proper authentication
   * Works in production and incognito mode by using authenticated download URL
   * @param fileId - The file ID to download
   * @param fileName - The desired file name for download
   * @returns Promise that resolves when download starts
   */
  static async downloadFile(fileId: string, fileName: string): Promise<void> {
    if (!this.bucketId) {
      throw new Error('Storage bucket ID not configured')
    }

    try {
      console.log(`Downloading file: ${fileName} (${fileId})`)
      
      // First, verify file exists and get file info
      let fileInfo: any
      try {
        fileInfo = await storage.getFile(this.bucketId, fileId)
        console.log('File info retrieved:', fileInfo)
        
        // CRITICAL: Use the actual file ID from fileInfo, not the passed fileId
        // Sometimes the fileId parameter might be different from the actual stored ID
        const actualFileId = fileInfo.$id || fileId
        if (actualFileId !== fileId) {
          console.warn(`File ID mismatch: passed "${fileId}", using "${actualFileId}"`)
        }
        
        // Use actual filename from fileInfo if available
        if (fileInfo.name && !fileName) {
          fileName = fileInfo.name
        }
        
        // Update fileId to use the verified ID
        fileId = actualFileId
      } catch (getFileError: any) {
        console.error('Error getting file info:', getFileError)
        if (getFileError?.code === 404 || getFileError?.message?.includes('not found')) {
          throw new Error(`File not found: "${fileName}". The file may have been deleted or moved. File ID: ${fileId}`)
        }
        if (getFileError?.code === 401 || getFileError?.code === 403) {
          throw new Error(`Permission denied: You don't have access to download this file. Please ensure you are logged in.`)
        }
        throw new Error(`Cannot access file: ${getFileError?.message || 'Unknown error'}`)
      }
      
      // Verify user is authenticated before attempting download
      const { appwriteAccount } = await import('../lib/appwrite')

      try {
        // Use account.get() to verify authentication (recommended approach)
        const user = await appwriteAccount.get()
        console.log('User authenticated for download:', user.email)
      } catch (authError: any) {
        // If user is not authenticated, throw a clear error
        if (authError?.code === 401 || authError?.type === 'general_unauthorized_scope') {
          throw new Error('You must be logged in to download files. Please log in and try again.')
        }
        console.warn('Authentication check failed, will attempt download anyway:', authError)
      }

      // CRITICAL FIX: Use getFileView instead of getFileDownload
      // getFileView respects read permissions better and works in incognito mode
      // We'll fetch the file content and trigger download manually
      const viewUrl = storage.getFileView(this.bucketId, fileId)
      console.log('Using Appwrite file view URL:', viewUrl.toString())
      console.log('File details:', {
        originalFileId: fileId,
        verifiedFileId: fileInfo?.$id,
        fileName,
        bucketId: this.bucketId,
        fileInfoName: fileInfo?.name,
        fileInfoSize: fileInfo?.sizeOriginal,
        fileInfoPermissions: fileInfo?.$permissions
      })

      // Try fetch with credentials first (most reliable method)
      // This ensures session cookies are included even in incognito/production
      try {
        const response = await fetch(viewUrl.toString(), {
          method: 'GET',
          credentials: 'include', // Critical: Include cookies/session for authentication
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Accept': '*/*',
            'X-Appwrite-Project': ENVObj.VITE_APPWRITE_PROJECT_ID || '',
          },
          redirect: 'follow' // Follow redirects if any
        })
        
        if (!response.ok) {
          // Log response details for debugging
          const errorText = await response.text().catch(() => '')
          console.error('Download failed:', {
            status: response.status,
            statusText: response.statusText,
            url: viewUrl.toString(),
            errorText
          })
          
          if (response.status === 404) {
            throw new Error(`File not found: "${fileName}". The file may have been deleted or the file ID "${fileId}" is incorrect.`)
          }
          if (response.status === 401 || response.status === 403) {
            throw new Error(`Permission denied: You don't have access to download this file. Please ensure you are logged in as a notary and file permissions are correct.`)
          }
          throw new Error(`Failed to download file: HTTP ${response.status}. ${errorText || response.statusText}`)
        }
        
        // Get the file as a blob
        const blob = await response.blob()
        
        // Verify blob is not empty
        if (blob.size === 0) {
          throw new Error(`Downloaded file is empty. The file may be corrupted or the download failed.`)
        }
        
        // Create a download link from blob
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName || fileInfo.name || 'download'
        link.style.display = 'none'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Clean up the object URL after a delay
        setTimeout(() => window.URL.revokeObjectURL(url), 1000)
        
        console.log(`Successfully downloaded file: ${fileName} (${blob.size} bytes)`)
        return
      } catch (fetchError: any) {
        console.error('Fetch download failed, trying direct link method:', fetchError)

        // Fallback: Try direct link method (works when session is available in same tab)
        // This is less reliable in incognito but may work if fetch fails due to CORS
        try {
          const link = document.createElement('a')
          link.href = viewUrl.toString()
          link.download = fileName || fileInfo.name || 'download'
          link.target = '_blank'
          link.rel = 'noopener noreferrer'
          link.style.display = 'none'

          document.body.appendChild(link)
          link.click()

          // Wait briefly to see if download starts
          await new Promise(resolve => setTimeout(resolve, 500))

          document.body.removeChild(link)

          console.log(`Download initiated via direct link: ${fileName}`)
          return
        } catch (linkError) {
          console.error('Direct link download also failed:', linkError)
          // Re-throw the original fetch error as it's more informative
          throw fetchError
        }
      }
    } catch (error) {
      console.error('Error downloading file:', error)
      throw error
    }
  }

  /**
   * Download multiple files as a ZIP
   * @param files - Array of file metadata to download
   * @param zipFileName - Name for the ZIP file
   * @returns Promise that resolves when ZIP download starts
   */
  static async downloadFilesAsZip(files: FileMetadata[], zipFileName: string): Promise<void> {
    if (!this.bucketId) {
      throw new Error('Storage bucket ID not configured')
    }

    try {
      console.log(`Creating ZIP with ${files.length} files: ${zipFileName}`)
      
      // Import JSZip dynamically
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

       // Download each file and add to ZIP
       for (const file of files) {
         try {
           console.log(`Adding to ZIP: ${file.name}`)

           // Use Appwrite storage.getFileDownload for proper authentication
           const downloadUrl = storage.getFileDownload(this.bucketId, file.fileId)

           // Fetch the file using the Appwrite download URL
           const response = await fetch(downloadUrl.toString(), {
             method: 'GET',
             credentials: 'include',
             mode: 'cors',
             cache: 'no-cache',
             headers: {
               'Accept': '*/*',
               'X-Appwrite-Project': ENVObj.VITE_APPWRITE_PROJECT_ID || '',
             }
           })
           
           if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`)
           }
           
           // Get as ArrayBuffer to preserve binary data
           const arrayBuffer = await response.arrayBuffer()
           const mimeType = this.getMimeTypeFromFileName(file.name)
           const blob = new Blob([arrayBuffer], { type: mimeType })
           
           // Add to ZIP with relative path (remove folder prefix)
           const relativePath = file.name.replace(/^[^/]+\/[^/]+\/[^/]+\//, '') // Remove folder structure
           zip.file(relativePath, blob)
           
           console.log(`Added to ZIP: ${relativePath}`)
         } catch (fileError) {
           console.error(`Error adding ${file.name} to ZIP:`, fileError)
           // Continue with other files
         }
       }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = window.URL.createObjectURL(zipBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = zipFileName
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log(`ZIP downloaded: ${zipFileName}`)
    } catch (error) {
      console.error('Error creating ZIP:', error)
      throw error
    }
  }

  /**
   * Get MIME type from file extension
   */
  private static getMimeTypeFromFileName(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop() || ''
    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'txt': 'text/plain',
      'zip': 'application/zip',
      'rtf': 'application/rtf',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    }
    return mimeTypes[ext] || 'application/octet-stream'
  }

  /**
   * Get all files for a client (both uploaded and notarized)
   * @param clientEmail - The client's email address
   * @returns Object with clientUploaded and notarized files
   */
  static async getAllClientFiles(clientEmail: string): Promise<{
    clientUploaded: FileMetadata[]
    notarized: FileMetadata[]
  }> {
    try {
      const [clientUploaded, notarized] = await Promise.all([
        this.getClientUploadedFiles(clientEmail),
        this.getNotarizedFiles(clientEmail)
      ])

      return {
        clientUploaded,
        notarized
      }
    } catch (error) {
      console.error('Error fetching all client files:', error)
      throw error
    }
  }
}
