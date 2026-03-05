import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ACADEMY_MODULE } from "../../../modules/academy";
import AcademyModuleService from "../../../modules/academy/service";

export type CreateCourseStepInput = {
  name: string;
  description?: string;
  academy_id: string;
};

export const createCourseStep = createStep(
  "create-course-step",
  async (input: CreateCourseStepInput, { container }) => {
    const academyModuleService: AcademyModuleService = container.resolve(ACADEMY_MODULE);
    const course = await academyModuleService.createCourses(input);
    return new StepResponse(course, course.id);
  }
);