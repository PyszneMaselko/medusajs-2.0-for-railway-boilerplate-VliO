import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { deleteAcademyWorkflow } from "../../../../workflows/academy/delete-academy";
import { updateAcademyWorkflow } from "../../../../workflows/academy/update-academy";

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;

  const { result } = await deleteAcademyWorkflow(req.scope).run({
    input: {
      id,
    },
  });

  res.status(200).json({
    id: result,
    object: "academy",
    deleted: true,
  });
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;
  const { result } = await updateAcademyWorkflow(req.scope).run({
    input:{
        id,
        ...(req.validatedBody as Record<string, unknown>)
    }
  });

    res.json({ academy: result })

};
