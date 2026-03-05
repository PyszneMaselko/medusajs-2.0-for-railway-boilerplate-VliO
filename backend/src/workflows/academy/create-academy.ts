import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ACADEMY_MODULE } from "../../modules/academy";
import AcademyModuleService from "../../modules/academy/service";

// STEPS
export type CreateAcademyStepInput = {
  name: string;
  address_line_1?: string;
  address_line_2?: string;
};

export type CreateCourseStepInput = {
  name: string;
  description?: string;
  academy_id: string;
};


export const createCourseStepInternal = createStep(
  "create-course-step",
  async (input: CreateCourseStepInput, { container }) => {
    const academyModuleService: AcademyModuleService =
      container.resolve(ACADEMY_MODULE);

    const course = await academyModuleService.createCourses(input);
    return new StepResponse(course, course.id);
  },
);

export const createAcademyStep = createStep(
  "create-academy-step",
  async (input: CreateAcademyStepInput, { container }) => {
    const academyModuleService: AcademyModuleService =
      container.resolve(ACADEMY_MODULE);

    const data = {
      ...input,
      address_line_1: input.address_line_1 ?? null,
      address_line_2: input.address_line_2 ?? null,
    };

    const academy = await academyModuleService.createAcademies(input);

    return new StepResponse(academy, academy.id);
  },
);

// WORKFLOW
type CreateAcademyWorkflowInput = {
  name: string;
  address_line_1?: string;
  address_line_2?: string;
};

export const createAcademyWorkflow = createWorkflow(
  "create-academy",
  (input: CreateAcademyWorkflowInput) => {
    const academy = createAcademyStep(input);

    const courseData = {
      name: input.name,
      description: "Automatyczny kurs",
      academy_id: academy.id,
    };

    createCourseStepInternal(courseData);

    return new WorkflowResponse(academy);
  },
);
