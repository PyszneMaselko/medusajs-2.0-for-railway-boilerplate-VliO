import { z } from "zod";

export const PostAdminCreateCourseGroup = z.object({
  name: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  course_id: z.string(),
  teacher_id: z.string().optional(),
  customer_ids: z.array(z.string()).optional(),
});

export const PutAdminUpdateCourseGroup = z.object({
    name: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    course_id: z.string().optional(),
    teacher_id: z.string().optional(),
    customer_ids: z.array(z.string()).optional(),
});

export const GetCourseGroupsParams = z.object({
  course_id: z.string().optional(),
  name: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});