import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ACADEMY_MODULE } from "modules/academy";
import AcademyModuleService from "modules/academy/service";

export type CreateCourseGroupStepInput = {
  name: string;
  start_date: Date;
  end_date: Date;
  course_id: string;
  teacher_id?: string;
};

export const createCourseGroupStep = createStep(
  "create-course-group-step",
  async (input: CreateCourseGroupStepInput, { container }) => {
    const academyModuleService: AcademyModuleService =
      container.resolve(ACADEMY_MODULE);

    const [group] = await academyModuleService.createCourseGroups([input]);
    return new StepResponse(group, group.id);
  },
);

type CreateCourseGroupWorkflowInput = {
  name: string;
  start_date: Date;
  end_date: Date;
  course_id: string;
  teacher_id: string;
};

export const createCourseGroupWorkflow: ReturnType<typeof createWorkflow> =
  createWorkflow(
    "create-course-group",
    (input: CreateCourseGroupWorkflowInput) => {
      const group = createCourseGroupStep(input);

      return new WorkflowResponse({
        course_group: group,
      });
    },
  );
