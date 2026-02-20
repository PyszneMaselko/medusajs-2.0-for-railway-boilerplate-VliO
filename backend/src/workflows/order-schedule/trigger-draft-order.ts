import {
  createStep,
  StepResponse,
  when,
  transform,
} from "@medusajs/framework/workflows-sdk";
import { ORDER_SCHEDULE_MODULE } from "../../modules/order_schedule";
import OrderScheduleModuleService from "../../modules/order_schedule/service";
import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { LinkDefinition } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { convertDraftOrderWorkflow } from "@medusajs/medusa/core-flows";
import { getOrderDetailWorkflow } from "@medusajs/medusa/core-flows";
import { deleteDraftOrderScheduleWorkflow } from "./delete-draft-order-schedule";
import { createDraftOrderScheduleWorkflow } from "./create-draft-order-schedule";

const createClonedOrderStep = createStep(
  "create-cloned-order",
  async ({ order }: any, { container }) => {
    const orderModule = container.resolve(Modules.ORDER);
    const logger = container.resolve("logger");

    logger.info("Before cloning");

    // @ts-ignore
    const cloned = await orderModule.createOrders({
      currency_code: order.currency_code,
      email: order.email,
      shipping_address: {
        first_name: order.shipping_address?.first_name || "",
        last_name: order.shipping_address?.last_name || "",
        address_1: order.shipping_address?.address_1 || "",
        address_2: order.shipping_address?.address_2 || "",
        company: order.shipping_address?.company || null,
        city: order.shipping_address?.city || "",
        province: order.shipping_address?.province || "",
        postal_code: order.shipping_address?.postal_code || "",
        country_code: order.shipping_address?.country_code || "",
        phone: order.shipping_address?.phone || "",
      },
      billing_address: {
        first_name: order.billing_address?.first_name || "",
        last_name: order.billing_address?.last_name || "",
        address_1: order.billing_address?.address_1 || "",
        address_2: order.billing_address?.address_2 || "",
        city: order.billing_address?.city || "",
        province: order.billing_address?.province || "",
        postal_code: order.billing_address?.postal_code || "",
        country_code: order.billing_address?.country_code || "",
        phone: order.billing_address?.phone || "",
      },
      items: order.items.map((item) => ({
        title: item!.title,
        quantity: item!.quantity,
        subtitle: item!.subtitle,
        thumbnail: item!.thumbnail,
        product_title: item!.product_title,
        product_description: item!.product_description,
        product_handle: item!.product_handle,
        variant_id: item!.variant_id || "",
        variant_title: item!.variant_title,
        unit_price: item!.unit_price,
        requires_shipping: item!.requires_shipping,
        metadata: item!.metadata || undefined,
        product_id: item!.product_id || "",
      })),
      region_id: order.region_id || "",
      customer_id: order.customer_id || "",
      sales_channel_id: order.sales_channel_id || "",
      shipping_methods:
        order.shipping_methods?.map((sm) => ({
          shipping_option_id: sm?.shipping_option_id || "",
          data: sm?.data || {},
          name: sm?.name || "",
          amount: sm?.amount || 0,
          order_id: "", // ustawiane wewnętrznie
        })) || [],
      status: order.status,
      is_draft_order: true,
    });
    logger.info("After cloning");

    return new StepResponse({ clonedOrder: cloned }, cloned.id);
  },
  async (orderId, { container }) => {
    if (!orderId) {
      return;
    }
    const orderModule = container.resolve(Modules.ORDER);
    await orderModule.softDeleteOrders([orderId]);
  },
);

type TriggerDraftOrderWorkflowInput = {
  draftOrderSchedule_id: string;
};

export const triggerDraftOrderWorkflow = createWorkflow(
  "trigger-draft-order",
  (input: TriggerDraftOrderWorkflowInput) => {
    const startToday = new Date(0);
    const endToday = new Date();
    endToday.setHours(23, 59, 59, 999);

    const { data: schedules } = useQueryGraphStep({
      entity: "draft_order_schedule",
      fields: ["*", "order.*", "order.items.*"],
      filters: {
        trigger_date: {
          $gte: startToday,
          $lte: endToday,
        },
        id: input.draftOrderSchedule_id,
      },
    });

    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "*",
        "items.*",
        "shipping_address.*",
        "billing_address.*",
        "shipping_methods.*",
        "customer.*",
      ],
      filters: { id: schedules[0].order.id },
      options: { throwIfKeyNotFound: true },
    }).config({ name: "fetch-order-for-draft-schedule" });

    const cloneOrder = when(
      "handle-clone-draft-order",
      { schedules },
      ({ schedules }) => schedules.length > 0 && schedules[0].clone,
    ).then(() => {
      // Order cloning
      const { clonedOrder } = createClonedOrderStep({ order: orders[0] });

      // Calculating new Triggers date
      const nextTriggerDate = transform({ schedules }, ({ schedules }) => {
        const base = new Date(schedules[0].trigger_date);
        base.setMonth(base.getMonth() + 1);
        return base.toISOString();
      });

      //Creating new Trigger
      const cloneTrigger = createDraftOrderScheduleWorkflow.runAsStep({
        input: {
          trigger_date: nextTriggerDate,
          order_id: clonedOrder.id,
          clone: true,
        },
      });
    });

    const order = convertDraftOrderWorkflow.runAsStep({
      input: {
        id: schedules[0].order.id,
      },
    });

    deleteDraftOrderScheduleWorkflow.runAsStep({
      input: { order_id: order.id },
    });

    // const resp = changeDraftOrderToOrder({ schedules, order });

    return new WorkflowResponse({ schedules });
  },
);
