import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../../../lib/sdk.js"

export const useCustomerOrders = (
  customerIds: string[],
  limit = 10,
  offset = 0
) =>
  useQuery({
    queryKey: ["orders", customerIds, limit, offset],
    queryFn: () =>
      sdk.admin.order.list({
        customer_id: customerIds,
        limit,
        offset,
        fields:
          "id,display_id,status,created_at,total,currency_code,payment_status,fulfillment_status",
      }),
    enabled: customerIds && customerIds.length > 0,
  })