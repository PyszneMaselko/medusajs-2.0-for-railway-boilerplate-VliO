import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  updateFamilyMembersWorkflow,
} from "../../../../workflows/family/update-family-members"
import { z } from "zod";
import { PatchAdminUpdateFamily } from "./validators"
import { MedusaError } from "@medusajs/framework/utils"

type PatchAdminUpdateFamilyType = z.infer<typeof PatchAdminUpdateFamily>;

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Provide family ID" });
  }

  const { data } = await query.graph({
    entity: "family",
    fields: ["*", "customers.*", "customers.groups.*"],
    filters: { id },
    ...req.queryConfig,
  });

  if (!data || data.length === 0) {
    return res.status(404).json({ message: "Family not found" });
  }

  res.json({ family: data[0] });
};

export const PATCH = async (
  req: MedusaRequest<PatchAdminUpdateFamilyType>,
  res: MedusaResponse
) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Provide family ID" });
  }

  const customerIds = req.body.customer_ids ?? [];

  const { result, errors } = await updateFamilyMembersWorkflow(req.scope).run({
    input: {
      family_id: id,
      new_customer_ids: customerIds,
    },
  });

    if (errors.length) {
    // znajdź konkretny błąd z link.create
    const err = errors[0].error as MedusaError

    return res.status(400).json({
      message: err.message, // np. "Cannot create multiple links between 'customer' and 'family'"
      type: err.type,
      code: err.code,
    })
  }

  res.status(200).json(result);
};
