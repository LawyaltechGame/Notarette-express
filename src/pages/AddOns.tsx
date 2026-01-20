import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useFormSubmission } from '../hooks/useFormSubmission'
import PageBackground from '../components/layout/PageBackground'

const addonsList = [
  { key: 'courier', title: 'Courier Delivery', subtitle: 'Physical delivery within 3 business days', priceCents: 100 },
  { key: 'apostille', title: 'Apostille Service', subtitle: 'International authentication for Hague Convention countries', priceCents: 100 },
  { key: 'express', title: 'Express 24h Processing', subtitle: 'Priority processing within 24 hours', priceCents: 100 },
]

const AddOns: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { updateSubmission } = useFormSubmission()
  
  const navigateToStep = (step: string) => {
    const base = slug || ''
    if (step === 'form_submitted') navigate(`/services/${base}/document-type`, { replace: true })
    else if (step === 'service_selected') navigate(`/services/${base}/service-selection`, { replace: true })
    else if (step === 'addons_selected') navigate(`/services/${base}/add-ons`, { replace: true })
    else if (step === 'checkout') navigate(`/checkout`, { replace: true })
    else if (step === 'completed') navigate(`/thank-you`, { replace: true })
  }

  // Guard: require ServiceSelection payload
  React.useEffect(() => {
    try {
      const hasSubmissionId = !!sessionStorage.getItem('current_submission_id')
      const selection = sessionStorage.getItem('notary_wizard_selection')
      if (!hasSubmissionId || !selection) {
        navigate('/services', { replace: true })
      }
    } catch {
      navigate('/services', { replace: true })
    }
  }, [navigate])

  const initial = React.useMemo(() => {
    try {
      const raw = sessionStorage.getItem('notary_wizard_selection')
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  }, [])

  const [selected, setSelected] = React.useState<Set<string>>(new Set(['apostille']))
  const [extraCopies, setExtraCopies] = React.useState<number>(0)
  const [savingAddress, setSavingAddress] = React.useState(false)
  const [addressSaved, setAddressSaved] = React.useState(false)
  const [courierAddress, setCourierAddress] = React.useState({
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  })

  const currency = initial?.currency || 'EUR'
  const fmt = (cents: number) => new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format(cents / 100)

  const baseSubtotal = initial?.subtotalCents || 0
  const EXTRA_COPY_PRICE_CENTS = 100
  const addonsCentsFromToggles = Array.from(selected).reduce((sum, key) => {
    const a = addonsList.find(x => x.key === key)
    return sum + (a?.priceCents || 0)
  }, 0)
  const extraCopiesCents = (selected.has('courier') ? extraCopies : 0) * EXTRA_COPY_PRICE_CENTS
  const addonsCents = addonsCentsFromToggles + extraCopiesCents
  const subtotalCents = baseSubtotal + addonsCents
  const vatCents = 0
  const totalCents = subtotalCents + vatCents

  const toggle = (key: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <PageBackground>
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center space-x-12 mb-8 text-gray-500 dark:text-gray-400">
          <div className="text-center opacity-70">
            <div className="w-8 h-8 rounded-full border flex items-center justify-center mx-auto mb-1">1</div>
            <div className="text-xs">Document Type</div>
          </div>
          <div className="text-center opacity-70">
            <div className="w-8 h-8 rounded-full border flex items-center justify-center mx-auto mb-1">2</div>
            <div className="text-xs">Service Selection</div>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center mx-auto mb-1">3</div>
            <div className="text-xs">Add-ons</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <Card>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Optional Add-ons
              </h1>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                Enhance your service with these optional features
              </p>

              <div className="max-w-3xl mx-auto space-y-4">
                {addonsList.map(a => {
                  const active = selected.has(a.key)
                  return (
                    <button
                      key={a.key}
                      onClick={() => toggle(a.key)}
                      className={`w-full text-left p-5 rounded-xl border transition-all flex items-center justify-between ${
                        active ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{a.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{a.subtitle}</div>
                      </div>
                      <div className="text-blue-600 font-bold">+{fmt(a.priceCents)}</div>
                    </button>
                  )
                })}
              </div>

              {selected.has('courier') && (
                <div className="max-w-3xl mx-auto mt-6 p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Courier Address</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">We will ship physical documents to this address.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      value={courierAddress.name}
                      onChange={e=>setCourierAddress(v=>({ ...v, name: e.target.value }))}
                      placeholder="Full Name"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    <input
                      value={courierAddress.line1}
                      onChange={e=>setCourierAddress(v=>({ ...v, line1: e.target.value }))}
                      placeholder="Address Line 1"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    <input
                      value={courierAddress.line2}
                      onChange={e=>setCourierAddress(v=>({ ...v, line2: e.target.value }))}
                      placeholder="Address Line 2 (optional)"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    <input
                      value={courierAddress.city}
                      onChange={e=>setCourierAddress(v=>({ ...v, city: e.target.value }))}
                      placeholder="City"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    <input
                      value={courierAddress.state}
                      onChange={e=>setCourierAddress(v=>({ ...v, state: e.target.value }))}
                      placeholder="State / Province"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    <input
                      value={courierAddress.postalCode}
                      onChange={e=>setCourierAddress(v=>({ ...v, postalCode: e.target.value }))}
                      placeholder="Postal Code"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    <input
                      value={courierAddress.country}
                      onChange={e=>setCourierAddress(v=>({ ...v, country: e.target.value }))}
                      placeholder="Country"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center justify-end mt-4">
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        try {
                          setSavingAddress(true)
                          await updateSubmission({ courierAddress: JSON.stringify(courierAddress) })
                          setAddressSaved(true)
                          setTimeout(()=>setAddressSaved(false), 2500)
                        } catch (err) {
                          console.error('Failed to save courier address', err)
                          alert('Failed to save address. Please try again.')
                        } finally {
                          setSavingAddress(false)
                        }
                      }}
                    >
                      {savingAddress ? 'Saving…' : (addressSaved ? 'Saved' : 'Save Address')}
                    </Button>
                  </div>
                  <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Extra Certified Copies</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Optional. Available only with Courier Delivery.</p>
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700 dark:text-gray-300">Number of extra copies</label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={extraCopies}
                        onChange={e => setExtraCopies(Math.max(0, Math.min(10, Number(e.target.value) || 0)))}
                        className="w-24 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                      <span className="text-sm text-blue-600 font-medium">+{fmt(EXTRA_COPY_PRICE_CENTS)} each</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-8 max-w-3xl mx-auto">
                <Button variant="ghost" onClick={() => navigate(`/services/${slug}/service-selection`)}>Back</Button>
                <Button
                  variant="primary"
                  onClick={async () => {
                    try {
                      // Update form submission with selected add-ons
                      await updateSubmission({
                        selectedAddOns: JSON.stringify(Array.from(selected)),
                        extraCopies: selected.has('courier') ? extraCopies : 0,
                        currentStep: 'checkout'
                      })
                      console.log('Add-ons selection updated in Appwrite')
                    } catch (error) {
                      console.error('Error updating add-ons selection:', error)
                      // Continue anyway - don't block user flow
                    }

                    const raw = sessionStorage.getItem('notary_wizard_selection')
                    const base = raw ? JSON.parse(raw) : {}
                    const addons = Array.from(selected).map(key => {
                      const a = addonsList.find(x => x.key === key)
                      return { key, title: a?.title, priceCents: a?.priceCents || 0 }
                    })
                    if (selected.has('courier') && extraCopies > 0) {
                      addons.push({ key: 'extraCopies', title: `Extra Certified Copies × ${extraCopies}`, priceCents: extraCopiesCents })
                    }
                    const payload = {
                      ...base,
                      addons,
                      addonsCents,
                      subtotalCents,
                      vatCents,
                      totalCents,
                      extraCopies: selected.has('courier') ? extraCopies : 0,
                    }
                    sessionStorage.setItem('notary_checkout_payload', JSON.stringify(payload))
                    navigate('/checkout')
                  }}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-900 dark:text-white">Selected Services</div>
                  <div className="text-gray-900 dark:text-white font-medium">{fmt(baseSubtotal)}</div>
                </div>
                {Array.from(selected).map(key => {
                  const a = addonsList.find(x => x.key === key)
                  if (!a) return null
                  return (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <div className="text-gray-900 dark:text-white">{a.title}</div>
                      <div className="text-gray-900 dark:text-white font-medium">+{fmt(a.priceCents)}</div>
                    </div>
                  )
                })}

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">{fmt(subtotalCents)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">VAT (21%)</span>
                    <span className="text-gray-900 dark:text-white">{fmt(vatCents)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-blue-600">{fmt(totalCents)}</span>
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

export default AddOns
