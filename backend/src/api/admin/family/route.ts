import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createFamilyWorkflow } from "../../../workflows/family/create-family";
import { deleteFamilyWorkflow } from "../../../workflows/family/delete-family";
import { z } from "zod";
import { PostAdminCreateFamily, DeleteAdminDeleteFamily } from "./validators";

type PostAdminCreateFamilyType = z.infer<typeof PostAdminCreateFamily>;
type DeleteAdminDeleteFamilyType = z.infer<typeof DeleteAdminDeleteFamily>;

export const POST = async (
  req: MedusaRequest<PostAdminCreateFamilyType>,
  res: MedusaResponse,
) => {
  const { result } = await createFamilyWorkflow(req.scope).run({
    input: req.validatedBody,
  });

  res.json({ family: result });
};

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const { data: families, metadata: { count, take, skip } = {} } =
    await query.graph({
      entity: "family",
      fields: ["*", "customers.*"],
      ...req.queryConfig,
    });

  res.json({
    families,
    count,
    limit: take,
    offset: skip,
  });
};

export const DELETE = async (
  req: MedusaRequest<DeleteAdminDeleteFamilyType>,
  res: MedusaResponse,
) => {
  const { result } = await deleteFamilyWorkflow(req.scope).run({
    input: req.validatedBody,
  });

  res.json({ family: result });
};
