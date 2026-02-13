import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
// import {
//   createAcademyWorkflow,
// } from "../../../workflows/academy/create-academy"
import { z } from "zod";
// import { PostAdminCreateAcademy } from "./validators"

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
