import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../../../lib/sdk.js"

export const useCustomerDraftOrders = (
  customerIds: string[],
  limit = 10,
  offset = 0
) =>
  useQuery({
    queryKey: ["draft-orders", customerIds, limit, offset],
    queryFn: () =>
      sdk.admin.draftOrder.list({
        customer_id: customerIds,
        limit,
        offset,
        fields:
          "id,display_id,status,created_at,total,subtotal,currency_code,payment_status,fulfillment_status",
      }),
    enabled: customerIds && customerIds.length > 0,
  })