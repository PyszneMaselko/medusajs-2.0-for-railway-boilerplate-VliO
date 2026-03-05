import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const STUDENT_GROUP_ID = "cusgroup_01KGZ39YR2WPGCSXC6MCGWNG57";

  const {
    data: students,
    metadata: { count, take, skip } = {},
  } = await query.graph({
    entity: "customer",

    fields: ["id", "first_name", "last_name", "email", "groups.*"],

    filters: {
      groups: {
        id: [STUDENT_GROUP_ID],
      },
    },

    ...req.queryConfig,
  });

  res.json({
    students,
    count,
    limit: take,
    offset: skip,
  });
};