import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useFormSubmission } from '../hooks/useFormSubmission'

const options = [
  {
    key: 'personal',
    title: 'Personal Documents',
    subtitle: 'Passports, IDs, certificates',
    icon: '📄',
  },
  {
    key: 'corporate',
    title: 'Corporate Documents',
    subtitle: 'Business contracts, articles',
    icon: '🏢',
  },
  {
    key: 'legal',
    title: 'Legal Documents',
    subtitle: 'Powers of attorney, affidavits',
    icon: '⚖️',
  },
  {
    key: 'other',
    title: 'Other Documents',
    subtitle: 'Custom or specialized docs',
    icon: '❓',
  },
]

const DocumentType: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [selected, setSelected] = React.useState<string | null>(null)
  const { submission, updateSubmission } = useFormSubmission()
  
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  // Set initial selection from submission if available
  React.useEffect(() => {
    if (submission?.documentType) {
      setSelected(submission.documentType)
    }
  }, [submission])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center space-x-12 mb-8 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center mx-auto mb-1">1</div>
            <div className="text-xs">Document Type</div>
          </div>
          <div className="text-center opacity-70">
            <div className="w-8 h-8 rounded-full border flex items-center justify-center mx-auto mb-1">2</div>
            <div className="text-xs">Service Selection</div>
          </div>
          <div className="text-center opacity-70">
            <div className="w-8 h-8 rounded-full border flex items-center justify-center mx-auto mb-1">3</div>
            <div className="text-xs">Add-ons</div>
          </div>
        </div>

        <Card>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
            What type of document do you need notarized?
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Select the category that best describes your document
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSelected(opt.key)}
                className={`text-left p-5 rounded-xl border transition-all ${
                  selected === opt.key
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl" aria-hidden>
                    {opt.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{opt.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{opt.subtitle}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-8 max-w-3xl mx-auto">
            <Button variant="ghost" onClick={() => navigate('/services')}>Back</Button>
            <Button
              variant="primary"
              disabled={!selected}
              onClick={async () => {
                if (selected) {
                  try {
                    // Update submission with selected document type
                    await updateSubmission({
                      documentType: selected as 'personal' | 'corporate' | 'legal' | 'others',
                      currentStep: 'service_selected'
                    })
                  } catch (error) {
                    console.error('Error updating submission:', error)
                    // Continue anyway - don't block user flow
                  }
                }
                navigate(`/services/${slug || ''}/service-selection${selected ? `?docType=${selected}` : ''}`)
              }}
            >
              Continue
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DocumentType
