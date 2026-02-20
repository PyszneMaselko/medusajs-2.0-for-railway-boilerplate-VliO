import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ORDER_SCHEDULE_MODULE } from "../../modules/order_schedule";
import OrderScheduleModuleService from "../../modules/order_schedule/service";
import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { LinkDefinition } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export type CreateDraftOrderScheduleStepInput = {
  trigger_date: string;
  clone : boolean;
};

export const createDraftOrderScheduleStep = createStep(
  "create-draft-order-schedule-step",
  async (input: CreateDraftOrderScheduleStepInput, { container }) => {
    const orderScheduleModuleService: OrderScheduleModuleService =
      container.resolve(ORDER_SCHEDULE_MODULE);

    const date = new Date(input.trigger_date);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid trigger_date");
    }

    const draftOrderSchedule =
      await orderScheduleModuleService.createDraftOrderSchedules({
        trigger_date: date,
        clone: input.clone
      });

    return new StepResponse(draftOrderSchedule, draftOrderSchedule.id);
  },
  async (id: string, { container }) => {
    const orderScheduleModuleService: OrderScheduleModuleService =
      container.resolve(ORDER_SCHEDULE_MODULE);

    await orderScheduleModuleService.deleteDraftOrderSchedules(id);
  },
);

export type LinkDraftOrderScheduleStepInput = {
  order_id: string;
  draft_order_schedule_id: string;
};

export const linkDraftOrderScheduleOrderStep = createStep(
  "link-draft-order-schedule-step",
  async (input: LinkDraftOrderScheduleStepInput, { container }) => {
    const orderScheduleModuleService: OrderScheduleModuleService =
      container.resolve(ORDER_SCHEDULE_MODULE);
    const link = container.resolve(ContainerRegistrationKeys.LINK); // as any;
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER); // as any;

    const links: LinkDefinition[] = [];

    links.push({
      [Modules.ORDER]: {
        order_id: input.order_id,
      },
      [ORDER_SCHEDULE_MODULE]: {
        draft_order_schedule_id: input.draft_order_schedule_id,
      },
    });

    await link.create(links);
    logger.info("Link created");

    return new StepResponse(links, links);
  },
);

type CreateDraftOrderScheduleWorkflowInput = {
  trigger_date: string;
  order_id: string;
  clone: boolean;
};

export const createDraftOrderScheduleWorkflow = createWorkflow(
  "create-draft-order-schedule",
  (input: CreateDraftOrderScheduleWorkflowInput) => {
    const draftOrderSchedule = createDraftOrderScheduleStep({
      trigger_date: input.trigger_date,
      clone: input.clone,
    });

    const links = linkDraftOrderScheduleOrderStep({
      order_id: input.order_id,
      draft_order_schedule_id: draftOrderSchedule.id,
    });

    return new WorkflowResponse(draftOrderSchedule);
  },
);
