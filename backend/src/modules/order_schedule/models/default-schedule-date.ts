import { model } from "@medusajs/framework/utils"

export const DefaultScheduleDate = model.define("default_schedule_date", {
  id: model.id().primaryKey(),
  name: model.text(),
  default_date: model.dateTime(),
})