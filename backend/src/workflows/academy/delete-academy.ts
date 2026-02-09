import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ACADEMY_MODULE } from "../../modules/academy";
import AcademyModuleService from "../../modules/academy/service";

//STEPS
export const deleteAcademyStep = createStep(
  "delete-academy-step",
  async (id: string, { container }) => {
    const academyModuleService: AcademyModuleService =
      container.resolve(ACADEMY_MODULE);

    await academyModuleService.deleteAcademies(id);

    return new StepResponse(true);
  },
);

//WORKFLOW
type DeleteAcademyWorkflowInput = {
  id: string;
};

export const deleteAcademyWorkflow: ReturnType<typeof createWorkflow> = createWorkflow(
  "delete-academy",
  (input: DeleteAcademyWorkflowInput) => {
    const deleteId = deleteAcademyStep(input.id);
    return new WorkflowResponse({
      deleteId,
    });
  },
);
