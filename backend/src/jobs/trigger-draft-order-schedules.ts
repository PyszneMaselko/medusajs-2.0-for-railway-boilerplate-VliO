import { IProductModuleService, MedusaContainer } from "@medusajs/types";
import { ORDER_SCHEDULE_MODULE } from "../modules/order_schedule";
import OrderScheduleModuleService from "../modules/order_schedule/service";
import { triggerDraftOrderWorkflow } from "../workflows/order-schedule/trigger-draft-order";

export default async function triggerDraftOrderSchedules(
  container: MedusaContainer,
) {
  const OrderScheduleModuleService: OrderScheduleModuleService =
    container.resolve(ORDER_SCHEDULE_MODULE);

  const startToday = new Date(0);
  const endToday = new Date();
  endToday.setHours(23, 59, 59, 999);

  const draftOrderSchedules =
    await OrderScheduleModuleService.listDraftOrderSchedules({
      trigger_date: {
        $gte: startToday,
        $lte: endToday,
      },
    });

  draftOrderSchedules.map((dos) =>
    triggerDraftOrderWorkflow(container).run({
      input: {
        draftOrderSchedule_id: dos.id,
      },
    }),
  );
}

export const config = {
  name: "daily-order-schedule-trigger",
  schedule: "* * * * *",
};
