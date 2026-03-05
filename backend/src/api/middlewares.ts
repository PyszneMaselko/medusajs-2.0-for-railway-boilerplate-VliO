import {
  defineMiddlewares,
  validateAndTransformQuery,
  validateAndTransformBody,
} from "@medusajs/framework/http";
import {
  PostAdminCreateAcademy,
  PostAdminUpdateAcademy,
} from "./admin/academy/validators";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";
import {
  PostAdminCreateFamily,
  DeleteAdminDeleteFamily,
} from "./admin/family/validators";
import { PostAdminCreateCourse } from "./admin/course/validators";
import { GetCourseGroupsParams, PostAdminCreateCourseGroup, PutAdminUpdateCourseGroup } from "./admin/course-group/validators";
import { PatchAdminUpdateFamily } from "./admin/family/[id]/validators";
import {
  PostAdminCreateDraftOrderSchedule,
  DeleteAdminDeleteDraftOrderSchedule,
} from "./admin/order-schedule/validators";
import { PatchAdminPatchDraftOrderSchedule } from "./admin/order-schedule/[id]/validators";

// @ts-ignore
export const paginationSchema: z.ZodSchema = createFindParams();

export default defineMiddlewares({
  routes: [
    // ORDER SUMMARY - STOREFRONT
    {
      matcher: "/store/order-summary/:id",
      method: "GET",
    },
    // ORDER SCHEDULE
    {
      matcher: "/admin/order-schedule/:id",
      method: "PATCH",
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(PatchAdminPatchDraftOrderSchedule),
      ],
    },
    {
      matcher: "/admin/order-schedule",
      method: "DELETE",
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(DeleteAdminDeleteDraftOrderSchedule),
      ],
    },
    {
      matcher: "/admin/order-schedule",
      method: "POST",
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(PostAdminCreateDraftOrderSchedule),
      ],
    },
    // FAMILY
    {
      matcher: "/admin/family/:id",
      method: "PATCH",
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(PatchAdminUpdateFamily),
      ],
    },
    {
      matcher: "/admin/family/:id",
      method: "GET",
    },
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
    {
      matcher: "/admin/academy/:id",
      method: "POST",
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(PostAdminUpdateAcademy),
      ],
    },
    {
      matcher: "/admin/academy/:id",
      method: "GET",
    },
    // COURSE
    {
      matcher: "/admin/course",
      method: "GET",
    },
    {
      matcher: "/admin/course",
      method: "POST",
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(PostAdminCreateCourse),
      ],
    },
    {
      matcher: "/admin/academy/:id",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(paginationSchema, {
          defaults: [
            "id",
            "name",
            "address_line_1",
            "address_line_2",
            "courses.*",
          ],
          isList: false,
        }),
      ],
    },
    {
      matcher: "/admin/course/:id",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(paginationSchema, {
          defaults: ["id", "name", "description", "academy.*"],
          isList: false,
        }),
      ],
    },
    // COURSE GROUP
    {
      matcher: "/admin/course-group",
      method: "POST",
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(PostAdminCreateCourseGroup),
      ],
    },
    {
      matcher: "/admin/course-group",
      method: "GET",
      middlewares: [
        // @ts-ignore
        validateAndTransformQuery(GetCourseGroupsParams, {
          defaults: [
            "id",
            "name", 
            "start_date",
            "end_date",
            "course_id",
            "teacher_id",
          ],
          isList: true,
        }),
      ],
    },
    {
      matcher: "/admin/course-group/:id",
      method: "DELETE",
    },
    {
      matcher: "/admin/course-group/:id",
      method: "PUT",
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(PutAdminUpdateCourseGroup),
      ],
    },
    {
      matcher: "/admin/course-group/:id",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(paginationSchema, {
          defaults: [
            "id",
            "name", 
            "start_date",
            "end_date",
            "course_id",
            "teacher_id",
          ],
          isList: false,
        }),
      ],
    },
    // CUSTOMER
    {
      matcher: "/admin/customer/teacher",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(paginationSchema, {
          defaults: ["id", "first_name", "last_name", "email"],
          isList: true,
        }),
      ],
    },
    {
      matcher: "/admin/customer/teacher/student",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(paginationSchema, {
          defaults: ["id", "first_name", "last_name", "email"],
          isList: true,
        }),
      ],
    },
    {
      matcher: "/admin/course-group/:id",
      method: "DELETE",
    }
  ],
});
