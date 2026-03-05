import { model } from "@medusajs/framework/utils"
import { Course } from "./course";

export const Academy = model.define("academy", {
  id: model.id().primaryKey(),
  name: model.text(),
  address_line_1: model.text().nullable(),
  address_line_2: model.text().nullable(),
  courses: model.hasMany(() => Course, {
    mappedBy: "academy",
  }),
})