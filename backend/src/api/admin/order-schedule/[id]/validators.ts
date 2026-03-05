import { z } from "zod";

export const PatchAdminPatchDraftOrderSchedule = z.object({
  id: z.string(),
  trigger_date: z.string().optional(),
  clone: z.boolean().optional(),
});
