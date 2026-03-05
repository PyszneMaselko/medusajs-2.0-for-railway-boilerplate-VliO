import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { createCourseGroupWorkflow } from "../../../workflows/course-group.ts/create-course-group";
import { PostAdminCreateCourseGroup } from "./validators";
import z from "zod";

type PostAdminCreateCourseGroup = z.infer<typeof PostAdminCreateCourseGroup>;

export const POST = async (
  req: MedusaRequest<PostAdminCreateCourseGroup>,
  res: MedusaResponse,
) => {
  const { result } = await createCourseGroupWorkflow(req.scope).run({
    input: {
      name: req.validatedBody.name,
      start_date: new Date(req.validatedBody.start_date),
      end_date: new Date(req.validatedBody.end_date),
      course_id: req.validatedBody.course_id,
      teacher_id: req.validatedBody.teacher_id,
    },
  });

  res.json({ course_group: result });
};

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const targetCourseId = req.query.course_id as string;
  const { data: courseGroups } = await query.graph({
    entity: "course_group",
    fields: [
      "id",
      "name",
      "start_date",
      "end_date",
      "course_id",
      "teacher_id",
      "customers.*",
    ],
  });

  const filteredGroups = targetCourseId 
    ? courseGroups.filter(group => group.course_id === targetCourseId)
    : courseGroups;
    
  res.json({ 
    course_groups: filteredGroups,
    count: filteredGroups.length 
  });
};

export const AUTHENTICATE = true