import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;
  const query = req.scope.resolve("query");

  const { data: [academy] } = await query.graph({
    entity: "academy",
    fields: ["*", "courses.*"], 
    filters: { id: [id] }
  });

  if (!academy) {
    return res.status(404).json({ message: "Academy not found" });
  }

  res.json({ academy });
};