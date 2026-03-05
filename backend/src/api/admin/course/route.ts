import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import z from "zod";
import { PostAdminCreateCourse } from "./validators";
import { createCourseWorkflow } from "workflows/course/create-course";

type PostAdminCreateCourse = z.infer<typeof PostAdminCreateCourse>;

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const { data: courses } = await query.graph({
    entity: "course",
    fields: ["*"],
  });

  res.json({ courses });
};

export const POST = async (
  req: MedusaRequest<PostAdminCreateCourse>,
  res: MedusaResponse,
) => {
  const { result } = await createCourseWorkflow(req.scope).run({
    input: {
      name: req.validatedBody.name,
      description: req.validatedBody.description,
      academy_id: req.body.academy_id,
    },
  });
  res.json({ course: result });
};
