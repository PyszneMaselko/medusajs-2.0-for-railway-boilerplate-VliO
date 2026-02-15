import { z } from "zod";

export const PatchAdminUpdateFamily = z.object({
  customer_ids: z.array(z.string())
});