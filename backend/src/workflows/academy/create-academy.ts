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

export const createAcademyStep = createStep(
  "create-academy-step",
  async (input: CreateAcademyStepInput, { container }) => {
    const academyModuleService: AcademyModuleService =
      container.resolve(ACADEMY_MODULE);

      //Sprawdzamy czy podano adress_line 1 i 2
      if(input.address_line_1 == undefined){
        input.address_line_1 = null;
      }
    if(input.address_line_2 == undefined){
        input.address_line_2 = null;
      }
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

    return new WorkflowResponse(academy);
  },
);
