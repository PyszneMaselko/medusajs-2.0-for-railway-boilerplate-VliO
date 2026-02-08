import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { FAMILY_MODULE } from "../../modules/family";
import FamilyModuleService from "../../modules/family/service";

export type CreateFamilyStepInput = {
  name: string;
};

export const createFamilyStep = createStep(
  "create-family-step",
  async (input: CreateFamilyStepInput, { container }) => {
    const familyModuleService: FamilyModuleService =
      container.resolve(FAMILY_MODULE);

    const family = await familyModuleService.createFamilies(input);

    return new StepResponse(family, family.id);
  },
  // Compensation Func
  async (id: string, { container }) => {
    const familyModuleService: FamilyModuleService =
      container.resolve(FAMILY_MODULE);

    await familyModuleService.deleteFamilies(id);
  },
);

type CreateFamilyWorkflowInput = {
  name: string
}

export const createFamilyWorkflow = createWorkflow(
  "create-family",
  (input: CreateFamilyWorkflowInput) => {
    const family = createFamilyStep(input)

    return new WorkflowResponse(family)
  }
)