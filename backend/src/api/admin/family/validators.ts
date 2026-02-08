import { z } from "zod";

export const PostAdminCreateFamily = z.object({
  name: z.string(),
});
