// DraftOrderDetailsDrawer.tsx
import React from "react"
import { Drawer, Button, Text, Badge, StatusBadge } from "@medusajs/ui"

type DraftOrderItem = {
  id: string
  title: string
  variant_title?: string | null
  product_title: string
  thumbnail?: string | null
  quantity: number
  unit_price: number
}

type DraftOrder = {
  id: string
  display_id: number
  items: DraftOrderItem[]
  currency_code: string
}

type Props = {
  draftOrder: DraftOrder
}

const formatAmount = (amount: number, currency_code: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency_code,
  }).format(amount)
}

export const DraftOrderDetailsDrawer = ({ draftOrder }) => {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Drawer>
        <Drawer.Trigger asChild>
          <Button variant="secondary">#{draftOrder.display_id}</Button>
        </Drawer.Trigger>

        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Draft Order #{draftOrder.display_id}</Drawer.Title>
          </Drawer.Header>

          <Drawer.Body className="p-4 overflow-auto">
            {draftOrder.items.length > 0 ? (
              <div className="divide-y divide-dashed">
                {draftOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-x-4 py-4"
                  >
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex flex-col flex-1 gap-y-1">
                      <Text size="small" weight="plus" className="text-ui-fg-base">
                        {item.product_title}
                      </Text>
                      {item.variant_title && (
                        <Text size="small" className="text-ui-fg-subtle">
                          {item.variant_title}
                        </Text>
                      )}
                      <div className="flex items-center gap-x-2">
                        <Badge size="xsmall" color="grey">
                          {item.quantity}x
                        </Badge>
                        <Text size="small" className="text-ui-fg-subtle">
                          {formatAmount(item.unit_price, draftOrder.currency_code)}
                        </Text>
                      </div>
                    </div>
                    <Text size="small" weight="plus" className="text-ui-fg-base">
                      {formatAmount(item.unit_price * item.quantity, draftOrder.currency_code)}
                    </Text>
                  </div>
                ))}
              </div>
            ) : (
              <Text className="text-ui-fg-subtle">No items in this draft order</Text>
            )}
          </Drawer.Body>

          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button variant="secondary">Close</Button>
            </Drawer.Close>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}