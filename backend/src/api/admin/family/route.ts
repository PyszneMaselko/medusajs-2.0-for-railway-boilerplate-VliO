import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { 
  createFamilyWorkflow,
} from "../../../workflows/family/create-family"
import { z } from "zod"
import { PostAdminCreateFamily } from "./validators"

type PostAdminCreateFamilyType = z.infer<typeof PostAdminCreateFamily>

export const POST = async (
  req: MedusaRequest<PostAdminCreateFamilyType>,
  res: MedusaResponse
) => {
  const { result } = await createFamilyWorkflow(req.scope)
    .run({
      input: req.validatedBody,
    })

  res.json({ family: result })
}

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve("query")
  
  const { 
    data: families, 
    metadata: { count, take, skip } = {},
  } = await query.graph({
    entity: "family",
    ...req.queryConfig,
  })

  res.json({ 
    families,
    count,
    limit: take,
    offset: skip,
  })
}