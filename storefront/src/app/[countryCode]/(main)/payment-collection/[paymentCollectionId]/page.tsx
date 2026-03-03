"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { clx, Text, Button } from "@medusajs/ui"
import { RadioGroup } from "@headlessui/react"
import { ChevronLeft } from "@medusajs/icons"

import StripeForm from "@modules/payment/components/stripe-form"
import Radio from "@modules/common/components/radio"

const PAYMENT_OPTIONS = [
  {
    id: "pp_stripe_stripe",
    title: "Karta płatnicza",
  },
  {
    id: "pp_stripe-blik_stripe",
    title: "BLIK",
  },
]

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_KEY || "pk_test_temp"
)

export default function PayExistingOrderPage() {
  const { paymentCollectionId } = useParams<{ paymentCollectionId: string }>()

  const [selectedProvider, setSelectedProvider] =
    useState<string>("pp_stripe_stripe")

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 🔁 RESET przy zmianie providera
   * (Stripe NIE pozwala zmieniać metod na istniejącym PI)
   */
  useEffect(() => {
    setClientSecret(null)
    setError(null)
  }, [selectedProvider])

  /**
   * ▶️ User świadomie zatwierdza metodę
   */
  const handleConfirmProvider = async () => {
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
            provider_id: selectedProvider,
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
          (s: any) => s.provider_id === selectedProvider
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

        {/* ERROR */}
        {error && (
          <div className="bg-ui-tag-red-bg border border-ui-tag-red-border rounded-lg px-4 py-3">
            <p className="text-ui-tag-red-text text-sm font-medium">{error}</p>
          </div>
        )}

        {/* PROVIDER SELECTION */}
        {!clientSecret && (
          <>
            <RadioGroup
              value={selectedProvider}
              onChange={setSelectedProvider}
              className="flex flex-col gap-y-2"
            >
              {PAYMENT_OPTIONS.map((option) => (
                <RadioGroup.Option
                  key={option.id}
                  value={option.id}
                  className={({ checked }) =>
                    clx(
                      "flex items-center justify-between cursor-pointer py-4 px-6 border rounded-rounded",
                      {
                        "border-ui-border-interactive": checked,
                        "border-ui-border-base": !checked,
                      }
                    )
                  }
                >
                  {({ checked }) => (
                    <div className="flex items-center gap-x-4">
                      <Radio checked={checked} />
                      <Text className="text-base-regular">{option.title}</Text>
                    </div>
                  )}
                </RadioGroup.Option>
              ))}
            </RadioGroup>

            {/* <Button
              variant="primary"
              className="w-full mt-4"
              onClick={handleConfirmProvider}
              isLoading={loading}
            >
              Kontynuuj
            </Button> */}
            <button
              type="submit"
              className={clx(
                "w-full rounded-lg py-3 text-sm font-medium transition-colors",
                "bg-ui-button-inverted text-ui-fg-on-inverted",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              onClick={handleConfirmProvider}
            >
              {loading ? "Przetwarzanie…" : "Wybierz metodę płatności"}
            </button>
          </>
        )}

        {/* STRIPE ELEMENTS */}
        {clientSecret && (
          <>
            <div className="flex justify-start mt-4">
              <Text
                className={clx(
                  "flex items-center gap-1 text-ui-fg-interactive cursor-pointer transition-colors",
                  "hover:text-ui-fg-base"
                )}
                onClick={() => setSelectedProvider("")}
              >
                <ChevronLeft className="w-4 h-4" />
                Wybierz inną metodę płatności
              </Text>
            </div>
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
          </>
        )}

        <p className="text-ui-fg-muted text-xs text-center mt-2">
          Your payment information is encrypted and secure.
        </p>
      </div>
    </div>
  )
}
