import React from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { getServiceBySlug } from '../data/services'
import { useFormSubmission } from '../hooks/useFormSubmission'

const ServiceSelection: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [] = useSearchParams()
  const service = slug ? getServiceBySlug(slug) : undefined
  const { updateSubmission } = useFormSubmission()

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center space-x-12 mb-8 text-gray-500 dark:text-gray-400">
          <div className="text-center opacity-70">
            <div className="w-8 h-8 rounded-full border flex items-center justify-center mx-auto mb-1">1</div>
            <div className="text-xs">Document Type</div>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center mx-auto mb-1">2</div>
            <div className="text-xs">Service Selection</div>
          </div>
          <div className="text-center opacity-70">
            <div className="w-8 h-8 rounded-full border flex items-center justify-center mx-auto mb-1">3</div>
            <div className="text-xs">Add-ons</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left: choices */}
          <div className="lg:col-span-2">
            <Card>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Choose your notarial service
              </h1>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
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
                        selected ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{opt.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{opt.subtitle}</div>
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
                <Button variant="ghost" onClick={() => navigate(`/services/${slug}/document-type`)}>Back</Button>
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
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
              <div className="space-y-3">
                {selectedOptions.map(opt => (
                  <div key={opt.key} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="text-gray-900 dark:text-white">{opt.title}</div>
                      <div className="text-xs text-gray-500">Base Service</div>
                    </div>
                    <div className="text-gray-900 dark:text-white font-medium">{fmt(opt.price, currency)}</div>
                  </div>
                ))}
                {/* Extra Certified Copies moved to Add-ons page */}

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">{fmt(subtotalCents, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">VAT (21%)</span>
                    <span className="text-gray-900 dark:text-white">{fmt(vatCents, currency)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-gray-900 dark:text-white">Total</span>
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
  )
}

export default ServiceSelection
