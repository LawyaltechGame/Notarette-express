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
      console.log(`Fetching files from folder: ${folderPath}`)
      
      // List all files in the bucket
      const response = await storage.listFiles(this.bucketId)
      const files: FileMetadata[] = []

      // Filter files that match the folder path
      for (const file of response.files) {
        // Check if file name starts with the folder path
        if (file.name.startsWith(folderPath)) {
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

      console.log(`Found ${files.length} files in folder: ${folderPath}`)
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
    const folderPath = `notarized-docs/${clientEmail}`
    return this.getFilesByFolder(folderPath)
  }

  /**
   * Download a file by file ID using direct Appwrite URL for better PDF compatibility
   * @param fileId - The file ID to download
   * @param fileName - The desired file name for download
   * @returns Promise that resolves when download starts
   */
  static async downloadFile(fileId: string, fileName: string): Promise<void> {
    if (!this.bucketId) {
      throw new Error('Storage bucket ID not configured')
    }

    try {
      console.log(`Downloading file directly: ${fileName} (${fileId})`)
      
      // Use direct Appwrite view URL for better PDF compatibility
      const baseUrl = ENVObj.VITE_APPWRITE_ENDPOINT
      const projectId = ENVObj.VITE_APPWRITE_PROJECT_ID
      const viewUrl = `${baseUrl}/storage/buckets/${this.bucketId}/files/${fileId}/view?project=${projectId}`
      
      console.log('Using direct view URL:', viewUrl)
      
      // Create a temporary link with the direct view URL
      const link = document.createElement('a')
      link.href = viewUrl
      link.download = fileName
      link.target = '_blank'
      link.style.display = 'none'
      
      // Add to DOM, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log(`Downloaded file directly: ${fileName}`)
    } catch (error) {
      console.error('Error downloading file directly:', error)
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
             headers: {
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
