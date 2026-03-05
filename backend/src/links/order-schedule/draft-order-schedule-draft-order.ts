import OrderScheduleModule from "../../modules/order_schedule"
import OrderModule from "@medusajs/medusa/order"

import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  {
    linkable: OrderModule.linkable.order,
  },
  OrderScheduleModule.linkable.draftOrderSchedule
)