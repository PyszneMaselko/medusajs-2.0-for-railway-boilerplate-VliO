import {
  createStep,
  StepResponse,
  when,
} from "@medusajs/framework/workflows-sdk";
import { MedusaError } from "@medusajs/framework/utils";
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
import OrderDraftScheduleLink from "../../links/order-schedule/draft-order-schedule-draft-order";

export type DeleteDraftOrderScheduleStepInput = {
  draft_order_schedule_id: string;
};

export const deleteDraftOrderScheduleStep = createStep(
  "delete-draft-order-schedule-step",
  async (input: DeleteDraftOrderScheduleStepInput, { container }) => {
    const orderScheduleModuleService: OrderScheduleModuleService =
      container.resolve(ORDER_SCHEDULE_MODULE);

    const draftOrderSchedule =
      await orderScheduleModuleService.deleteDraftOrderSchedules(
        input.draft_order_schedule_id,
      );

    return new StepResponse(draftOrderSchedule, draftOrderSchedule);
  }
);

export type DeleteDraftOrderScheduleLinksStepInput = {
  draft_order_schedule_id: string;
  order_id: string;
};

export const deleteDraftOrderScheduleLinksStep = createStep(
  "delete-draft-order-schedule-links-step",
  async (input: DeleteDraftOrderScheduleLinksStepInput, { container }) => {
    const orderScheduleModuleService: OrderScheduleModuleService =
      container.resolve(ORDER_SCHEDULE_MODULE);
    // const orderModuleService = container.resolve("order");
    const logger = container.resolve("logger");
    const link = container.resolve("link");

    logger.info(input.draft_order_schedule_id);
    logger.info(input.order_id);

    const links: LinkDefinition[] = [];

    if (input.draft_order_schedule_id && input.order_id) {
      links.push({
        [Modules.ORDER]: {
          order_id: input.order_id,
        },
        [ORDER_SCHEDULE_MODULE]: {
          draft_order_schedule_id: input.draft_order_schedule_id,
        },
      });
      await link.dismiss(links);
      logger.info("DELETED order_schedule LINKS");
    }

    return new StepResponse(links, links);
  },
);

type DeleteDraftOrderScheduleWorkflowInput = {
  order_id: string;
};

export const deleteDraftOrderScheduleWorkflow = createWorkflow(
  "delete-draft-order-schedule",
  (input: DeleteDraftOrderScheduleWorkflowInput) => {
    const { data: schedules } = useQueryGraphStep({
      entity: OrderDraftScheduleLink.entryPoint,
      fields: ["*"],
      filters: {
        order_id: input.order_id,
      },
    });

    const result = when(
      { schedules },
      ({ schedules }) => schedules.length > 0,
    ).then(() => {
      const links = deleteDraftOrderScheduleLinksStep({
        draft_order_schedule_id: schedules[0].draft_order_schedule_id,
        order_id: schedules[0].order_id,
      });
      return deleteDraftOrderScheduleStep({
        draft_order_schedule_id: schedules[0].draft_order_schedule_id,
      });
    });

    return new WorkflowResponse(result);
  },
);
