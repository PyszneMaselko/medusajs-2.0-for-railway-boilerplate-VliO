"use client"

import { clx, Text } from "@medusajs/ui"

type OrderItemDetail = {
  id: string
  title: string
  product_title: string
  variant_title: string | null
  thumbnail: string | null
  quantity: number
  unit_price: number
}

type Order = {
  id: string
  display_id: number
  email: string
  currency_code: string
  items: OrderItemDetail[]
}

type PaymentCollection = {
  id: string
  amount: number
  currency_code: string
  status: string
}

export type OrderDetails = {
  order_id: string
  payment_collection_id: string
  id: string
  order: Order
  payment_collection: PaymentCollection
}

type Props = {
  orderDetails: OrderDetails
}

const formatAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount)

const OrderSummary = ({ orderDetails }: Props) => {
  const { order, payment_collection } = orderDetails

  return (
    <div
      className={clx(
        "w-full bg-ui-bg-base rounded-2xl shadow-md",
        "border border-ui-border-base p-8 flex flex-col gap-6"
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-ui-fg-base text-xl font-semibold">Order Details</h2>
        <p className="text-ui-fg-subtle text-sm">
          Order number: #{order.display_id} • {order.email}
        </p>
      </div>

      <hr className="border-ui-border-base" />

      {/* Items */}
      <div className="flex flex-col gap-3">
        <Text className="text-ui-fg-base text-sm font-semibold">
          Ordered services
        </Text>

        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 border border-ui-border-base rounded-lg p-3"
          >
            {item.thumbnail && (
              <img
                src={item.thumbnail}
                alt={item.product_title}
                className="w-12 h-12 rounded-md object-cover"
              />
            )}

            <div className="flex-1 flex flex-col">
              <span className="text-ui-fg-base text-sm font-medium">
                {item.product_title || item.title}
              </span>

              {/* {item.variant_title && (
                <span className="text-ui-fg-subtle text-xs">
                  {item.variant_title}
                </span>
              )} */}

              <span className="text-ui-fg-subtle text-xs">
                Quantity: {item.quantity}
              </span>
            </div>

            <span className="text-ui-fg-base text-sm font-semibold">
              {formatAmount(
                item.unit_price * item.quantity,
                order.currency_code
              )}
            </span>
          </div>
        ))}
      </div>

      <hr className="border-ui-border-base" />

      {/* Summary */}
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <Text className="text-ui-fg-subtle">Total</Text>
          <Text className="text-ui-fg-base font-semibold">
            {formatAmount(
              payment_collection.amount,
              payment_collection.currency_code
            )}
          </Text>
        </div>

        <div className="flex justify-between">
          <Text className="text-ui-fg-subtle">Payment status</Text>
          <Text className="text-ui-fg-base capitalize">
            {payment_collection.status}
          </Text>
        </div>

        <div className="flex justify-between mt-2 pt-2 border-t border-ui-border-base">
          <Text className="text-ui-fg-base font-semibold">Razem</Text>
          <Text className="text-ui-fg-base font-semibold">
            {formatAmount(
              payment_collection.amount,
              payment_collection.currency_code
            )}
          </Text>
        </div>
      </div>

      <p className="text-ui-fg-muted text-xs text-center">
        Po opłaceniu zamówienia otrzymasz potwierdzenie na podany adres e-mail.
      </p>
    </div>
  )
}

export default OrderSummary
