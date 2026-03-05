import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Provide payment collection ID" });
  }

const { data } = await query.graph({
  entity: "order_payment_collection",
  fields: [
    "*",
    "order.*",
    "order.items.*",
    "payment_collection.*",
  ],
  filters: {
    payment_collection_id: id,
  },
})

  if (!data || data.length === 0) {
    return res.status(404).json({ message: "Order Payment Collection not found" });
  }

  res.json({ order_details: data[0] });
};
