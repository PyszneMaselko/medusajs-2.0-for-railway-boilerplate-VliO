import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const TEACHER_GROUP_ID = "cusgroup_01KGZ39QVW330Z5V3Q0S1ZWR2Z";

  const {
    data: teachers,

    metadata: { count, take, skip } = {},
  } = await query.graph({
    entity: "customer",

    fields: ["id", "first_name", "last_name", "email", "groups.*"],

    filters: {
      groups: {
        id: [TEACHER_GROUP_ID],
      },
    },

    ...req.queryConfig,
  });

  res.json({
    teachers,

    count,

    limit: take,

    offset: skip,
  });
};
