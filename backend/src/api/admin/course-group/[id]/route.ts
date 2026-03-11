import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { deleteCourseGroupWorkflow } from "../../../../workflows/course-group/delete-course-group";
import { updateCourseGroupWorkflow } from "../../../../workflows/course-group/update-course-group";
import { PutAdminUpdateCourseGroup } from "../validators";
import z from "zod";
import { removeStudentsFromGroupWorkflow } from "workflows/student/delete-student";

type PutAdminUpdateCourseGroup = z.infer<typeof PutAdminUpdateCourseGroup>;

interface DeleteCourseGroupRequest {
  student_ids: string[];
}

export const DELETE = async (req: MedusaRequest<any>, res: MedusaResponse) => {
  const { id } = req.params;
  const { student_ids } = req.body;

  if (student_ids && Array.isArray(student_ids) && student_ids.length > 0) {
    const { result } = await removeStudentsFromGroupWorkflow(req.scope).run({
      input: { id, student_ids },
    });
    return res.json(result)
  }

  const { result } = await deleteCourseGroupWorkflow(req.scope).run({
    input: {
      id: id,
    },
  });

  res.json(result);
};

export const PUT = async (
  req: MedusaRequest<PutAdminUpdateCourseGroup>,
  res: MedusaResponse,
) => {
  const { id } = req.params;

  const { result } = await updateCourseGroupWorkflow(req.scope).run({
    input: {
      id,
      name: req.validatedBody.name,
      start_date: req.validatedBody.start_date,
      end_date: req.validatedBody.end_date,
      course_id: req.validatedBody.course_id,
      teacher_id: req.validatedBody.teacher_id,
      student_ids: req.validatedBody.customer_ids,
    },
  });

  res.json({ course_group: result });
};

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;
  const query = req.scope.resolve("query");

  const { data } = await query.graph({
    entity: "course_group",
    fields: ["id", "name", "customers.*"],
    filters: {
      id: id,
    },
  });
  const group = data[0];

  if (!group) {
    return res.status(404).json({
      message: `Group with id ${id} not found`,
    });
  }
  let students = [];
  if (group?.customer) {
    students = Array.isArray(group.customer)
      ? group.customer
      : [group.customer];
  }
  res.json({
    students: group.customers || [],
  });
};
