import { 
  defineMiddlewares,
  validateAndTransformQuery,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { PostAdminCreateAcademy } from "./admin/academy/validators"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"

// @ts-ignore
export const GetAcademiesSchema: z.ZodSchema = createFindParams()

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/academy",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(
          GetAcademiesSchema,
          {
            defaults: [
              "id",
              "name",
              "address_line_1",
              "address_line_2",
            ],
            isList: true,
          }
        ),
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
})