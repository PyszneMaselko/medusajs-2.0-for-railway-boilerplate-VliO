import { z } from "zod"

export const PostAdminCreateCourse = z.object({
    name: z.string(),
    description: z.string().optional(),
    academy_id: z.string(),
});
