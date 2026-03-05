import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ACADEMY_MODULE } from "modules/academy";
import AcademyModuleService from "modules/academy/service";

// STEPS
export type CreateCourseStepInput = {
  name: string;
  description?: string;
  academy_id: string;
};

export const createCourseStep = createStep(
  "create-course-step",
  async (input: CreateCourseStepInput, { container }) => {
    const academyModuleService: AcademyModuleService =
      container.resolve(ACADEMY_MODULE);

    const course = await academyModuleService.createCourses(input);
    return new StepResponse(course, course.id);
  },
);

type CreateCourseWorkflowInput = {
  name: string;
  description?: string;
  academy_id: string;
};

export const createCourseWorkflow: ReturnType<typeof createWorkflow> = createWorkflow(
  "create-course",
  (input: CreateCourseWorkflowInput) => {
    const course = createCourseStep(input);
    return new WorkflowResponse({
      course,
    });
  },
);
