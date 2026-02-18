import { Module } from "@medusajs/framework/utils"
import OrderScheduleModuleService from "./service"

export const ORDER_SCHEDULE_MODULE = "order_schedule"

export default Module(ORDER_SCHEDULE_MODULE, {
  service: OrderScheduleModuleService,
})