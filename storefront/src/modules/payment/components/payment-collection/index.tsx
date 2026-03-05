"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import StripeForm from "../stripe-form"
// import { sdk } from "@/lib/sdk" // JS SDK skonfigurowany wg docs

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PK || "pk_test_temp"
)

export default function PayExistingOrderPage() {
  const { paymentCollectionId } = useParams<{ paymentCollectionId: string }>()
  const searchParams = useSearchParams()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1) Inicjalizacja payment session dla istniejącej payment collection
  useEffect(() => {
    const initPaymentSession = async () => {
      if (!paymentCollectionId) return

      setLoading(true)
      setError(null)

      try {
        // Bezpośredni REST na Initialize Payment Session:
        // POST /store/payment-collections/{id}/payment-sessions
        // body: { provider_id, data? }
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_MEDUSA_URL}/store/payment-collections/${paymentCollectionId}/payment-sessions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-publishable-api-key":
                process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
            },
            body: JSON.stringify({
              provider_id: "pp_stripe_stripe",
              data: {
                // opcjonalne dane dla providera
              },
            }),
          }
        )

        if (!res.ok) {
          throw new Error("Failed to initialize payment session")
        }

        const { payment_collection } = await res.json()
        // Zakładamy, że mamy jedną session dla Stripe
        const session =
          payment_collection.payment_sessions?.find(
            (s: any) => s.provider_id === "pp_stripe_stripe"
          ) || payment_collection.payment_sessions?.[0]

        const cs = session?.data?.client_secret as string | undefined
        if (!cs) {
          throw new Error("Missing client_secret on payment session")
        }

        setClientSecret(cs)
      } catch (e: any) {
        setError(e.message || "Error initializing payment")
      } finally {
        setLoading(false)
      }
    }

    initPaymentSession()
  }, [paymentCollectionId])

  if (loading) {
    return <div>Ładowanie płatności...</div>
  }

  if (error) {
    return <div>Błąd: {error}</div>
  }

  if (!clientSecret) {
    return <div>Brak danych płatności.</div>
  }

  return (
    <div>
      <h1>Zapłać za zamówienie</h1>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
        }}
      >
        {/* 2) Formularz Stripe, który potwierdza płatność i woła Twój backend */}
        <StripeForm clientSecret={clientSecret} paymentCollectionId={paymentCollectionId} />
      </Elements>
    </div>
  )
}