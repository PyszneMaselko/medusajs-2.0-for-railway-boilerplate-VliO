import {
  defineMiddlewares,
  validateAndTransformQuery,
  validateAndTransformBody,
} from "@medusajs/framework/http";

import { PostAdminCreateAcademy } from "./admin/academy/validators";
import { PostAdminCreateFamily, DeleteAdminDeleteFamily } from "./admin/family/validators";

import { createFindParams } from "@medusajs/medusa/api/utils/validators";

// @ts-ignore
export const paginationSchema: z.ZodSchema = createFindParams();

export default defineMiddlewares({
  routes: [
    // FAMILY
    {
      matcher: "/admin/family",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(paginationSchema, {
          defaults: ["id", "name", "customers.*"],
          isList: true,
        }),
      ],
    },
    {
      matcher: "/admin/family",
      method: "POST",
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(PostAdminCreateFamily),
      ],
    },
    {
      matcher: "/admin/family",
      method: "DELETE",
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(DeleteAdminDeleteFamily),
      ],
    },
    // ACADEMY
    {
      matcher: "/admin/academy",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(paginationSchema, {
          defaults: ["id", "name", "address_line_1", "address_line_2"],
          isList: true,
        }),
      ],
    },
    {
      matcher: "/admin/academy",
      method: "POST",
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(PostAdminCreateAcademy),
      ],
    },
  ],
});
