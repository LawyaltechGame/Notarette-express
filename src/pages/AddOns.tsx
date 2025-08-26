import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const addonsList = [
  { key: 'courier', title: 'Courier Delivery', subtitle: 'Physical delivery within 3 business days', priceCents: 1500 },
  { key: 'apostille', title: 'Apostille Service', subtitle: 'International authentication for Hague Convention countries', priceCents: 8900 },
  { key: 'express', title: 'Express 24h Processing', subtitle: 'Priority processing within 24 hours', priceCents: 2500 },
]

const AddOns: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const initial = React.useMemo(() => {
    try {
      const raw = sessionStorage.getItem('notary_wizard_selection')
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  }, [])

  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  const currency = initial?.currency || 'INR'
  const fmt = (cents: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(cents / 100)

  const baseSubtotal = initial?.subtotalCents || 0
  const addonsCents = Array.from(selected).reduce((sum, key) => {
    const a = addonsList.find(x => x.key === key)
    return sum + (a?.priceCents || 0)
  }, 0)
  const subtotalCents = baseSubtotal + addonsCents
  const vatCents = Math.round(subtotalCents * 0.21)
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
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

              <div className="flex items-center justify-between mt-8 max-w-3xl mx-auto">
                <Button variant="ghost" onClick={() => navigate(`/services/${slug}/service-selection`)}>Back</Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const raw = sessionStorage.getItem('notary_wizard_selection')
                    const base = raw ? JSON.parse(raw) : {}
                    const addons = Array.from(selected).map(key => {
                      const a = addonsList.find(x => x.key === key)
                      return { key, title: a?.title, priceCents: a?.priceCents || 0 }
                    })
                    const payload = {
                      ...base,
                      addons,
                      addonsCents,
                      subtotalCents,
                      vatCents,
                      totalCents,
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
  )
}

export default AddOns
