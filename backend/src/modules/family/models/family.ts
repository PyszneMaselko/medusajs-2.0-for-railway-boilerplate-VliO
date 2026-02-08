import { model } from "@medusajs/framework/utils"

export const Family = model.define("family", {
  id: model.id().primaryKey(),
  name: model.text(),
})