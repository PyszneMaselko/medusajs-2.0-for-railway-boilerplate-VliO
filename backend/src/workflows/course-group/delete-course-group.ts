import { Modules } from "@medusajs/framework/utils";
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ACADEMY_MODULE } from "modules/academy";
import { dismissRemoteLinkStep } from "@medusajs/medusa/core-flows";
import AcademyModuleService from "modules/academy/service";

export const deleteCourseGroupStep = createStep(
  "delete-course-group-step",
  async (id: string, { container }) => {
    const courseGroupModuleService: AcademyModuleService =
      container.resolve(ACADEMY_MODULE);
    await courseGroupModuleService.deleteCourseGroups(id);
    return new StepResponse(true);
  },
);

type DeleteCourseGroupWorkflowInput = {
  id: string;
};

export const deleteCourseGroupWorkflow: ReturnType<typeof createWorkflow> =
  createWorkflow(
    "delete-course-group",
    (input: DeleteCourseGroupWorkflowInput) => {
      dismissRemoteLinkStep({
        [Modules.CUSTOMER]: {
          customer_id: "*",
        },
        [ACADEMY_MODULE]: {
          course_group_id: input.id,
        },
      });
      const deleteId = deleteCourseGroupStep(input.id);
      return new WorkflowResponse({
        deleteId,
      });
    },
  );
