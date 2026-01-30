import React from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { getServiceBySlug } from '../data/services'
import { useFormSubmission } from '../hooks/useFormSubmission'
import PageBackground from '../components/layout/PageBackground'

const ServiceSelection: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [] = useSearchParams()
  const service = slug ? getServiceBySlug(slug) : undefined
  const { updateSubmission } = useFormSubmission()
  const navigateToStep = (step: string) => {
    const base = slug || ''
    if (step === 'form_submitted') navigate(`/services/${base}/service-selection`, { replace: true })
    else if (step === 'service_selected') navigate(`/services/${base}/service-selection`, { replace: true })
    else if (step === 'addons_selected') navigate(`/services/${base}/add-ons`, { replace: true })
    else if (step === 'checkout') navigate(`/checkout`, { replace: true })
    else if (step === 'completed') navigate(`/thank-you`, { replace: true })
  }
  
  // Guard: require submission ID
  React.useEffect(() => {
    try {
      const hasSubmissionId = !!sessionStorage.getItem('current_submission_id')
      const hasLegacy = !!(sessionStorage.getItem('notary_manual_form') || '').length || !!(sessionStorage.getItem('notary_wizard_selection') || '').length
      if (!hasSubmissionId && !hasLegacy) {
        navigate('/services', { replace: true })
      }
    } catch {
      navigate('/services', { replace: true })
    }
  }, [navigate])

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  // If user has progressed further, send them to current step instead of allowing jump back/forward
  React.useEffect(() => {
    (async () => {
      try {
        // infer current step from selection or submission cache if available in future
        // for now, rely on form submission hook persistence if present
      } catch {}
    })()
  }, [])

  const baseOptions = React.useMemo(() => {
    return [
      { key: 'base', title:  'Certified Copy', subtitle: 'Official service with notary seal', price: service ? service.priceCents : 100, currency: service?.currency || 'EUR' },
      { key: 'signature', title: 'Signature Notarization', subtitle: 'Verify and notarize signatures', price: 100, currency: service?.currency || 'EUR' },
      { key: 'true-content', title: 'True Content Verification', subtitle: 'Verify document authenticity', price: 100, currency: service?.currency || 'EUR' },
    ]
  }, [service])

  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set(['base']))

  const currency = service?.currency || 'EUR'
  const fmt = (cents: number, curr: string) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: curr }).format(cents / 100)

  const toggleKey = (key: string) => {
    setSelectedKeys(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const canContinue = selectedKeys.size > 0

  // Pricing summary
  const selectedOptions = baseOptions.filter(o => selectedKeys.has(o.key))
  const subtotalCents = selectedOptions.reduce((sum, o) => sum + o.price, 0)
  const vatRate = 0
  const vatCents = 0
  const totalCents = subtotalCents + vatCents

  return (
    <PageBackground>
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center space-x-12 mb-8 text-gray-500">
          <div className="text-center">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center mx-auto mb-1">1</div>
            <div className="text-xs">Service Selection</div>
          </div>
          <div className="text-center opacity-70">
            <div className="w-8 h-8 rounded-full border flex items-center justify-center mx-auto mb-1">2</div>
            <div className="text-xs">Add-ons</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left: choices */}
          <div className="lg:col-span-2">
            <Card>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
                Choose your Service Type
              </h1>
              <p className="text-center text-gray-600 mb-8">
                Select one or more types of notarization you need
              </p>

              <div className="max-w-3xl mx-auto space-y-4">
                {baseOptions.map(opt => {
                  const selected = selectedKeys.has(opt.key)
                  return (
                    <button
                      key={opt.key}
                      onClick={() => toggleKey(opt.key)}
                      className={`w-full text-left p-5 rounded-xl border transition-all flex items-center justify-between ${
                        selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-gray-900">{opt.title}</div>
                        <div className="text-sm text-gray-600">{opt.subtitle}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {selected && <span className="text-blue-600 text-sm font-medium">Selected</span>}
                        <div className="text-blue-600 font-bold">{fmt(opt.price, currency)}</div>
                      </div>
                    </button>
                  )
                })}

                {/* Extra Certified Copies moved to Add-ons page */}
              </div>

              <div className="flex items-center justify-between mt-8 max-w-3xl mx-auto">
                <Button variant="ghost" onClick={() => navigate(`/services/${slug}/start`)}>Back</Button>
                <Button
                  variant="primary"
                  disabled={!canContinue}
                  onClick={async () => {
                    try {
                      // Update form submission with selected services
                      await updateSubmission({
                        selectedOptions: JSON.stringify(Array.from(selectedKeys)),
                        currentStep: 'addons_selected'
                      })
                      console.log('Service selection updated in Appwrite')
                    } catch (error) {
                      console.error('Error updating service selection:', error)
                      // Continue anyway - don't block user flow
                    }

                    const payload = {
                      serviceTitle: service?.name || 'Service',
                      serviceSlug: slug,
                      calComBookingLink: service?.calComBookingLink || null,
                      selectedKeys: Array.from(selectedKeys),
                      selectedOptions: selectedOptions.map(o => ({ key: o.key, title: o.title, price: o.price })),
                      subtotalCents,
                      currency,
                    }
                    sessionStorage.setItem('notary_wizard_selection', JSON.stringify(payload))
                    navigate(`/services/${slug}/add-ons`)
                  }}
                >
                  Continue
                </Button>
              </div>
            </Card>
          </div>

          {/* Right: order summary */}
          <div className="lg:col-span-1">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                {selectedOptions.map(opt => (
                  <div key={opt.key} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="text-gray-900">{opt.title}</div>
                      <div className="text-xs text-gray-500">Base Service</div>
                    </div>
                    <div className="text-gray-900 font-medium">{fmt(opt.price, currency)}</div>
                  </div>
                ))}
                {/* Extra Certified Copies moved to Add-ons page */}

                <div className="pt-3 border-t border-gray-200 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{fmt(subtotalCents, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">VAT (21%)</span>
                    <span className="text-gray-900">{fmt(vatCents, currency)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-blue-600">{fmt(totalCents, currency)}</span>
                  </div>
                </div>

                <ul className="text-xs text-gray-500 mt-2 list-disc list-inside">
                  <li>Price includes notary fees and digital delivery</li>
                  <li>VAT applied as per regulations</li>
                  <li>Express options available at checkout</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </PageBackground>
  )
}

export default ServiceSelection
