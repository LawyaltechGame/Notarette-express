import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useFormSubmission } from '../hooks/useFormSubmission'
import PageBackground from '../components/layout/PageBackground'

const EU_COUNTRIES = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE']
const EUROPE_OUTSIDE_EU = ['CH', 'NO', 'IS', 'GB', 'UA', 'BY', 'RU', 'MD', 'RS', 'BA', 'ME', 'MK', 'AL', 'TR']

// Calculate shipping cost based on country
const getShippingCostCents = (countryCode: string): number => {
  if (!countryCode) return 0
  const code = countryCode.toUpperCase()
  if (EU_COUNTRIES.includes(code)) return 4500 // €45 for EU
  if (EUROPE_OUTSIDE_EU.includes(code)) return 5500 // €55 for Europe outside EU
  return 6500 // €65 for rest of world
}

// Calculate extra copy price based on country (proportional to shipping cost)
// Extra copy pricing removed — copies are free

const addonsList = [
  { key: 'courier', title: 'Courier Delivery', subtitle: 'Physical delivery within 3 business days', priceCents: 0 }, // Dynamic pricing
  { key: 'apostille', title: 'Apostille Service', subtitle: 'International authentication for Hague Convention countries', priceCents: 7000 },
]

const AddOns: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { updateSubmission } = useFormSubmission()
  
  

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

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
    postalCode: '',
    country: '',
    email: '',
    phone: ''
  })

  const currency = initial?.currency || 'EUR'
  const fmt = (cents: number) => new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format(cents / 100)

  const baseSubtotal = initial?.subtotalCents || 0
  
  // Calculate courier cost dynamically based on country
  const courierCostCents = selected.has('courier') ? getShippingCostCents(courierAddress.country) : 0
  
  // Extra copies are free
  const extraCopyPriceCents = 0
  
  const addonsCentsFromToggles = Array.from(selected).reduce((sum, key) => {
    if (key === 'courier') return sum + courierCostCents
    const a = addonsList.find(x => x.key === key)
    return sum + (a?.priceCents || 0)
  }, 0)
  const extraCopiesCents = (selected.has('courier') ? extraCopies : 0) * extraCopyPriceCents
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
        <div className="flex items-center justify-center space-x-12 mb-8 text-gray-500">
          <div className="text-center opacity-70">
            <div className="w-8 h-8 rounded-full border flex items-center justify-center mx-auto mb-1">1</div>
            <div className="text-xs">Service Selection</div>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center mx-auto mb-1">2</div>
            <div className="text-xs">Add-ons</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <Card>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
                Optional Add-ons
              </h1>
              <p className="text-center text-gray-600 mb-8">
                Enhance your service with these optional features
              </p>

              <div className="max-w-3xl mx-auto space-y-4">
                {addonsList.map(a => {
                  const active = selected.has(a.key)
                  const displayPrice = a.key === 'courier' ? courierCostCents : a.priceCents
                  return (
                    <button
                      key={a.key}
                      onClick={() => toggle(a.key)}
                      className={`w-full text-left p-5 rounded-xl border transition-all flex items-center justify-between ${
                        active ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-gray-900">{a.title}</div>
                        <div className="text-sm text-gray-600">{a.subtitle}</div>
                      </div>
                      <div className="text-blue-600 font-bold">+{fmt(displayPrice)}</div>
                    </button>
                  )
                })}
              </div>

              {selected.has('courier') && (
                <div className="max-w-3xl mx-auto mt-6 p-5 rounded-xl border border-gray-200 bg-white">
                  <h3 className="font-semibold text-gray-900 mb-1">Courier Address</h3>
                  <p className="text-xs text-gray-500 mb-4">We will ship physical documents to this address.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      value={courierAddress.name}
                      onChange={e=>setCourierAddress(v=>({ ...v, name: e.target.value }))}
                      placeholder="Full Name"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900"
                    />
                    <input
                      value={courierAddress.line1}
                      onChange={e=>setCourierAddress(v=>({ ...v, line1: e.target.value }))}
                      placeholder="Address Line 1"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900"
                    />
                    <input
                      value={courierAddress.line2}
                      onChange={e=>setCourierAddress(v=>({ ...v, line2: e.target.value }))}
                      placeholder="Address Line 2 (optional)"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900"
                    />
                    <input
                      value={courierAddress.city}
                      onChange={e=>setCourierAddress(v=>({ ...v, city: e.target.value }))}
                      placeholder="City"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900"
                    />
                    <input
                      value={courierAddress.email}
                      onChange={e=>setCourierAddress(v=>({ ...v, email: e.target.value }))}
                      placeholder="Email Address (to recipient)"
                      type="email"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900"
                    />
                    <input
                      value={courierAddress.phone}
                      onChange={e=>setCourierAddress(v=>({ ...v, phone: e.target.value }))}
                      placeholder="Phone Number (to recipient)"
                      type="tel"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900"
                    />
                    <input
                      value={courierAddress.postalCode}
                      onChange={e=>setCourierAddress(v=>({ ...v, postalCode: e.target.value }))}
                      placeholder="Postal Code"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900"
                    />
                    <input
                      value={courierAddress.country}
                      onChange={e=>setCourierAddress(v=>({ ...v, country: e.target.value }))}
                      placeholder="Country (e.g., DE, FR, AT)"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900"
                    />
                  </div>
                  
                  {courierAddress.country && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Shipping Cost for {courierAddress.country.toUpperCase()}:</span> {fmt(getShippingCostCents(courierAddress.country))}
                      </p>
                    </div>
                  )}
                  
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
                  <div className="mt-6 pt-5 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Extra copies</h3>
                    <p className="text-xs text-gray-500 mb-3">Optional. Available only with Courier Delivery.</p>
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700">Number of extra copies</label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={extraCopies}
                        onChange={e => setExtraCopies(Math.max(0, Math.min(10, Number(e.target.value) || 0)))}
                        className="w-24 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900"
                      />
                      <span className="text-sm text-blue-600 font-medium">Free</span>
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
                      let price = a?.priceCents || 0
                      if (key === 'courier') {
                        price = courierCostCents
                      }
                      return { key, title: a?.title, priceCents: price }
                    })
                    if (selected.has('courier') && extraCopies > 0) {
                      addons.push({ key: 'extraCopies', title: `Extra copies × ${extraCopies}`, priceCents: 0 })
                    }
                    const payload = {
                      ...base,
                      addons,
                      addonsCents,
                      subtotalCents,
                      vatCents,
                      totalCents,
                      extraCopies: selected.has('courier') ? extraCopies : 0,
                      courierAddress: selected.has('courier') ? courierAddress : null,
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
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-900">Selected Services</div>
                  <div className="text-gray-900 font-medium">{fmt(baseSubtotal)}</div>
                </div>
                {Array.from(selected).map(key => {
                  const a = addonsList.find(x => x.key === key)
                  if (!a) return null
                  const displayPrice = key === 'courier' ? courierCostCents : a.priceCents
                  return (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <div className="text-gray-900">{a.title}</div>
                      <div className="text-gray-900 font-medium">+{fmt(displayPrice)}</div>
                    </div>
                  )
                })}

                {selected.has('courier') && extraCopies > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-900">Extra copies × {extraCopies}</div>
                    <div className="text-gray-900 font-medium">+{fmt(extraCopiesCents)}</div>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{fmt(subtotalCents)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">VAT (21%)</span>
                    <span className="text-gray-900">{fmt(vatCents)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-gray-900">Total</span>
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
