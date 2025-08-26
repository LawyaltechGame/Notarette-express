import React, { useState, useEffect } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Shield, CheckCircle, Calendar } from 'lucide-react'
import { createCheckoutAndRedirect } from '../services/stripeService'

const Checkout: React.FC = () => {
  const [payload, setPayload] = useState<any>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('notary_checkout_payload')
      if (raw) setPayload(JSON.parse(raw))
    } catch {}
  }, [])

  const currency = payload?.currency || 'INR'
  const fmt = (cents: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format((cents || 0) / 100)

  const subtotal = payload?.subtotalCents || 0
  const vat = payload?.vatCents ?? Math.round(subtotal * 0.21)
  const total = payload?.totalCents ?? subtotal + vat

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Summary */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {payload?.serviceTitle || 'Selected Service'}
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">Base Service</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Professional notarization of your documents with legal drafting support.
                </p>
              </div>

              {payload?.selectedOptions?.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Selected Types</div>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                    {payload.selectedOptions.map((o: any) => (
                      <li key={o.key}>{o.title}</li>
                    ))}
                    {payload?.extraCopies > 0 && (
                      <li>Extra Copies × {payload.extraCopies}</li>
                    )}
                  </ul>
                </div>
              )}

              {payload?.addons?.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Selected Add-ons</div>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                    {payload.addons.map((a: any) => (
                      <li key={a.key}>{a.title}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">{fmt(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">VAT (21%)</span>
                  <span className="text-gray-900 dark:text-white">{fmt(vat)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-blue-600">{fmt(total)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Pay with Stripe */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pay with Stripe</h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2 mb-6">
              <div>1. Review your order summary</div>
              <div>2. Click Pay Securely to open Stripe Checkout</div>
              <div>3. Complete payment securely on Stripe</div>
              <div>4. You will receive confirmation and next steps by email</div>
            </div>
            <Button
              variant="danger"
              className="w-full py-3"
              onClick={() => {
                try {
                  if (!payload) {
                    alert('Missing checkout payload. Please start again.')
                    return
                  }
                  const serviceId = payload.serviceSlug
                  if (!serviceId) {
                    alert('Missing service. Please start again.')
                    return
                  }
                  const addOnIds = Array.isArray(payload?.addons)
                    ? payload.addons.map((a: any) => a.key)
                    : []
                  const optionKeys = Array.isArray(payload?.selectedOptions)
                    ? payload.selectedOptions.map((o: any) => o.key)
                    : []
                  const extraCopies = payload?.extraCopies || 0
                  const items = [{ serviceId, quantity: 1, addOnIds, optionKeys, extraCopies }]
                  createCheckoutAndRedirect(items)
                } catch (e) {
                  console.error(e)
                  alert('Failed to start Stripe Checkout. Please try again.')
                }
              }}
            >
              Pay Now and Securely
            </Button>

            <ul className="text-xs text-gray-500 mt-4 list-disc list-inside">
              <li>Secure payment powered by Stripe</li>
              <li>Card details are never stored on our servers</li>
              <li>Full refund available if cancelled 24h before</li>
            </ul>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <div className="p-4 border rounded-lg dark:border-gray-700">
            <Shield className="w-5 h-5 mx-auto mb-2" /> SSL Secured
          </div>
          <div className="p-4 border rounded-lg dark:border-gray-700">
            <CheckCircle className="w-5 h-5 mx-auto mb-2" /> PCI DSS Compliant
          </div>
          <div className="p-4 border rounded-lg dark:border-gray-700">
            <Calendar className="w-5 h-5 mx-auto mb-2" /> Instant Confirmation
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout