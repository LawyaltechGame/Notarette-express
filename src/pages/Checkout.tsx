import React, { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Shield, CheckCircle, Calendar } from "lucide-react";
import { createCheckoutAndRedirect } from "../services/stripeService";
import { useFormSubmission } from "../hooks/useFormSubmission";
import PageBackground from "../components/layout/PageBackground";

const Checkout: React.FC = () => {
  const [payload, setPayload] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateSubmission } = useFormSubmission();
  const [email, setEmail] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("notary_checkout_payload");
      if (raw) setPayload(JSON.parse(raw));
      const savedEmail = sessionStorage.getItem('notary_checkout_email')
      if (savedEmail) setEmail(savedEmail)
    } catch {}
  }, []);

  // Guard: require AddOns step payload
  useEffect(() => {
    try {
      const hasSubmissionId = !!sessionStorage.getItem('current_submission_id')
      const hasPayload = !!sessionStorage.getItem('notary_checkout_payload')
      if (!hasSubmissionId || !hasPayload) {
        window.location.replace('/services')
      }
    } catch {
      window.location.replace('/services')
    }
  }, [])

  // If user’s currentStep indicates earlier/later, route them accordingly
  // Minimal check by reading a cached indicator (optional future enhancement could read from DB)

  const currency = payload?.currency || "EUR";
  const fmt = (cents: number) =>
    new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(
      (cents || 0) / 100
    );

  const subtotal = payload?.subtotalCents || 0;
  const vat = payload?.vatCents ?? 0;
  const total = payload?.totalCents ?? subtotal;

  return (
    <PageBackground>
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Summary */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-3">
              <div>
                <div className="font-semibold text-gray-900">
                  {payload?.serviceTitle || "Selected Service"}
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    Base Service
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Professional notarization of your documents with legal
                  drafting support.
                </p>
              </div>

              {payload?.selectedOptions?.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    Selected Types
                  </div>
                  <ul className="text-sm text-gray-700 list-disc list-inside">
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
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    Selected Add-ons
                  </div>
                  <ul className="text-sm text-gray-700 list-disc list-inside">
                    {payload.addons.map((a: any) => (
                      <li key={a.key}>{a.title}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Subtotal
                  </span>
                  <span className="text-gray-900">
                    {fmt(subtotal)}
                  </span>
                </div>
                {false && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      VAT (21%)
                    </span>
                    <span className="text-gray-900">
                      {fmt(vat)}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-blue-600">{fmt(total)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Pay with Stripe */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pay with Stripe
            </h2>
            <div className="text-sm text-gray-700 space-y-2 mb-6">
              <div>1. Review your order summary</div>
              <div>2. Click Pay Here to open Stripe Checkout</div>
              <div>
                3. Complete payment securely with card or digital wallet
              </div>
              <div>
                4. You will receive confirmation and payment successfully emails
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email for receipt and updates
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                We'll use this email on Stripe Checkout.
              </p>
            </div>
            <Button
              variant="danger"
              className="w-full py-3"
              disabled={isSubmitting}
              onClick={async () => {
                try {
                  if (!payload) {
                    alert("Missing checkout payload. Please start again.");
                    return;
                  }
                  if (isSubmitting) return;
                  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    alert("Please enter a valid email to continue.");
                    return;
                  }
                  setIsSubmitting(true);
                  try { sessionStorage.setItem('notary_checkout_email', email) } catch {}

                  // Update form submission to mark as checkout initiated
                  try {
                    await updateSubmission({
                      currentStep: "checkout",
                    });
                    console.log("Checkout step updated in Appwrite");
                  } catch (error) {
                    console.error("Error updating checkout step:", error);
                    // Continue anyway - don't block payment
                  }

                  const serviceId = payload.serviceSlug;
                  if (!serviceId) {
                    alert("Missing service. Please start again.");
                    setIsSubmitting(false);
                    return;
                  }
                  const addOnIds = Array.isArray(payload?.addons)
                    ? payload.addons.map((a: any) => a.key)
                    : [];
                  const optionKeys = Array.isArray(payload?.selectedOptions)
                    ? payload.selectedOptions.map((o: any) => o.key)
                    : [];
                  const extraCopies = payload?.extraCopies || 0;
                  const items = [
                    {
                      serviceId,
                      quantity: 1,
                      addOnIds,
                      optionKeys,
                      extraCopies,
                    },
                  ];
                  createCheckoutAndRedirect(items, email)
                    .catch(() => {})
                    .finally(() => setIsSubmitting(false));
                } catch (e) {
                  console.error(e);
                  alert("Failed to start Stripe Checkout. Please try again.");
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? "Opening Stripe…" : "Pay Here"}
            </Button>

            <ul className="text-xs text-gray-500 mt-4 list-disc list-inside">
              <h1 className="mb-2 font-medium">🔴 Pay Here Security & Trust</h1>
              <li className="ml-5">🔒 SSL Secured</li>
              <li className="ml-5">✅ PCI DSS Compliant</li>
              <li className="ml-5">⚡ Instant Confirmation</li>
            </ul>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-center text-sm text-gray-600">
          <div className="p-4 border rounded-lg">
            <Shield className="w-5 h-5 mx-auto mb-2" /> SSL Secured
          </div>
          <div className="p-4 border rounded-lg">
            <CheckCircle className="w-5 h-5 mx-auto mb-2" /> PCI DSS Compliant
          </div>
          <div className="p-4 border rounded-lg">
            <Calendar className="w-5 h-5 mx-auto mb-2" /> Instant Confirmation
          </div>
        </div>
        </div>
      </div>
    </PageBackground>
  );
};

export default Checkout;
