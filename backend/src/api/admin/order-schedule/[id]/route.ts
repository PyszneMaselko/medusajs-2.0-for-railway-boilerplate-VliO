import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";
import { PatchAdminPatchDraftOrderSchedule } from "./validators";
import { updateDraftOrderScheduleWorkflow } from "../../../../workflows/order-schedule/update-draft-order-schedule";

type PatchAdminPatchDraftOrderScheduleType = z.infer<typeof PatchAdminPatchDraftOrderSchedule>;

export const PATCH = async (
  req: MedusaRequest<PatchAdminPatchDraftOrderScheduleType>,
  res: MedusaResponse,
) => {
  const { result } = await updateDraftOrderScheduleWorkflow(req.scope).run({
    input: req.validatedBody,
  });

  res.json({ draftOrderSchedule: result });
};