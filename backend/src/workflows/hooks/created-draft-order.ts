// import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
// import { StepResponse } from "@medusajs/framework/workflows-sdk"
// import { Modules } from "@medusajs/framework/utils"
// import { LinkDefinition } from "@medusajs/framework/types"
// import { ORDER_SCHEDULE_MODULE } from "../../modules/order-schedule"
// import OrderScheduleModuleService from "../../modules/order-schedule/service"

// createProductsWorkflow.hooks.productsCreated(
//   (async ({ products, additional_data }, { container }) => {
//     if (!additional_data?.brand_id) {
//       return new StepResponse([], [])
//     }

//     const brandModuleService: OrderScheduleModuleService = container.resolve(
//       ORDER_SCHEDULE_MODULE
//     )
//     // if the brand doesn't exist, an error is thrown.
//     await brandModuleService.retrieveDraftOrderSchedule(additional_data.brand_id as string)

//     // TODO link brand to product
//   })
// )