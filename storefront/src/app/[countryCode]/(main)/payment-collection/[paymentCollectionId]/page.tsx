"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { clx } from "@medusajs/ui"
import StripeForm from "@modules/payment/components/stripe-form"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_KEY || "pk_test_temp"
)

export default function PayExistingOrderPage() {
  const { paymentCollectionId } = useParams<{ paymentCollectionId: string }>()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initPaymentSession = async () => {
      if (!paymentCollectionId) return

      setLoading(true)
      setError(null)

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/payment-collections/${paymentCollectionId}/payment-sessions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-publishable-api-key":
                process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
            },
            body: JSON.stringify({
              provider_id: "pp_stripe_stripe",
              data: {},
            }),
          }
        )

        if (!res.ok) {
          throw new Error("Failed to initialize payment session")
        }

        const { payment_collection } = await res.json()
        const session =
          payment_collection.payment_sessions?.find(
            (s: any) => s.provider_id === "pp_stripe_stripe"
          ) || payment_collection.payment_sessions?.[0]

        const cs = session?.data?.client_secret as string | undefined
        if (!cs) throw new Error("Missing client_secret on payment session")

        setClientSecret(cs)
      } catch (e: any) {
        setError(e.message || "Error initializing payment")
      } finally {
        setLoading(false)
      }
    }

    initPaymentSession()
  }, [paymentCollectionId])

  return (
    <div className="min-h-screen bg-ui-bg-subtle flex items-center justify-center px-4">
      <div
        className={clx(
          "w-full max-w-md bg-ui-bg-base rounded-2xl shadow-md",
          "border border-ui-border-base p-8 flex flex-col gap-6"
        )}
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-ui-fg-base text-xl font-semibold">
            Complete your payment
          </h1>
          <p className="text-ui-fg-subtle text-sm">
            Secure payment powered by Stripe
          </p>
        </div>

        <hr className="border-ui-border-base" />

        {loading && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-ui-border-base border-t-ui-fg-interactive" />
            <p className="text-ui-fg-muted text-sm">
              Initializing payment…
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-ui-tag-red-bg border border-ui-tag-red-border rounded-lg px-4 py-3">
            <p className="text-ui-tag-red-text text-sm font-medium">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && !clientSecret && (
          <p className="text-ui-fg-muted text-sm text-center py-6">
            No payment data available.
          </p>
        )}

        {!loading && !error && clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret }}
            key={clientSecret}
          >
            <StripeForm
              clientSecret={clientSecret}
              paymentCollectionId={paymentCollectionId}
            />
          </Elements>
        )}

        <p className="text-ui-fg-muted text-xs text-center mt-2">
          Your payment information is encrypted and secure.
        </p>
      </div>
    </div>
  )
}