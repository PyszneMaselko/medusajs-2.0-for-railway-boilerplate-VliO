import { z } from "zod";

export const PostAdminCreateAcademy = z.object({
  name: z.string(),
  address_line_1: z.string().optional(),
  address_line_2: z.string().optional(),
});

export const PostAdminUpdateAcademy = z.object({
  name: z.string().optional(),
  address_line_1: z.string().optional().nullable(),
  address_line_2: z.string().optional().nullable(),
})