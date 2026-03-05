"use client"

import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { useState } from "react"
import { clx } from "@medusajs/ui"

type StripeFormProps = {
  clientSecret: string
  paymentCollectionId: string
}

export default function StripeForm({
  clientSecret,
  paymentCollectionId,
}: StripeFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [complete, setComplete] = useState(false)

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    // Submit payment element details first
    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message || "Payment submission failed")
      setLoading(false)
      return
    }

    // Confirm payment (handles cards, BLIK, etc.)
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/order/confirmed`,
      },
      redirect: "if_required",
    })


    if (confirmError) {
      setError(confirmError.message || "Payment failed")
      setLoading(false)
      return
    }

    if (
      paymentIntent?.status === "requires_capture" ||
      paymentIntent?.status === "succeeded"
    ) {
      // TODO: complete the cart / place order via your backend
      alert("Payment successful!")
    }

    setLoading(false)
  }

  return (
    <>
    <form onSubmit={handlePayment} className="flex flex-col gap-4">
      <PaymentElement
        onChange={(e) => setComplete(e.complete)}
        options={{
          layout: "accordion", // shows card, BLIK, etc. as accordion tabs
        }}
      />

      {error && (
        <div className="bg-ui-tag-red-bg border border-ui-tag-red-border rounded-lg px-4 py-3">
          <p className="text-ui-tag-red-text text-sm font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!complete || loading || !stripe || !elements}
        className={clx(
          "w-full rounded-lg py-3 text-sm font-medium transition-colors",
          "bg-ui-button-inverted text-ui-fg-on-inverted",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {loading ? "Przetwarzanie…" : "Płacę teraz"}
      </button>
    </form>
    </>
  )
}
