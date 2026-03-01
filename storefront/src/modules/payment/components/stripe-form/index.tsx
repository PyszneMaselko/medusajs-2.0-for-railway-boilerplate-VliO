"use client"

import { useState } from "react"
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js"

type Props = {
  clientSecret: string
  paymentCollectionId: string
}

export default function StripeForm({ clientSecret, paymentCollectionId }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handlePayment = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
    setError(null)

    const card = elements?.getElement(CardElement)
    if (!stripe || !elements || !card || !clientSecret) {
      return
    }

    setLoading(true)

    try {
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card,
          },
        })

      if (stripeError) {
        setError(stripeError.message || "Stripe error")
        setLoading(false)
        return
      }

      if (
        paymentIntent &&
        (paymentIntent.status === "succeeded" ||
          paymentIntent.status === "requires_capture")
      ) {
        // 3) TU: wywołujesz swój backend, który:
        // - autoryzuje/capture’uje payment session po stronie Medusy
        // - aktualizuje order (np. outstanding amount)
        //
        // W dokumentacji jest analogiczny wzorzec dla carta:
        // sdk.store.cart.complete(cart.id)
        // [[Stripe component](https://docs.medusajs.com/resources/storefront-development/checkout/payment/stripe#3-create-stripe-component)]
        //
        // Przykładowo możesz mieć własny endpoint:
        // POST /api/complete-order-payment
        // body: { payment_collection_id }
        await fetch("/api/complete-order-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payment_collection_id: paymentCollectionId }),
        })

        setSuccess(true)
      } else {
        setError("Payment not completed")
      }
    } catch (e: any) {
      setError(e.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return <div>Płatność zakończona sukcesem. Dziękujemy!</div>
  }

  return (
    <form>
      <CardElement />
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button onClick={handlePayment} disabled={loading}>
        {loading ? "Przetwarzanie..." : "Zapłać"}
      </button>
    </form>
  )
}