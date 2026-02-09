import { 
  createStep, 
  createWorkflow, 
  StepResponse, 
  WorkflowResponse,
  ReturnWorkflow 
} from "@medusajs/framework/workflows-sdk";
import { ACADEMY_MODULE } from "../../modules/academy";
import AcademyModuleService from "../../modules/academy/service";

export type UpdateAcademyStepInput = {
    id: string;
    name?: string;
    address_line_1?: string;
    address_line_2?: string;
}

export const updateAcademyStep = createStep(
    "update-academy-step",
    async (input: UpdateAcademyStepInput, { container }) => {
        const academyModuleService: AcademyModuleService = 
        container.resolve(ACADEMY_MODULE);
        const academy = await academyModuleService.updateAcademies({
            id: input.id,
            name: input.name,
            address_line_1: input.address_line_1,
            address_line_2: input.address_line_2
        });
        return new StepResponse(academy, academy.id);
    }
)

type UpdateAcademyWorkflowInput = {
    id: string;
    name?: string;
    address_line_1?: string;
    address_line_2?: string;
}   

export const updateAcademyWorkflow = createWorkflow(
    "update-academy",
    (input: UpdateAcademyWorkflowInput) => {
        const academy = updateAcademyStep(input);
        return new WorkflowResponse(academy);
    }
);
