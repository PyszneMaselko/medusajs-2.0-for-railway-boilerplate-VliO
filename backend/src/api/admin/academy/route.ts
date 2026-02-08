import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { 
  createAcademyWorkflow,
} from "../../../workflows/academy/create-academy"
import { z } from "zod"
import { PostAdminCreateAcademy } from "./validators"

type PostAdminCreateAcademyType = z.infer<typeof PostAdminCreateAcademy>

export const POST = async (
  req: MedusaRequest<PostAdminCreateAcademyType>,
  res: MedusaResponse
) => {
  const { result } = await createAcademyWorkflow(req.scope)
    .run({
      input: req.validatedBody,
    })

  res.json({ academy: result })
}

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve("query")
  
  const { 
    data: academies, 
    metadata: { count, take, skip } = {},
  } = await query.graph({
    entity: "academy",
    ...req.queryConfig,
  })

  res.json({ 
    academies,
    count,
    limit: take,
    offset: skip,
  })
}