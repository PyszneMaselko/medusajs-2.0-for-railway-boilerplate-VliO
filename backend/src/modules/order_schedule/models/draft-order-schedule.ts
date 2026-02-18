import { model } from "@medusajs/framework/utils"

export const DraftOrderSchedule = model.define("draft_order_schedule", {
  id: model.id().primaryKey(),
  trigger_date: model.dateTime(),
})