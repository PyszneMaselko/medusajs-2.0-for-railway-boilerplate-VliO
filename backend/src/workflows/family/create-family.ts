import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { FAMILY_MODULE } from "../../modules/family";
import FamilyModuleService from "../../modules/family/service";
import { Modules } from "@medusajs/framework/utils";
import { LinkDefinition } from "@medusajs/framework/types";
import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

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

export type CreateFamilyCustomerLinkStepInput = {
  family_id: string;
  customer_ids?: string[];
};

export const createFamilyCustomerLinkStep = createStep(
  "create-family-customer-link-step",
  async (input: CreateFamilyCustomerLinkStepInput, { container }) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK);
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

    const links: LinkDefinition[] = [];

    if (input.customer_ids && input.customer_ids.length > 0) {
      for (const customer_id of input.customer_ids) {
        links.push({
          [Modules.CUSTOMER]: {
            customer_id: customer_id,
          },
          [FAMILY_MODULE]: {
            family_id: input.family_id,
          },
        });
      }
      await link.create(links);
      logger.info("Linked family to customer");
    }

    return new StepResponse(links, links);
  },
  // Compensation Func
  async (links, { container }) => {
    if (!links?.length) {
      return;
    }
    const link = container.resolve(ContainerRegistrationKeys.LINK);
    await link.dismiss(links);
  },
);

type CreateFamilyWorkflowInput = {
  name: string;
  customer_ids?: string[];
};

export const createFamilyWorkflow = createWorkflow(
  "create-family",
  (input: CreateFamilyWorkflowInput) => {
    const family = createFamilyStep(input);
    const links = createFamilyCustomerLinkStep({ family_id: family.id, customer_ids: input.customer_ids });

    return new WorkflowResponse(family);
  },
);