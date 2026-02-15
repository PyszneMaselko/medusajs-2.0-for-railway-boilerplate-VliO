import {
  createWorkflow,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk";
import { updateFamilyMembersStep } from "./steps/update-family-members-step";
import {
  useQueryGraphStep,
  dismissRemoteLinkStep,
} from "@medusajs/medusa/core-flows";

type Input = {
  family_id: string;
  new_customer_ids: string[];
};

export const updateFamilyMembersWorkflow = createWorkflow(
  "update-family-members",
  ({ family_id, new_customer_ids }: Input) => {
    const { data: families } = useQueryGraphStep({
      entity: "family",
      fields: ["*", "customers.*"],
      filters: {
        id: family_id,
      },
    });

    const old_customer_ids = transform({ families }, ({ families }) =>
      families.flatMap((f) => f.customers?.map((c) => c.id) ?? []),
    );

    updateFamilyMembersStep({ family_id, new_customer_ids, old_customer_ids });

    return new WorkflowResponse({
      family_id: family_id,
    });
  },
);
