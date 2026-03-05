import { z } from "zod";

export const PostAdminCreateDraftOrderSchedule = z.object({
  trigger_date: z.string(),
  order_id: z.string(),
  clone: z.boolean()
});

export const DeleteAdminDeleteDraftOrderSchedule = z.object({
  order_id: z.string()
});