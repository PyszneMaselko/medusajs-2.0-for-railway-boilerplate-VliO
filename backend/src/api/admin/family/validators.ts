import { z } from "zod";

export const PostAdminCreateFamily = z.object({
  name: z.string(),
  customer_ids: z.array(z.string()).optional()
});

export const DeleteAdminDeleteFamily = z.object({
  ids: z.string().array(),
})