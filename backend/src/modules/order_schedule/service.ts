import { MedusaService } from "@medusajs/framework/utils"
import { DefaultScheduleDate } from "./models/default-schedule-date"
import { DraftOrderSchedule } from "./models/draft-order-schedule"

class OrderScheduleModuleService extends MedusaService({
  DefaultScheduleDate, DraftOrderSchedule,
}) {

}

export default OrderScheduleModuleService