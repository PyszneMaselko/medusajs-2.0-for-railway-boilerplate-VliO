import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ACADEMY_MODULE } from "../../modules/academy";
import AcademyModuleService from "../../modules/academy/service";
import { container } from "@medusajs/framework";
import { id } from "zod/v4/locales";


//STEPS
export const deleteAcademyResourcesStep = createStep(
  "delete-academy-resources-step",
  async (id: string, { container }) => {
    const academyModuleService: AcademyModuleService = container.resolve(ACADEMY_MODULE);

    const courses = await academyModuleService.listCourses({ academy_id: id})
    const courseIds = courses.map(c => c.id);

    if (courseIds.length > 0){
      const groups = await academyModuleService.listCourseGroups({
        course_id: courseIds
      });
      if (groups.length > 0) {
        await academyModuleService.deleteCourseGroups(groups.map(g => g.id));
      }
      await academyModuleService.deleteCourses(courseIds);
    }

    return new StepResponse(true);
  }
);

export const deleteAcademyStep = createStep(
  "delete-academy-step",
  async (id: string, { container }) => {
    const academyModuleService: AcademyModuleService = container.resolve(ACADEMY_MODULE);

    const academy = await academyModuleService.retrieveAcademy(id).catch(() => null);
    if (academy) {
      await academyModuleService.deleteAcademies(id);
    }
    return new StepResponse(true);
  }
)


//WORKFLOW
type DeleteAcademyWorkflowInput = {
  id: string;
};

export const deleteAcademyWorkflow = createWorkflow(
  "delete-academy", 
  (input: DeleteAcademyWorkflowInput) => {
    deleteAcademyResourcesStep(input.id);
    
    const result = deleteAcademyStep(input.id);

    return new WorkflowResponse(result);
  }
);
