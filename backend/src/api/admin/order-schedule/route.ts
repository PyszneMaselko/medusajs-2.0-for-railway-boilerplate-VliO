import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createDraftOrderScheduleWorkflow } from "../../../workflows/order-schedule/create-draft-order-schedule";
import { z } from "zod";
import { PostAdminCreateDraftOrderSchedule, DeleteAdminDeleteDraftOrderSchedule } from "./validators";
import { deleteDraftOrderScheduleWorkflow } from "../../../workflows/order-schedule/delete-draft-order-schedule";

type PostAdminCreateDraftOrderScheduleType = z.infer<typeof PostAdminCreateDraftOrderSchedule>;
type DeleteAdminDeleteDraftOrderScheduleType = z.infer<typeof DeleteAdminDeleteDraftOrderSchedule>;

export const POST = async (
  req: MedusaRequest<PostAdminCreateDraftOrderScheduleType>,
  res: MedusaResponse,
) => {
  const { result } = await createDraftOrderScheduleWorkflow(req.scope).run({
    input: req.validatedBody,
  });

  res.json({ draftOrderSchedule: result });
};

export const DELETE = async (
  req: MedusaRequest<DeleteAdminDeleteDraftOrderScheduleType>, 
  res: MedusaResponse
) => {

  const { result } = await deleteDraftOrderScheduleWorkflow(req.scope).run({
    input: req.validatedBody,
  });

  res.status(200).json({
    id: result,
    object: "draft_order_schedule",
    deleted: true,
  });
};