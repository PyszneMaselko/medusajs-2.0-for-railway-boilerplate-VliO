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
import {
  useQueryGraphStep,
  dismissRemoteLinkStep,
} from "@medusajs/medusa/core-flows";
import familyCustomerLink from "../../links/family/customer-family";
import { removeRemoteLinkStep } from "@medusajs/medusa/core-flows";
import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export type DeleteFamilyStepInput = {
  ids: string[];
};

export const deleteFamilyStep = createStep(
  "delete-family-step",
  async (input: DeleteFamilyStepInput, { container }) => {
    const familyModuleService: FamilyModuleService =
      container.resolve(FAMILY_MODULE);

    const deletedFamily = await familyModuleService.deleteFamilies(input.ids);

    return new StepResponse(deletedFamily);
  },
);

type DeleteFamilyWorkflowInput = {
  ids: string[];
};

type Family = {
  id: string;
  customers?: { id: string }[];
  // inne pola, jeśli potrzebne
};

const getFamilyCustomerIdsStep = createStep(
  "get-family-customer-ids",
  async (families: Family[], { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as any;
    const link = container.resolve(ContainerRegistrationKeys.LINK) as any;

    const customerIds = families.flatMap(
      (f) => f.customers?.map((c) => c.id) ?? [],
    );

    const links: LinkDefinition[] = [];

    if (families && families.length > 0) {
      for (const family of families) {
        links.push({
          [Modules.CUSTOMER]: {
            customer_id: family.customers?.map((c) => c.id),
          },
          [FAMILY_MODULE]: {
            family_id: family.id,
          },
        });
      }
      await link.dismiss(links);
      logger.info("DELETED family to customer LINKS");
    }

    logger.info(`Customer IDs: ${customerIds.join(",")}`);

    return new StepResponse(links, links);
  },
);

export const deleteFamilyWorkflow = createWorkflow(
  "delete-family",
  (input: DeleteFamilyWorkflowInput) => {
    const { data: families } = useQueryGraphStep({
      entity: "family",
      fields: ["*", "customers.*"],
      filters: {
        id: input.ids,
      },
    });
    const deletedLinks = getFamilyCustomerIdsStep(families);

    const family = deleteFamilyStep(input);

    return new WorkflowResponse(family);
  },
);
