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

export type UpdateDraftOrderScheduleStepInput = {
  id: string;
  trigger_date?: string;
  clone?: boolean;
};

export type UpdateDraftOrderScheduleType = {
  id: string;
  trigger_date?: Date;
  clone?: boolean;
};

export const updateDraftOrderScheduleStep = createStep(
  "update-draft-order-schedule-step",
  async (input: UpdateDraftOrderScheduleStepInput, { container }) => {
    const orderScheduleModuleService: OrderScheduleModuleService =
      container.resolve(ORDER_SCHEDULE_MODULE);

    let updateData: UpdateDraftOrderScheduleType = {id: input.id};

    if (input.trigger_date !== undefined) {
      const date = new Date(input.trigger_date);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid trigger_date");
      }
      updateData.trigger_date = date;
    }

    if (input.clone !== undefined) {
      updateData.clone = input.clone;
    }

    const draftOrderSchedule =
      await orderScheduleModuleService.updateDraftOrderSchedules(updateData);

    return new StepResponse(draftOrderSchedule, draftOrderSchedule.id);
  },
  async (id: string, { container }) => {
    const orderScheduleModuleService: OrderScheduleModuleService =
      container.resolve(ORDER_SCHEDULE_MODULE);

    await orderScheduleModuleService.deleteDraftOrderSchedules(id);
  },
);

type UpdateDraftOrderScheduleWorkflowInput = {
  id: string;
  trigger_date?: string;
  clone?: boolean;
};

export const updateDraftOrderScheduleWorkflow = createWorkflow(
  "update-draft-order-schedule",
  (input: UpdateDraftOrderScheduleWorkflowInput) => {
    const draftOrderSchedule = updateDraftOrderScheduleStep(input);

    return new WorkflowResponse(draftOrderSchedule);
  },
);
