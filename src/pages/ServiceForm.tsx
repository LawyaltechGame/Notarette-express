import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { getServiceBySlug } from '../data/services'

const GOOGLE_FORM_URL = 'https://forms.gle/3ZN3BcZXqpiLR8Kx6'

const ServiceForm: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const service = slug ? getServiceBySlug(slug) : undefined
  const [confirmedSubmitted, setConfirmedSubmitted] = React.useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {service ? `Start ${service.name}` : 'Start Service'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Open the form in a new tab to provide details. After submitting, come back and click Continue to proceed to the next step.
          </p>
        </Card>

        <Card>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="primary"
              onClick={() => window.open(GOOGLE_FORM_URL, '_blank', 'noopener,noreferrer')}
            >
              Open Form in New Tab
            </Button>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                id="confirmSubmitted"
                type="checkbox"
                className="w-4 h-4"
                checked={confirmedSubmitted}
                onChange={(e) => setConfirmedSubmitted(e.target.checked)}
              />
              <label htmlFor="confirmSubmitted">I submitted the form</label>
            </div>
            <Button
              variant="secondary"
              disabled={!confirmedSubmitted}
              onClick={() => {
                if (service) navigate(`/services/${service.slug}`)
                else navigate('/services')
              }}
            >
              Continue to {service ? service.name : 'Services'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ServiceForm
